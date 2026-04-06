use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use chrono::Utc;
use chrono_tz::Tz;
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder},
    Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder,
};

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

fn show_popover(app: &tauri::AppHandle, click_pos: &PhysicalPosition<f64>) {
    let win_width = 360.0_f64;
    let win_height = 780.0_f64;

    // Position window centered horizontally on click, just below menu bar
    let x = click_pos.x - (win_width / 2.0);
    let y = click_pos.y + 8.0;

    if let Some(window) = app.get_webview_window("popover") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.set_position(PhysicalPosition::new(x as i32, y as i32));
            let _ = window.show();
            let _ = window.set_focus();
        }
    } else {
        let window = WebviewWindowBuilder::new(app, "popover", WebviewUrl::default())
            .title("World Clock")
            .inner_size(win_width, win_height)
            .position(x, y)
            .resizable(false)
            .decorations(false)
            .always_on_top(true)
            .visible(true)
            .focused(true)
            .build();

        // Auto-hide when popover loses focus
        if let Ok(win) = window {
            let app_handle = app.clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    if let Some(w) = app_handle.get_webview_window("popover") {
                        let _ = w.hide();
                    }
                }
            });
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tray_config = Arc::new(Mutex::new(TrayConfig::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(tray_config.clone())
        .setup(move |app| {
            let handle = app.handle().clone();
            let config = tray_config.clone();

            let tray = TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .tooltip("World Clock")
                .on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        position,
                        ..
                    } = event
                    {
                        show_popover(&handle, &position);
                    }
                })
                .build(app)?;

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
        .invoke_handler(tauri::generate_handler![update_tray_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
