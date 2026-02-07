#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-latest}"
OWNER="jdsalasca"
REPO="amiwi"

if [[ "$VERSION" == "latest" ]]; then
  URL="https://github.com/${OWNER}/${REPO}/releases/latest/download/Amiwi_*.dmg"
else
  CLEAN_VERSION="${VERSION#v}"
  URL="https://github.com/${OWNER}/${REPO}/releases/download/${VERSION}/Amiwi_${CLEAN_VERSION}_aarch64.dmg"
fi

TARGET="/tmp/amiwi.dmg"
echo "Downloading installer from ${URL}"
curl -L "${URL}" -o "${TARGET}"
echo "Open ${TARGET} and drag Amiwi to Applications"
open "${TARGET}"
