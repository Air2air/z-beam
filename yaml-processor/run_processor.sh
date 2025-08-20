#!/bin/bash
# Z-Beam YAML Processor Runner
# ============================
# Convenience script to run the YAML processor and test build

set -e  # Exit on any error

echo "🎯 Z-Beam YAML Processor System"
echo "================================"
echo

# Ensure we're in the right directory
if [ ! -f "yaml_processor.py" ]; then
    echo "❌ Error: yaml_processor.py not found"
    echo "   Make sure you're running this from the yaml-processor directory"
    exit 1
fi

# Check if content directory exists
if [ ! -d "../content" ]; then
    echo "❌ Error: ../content directory not found"
    echo "   Make sure the yaml-processor directory is in the project root"
    exit 1
fi

echo "🔧 Running YAML processor on ../content..."
python3 yaml_processor.py ../content

echo
echo "🔍 Testing Next.js build..."
cd ..
npm run build

if [ $? -eq 0 ]; then
    echo
    echo "✅ Success! All YAML issues resolved and build passed."
    echo "🎉 Your content is ready for production!"
else
    echo
    echo "❌ Build failed. There may be remaining issues to address."
    exit 1
fi
