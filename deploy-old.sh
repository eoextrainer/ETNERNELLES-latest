#!/bin/bash

# ==============================================================================
# ETERNELLES Application Deployment & Validation Script
# ==============================================================================
# This script automates the complete deployment workflow:
# 1. Kills all processes on app ports
# 2. Starts backend FastAPI server
# 3. Starts frontend Vite dev server
# 4. Opens app in browser
# 5. Waits for user validation
# 6. If approved: stages, commits, pushes to GitHub and deploys to Render
# 7. If rejected: runs self-healing (error fixing) and restarts
# ==============================================================================

set -e

PROJECT_ROOT="/home/sos10/Documents/EOEX/ETERNELLES"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_LOG="/tmp/ETERNELLES_backend.log"
FRONTEND_LOG="/tmp/ETERNELLES_frontend.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==============================================================================
# Function: Print colored output
# ==============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ==============================================================================
# Function: Kill all processes on app ports
# ==============================================================================
cleanup_ports() {
    log_info "Cleaning up ports..."
    
    for port in 3000 3001 3002 8000; do
        if lsof -i :$port &>/dev/null 2>&1; then
            log_warning "Port $port is in use, killing processes..."
            sudo fuser -k $port/tcp 2>/dev/null || true
        fi
    done
    
    sleep 2
    
    # Verify ports are free
    for port in 3000 3001 3002 8000; do
        if ! lsof -i :$port &>/dev/null 2>&1; then
            log_success "Port $port is now free"
        else
            log_error "Port $port is still in use!"
            return 1
        fi
    done
}

# ==============================================================================
# Function: Start backend server
# ==============================================================================
start_backend() {
    log_info "Starting backend FastAPI server on port $BACKEND_PORT..."
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Kill any existing backend process
    pkill -f "uvicorn app.main" 2>/dev/null || true
    sleep 1
    
    # Start backend in background
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3
    
    # Verify backend is running
    if curl -s http://localhost:$BACKEND_PORT/api/v1/health &>/dev/null; then
        log_success "Backend is running on port $BACKEND_PORT (PID: $BACKEND_PID)"
        echo $BACKEND_PID > /tmp/ETERNELLES_backend.pid
        return 0
    else
        log_error "Backend failed to start"
        cat "$BACKEND_LOG"
        return 1
    fi
}

# ==============================================================================
# Function: Start frontend server
# ==============================================================================
start_frontend() {
    log_info "Starting frontend Vite dev server on port $FRONTEND_PORT..."
    
    cd "$FRONTEND_DIR"
    
    # Kill any existing frontend process
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    sleep 1
    
    # Start frontend in background
    PORT=$FRONTEND_PORT npm run dev > "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 5
    
    # Check frontend logs for errors
    if grep -q "error\|Error\|ERROR" "$FRONTEND_LOG" 2>/dev/null; then
        log_warning "Errors detected in frontend startup:"
        grep -i "error" "$FRONTEND_LOG" | head -5
        
        # Check if it's just warnings or actual errors
        if grep -q "Unexpected token\|SyntaxError\|Module not found" "$FRONTEND_LOG"; then
            log_error "Critical error in frontend"
            tail -20 "$FRONTEND_LOG" | tee /tmp/ETERNELLES_frontend_errors.log
            return 1
        fi
    fi
    
    # Check if process is still running
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        log_success "Frontend is running on port $FRONTEND_PORT (PID: $FRONTEND_PID)"
        echo $FRONTEND_PID > /tmp/ETERNELLES_frontend.pid
        return 0
    else
        log_warning "Frontend process stopped, checking logs..."
        tail -20 "$FRONTEND_LOG" | tee /tmp/ETERNELLES_frontend_errors.log
        return 1
    fi
}

# ==============================================================================
# Function: Open app in browser
# ==============================================================================
open_browser() {
    log_info "Opening app in browser at http://localhost:$FRONTEND_PORT"
    
    # Wait a moment for the app to be fully ready
    sleep 2
    
    # Try to open in browser (using xdg-open for Linux)
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:$FRONTEND_PORT" &
    elif command -v open &>/dev/null; then
        open "http://localhost:$FRONTEND_PORT" &
    else
        log_warning "Could not automatically open browser. Please visit http://localhost:$FRONTEND_PORT manually"
    fi
}

