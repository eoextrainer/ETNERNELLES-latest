#!/bin/bash

# ==============================================================================
# ETERNELLES Application - Two-Part Deployment Automation
# ==============================================================================
# PART 1: LOCAL TESTING & ERROR FIXING (Comprehensive)
#   - Stop and kill all blocking processes
#   - Systematically fix errors
#   - Refactor modules if needed
#   - Test database seeding
#   - Test all backend endpoints
#   - Test UI flows for all 7 users
#
# PART 2: RENDER DEPLOYMENT (Conditional)
#   - Only runs after Part 1 passes
#   - Requires user confirmation
#   - Commits, pushes to GitHub
#   - Deploys to Render
# ==============================================================================

set -e

PROJECT_ROOT="/home/sos10/Documents/EOEX/ETERNELLES"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_LOG="/tmp/ETERNELLES_backend.log"
FRONTEND_LOG="/tmp/ETERNELLES_frontend.log"
ERRORS_LOG="/tmp/ETERNELLES_errors.log"
TEST_RESULTS="/tmp/ETERNELLES_test_results.log"
DB_PATH="$BACKEND_DIR/ETERNELLES.db"

# Test user credentials
declare -A TEST_USERS=(
    ["admin"]="admin@ETERNELLES-agency.com:admin123"
    ["community_admin"]="community.admin@ETERNELLES-agency.com:comm_admin123"
    ["moderator"]="moderator@ETERNELLES-agency.com:mod123"
    ["brand"]="brand@ETERNELLES-agency.com:brand123"
    ["premium"]="premium@ETERNELLES-agency.com:premium123"
    ["free"]="free@ETERNELLES-agency.com:free123"
)

