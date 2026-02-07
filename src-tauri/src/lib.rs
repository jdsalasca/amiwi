use serde::Serialize;
use std::process::Command;
use tauri::Emitter;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Serialize)]
struct MusicDetection {
    active: bool,
    source: String,
    method: String,
}

#[tauri::command]
async fn detect_system_music() -> MusicDetection {
    tauri::async_runtime::spawn_blocking(detect_system_music_impl)
        .await
        .unwrap_or(MusicDetection {
            active: false,
            source: String::new(),
            method: "spawn_error".to_string(),
        })
}

#[cfg(target_os = "windows")]
fn detect_system_music_impl() -> MusicDetection {
    let script = "Get-Process Spotify,AppleMusic,iTunes,vlc -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName | Select-Object -First 1";

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", script])
        .output();

    if let Ok(result) = output {
        let source = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if !source.is_empty() {
            return MusicDetection {
                active: true,
                source,
                method: "process_presence_beta".to_string(),
            };
        }
    }

    MusicDetection {
        active: false,
        source: String::new(),
        method: "process_presence_beta".to_string(),
    }
}

#[cfg(target_os = "macos")]
fn detect_system_music_impl() -> MusicDetection {
    let script = "for app in Spotify Music VLC; do pgrep -x \"$app\" >/dev/null && echo $app && exit 0; done";

    let output = Command::new("sh").args(["-c", script]).output();

    if let Ok(result) = output {
        let source = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if !source.is_empty() {
            return MusicDetection {
                active: true,
                source,
                method: "process_presence_beta".to_string(),
            };
        }
    }

    MusicDetection {
        active: false,
        source: String::new(),
        method: "process_presence_beta".to_string(),
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn detect_system_music_impl() -> MusicDetection {
    MusicDetection {
        active: false,
        source: String::new(),
        method: "not_supported".to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyA);
            let app_handle = app.handle().clone();

            app.global_shortcut().on_shortcut(shortcut.clone(), move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = app_handle.emit("amiwi://toggle-settings", ());
                }
            })?;

            app.global_shortcut().register(shortcut)?;
            Ok(())
        })
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![detect_system_music])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
