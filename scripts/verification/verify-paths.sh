#!/bin/bash
echo "=== VERIFYING IMAGE PATHS ==="
echo ""

paths=(
  "public/images/favicon/favicon-350.png"
  "public/images/netalux/photo_pro.jpg"
  "public/images/netalux/netalux_group.png"
  "public/images/van/van.png"
)

for path in "${paths[@]}"; do
  if [ -f "$path" ]; then
    echo "✅ EXISTS: $path"
  else
    echo "❌ MISSING: $path"
  fi
done

echo ""
echo "=== VERIFICATION COMPLETE ==="