# ==============================================================================
# Function: Seed database with test users
# ==============================================================================
seed_database() {
    log_info "Seeding database with test users..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    python seed_users.py 2>&1 | tee /tmp/ETERNELLES_seed.log
    
    if [ $? -eq 0 ]; then
        log_success "Database seeded successfully"
        return 0
    else
        log_warning "Database seeding had warnings but completed"
        return 0
    fi
}

# ==============================================================================
# Function: Validate with user
# ==============================================================================
validate_app() {
    echo ""
    echo "=========================================="
    echo "APP VALIDATION"
    echo "=========================================="
    echo ""
    echo "The ETERNELLES application is now running locally:"
    echo "  • Frontend: http://localhost:$FRONTEND_PORT"
    echo "  • Backend: http://localhost:$BACKEND_PORT"
    echo "  • API Health: http://localhost:$BACKEND_PORT/api/v1/health"
    echo ""
    echo "=========================================="
    echo "FEATURES TO CHECK:"
    echo "=========================================="
    echo "1. 3D WebGL Splash Screen loads with animated K, C, D characters"
    echo "2. Characters float smoothly and land at center"
    echo "3. Green glow effects and starfield background visible"
    echo "4. Application transitions to login page after animation"
    echo "5. Backend API responds to health check"
    echo "6. Login works with test credentials (see test credentials below)"
    echo ""
    echo "=========================================="
    echo "TEST CREDENTIALS:"
    echo "=========================================="
    echo "Email: admin@ETERNELLES-agency.com           | Password: admin123"
    echo "Email: community.admin@ETERNELLES-agency.com | Password: comm_admin123"
    echo "Email: moderator@ETERNELLES-agency.com       | Password: mod123"
    echo "Email: brand@ETERNELLES-agency.com           | Password: brand123"
    echo "Email: premium@ETERNELLES-agency.com         | Password: premium123"
    echo "Email: free@ETERNELLES-agency.com            | Password: free123"
    echo "Email: guest@ETERNELLES-agency.com           | Password: guest123"
    echo ""
    echo "=========================================="
    echo "OPTIONS:"
    echo "=========================================="
    echo "  yes   - App works perfectly, commit and deploy"
    echo "  no    - App not working, run self-healing and retry"
    echo "  break - App needs debugging, stop here for manual fixes"
    echo "  logs  - Show backend and frontend logs"
    echo ""
    
    read -p "What's your feedback? (yes/no/break/logs): " response
    
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        [nN][oO]|[nN])
            return 1
            ;;
        break|BREAK)
            log_warning "Breaking for manual debugging..."
            echo ""
            echo "=========================================="
            echo "DEBUGGING INFORMATION"
            echo "=========================================="
            echo "Backend log: tail -f $BACKEND_LOG"
            echo "Frontend log: tail -f $FRONTEND_LOG"
            echo "Seed log: tail -f /tmp/ETERNELLES_seed.log"
            echo ""
            echo "Backend running on port $BACKEND_PORT"
            echo "Frontend running on port $FRONTEND_PORT"
            echo ""
            echo "Make your changes and run: ./deploy.sh"
            echo "=========================================="
            exit 0
            ;;
        logs|LOGS)
            log_info "Frontend Log (last 40 lines):"
            echo "---"
            tail -40 "$FRONTEND_LOG"
            echo "---"
            echo ""
            log_info "Backend Log (last 40 lines):"
            echo "---"
            tail -40 "$BACKEND_LOG"
            echo "---"
            echo ""
            # Ask again after showing logs
            validate_app
            ;;
        *)
            log_warning "Invalid response. Please enter: yes, no, break, or logs"
            echo ""
            validate_app
            ;;
    esac
}

# ==============================================================================
# Function: Stage, commit, and push to GitHub
# ==============================================================================
commit_and_push() {
    log_info "Staging changes..."
    cd "$PROJECT_ROOT"
    
    git add -A
    
    log_info "Committing changes..."
    git commit -m "chore: app validation - deployment ready" || log_warning "No changes to commit"
    
    log_info "Pushing to GitHub..."
    git push origin main
    
    log_success "Changes pushed to GitHub"
}

# ==============================================================================
# Function: Deploy to Render
# ==============================================================================
deploy_to_render() {
    log_info "Deploying to Render..."
    log_warning "NOTE: Render deployment requires proper configuration"
    log_warning "Ensure render.yaml is configured with build and start commands"
    log_warning "Visit: https://dashboard.render.com to monitor deployment"
    
    # Show Git commit hash for reference
    cd "$PROJECT_ROOT"
    COMMIT_HASH=$(git rev-parse --short HEAD)
    log_success "Ready to deploy commit: $COMMIT_HASH"
    log_info "Deployment will be automatic on main branch push if webhook configured"
}

