use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use chrono::Utc;
use chrono_tz::Tz;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder},
    window::{Effect, EffectState, EffectsBuilder},
    Emitter, LogicalPosition, LogicalSize, Manager, PhysicalPosition, PhysicalSize, Rect,
    WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_autostart::MacosLauncher;

#[cfg(target_os = "macos")]
mod macos;

#[derive(Clone)]
struct TrayConfig {
    timezone: String,
    flag: String,
    use_24h: bool,
}

impl Default for TrayConfig {
    fn default() -> Self {
        Self {
            timezone: "Asia/Seoul".to_string(),
            flag: "\u{1f1f0}\u{1f1f7}".to_string(), // 🇰🇷
            use_24h: true,
        }
    }
}

fn format_tray_title(config: &TrayConfig) -> String {
    let tz: Tz = config.timezone.parse().unwrap_or(chrono_tz::Asia::Seoul);
    let now = Utc::now().with_timezone(&tz);
    let time_str = if config.use_24h {
        now.format("%H:%M").to_string()
    } else {
        // 12h format: "2:30 PM"
        let hour = now.format("%I").to_string();
        let hour = hour.trim_start_matches('0'); // remove leading zero
        let minute = now.format("%M").to_string();
        let period = now.format("%p").to_string();
        format!("{hour}:{minute} {period}")
    };
    format!("{} {}", config.flag, time_str)
}

#[tauri::command]
fn update_tray_config(
    state: tauri::State<'_, Arc<Mutex<TrayConfig>>>,
    timezone: String,
    flag: String,
    use_24h: bool,
) {
    if let Ok(mut config) = state.lock() {
        config.timezone = timezone;
        config.flag = flag;
        config.use_24h = use_24h;
    }
}

#[derive(serde::Serialize)]
struct SystemLook {
    accent: Option<String>,
    material: &'static str,
}

fn uses_liquid_glass() -> bool {
    #[cfg(target_os = "macos")]
    return macos::liquid_glass_available();
    #[cfg(not(target_os = "macos"))]
    false
}

/// Accent color and glass material, mirrored into CSS by the frontend.
#[tauri::command]
fn system_look() -> SystemLook {
    #[cfg(target_os = "macos")]
    let accent = macos::accent_hex();
    #[cfg(not(target_os = "macos"))]
    let accent = None;
    SystemLook {
        accent,
        material: if uses_liquid_glass() { "liquid" } else { "vibrancy" },
    }
}

const POPOVER_WIDTH: f64 = 360.0;
const POPOVER_MAX_HEIGHT: f64 = 780.0;
const POPOVER_INITIAL_HEIGHT: f64 = 560.0;
const POPOVER_GAP: f64 = 6.0;
const SCREEN_MARGIN: f64 = 8.0;
/// Corner radius of the native vibrancy layer; must match `--popover-radius` in global.css.
const POPOVER_RADIUS: f64 = 16.0;

/// Time the popover was last hidden by losing focus. Clicking the tray icon
/// while the popover is open first blurs it, so without this the same click
/// would immediately re-open it.
struct PopoverState {
    last_blur_hide: Mutex<Option<Instant>>,
}

/// Compute the popover frame (logical units) anchored under the tray icon and
/// clamped inside the monitor that contains it.
fn popover_frame(app: &tauri::AppHandle, icon_rect: &Rect) -> (LogicalPosition<f64>, LogicalSize<f64>) {
    let fallback_scale = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| m.scale_factor())
        .unwrap_or(2.0);
    let icon_pos: PhysicalPosition<f64> = icon_rect.position.to_physical(fallback_scale);
    let icon_size: PhysicalSize<f64> = icon_rect.size.to_physical(fallback_scale);

    let monitor = app
        .monitor_from_point(icon_pos.x, icon_pos.y)
        .ok()
        .flatten()
        .or_else(|| app.primary_monitor().ok().flatten());

    let Some(monitor) = monitor else {
        let scale = fallback_scale;
        return (
            LogicalPosition::new(icon_pos.x / scale - POPOVER_WIDTH / 2.0, (icon_pos.y + icon_size.height) / scale + POPOVER_GAP),
            LogicalSize::new(POPOVER_WIDTH, POPOVER_MAX_HEIGHT),
        );
    };

    let scale = monitor.scale_factor();
    let mon_x = monitor.position().x as f64 / scale;
    let mon_y = monitor.position().y as f64 / scale;
    let mon_w = monitor.size().width as f64 / scale;
    let mon_h = monitor.size().height as f64 / scale;

    let icon_center_x = (icon_pos.x + icon_size.width / 2.0) / scale;
    let icon_bottom = (icon_pos.y + icon_size.height) / scale;

    let top = icon_bottom + POPOVER_GAP;
    let height = POPOVER_MAX_HEIGHT.min(mon_y + mon_h - top - SCREEN_MARGIN).max(320.0);
    let left = (icon_center_x - POPOVER_WIDTH / 2.0)
        .max(mon_x + SCREEN_MARGIN)
        .min(mon_x + mon_w - POPOVER_WIDTH - SCREEN_MARGIN);

    (LogicalPosition::new(left, top), LogicalSize::new(POPOVER_WIDTH, height))
}

