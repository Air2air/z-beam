#!/bin/bash
# Automatically monitor and update YAML error tracking
# This script sets up continuous monitoring of YAML errors

# Configuration
LOG_FILE="yaml-errors.log"
MONITOR_INTERVAL=10
DICTIONARY_PATH="format_issues_dictionary.json"

# Help message
show_help() {
  echo "YAML Error Auto-Monitor"
  echo "======================="
  echo "Automatically monitors YAML processing errors and updates the error dictionary."
  echo ""
  echo "Usage:"
  echo "  ./yaml-monitor.sh [options]"
  echo ""
  echo "Options:"
  echo "  --watch      Monitor existing log file (default)"
  echo "  --execute    Execute YAML processor and monitor its output"
  echo "  --interval N Set check interval in seconds (default: 10)"
  echo "  --quiet      Suppress informational output"
  echo "  --help       Show this help message"
  echo ""
  echo "Examples:"
  echo "  # Watch the log file for new errors"
  echo "  ./yaml-monitor.sh --watch"
  echo ""
  echo "  # Run the YAML processor and monitor its output"
  echo "  ./yaml-monitor.sh --execute"
  echo ""
}

# Parse arguments
EXECUTE_MODE=false
QUIET_MODE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      show_help
      exit 0
      ;;
    --watch)
      EXECUTE_MODE=false
      shift
      ;;
    --execute)
      EXECUTE_MODE=true
      shift
      ;;
    --interval)
      MONITOR_INTERVAL="$2"
      shift 2
      ;;
    --quiet)
      QUIET_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Print startup message
if [[ "$QUIET_MODE" == "false" ]]; then
  echo "🔍 YAML Error Auto-Monitor"
  echo "=========================="
  echo "Starting error monitoring at $(date)"
  echo "Log file: $LOG_FILE"
  echo "Dictionary: $DICTIONARY_PATH"
  echo "Interval: $MONITOR_INTERVAL seconds"
  echo ""
fi

# Run the monitor
if [[ "$EXECUTE_MODE" == "true" ]]; then
  if [[ "$QUIET_MODE" == "true" ]]; then
    python3 tools/terminal_error_monitor.py --command="./yaml ../content --verbose" --interval="$MONITOR_INTERVAL" --quiet
  else
    python3 tools/terminal_error_monitor.py --command="./yaml ../content --verbose" --interval="$MONITOR_INTERVAL"
  fi
else
  if [[ "$QUIET_MODE" == "true" ]]; then
    python3 tools/terminal_error_monitor.py --logfile="$LOG_FILE" --interval="$MONITOR_INTERVAL" --quiet
  else
    python3 tools/terminal_error_monitor.py --logfile="$LOG_FILE" --interval="$MONITOR_INTERVAL"
  fi
fi

# Exit gracefully
if [[ "$QUIET_MODE" == "false" ]]; then
  echo ""
  echo "Monitor stopped at $(date)"
fi

exit 0
