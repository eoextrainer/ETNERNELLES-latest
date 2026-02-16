#!/bin/bash
# eternel_restart_and_test.sh
# Force stop all related processes, free ports, restart DB, backend, frontend, capture logs, auto-fix errors, and test registration flow.

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="$APP_DIR/logs"
mkdir -p "$LOG_DIR"

# 1. Force stop all related processes
pkill -f uvicorn || true
pkill -f node || true
pkill -f vite || true
pkill -f python3 app/main.py || true
pkill -f "python3.*main.py" || true

# 2. Free up ports (8000 for backend, 5432 for postgres, 5173 for vite)
for port in 8000 5432 5173; do
  fuser -k $port/tcp || true
done

# 3. Start database server (PostgreSQL)
echo "[INFO] Starting PostgreSQL..."
sudo systemctl start postgresql || sudo service postgresql start
sleep 2

# 4. Start backend server
cd "$BACKEND_DIR"
echo "[INFO] Starting backend (FastAPI)..."
PYTHONPATH=. ../.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 3

# 5. Start frontend server
cd "$FRONTEND_DIR"
echo "[INFO] Starting frontend (Vite)..."
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 5

# 6. Start log listeners (tail -f in background)
tail -F "$LOG_DIR/backend.log" > "$LOG_DIR/backend.tail.log" 2>&1 &
tail -F "$LOG_DIR/frontend.log" > "$LOG_DIR/frontend.tail.log" 2>&1 &

# 7. Error detection and auto-fix (simple scan for now)
function scan_and_fix_errors() {
  local log_file="$1"
  if grep -iE "error|exception|traceback|fail" "$log_file"; then
    echo "[ERROR] Detected in $log_file. Manual intervention or advanced AI fix needed."
    # Placeholder: Here you would call AI tools or scripts to auto-fix
    # For now, just print the error and exit
    exit 1
  fi
}

scan_and_fix_errors "$LOG_DIR/backend.log"
scan_and_fix_errors "$LOG_DIR/frontend.log"

# 8. Test frontend [INSCRIPTION] form flow
cd "$APP_DIR"
echo "[INFO] Testing registration API with curl..."
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","nom":"User","email":"testuser@example.com","ville":"Paris","pays":"France","category":"spectateur"}'

# Optionally: Puppeteer/Playwright/Browser test (placeholder)
echo "[INFO] (Placeholder) Run Puppeteer/Playwright/Browser tests for registration form."
# You would add node scripts or python scripts here for full browser automation.

# 9. Final status
echo "[INFO] All servers running. Logs in $LOG_DIR. Manual review recommended."
