#!/bin/bash
# Automated log capture and error-fixing script for ETERNELLES
# Usage: ./auto_fix.sh

set -e

WORKDIR="$(dirname "$0")"
cd "$WORKDIR"

# 1. Capture logs
DB_LOG="/tmp/db.log"
BACKEND_LOG="/tmp/backend.log"
FRONTEND_LOG="/tmp/frontend.log"
BROWSER_LOG="/tmp/browser.log"

# Database logs (PostgreSQL)
sudo journalctl -u postgresql --since '10 minutes ago' > "$DB_LOG" 2>&1 || sudo tail -n 200 /var/log/postgresql/postgresql-*.log > "$DB_LOG" 2>&1

# Backend logs
if [ -f backend/nohup.out ]; then
  tail -n 200 backend/nohup.out > "$BACKEND_LOG"
else
  echo "No backend/nohup.out found" > "$BACKEND_LOG"
fi

# Frontend logs (Vite)
if [ -f frontend/vite.log ]; then
  tail -n 200 frontend/vite.log > "$FRONTEND_LOG"
else
  echo "No frontend/vite.log found" > "$FRONTEND_LOG"
fi

# Browser logs (headless Chrome, if available)
if command -v google-chrome > /dev/null; then
  google-chrome --headless --disable-gpu --dump-dom http://localhost:3000 > "$BROWSER_LOG" 2>&1 || echo "Browser log capture failed" > "$BROWSER_LOG"
else
  echo "Chrome not found, skipping browser log" > "$BROWSER_LOG"
fi

# 2. Analyze logs for known errors and attempt fixes
echo "Analyzing logs..."

# Example: Check for database auth errors and suggest fix
if grep -q "password authentication failed" "$DB_LOG"; then
  echo "[ERROR] Database password authentication failed. Check DB user and password in backend/.env." | tee -a auto_fix_report.txt
fi

# Example: Check for missing module errors in backend
if grep -q "ModuleNotFoundError" "$BACKEND_LOG"; then
  echo "[ERROR] Python module not found in backend. Check PYTHONPATH and dependencies." | tee -a auto_fix_report.txt
fi

# Example: Check for npm errors in frontend
if grep -q "npm error" "$FRONTEND_LOG"; then
  echo "[ERROR] NPM error in frontend. Run 'npm install' in frontend directory." | tee -a auto_fix_report.txt
fi

# Example: Check for browser-side errors
if grep -q "Uncaught" "$BROWSER_LOG"; then
  echo "[ERROR] JavaScript error in browser. Check browser console for details." | tee -a auto_fix_report.txt
fi

# 3. (Optional) Recursively apply fixes (requires more context and permissions)
# This script can be extended to automatically run migrations, install dependencies, or restart services.

# 4. Output summary
echo "\n--- Log Analysis Summary ---"
cat auto_fix_report.txt || echo "No critical errors detected."

echo "\n--- End of auto_fix.sh ---"
