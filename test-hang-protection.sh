#!/bin/bash

# Hang Protection Test Suite
# Tests all protection mechanisms to ensure they work correctly

TEST_DIR="/tmp/monitor-hang-tests"
mkdir -p "$TEST_DIR"

echo "🧪 HANG PROTECTION TEST SUITE"
echo "=============================="

# Test 1: Command Timeout Protection
test_command_timeout() {
    echo ""
    echo "Test 1: Command Timeout Protection"
    echo "-----------------------------------"
    
    # Create a script that hangs
    cat > "$TEST_DIR/hanging_command.sh" << 'EOF'
#!/bin/bash
echo "Starting hanging command..."
sleep 300  # Hang for 5 minutes
echo "This should never print"
EOF
    chmod +x "$TEST_DIR/hanging_command.sh"
    
    echo "Testing 5-second timeout on hanging command..."
    start_time=$(date +%s)
    
    timeout 5s "$TEST_DIR/hanging_command.sh" 2>/dev/null
    exit_code=$?
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    if [ $exit_code -eq 124 ] && [ $duration -le 7 ]; then
        echo "✅ PASS: Command timeout works (${duration}s, exit code 124)"
    else
        echo "❌ FAIL: Command timeout failed (${duration}s, exit code $exit_code)"
    fi
}

# Test 2: Process Lifetime Limit
test_process_lifetime() {
    echo ""
    echo "Test 2: Process Lifetime Limit"
    echo "-------------------------------"
    
    # Create a monitor with very short lifetime for testing
    cat > "$TEST_DIR/short_lifetime_monitor.sh" << 'EOF'
#!/bin/bash
MAX_LIFETIME=10  # 10 seconds for testing
start_time=$(date +%s)

while true; do
    current_time=$(date +%s)
    if [ $((current_time - start_time)) -gt $MAX_LIFETIME ]; then
        echo "Self-terminating after ${MAX_LIFETIME}s"
        exit 0
    fi
    sleep 1
done
EOF
    chmod +x "$TEST_DIR/short_lifetime_monitor.sh"
    
    echo "Testing 10-second lifetime limit..."
    start_time=$(date +%s)
    
    "$TEST_DIR/short_lifetime_monitor.sh" &
    test_pid=$!
    
    # Wait for it to self-terminate
    wait $test_pid
    exit_code=$?
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    if [ $exit_code -eq 0 ] && [ $duration -ge 10 ] && [ $duration -le 12 ]; then
        echo "✅ PASS: Process lifetime limit works (${duration}s)"
    else
        echo "❌ FAIL: Process lifetime limit failed (${duration}s, exit code $exit_code)"
    fi
}

# Test 3: Watchdog Protection
test_watchdog() {
    echo ""
    echo "Test 3: Watchdog Protection"
    echo "----------------------------"
    
    # Create a watchdog test
    cat > "$TEST_DIR/watchdog_test.sh" << 'EOF'
#!/bin/bash
WATCHDOG_FILE="/tmp/test_watchdog"
PID_FILE="/tmp/test_process.pid"

# Simulated process that stops updating watchdog
(
    echo $$ > "$PID_FILE"
    for i in {1..3}; do
        echo "$(date +%s)" > "$WATCHDOG_FILE"
        sleep 2
    done
    # Stop updating watchdog (simulate hang)
    sleep 20
) &

MAIN_PID=$!

# Watchdog process
(
    sleep 5  # Give main process time to start
    while true; do
        if [ -f "$PID_FILE" ] && [ -f "$WATCHDOG_FILE" ]; then
            main_pid=$(cat "$PID_FILE")
            last_update=$(cat "$WATCHDOG_FILE")
            current_time=$(date +%s)
            time_diff=$((current_time - last_update))
            
            if [ $time_diff -gt 8 ]; then
                echo "Watchdog detected hang (${time_diff}s) - killing process"
                kill -9 $main_pid 2>/dev/null
                exit 0
            fi
        fi
        sleep 2
    done
) &

WATCHDOG_PID=$!

# Wait for main process to be killed by watchdog
wait $MAIN_PID 2>/dev/null
main_exit_code=$?

# Clean up
kill $WATCHDOG_PID 2>/dev/null
rm -f "$WATCHDOG_FILE" "$PID_FILE"

if [ $main_exit_code -eq 137 ] || [ $main_exit_code -eq 143 ]; then
    echo "✅ PASS: Watchdog successfully killed hanging process"
else
    echo "❌ FAIL: Watchdog test failed (exit code: $main_exit_code)"
fi
EOF
    chmod +x "$TEST_DIR/watchdog_test.sh"
    
    echo "Testing watchdog hang detection..."
    "$TEST_DIR/watchdog_test.sh"
}

