use tauri::{
    tray::TrayIconBuilder, Manager, WebviewUrl, WebviewWindowBuilder,
};

#[tauri::command]
fn update_tray_title(app: tauri::AppHandle, title: String) {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_title(Some(&title));
    }
}

fn toggle_popover(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("popover") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    } else {
        let _ = WebviewWindowBuilder::new(app, "popover", WebviewUrl::default())
            .title("World Clock")
            .inner_size(360.0, 640.0)
            .resizable(false)
            .decorations(false)
            .always_on_top(true)
            .visible(true)
            .focused(true)
            .build();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let tray = TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .tooltip("World Clock")
                .on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        toggle_popover(&handle);
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
