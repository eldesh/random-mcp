#!/bin/sh
set -eux

# Update Smithery server metadata using the Smithery API.
#
# https://smithery.ai/docs/api-reference/servers/update-a-server

SMITHERY_API_KEY=${1:?"Missing Smithery API key argument. Usage: $0 <smithery_api_key>"}
shift
API_BODY=@-
if [ $# -ne 0 ]; then
  API_BODY=@$1
  shift
fi
[ $# -eq 0 ] || (echo "Unknown arguments: $*" >&2; exit 1)

curl -X PATCH \
  "https://api.smithery.ai/servers/eldesh%2Frandom-mcp" \
  -H "Authorization: Bearer $SMITHERY_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "${API_BODY}"
