#!/bin/bash
# Prevent Mac from sleeping while Claude Code is working

PIDFILE="/tmp/claude-caffeinate.pid"

# Kill any existing caffeinate process from previous runs
if [ -f "$PIDFILE" ]; then
    kill $(cat "$PIDFILE") 2>/dev/null
    rm -f "$PIDFILE"
fi

# Start caffeinate in background (prevents idle sleep for 1 hour)
# Use nohup and redirect output to prevent hook from blocking
nohup caffeinate -i -t 3600 >/dev/null 2>&1 &
echo $! > "$PIDFILE"

# Exit immediately
exit 0
