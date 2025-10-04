#!/bin/bash
echo "=== VERIFYING IMAGE PATHS ==="
echo ""

paths=(
  "public/images/site/favicon/favicon_350.png"
  "public/images/site/netalux/photo_pro.jpg"
  "public/images/site/netalux/netalux_group.png"
  "public/images/site/van/van.png"
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
