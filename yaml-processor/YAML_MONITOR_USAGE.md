# YAML Processor System Documentation
# ================================

# NPM Scripts for YAML Processing
npm run yaml              # Process all content files
npm run yaml:validate     # Only validate, don't modify files
npm run yaml:materials    # Process only material files
npm run yaml:check-file   # Check a specific file

# Error Monitoring & Dictionary Management
npm run yaml:monitor      # Start the automatic error monitor
npm run yaml:list-errors  # List all known errors
npm run yaml:report       # Generate a detailed error report

# Using the Terminal Error Monitor
# -------------------------------
# The terminal_error_monitor.py script will automatically detect and
# add YAML errors to your dictionary in real-time.

# Start monitoring with:
cd yaml-processor
./yaml-monitor.sh --watch

# Execute and monitor:
./yaml-monitor.sh --execute

# Set longer interval:
./yaml-monitor.sh --interval 30

# Run in quiet mode:
./yaml-monitor.sh --quiet

# Adding the Error Monitoring to package.json
# ------------------------------------------
# Add these scripts to your package.json:

"yaml:monitor": "cd yaml-processor && ./yaml-monitor.sh --watch",
"yaml:monitor:execute": "cd yaml-processor && ./yaml-monitor.sh --execute",
"yaml:list-errors": "cd yaml-processor/tools && python3 yaml_error_tracker.py list --with-solutions",
"yaml:report": "cd yaml-processor/tools && python3 yaml_error_tracker.py report"