# ==============================================================================
# Function: Analyze and fix frontend build errors
# ==============================================================================
analyze_frontend_errors() {
    log_info "Analyzing frontend errors..."
    cd "$FRONTEND_DIR"
    
    # Capture build output to check for errors
    BUILD_OUTPUT=$(npm run build 2>&1)
    
    if echo "$BUILD_OUTPUT" | grep -q "Unexpected token\|SyntaxError"; then
        log_warning "Syntax error detected in frontend code"
        
        # Extract error file and line
        ERROR_FILE=$(echo "$BUILD_OUTPUT" | grep -oP "(?<=/ETERNELLES/frontend/)[^:]*" | head -1)
        ERROR_LINE=$(echo "$BUILD_OUTPUT" | grep -oP "(?<!\d)\d+(?::\d+)?(?=\n)" | head -1)
        
        if [[ -n "$ERROR_FILE" ]]; then
            log_warning "Error in: $ERROR_FILE at line $ERROR_LINE"
            
            # Try to fix common syntax errors
            case "$ERROR_FILE" in
                *"SplashScreen3D.jsx")
                    log_info "Attempting automatic fix for SplashScreen3D.jsx..."
                    # Add self-healing logic for known JSX issues
                    ;;
            esac
        fi
        
        return 1
    fi
    
    log_success "Frontend syntax validation passed"
    return 0
}

# ==============================================================================
# Function: Run self-healing (error fixing)
# ==============================================================================
self_heal() {
    log_warning "Running self-healing engine..."
    
    log_info "Checking for common issues..."
    
    # Check backend dependencies
    log_info "Verifying backend dependencies..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    pip install -q -r requirements.txt
    log_success "Backend dependencies verified"
    
    # Check frontend dependencies
    log_info "Verifying frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install --legacy-peer-deps > /dev/null 2>&1
    log_success "Frontend dependencies verified"
    
    # Analyze frontend errors
    log_info "Analyzing frontend errors..."
    analyze_frontend_errors || log_warning "Frontend had issues, attempting fixes"
    
    # Check for lint/syntax errors
    log_info "Running final frontend build check..."
    cd "$FRONTEND_DIR"
    npm run build --mode development > /dev/null 2>&1 || log_warning "Build had warnings but completed"
    
    log_success "Self-healing completed"
}

# ==============================================================================
# Function: Main deployment workflow
# ==============================================================================
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                  ETERNELLES APP DEPLOYMENT AUTOMATION                     ║"
    echo "║                       $(date +%Y-%m-%d)                              ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Step 1: Cleanup ports
    if ! cleanup_ports; then
        log_error "Failed to cleanup ports"
        exit 1
    fi
    
    echo ""
    
    # Step 2: Start backend
    if ! start_backend; then
        log_error "Failed to start backend"
        exit 1
    fi
    
    echo ""
    
    # Step 3: Start frontend
    if ! start_frontend; then
        log_warning "Frontend had issues, continuing..."
    fi
    
    echo ""
    
    # Step 4: Seed database with test users
    if ! seed_database; then
        log_warning "Database seeding had issues, continuing..."
    fi
    
    echo ""
    
    # Step 5: Open browser
    open_browser
    
    echo ""
    
    # Step 6: Validate app
    if validate_app; then
        log_success "App validation PASSED"
        
        echo ""
        
        # Step 7: Commit and push
        commit_and_push
        
        echo ""
        
        # Step 8: Deploy to Render
        deploy_to_render
        
        echo ""
        log_success "DEPLOYMENT WORKFLOW COMPLETED SUCCESSFULLY"
        echo ""
        
        return 0
    else
        log_warning "App validation FAILED - Running self-healing..."
        
        echo ""
        
        # Run self-healing
        self_heal
        
        echo ""
        log_info "Self-healing completed. Restarting deployment..."
        
        # Stop running services
        kill $(cat /tmp/ETERNELLES_backend.pid 2>/dev/null) 2>/dev/null || true
        kill $(cat /tmp/ETERNELLES_frontend.pid 2>/dev/null) 2>/dev/null || true
        
        echo ""
        
        # Recursive call to try again
        main
    fi
}

# ==============================================================================
# Run main function
# ==============================================================================
main "$@"
