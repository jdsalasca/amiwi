param(
  [string]$Version = "latest",
  [switch]$Quick
)

$owner = "jdsalasca"
$repo = "amiwi"
$apiBase = "https://api.github.com/repos/$owner/$repo/releases"

if ($Version -eq "latest") {
  $releaseInfoUrl = "$apiBase/latest"
} else {
  $releaseInfoUrl = "$apiBase/tags/$Version"
}

Write-Host "Resolving release asset from $releaseInfoUrl"
$headers = @{
  "Accept" = "application/vnd.github+json"
  "User-Agent" = "amiwi-installer-script"
}

try {
  $release = Invoke-RestMethod -Uri $releaseInfoUrl -Headers $headers
} catch {
  throw "Could not resolve release metadata. Check version/tag and network connectivity."
}

$asset = $release.assets | Where-Object { $_.name -match "^Amiwi_.*_x64-setup\.exe$" } | Select-Object -First 1
if (-not $asset) {
  throw "No Windows installer asset found in release '$($release.tag_name)'."
}

$target = Join-Path $env:TEMP "Amiwi-setup.exe"
Write-Host "Downloading installer from $($asset.browser_download_url)"
Invoke-WebRequest -Uri $asset.browser_download_url -Headers $headers -OutFile $target

if ($Quick) {
  Write-Host "Running quick silent install..."
  Start-Process -FilePath $target -ArgumentList "/S" -Wait
} else {
  Write-Host "Running guided install..."
  Start-Process -FilePath $target -Wait
}