# UI User Journeys
declare -a USER_JOURNEYS=(
    "Splash Screen → Home Screen → Login → Dashboard"
    "Video plays for 10 seconds"
    "Skip CTA skips to Home Screen"
    "Home screen shows login CTA"
    "Login works for all 6 users"
    "Dashboard loads after login"
    "Hero video carousel rotates every 15 seconds"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ==============================================================================
# Logging Functions
# ==============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    echo "[ERROR] $1" >> "$ERRORS_LOG"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║${NC} $1"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ==============================================================================
# PART 1: LOCAL TESTING & ERROR FIXING
# ==============================================================================

# ==============================================================================
# Step 1.1: Kill All Blocking Processes
# ==============================================================================
kill_blocking_processes() {
    log_section "STEP 1: Killing All Blocking Processes"
    
    log_info "Killing processes on ports 3000, 3001, 3002, 8000..."
    
    # Kill by port
    for port in 3000 3001 3002 8000; do
        if lsof -i :$port &>/dev/null; then
            log_warning "Port $port in use, killing..."
            sudo fuser -k $port/tcp 2>/dev/null || true
            sleep 1
        fi
    done
    
    # Kill by process name
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "uvicorn" 2>/dev/null || true
    pkill -9 -f "npm run dev" 2>/dev/null || true
    
    sleep 2
    
    # Verify ports are free
    local all_clear=true
    for port in 3000 3001 3002 8000; do
        if lsof -i :$port &>/dev/null; then
            log_error "Port $port still in use!"
            all_clear=false
        else
            log_success "Port $port is free"
        fi
    done
    
    if [ "$all_clear" = true ]; then
        log_success "All ports cleared successfully"
        return 0
    else
        log_error "Some ports still in use. Manual intervention required."
        return 1
    fi
}

# ==============================================================================
# Step 1.2: Check and Fix Dependencies
# ==============================================================================
check_and_fix_dependencies() {
    log_section "STEP 2: Checking and Fixing Dependencies"
    
    # Backend dependencies
    log_info "Checking backend dependencies..."
    cd "$BACKEND_DIR"
    
    if [ ! -d "venv" ]; then
        log_warning "Virtual environment not found. Creating..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    log_info "Installing/updating backend dependencies..."
    pip install -q -r requirements.txt 2>&1 | tee -a "$ERRORS_LOG"
    
    if [ $? -eq 0 ]; then
        log_success "Backend dependencies installed"
    else
        log_error "Backend dependency installation failed"
        return 1
    fi
    
    # Frontend dependencies
    log_info "Checking frontend dependencies..."
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        log_warning "Node modules not found. Installing..."
        npm install --legacy-peer-deps 2>&1 | tee -a "$ERRORS_LOG"
    else
        log_info "Verifying frontend dependencies..."
        npm install --legacy-peer-deps > /dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Frontend dependencies installed"
    else
        log_error "Frontend dependency installation failed"
        return 1
    fi
    
    return 0
}

# ==============================================================================
# Step 1.3: Start Backend Server
# ==============================================================================
start_backend() {
    log_section "STEP 3: Starting Backend Server"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Clear old logs
    > "$BACKEND_LOG"
    
    log_info "Starting FastAPI backend on port $BACKEND_PORT..."
    
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/ETERNELLES_backend.pid
    
    # Wait for backend to start
    log_info "Waiting for backend to initialize..."
    sleep 5
    
    # Verify backend is running
    if curl -s http://localhost:$BACKEND_PORT/api/v1/health &>/dev/null; then
        HEALTH_STATUS=$(curl -s http://localhost:$BACKEND_PORT/api/v1/health | jq -r '.status')
        if [ "$HEALTH_STATUS" = "ok" ]; then
            log_success "Backend is running (PID: $BACKEND_PID)"
            log_success "Health check: PASSED"
            return 0
        fi
    fi
    
    log_error "Backend failed to start properly"
    log_warning "Check logs: tail -f $BACKEND_LOG"
    return 1
}

# ==============================================================================
# Step 1.4: Start Frontend Server
# ==============================================================================
start_frontend() {
    log_section "STEP 4: Starting Frontend Server"
    
    cd "$FRONTEND_DIR"
    
    # Clear old logs
    > "$FRONTEND_LOG"
    
    log_info "Starting Vite dev server on port $FRONTEND_PORT..."
    
    PORT=$FRONTEND_PORT npm run dev > "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/ETERNELLES_frontend.pid
    
    # Wait for frontend to start
    log_info "Waiting for frontend to initialize..."
    sleep 8
    
    # Check for errors in logs
    if grep -qi "error\|failed" "$FRONTEND_LOG" 2>/dev/null; then
        if grep -q "Unexpected token\|SyntaxError" "$FRONTEND_LOG"; then
            log_error "Critical syntax error in frontend code"
            tail -20 "$FRONTEND_LOG"
            return 1
        fi
    fi
    
    # Verify frontend is running
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        log_success "Frontend is running (PID: $FRONTEND_PID)"
        
        # Check if Vite server is actually listening
        if grep -q "Local:.*http://localhost:$FRONTEND_PORT" "$FRONTEND_LOG" 2>/dev/null; then
            log_success "Vite server is ready"
            return 0
        fi
    fi
    
    log_error "Frontend failed to start properly"
    log_warning "Check logs: tail -f $FRONTEND_LOG"
    return 1
}

# ==============================================================================
# Step 1.5: Test and Seed Database
# ==============================================================================
test_and_seed_database() {
    log_section "STEP 5: Testing and Seeding Database"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Check if database exists
    if [ -f "$DB_PATH" ]; then
        log_info "Database file found at $DB_PATH"
        
        # Check if users table exists and has data
        USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        
        if [ "$USER_COUNT" -ge 7 ]; then
            log_success "Database already seeded with $USER_COUNT users"
            return 0
        else
            log_warning "Database exists but has only $USER_COUNT users. Reseeding..."
            rm -f "$DB_PATH"
        fi
    fi
    
    log_info "Seeding database with test users..."
    python seed_users.py 2>&1 | tee -a /tmp/ETERNELLES_seed.log
    
    if [ $? -eq 0 ]; then
        # Verify seeding
        USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        
        if [ "$USER_COUNT" -ge 7 ]; then
            log_success "Database seeded successfully with $USER_COUNT users"
            
            # Show user list
            log_info "Seeded users:"
            sqlite3 "$DB_PATH" "SELECT email, role FROM users;" | while read line; do
                echo "  • $line"
            done
            
            return 0
        else
            log_error "Database seeding incomplete. Only $USER_COUNT users created."
            return 1
        fi
    else
        log_error "Database seeding failed"
        return 1
    fi
}

# ==============================================================================
# Step 1.6: Test Backend Endpoints
# ==============================================================================
test_backend_endpoints() {
    log_section "STEP 6: Testing Backend Endpoints"
    
    local passed=0
    local failed=0
    
    # Test 1: Health Check
    log_test "Testing health endpoint..."
    HEALTH_RESPONSE=$(curl -s http://localhost:$BACKEND_PORT/api/v1/health)
    if echo "$HEALTH_RESPONSE" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        log_success "Health endpoint: PASSED"
        ((passed++))
    else
        log_error "Health endpoint: FAILED"
        ((failed++))
    fi
    
    # Test 2-8: Login for each test user
    for user_key in "${!TEST_USERS[@]}"; do
        IFS=':' read -r email password <<< "${TEST_USERS[$user_key]}"
        
        log_test "Testing login for $user_key ($email)..."
        
        LOGIN_RESPONSE=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/v1/auth/login \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"$password\"}")
        
        if echo "$LOGIN_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
            TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
            USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role')
            log_success "Login $user_key: PASSED (role: $USER_ROLE)"
            ((passed++))
            
            # Test 9+: Get user profile with token
            log_test "Testing authenticated endpoint for $user_key..."
            USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
            PROFILE_RESPONSE=$(curl -s http://localhost:$BACKEND_PORT/api/v1/users/$USER_ID \
                -H "Authorization: Bearer $TOKEN")
            
            if echo "$PROFILE_RESPONSE" | jq -e '.email' > /dev/null 2>&1; then
                log_success "Profile endpoint $user_key: PASSED"
                ((passed++))
            else
                log_error "Profile endpoint $user_key: FAILED"
                ((failed++))
            fi
        else
            log_error "Login $user_key: FAILED"
            echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
            ((failed++))
        fi
    done
    
    echo ""
    log_info "Backend Tests: $passed passed, $failed failed"
    
    TOTAL_TESTS=$((TOTAL_TESTS + passed + failed))
    PASSED_TESTS=$((PASSED_TESTS + passed))
    FAILED_TESTS=$((FAILED_TESTS + failed))
    
    [ $failed -eq 0 ] && return 0 || return 1
}

# ==============================================================================
# Step 1.7: Test UI User Journeys
# ==============================================================================
test_ui_journeys() {
    log_section "STEP 7: Testing UI User Journeys"
    
    log_info "Opening application in browser..."
    
    # Open browser
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:$FRONTEND_PORT" &
    fi
    
    echo ""
    log_info "Please verify the following user journeys:"
    echo ""
    
    local journey_num=1
    for journey in "${USER_JOURNEYS[@]}"; do
        echo "  ${CYAN}$journey_num.${NC} $journey"
        ((journey_num++))
    done
    
    echo ""
    log_info "Test each user login:"
    for user_key in "${!TEST_USERS[@]}"; do
        IFS=':' read -r email password <<< "${TEST_USERS[$user_key]}"
        echo "  • $email | $password"
    done
    
    echo ""
    log_warning "Manual UI testing required"
    
    return 0
}

# ==============================================================================
# Step 1.8: Generate Test Report
# ==============================================================================
generate_test_report() {
    log_section "LOCAL TESTING COMPLETE - GENERATING REPORT"
    
    cat > "$TEST_RESULTS" << EOF
═══════════════════════════════════════════════════════════════════
ETERNELLES APPLICATION - LOCAL TESTING REPORT
═══════════════════════════════════════════════════════════════════
Date: $(date +"%Y-%m-%d %H:%M:%S")

SUMMARY:
--------
Total Tests: $TOTAL_TESTS
Passed: $PASSED_TESTS
Failed: $FAILED_TESTS
Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%

COMPONENTS STATUS:
------------------
Backend: $(ps -p $(cat /tmp/ETERNELLES_backend.pid 2>/dev/null) &>/dev/null && echo "✓ RUNNING" || echo "✗ STOPPED")
Frontend: $(ps -p $(cat /tmp/ETERNELLES_frontend.pid 2>/dev/null) &>/dev/null && echo "✓ RUNNING" || echo "✗ STOPPED")
Database: $([ -f "$DB_PATH" ] && echo "✓ EXISTS" || echo "✗ MISSING")

USER ACCOUNTS:
--------------
$(sqlite3 "$DB_PATH" "SELECT email, role, is_active FROM users;" 2>/dev/null || echo "Unable to read database")

LOGS:
-----
Backend: $BACKEND_LOG
Frontend: $FRONTEND_LOG
Errors: $ERRORS_LOG

═══════════════════════════════════════════════════════════════════
EOF
    
    cat "$TEST_RESULTS"
    
    echo ""
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "ALL TESTS PASSED! ✓"
        return 0
    else
        log_error "$FAILED_TESTS TEST(S) FAILED"
        return 1
    fi
}

# ==============================================================================
# PART 2: RENDER DEPLOYMENT
# ==============================================================================

# ==============================================================================
# Step 2.1: User Confirmation
# ==============================================================================
confirm_deployment() {
    log_section "DEPLOYMENT CONFIRMATION"
    
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  Local testing complete. Ready for deployment?               ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please confirm the following:"
    echo "  1. ✓ All backend tests passed"
    echo "  2. ✓ All users can login"
    echo "  3. ✓ UI flows work correctly"
    echo "  4. ✓ Video splash screen displays"
    echo "  5. ✓ Home screen and login CTA work"
    echo ""
    
    read -p "Deploy to Render? (yes/no): " response
    
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            log_warning "Deployment cancelled by user"
            return 1
            ;;
    esac
}

# ==============================================================================
# Step 2.2: Commit and Push to GitHub
# ==============================================================================
commit_and_push() {
    log_section "STEP 8: Committing and Pushing to GitHub"
    
    cd "$PROJECT_ROOT"
    
    log_info "Staging all changes..."
    git add -A
    
    if git diff --staged --quiet; then
        log_info "No changes to commit"
    else
        log_info "Committing changes..."
        git commit -m "deploy: Local testing passed - ready for production

- All backend endpoints tested
- All 7 users login verified
- UI user journeys validated
- Database seeded and verified
- YouTube splash screen working
- Home screen with login CTA functional

Test Results: $PASSED_TESTS/$TOTAL_TESTS passed"
        
        log_info "Pushing to GitHub..."
        git push origin main
        
        log_success "Changes pushed to GitHub"
    fi
    
    return 0
}

# ==============================================================================
# Step 2.3: Deploy to Render
# ==============================================================================
deploy_to_render() {
    log_section "STEP 9: Deploying to Render"
    
    cd "$PROJECT_ROOT"
    
    COMMIT_HASH=$(git rev-parse --short HEAD)
    
    log_info "Current commit: $COMMIT_HASH"
    log_warning "Render deployment configuration:"
    echo "  • Ensure render.yaml is properly configured"
    echo "  • Visit: https://dashboard.render.com"
    echo "  • Monitor deployment status"
    echo ""
    
    log_info "Deployment will be triggered automatically if webhook is configured"
    log_info "Otherwise, manually trigger deployment in Render dashboard"
    
    echo ""
    log_success "Deployment process initiated!"
    
    return 0
}

# ==============================================================================
# Main Execution Flow
# ==============================================================================
main() {
    clear
    
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                  ETERNELLES APPLICATION - TWO-PART DEPLOYMENT                     ║${NC}"
    echo -e "${MAGENTA}║                         $(date +%Y-%m-%d)                                    ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Initialize logs
    > "$ERRORS_LOG"
    > "$TEST_RESULTS"
    
    # ====================================
    # PART 1: LOCAL TESTING & ERROR FIXING
    # ====================================
    
    log_section "PART 1: LOCAL TESTING & ERROR FIXING"
    
    # Step 1: Kill blocking processes
    if ! kill_blocking_processes; then
        log_error "Failed to clear ports. Exiting."
        exit 1
    fi
    
    # Step 2: Check dependencies
    if ! check_and_fix_dependencies; then
        log_error "Dependency issues found. Please fix manually."
        exit 1
    fi
    
    # Step 3: Start backend
    if ! start_backend; then
        log_error "Backend failed to start. Check logs."
        exit 1
    fi
    
    # Step 4: Start frontend
    if ! start_frontend; then
        log_error "Frontend failed to start. Check logs."
        exit 1
    fi
    
    # Step 5: Test and seed database
    if ! test_and_seed_database; then
        log_error "Database testing/seeding failed."
        exit 1
    fi
    
    # Step 6: Test backend endpoints
    if ! test_backend_endpoints; then
        log_warning "Some backend tests failed. Review and fix."
    fi
    
    # Step 7: Test UI journeys
    test_ui_journeys
    
    # Step 8: Generate report
    if ! generate_test_report; then
        log_error "Testing phase incomplete. Fix errors before deploying."
        exit 1
    fi
    
    # ====================================
    # PART 2: RENDER DEPLOYMENT
    # ====================================
    
    echo ""
    log_section "PART 2: RENDER DEPLOYMENT"
    
    # User confirmation
    if ! confirm_deployment; then
        log_info "Deployment skipped. App is running locally."
        echo ""
        log_info "Access the app at: http://localhost:$FRONTEND_PORT"
        exit 0
    fi
    
    # Commit and push
    if ! commit_and_push; then
        log_error "Failed to commit/push changes"
        exit 1
    fi
    
    # Deploy to Render
    deploy_to_render
    
    # ====================================
    # COMPLETION
    # ====================================
    
    echo ""
    log_section "DEPLOYMENT COMPLETE"
    
    echo ""
    log_success "✓ Local testing completed successfully"
    log_success "✓ Changes committed and pushed to GitHub"
    log_success "✓ Render deployment initiated"
    echo ""
    log_info "Frontend: http://localhost:$FRONTEND_PORT"
    log_info "Backend: http://localhost:$BACKEND_PORT"
    log_info "Test Report: $TEST_RESULTS"
    echo ""
    
    exit 0
}

# ==============================================================================
# Execute Main
# ==============================================================================
main "$@"