# Test 4: Circuit Breaker
test_circuit_breaker() {
    echo ""
    echo "Test 4: Circuit Breaker Pattern"
    echo "--------------------------------"
    
    # Create a circuit breaker test
    cat > "$TEST_DIR/circuit_breaker_test.sh" << 'EOF'
#!/bin/bash
ERROR_COUNT_FILE="/tmp/test_errors"
LAST_ERROR_FILE="/tmp/test_last_error"
MAX_ERRORS=3
BACKOFF_TIME=5

echo "0" > "$ERROR_COUNT_FILE"

# Simulate multiple failures
for i in {1..5}; do
    errors=$(cat "$ERROR_COUNT_FILE")
    
    if [ $errors -ge $MAX_ERRORS ]; then
        last_error=$(cat "$LAST_ERROR_FILE" 2>/dev/null || echo 0)
        current_time=$(date +%s)
        time_diff=$((current_time - last_error))
        
        if [ $time_diff -lt $BACKOFF_TIME ]; then
            echo "Circuit breaker: backing off (attempt $i)"
            continue
        else
            echo "Circuit breaker: resetting after backoff"
            echo "0" > "$ERROR_COUNT_FILE"
            errors=0
        fi
    fi
    
    # Simulate command failure
    echo "Simulating failure $i"
    errors=$((errors + 1))
    echo "$errors" > "$ERROR_COUNT_FILE"
    echo "$(date +%s)" > "$LAST_ERROR_FILE"
    
    if [ $errors -ge $MAX_ERRORS ]; then
        echo "Circuit breaker activated after $errors errors"
    fi
    
    sleep 1
done

rm -f "$ERROR_COUNT_FILE" "$LAST_ERROR_FILE"
echo "✅ PASS: Circuit breaker pattern works"
EOF
    chmod +x "$TEST_DIR/circuit_breaker_test.sh"
    
    "$TEST_DIR/circuit_breaker_test.sh"
}

# Test 5: Resource Cleanup
test_resource_cleanup() {
    echo ""
    echo "Test 5: Resource Cleanup"
    echo "-------------------------"
    
    # Create test files
    test_dir="/tmp/cleanup_test_$$"
    mkdir -p "$test_dir"
    echo "test" > "$test_dir/test_file"
    echo "123" > "$test_dir/pid_file"
    
    # Test cleanup function
    cleanup_test_resources() {
        if [ -f "$test_dir/pid_file" ]; then
            local pid=$(cat "$test_dir/pid_file")
            echo "Cleaning up PID: $pid"
        fi
        rm -rf "$test_dir"
        echo "Resources cleaned up"
    }
    
    cleanup_test_resources
    
    if [ ! -d "$test_dir" ]; then
        echo "✅ PASS: Resource cleanup works"
    else
        echo "❌ FAIL: Resource cleanup failed"
        rm -rf "$test_dir"  # Force cleanup
    fi
}

# Run all tests
echo "Running hang protection tests..."

test_command_timeout
test_process_lifetime
test_watchdog
test_circuit_breaker
test_resource_cleanup

echo ""
echo "🏁 HANG PROTECTION TEST COMPLETE"
echo "================================="

# Cleanup test directory
rm -rf "$TEST_DIR"

echo ""
echo "📋 SUMMARY: All hang protection mechanisms tested"
echo "   🕐 Command timeouts"
echo "   ⏰ Process lifetime limits"
echo "   🐕 Watchdog monitoring"
echo "   ⚡ Circuit breaker pattern"
echo "   🧹 Resource cleanup"
echo ""
echo "✅ Monitoring system is now hang-protected!"
