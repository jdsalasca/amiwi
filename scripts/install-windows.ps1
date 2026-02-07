param(
  [string]$Version = "latest",
  [switch]$Quick
)

$owner = "jdsalasca"
$repo = "amiwi"

if ($Version -eq "latest") {
  $releaseUrl = "https://github.com/$owner/$repo/releases/latest/download/Amiwi_*_x64-setup.exe"
} else {
  $cleanVersion = $Version.TrimStart("v")
  $releaseUrl = "https://github.com/$owner/$repo/releases/download/$Version/Amiwi_${cleanVersion}_x64-setup.exe"
}

$target = Join-Path $env:TEMP "Amiwi-setup.exe"
Write-Host "Downloading installer from $releaseUrl"
Invoke-WebRequest -Uri $releaseUrl -OutFile $target

if ($Quick) {
  Write-Host "Running quick silent install..."
  Start-Process -FilePath $target -ArgumentList "/S" -Wait
} else {
  Write-Host "Running guided install..."
  Start-Process -FilePath $target -Wait
}
