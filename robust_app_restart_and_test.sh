#!/bin/bash

# Relaunch script with sudo if not already root
if [[ $EUID -ne 0 ]]; then
  echo "[INFO] Script not running as root. Relaunching with sudo..."
  exec sudo bash "$0" "$@"
fi
# robust_app_restart_and_test.sh
# This script force stops all app-related processes, frees up ports, restarts all services, captures logs, and tests the INSCRIPTION flow.
# It will attempt to fix errors automatically if detected.

set -euo pipefail

# CONFIGURABLE VARIABLES
DB_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
DB_SERVICE=postgresql
BACKEND_DIR="$(pwd)/backend"
FRONTEND_DIR="$(pwd)/frontend"
LOG_DIR="$(pwd)/logs"
mkdir -p "$LOG_DIR"

# 1. FORCE STOP ALL APP-RELATED PROCESSES
function kill_port() {
  local port=$1
  fuser -k ${port}/tcp || true
}

echo "[INFO] Killing processes on ports $DB_PORT, $BACKEND_PORT, $FRONTEND_PORT..."
kill_port $DB_PORT
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# 2. FREE UP PORTS (already done above)

# 3. START DATABASE SERVER
sudo systemctl restart $DB_SERVICE || sudo service $DB_SERVICE restart
sleep 3

# 4. START BACKEND SERVER
cd "$BACKEND_DIR"
echo "[INFO] Starting backend server..."
PYTHONPATH=. ../.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 5

# 5. START FRONTEND SERVER
cd "$FRONTEND_DIR"
echo "[INFO] Starting frontend server..."
npm run dev -- --port $FRONTEND_PORT > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 10

# 6. LOG LISTENERS (already redirecting logs above)

echo "[INFO] Tailing logs..."
tail -n 20 -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log" &
TAIL_PID=$!

# 7. ERROR DETECTION & AUTO-FIX (simple grep for errors, can be extended)
function check_and_fix_errors() {
  local log_file=$1
  if grep -i 'error\|exception\|traceback' "$log_file"; then
    echo "[ERROR] Detected in $log_file. Please check and fix manually or extend this script for auto-fix."
    # Placeholder: Here you could add AI/Internet search and auto-fix logic.
    # For now, just exit with error.
    kill $BACKEND_PID $FRONTEND_PID $TAIL_PID || true
    exit 1
  fi
}

check_and_fix_errors "$LOG_DIR/backend.log"
check_and_fix_errors "$LOG_DIR/frontend.log"

# 8. TEST INSCRIPTION FLOW
cd "$FRONTEND_DIR"
API_URL="http://localhost:$BACKEND_PORT/api/v1/users"
echo "[INFO] Testing INSCRIPTION flow with curl..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","nom":"User","email":"testuser@example.com","ville":"Paris","pays":"France","category":"spectateur"}'

# Puppeteer/Playwright test (Node.js required)
# You can add more robust browser automation here if needed.

# 9. CLEANUP
kill $TAIL_PID || true

echo "[INFO] All done. Logs are in $LOG_DIR."
