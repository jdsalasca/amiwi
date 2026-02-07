use serde::Serialize;
use std::process::Command;

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
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![detect_system_music])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
