use serde::Serialize;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;
use tauri::Emitter;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Serialize)]
struct MusicDetection {
    active: bool,
    source: String,
    method: String,
}

fn parse_detection_line(line: &str) -> Option<MusicDetection> {
    let mut parts = line.trim().splitn(3, '|');
    let active = parts.next()?;
    let source = parts.next().unwrap_or_default().to_string();
    let method = parts.next().unwrap_or("unknown").to_string();
    let active = matches!(active, "1" | "true" | "True");
    Some(MusicDetection {
        active,
        source,
        method,
    })
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
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let run_powershell = |script: &str| {
        Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-WindowStyle",
                "Hidden",
                "-Command",
                script,
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
    };

    let native_script = "$ErrorActionPreference='SilentlyContinue'; try { $manager=[Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime]::RequestAsync().GetAwaiter().GetResult(); if($null -eq $manager){ '0||windows_gsmtc'; exit 0 }; $sessions=$manager.GetSessions(); foreach($session in $sessions){ $info=$session.GetPlaybackInfo(); if($null -ne $info -and $info.PlaybackStatus.ToString() -eq 'Playing'){ $source=$session.SourceAppUserModelId; if([string]::IsNullOrWhiteSpace($source)){ $source='system' }; $source=$source -replace '\\|','/'; '1|' + $source + '|windows_gsmtc'; exit 0 } }; '0||windows_gsmtc' } catch { '0||windows_gsmtc_error' }";
    let native_output = run_powershell(native_script);

    if let Ok(result) = native_output {
        let line = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if let Some(parsed) = parse_detection_line(&line) {
            if parsed.method != "windows_gsmtc_error" {
                return parsed;
            }
        }
    }

    let heuristic_script = "$ErrorActionPreference='SilentlyContinue'; try { try { $itunes = New-Object -ComObject iTunes.Application; if($itunes.PlayerState -eq 1){ '1|iTunes|itunes_com'; exit 0 } } catch {}; $names=@('Spotify','AppleMusic','iTunes','vlc'); $samples=@{}; foreach($name in $names){ $proc=Get-Process -Name $name -ErrorAction SilentlyContinue | Select-Object -First 1; if($null -ne $proc){ $samples[$name]=[double]$proc.TotalProcessorTime.TotalMilliseconds } }; Start-Sleep -Milliseconds 650; foreach($name in $samples.Keys){ $proc=Get-Process -Name $name -ErrorAction SilentlyContinue | Select-Object -First 1; if($null -ne $proc){ $delta=[double]$proc.TotalProcessorTime.TotalMilliseconds - $samples[$name]; if($delta -gt 15){ '1|' + $proc.ProcessName + '|process_cpu_heuristic'; exit 0 } } }; if($samples.Count -gt 0){ $source=($samples.Keys | Select-Object -First 1); '0|' + $source + '|process_cpu_heuristic'; exit 0 }; '0||process_cpu_heuristic' } catch { '0||process_cpu_heuristic_error' }";
    let heuristic_output = run_powershell(heuristic_script);

    if let Ok(result) = heuristic_output {
        let line = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if let Some(parsed) = parse_detection_line(&line) {
            return parsed;
        }
    }

    MusicDetection {
        active: false,
        source: String::new(),
        method: "windows_detection_failed".to_string(),
    }
}

#[cfg(target_os = "macos")]
fn detect_system_music_impl() -> MusicDetection {
    let native_output = Command::new("osascript")
        .args([
            "-e",
            "if application \"Spotify\" is running then tell application \"Spotify\" to if player state is playing then return \"1|Spotify|applescript_native\"",
            "-e",
            "if application \"Music\" is running then tell application \"Music\" to if player state is playing then return \"1|Music|applescript_native\"",
            "-e",
            "return \"0||applescript_native\"",
        ])
        .output();

    if let Ok(result) = native_output {
        let line = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if let Some(parsed) = parse_detection_line(&line) {
            return parsed;
        }
    }

    let fallback = Command::new("sh")
        .args([
            "-c",
            "for app in Spotify Music VLC; do pgrep -x \"$app\" >/dev/null && echo \"0|$app|process_presence_beta\" && exit 0; done; echo \"0||process_presence_beta\"",
        ])
        .output();

    if let Ok(result) = fallback {
        let line = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if let Some(parsed) = parse_detection_line(&line) {
            return parsed;
        }
    }

    MusicDetection {
        active: false,
        source: String::new(),
        method: "mac_detection_failed".to_string(),
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
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyA);
            #[cfg(not(target_os = "macos"))]
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyA);
            let app_handle = app.handle().clone();

            if let Err(error) = app.global_shortcut().on_shortcut(
                shortcut.clone(),
                move |_app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = app_handle.emit("amiwi://toggle-settings", ());
                    }
                },
            ) {
                eprintln!("global shortcut listener unavailable: {error}");
            }

            if let Err(error) = app.global_shortcut().register(shortcut.clone()) {
                eprintln!("global shortcut registration failed for Ctrl+Shift+A: {error}");
                let fallback = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyA);
                if let Err(fallback_error) = app.global_shortcut().register(fallback) {
                    eprintln!("fallback global shortcut registration failed: {fallback_error}");
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![detect_system_music])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
