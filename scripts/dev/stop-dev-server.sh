#!/bin/bash
# Stop Next.js development server
pkill -f "next dev" 2>/dev/null || echo "No dev server processes found to stop"
echo "Dev server stop command completed"
