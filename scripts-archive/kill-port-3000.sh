#!/bin/bash

# Kill Port 3000 Script
# Frees up port 3000 by killing any processes using it

echo "🔧 FREEING PORT 3000"
echo "===================="

if ! command -v lsof > /dev/null 2>&1; then
    echo "❌ lsof command not available - cannot kill port processes"
    exit 1
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    PIDS=$(lsof -ti:3000)
    echo "🎯 Found processes using port 3000:"
    
    for PID in $PIDS; do
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        echo "   • PID $PID ($PROCESS)"
    done
    
    echo ""
    echo "🔨 Killing processes..."
    
    for PID in $PIDS; do
        echo "   Killing PID $PID..."
        if kill $PID 2>/dev/null; then
            sleep 0.5
            if ! ps -p $PID > /dev/null 2>&1; then
                echo "   ✅ PID $PID killed successfully"
            else
                echo "   🔨 Using force kill on PID $PID..."
                kill -9 $PID 2>/dev/null
                sleep 0.5
                if ! ps -p $PID > /dev/null 2>&1; then
                    echo "   ✅ PID $PID force killed"
                else
                    echo "   ❌ Could not kill PID $PID"
                fi
            fi
        else
            echo "   ❌ Failed to kill PID $PID"
        fi
    done
    
    echo ""
    # Final check
    if ! lsof -ti:3000 > /dev/null 2>&1; then
        echo "🎉 SUCCESS: Port 3000 is now free!"
        echo "   You can now run: npm run dev"
    else
        echo "❌ FAILED: Port 3000 still in use"
        echo "   Remaining processes:"
        lsof -ti:3000 | xargs ps -p 2>/dev/null || echo "   (Could not list processes)"
    fi
else
    echo "✅ Port 3000 is already free!"
fi

echo "===================="