fn toggle_popover(app: &tauri::AppHandle, icon_rect: &Rect) {
    let (position, size) = popover_frame(app, icon_rect);

    if let Some(window) = app.get_webview_window("popover") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            return;
        }
        let just_blurred = app
            .state::<PopoverState>()
            .last_blur_hide
            .lock()
            .ok()
            .and_then(|t| *t)
            .is_some_and(|t| t.elapsed() < Duration::from_millis(250));
        if just_blurred {
            return;
        }
        // Height is owned by the frontend (fits the content); only re-anchor it
        let _ = window.set_position(position);
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let liquid = uses_liquid_glass();
    let mut builder = WebviewWindowBuilder::new(app, "popover", WebviewUrl::default())
        .title("World Clock")
        // Starting height only; the frontend resizes the window to its content
        .inner_size(size.width, size.height.min(POPOVER_INITIAL_HEIGHT))
        .position(position.x, position.y)
        .resizable(false)
        .decorations(false)
        .transparent(true)
        .shadow(true)
        .skip_taskbar(true)
        .always_on_top(true)
        .visible_on_all_workspaces(true)
        .visible(true)
        .focused(true);
    // macOS 26+: Liquid Glass is installed after creation; older systems use vibrancy
    if !liquid {
        builder = builder.effects(
            EffectsBuilder::new()
                .effect(Effect::Popover)
                .state(EffectState::Active)
                .radius(POPOVER_RADIUS)
                .build(),
        );
    }
    let window = builder.build();

    #[cfg(target_os = "macos")]
    if liquid {
        if let Ok(win) = &window {
            let win = win.clone();
            let _ = app.run_on_main_thread(move || {
                if let Ok(ns_window) = win.ns_window() {
                    // SAFETY: pointer comes from a live window and we are on the main thread
                    unsafe { macos::install_liquid_glass(ns_window, POPOVER_RADIUS) };
                }
            });
        }
    }

    // Auto-hide when popover loses focus
    if let Ok(win) = window {
        let app_handle = app.clone();
        win.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(false) = event {
                if let Some(w) = app_handle.get_webview_window("popover") {
                    if w.is_visible().unwrap_or(false) {
                        let _ = w.hide();
                        if let Ok(mut t) = app_handle.state::<PopoverState>().last_blur_hide.lock() {
                            *t = Some(Instant::now());
                        }
                    }
                }
            }
        });
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tray_config = Arc::new(Mutex::new(TrayConfig::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .manage(tray_config.clone())
        .manage(PopoverState { last_blur_hide: Mutex::new(None) })
        .setup(move |app| {
            // Menu bar only: no Dock icon, no app switcher entry
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.handle().clone();
            let menu_handle = app.handle().clone();
            let config = tray_config.clone();

            // Build tray context menu
            let app_version = app.package_info().version.to_string();
            let ver_item = MenuItem::with_id(app, "version",
                format!("World Clock v{app_version}"), false, None::<&str>)?;
            let check_item = MenuItem::with_id(app, "check_updates",
                "업데이트 확인", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&ver_item, &check_item, &sep, &quit_item])?;

            let tray = TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .tooltip("World Clock")
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        rect,
                        ..
                    } = event
                    {
                        toggle_popover(&handle, &rect);
                    }
                })
                .build(app)?;

            // Menu event handler
            app.on_menu_event(move |_app, event| {
                match event.id().as_ref() {
                    "check_updates" => {
                        if let Some(win) = menu_handle.get_webview_window("popover") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                        let _ = menu_handle.emit("menu:check-updates", ());
                    }
                    "quit" => {
                        menu_handle.exit(0);
                    }
                    _ => {}
                }
            });

            // Set initial title
            let initial_title = {
                let cfg = config.lock().unwrap_or_else(|e| e.into_inner());
                format_tray_title(&cfg)
            };
            let _ = tray.set_title(Some(&initial_title));

            // Background thread: update tray title every second
            let app_handle = app.handle().clone();
            let config_for_thread = config.clone();
            thread::spawn(move || {
                loop {
                    thread::sleep(Duration::from_secs(1));
                    let title = {
                        let cfg = config_for_thread
                            .lock()
                            .unwrap_or_else(|e| e.into_inner());
                        format_tray_title(&cfg)
                    };
                    if let Some(tray) = app_handle.tray_by_id("main") {
                        let _ = tray.set_title(Some(&title));
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray_config, system_look])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
