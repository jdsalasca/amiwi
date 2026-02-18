#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-latest}"
OWNER="jdsalasca"
REPO="amiwi"
API_BASE="https://api.github.com/repos/${OWNER}/${REPO}/releases"

if [[ "$VERSION" == "latest" ]]; then
  RELEASE_URL="${API_BASE}/latest"
else
  RELEASE_URL="${API_BASE}/tags/${VERSION}"
fi

TARGET="/tmp/amiwi.dmg"
echo "Resolving release asset from ${RELEASE_URL}"
ASSET_URL="$(curl -fsSL \
  -H "Accept: application/vnd.github+json" \
  -H "User-Agent: amiwi-installer-script" \
  "${RELEASE_URL}" | python3 -c 'import json,sys; data=json.load(sys.stdin); assets=data.get("assets", []); 
for item in assets:
    name=item.get("name","")
    if name.startswith("Amiwi_") and name.endswith("_aarch64.dmg"):
        print(item.get("browser_download_url",""))
        break')"

if [[ -z "${ASSET_URL}" ]]; then
  echo "No macOS DMG asset found for release '${VERSION}'." >&2
  exit 1
fi

echo "Downloading installer from ${ASSET_URL}"
curl -fsSL "${ASSET_URL}" -o "${TARGET}"
echo "Open ${TARGET} and drag Amiwi to Applications"
open "${TARGET}"
