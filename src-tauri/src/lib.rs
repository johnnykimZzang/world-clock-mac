use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder},
    Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder,
};

#[tauri::command]
fn update_tray_title(app: tauri::AppHandle, title: String) {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_title(Some(&title));
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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let handle = app.handle().clone();

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
            let _ = tray.set_title(Some("🕐"));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray_title])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
