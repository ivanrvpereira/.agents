#!/bin/bash
# Allow Mac to sleep again after Claude Code stops

PIDFILE="/tmp/claude-caffeinate.pid"

if [ -f "$PIDFILE" ]; then
    kill $(cat "$PIDFILE") 2>/dev/null
    rm -f "$PIDFILE"
fi

# Exit immediately
exit 0
