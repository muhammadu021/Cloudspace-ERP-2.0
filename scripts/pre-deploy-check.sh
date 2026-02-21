#!/bin/bash

# Pre-Deployment Check Script for Puffin ERP
# This script verifies that everything is ready for deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Puffin ERP Pre-Deployment Check         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to print status
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo -e "${BLUE}[1/7] Checking Project Structure...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    check_fail "package.json not found. Run this script from project root."
    exit 1
else
    check_pass "Project root directory confirmed"
fi

# Check backend directory
if [ -d "backend" ]; then
    check_pass "Backend directory exists"
else
    check_fail "Backend directory not found"
fi

# Check frontend directory
if [ -d "frontend" ]; then
    check_pass "Frontend directory exists"
else
    check_fail "Frontend directory not found"
fi

echo ""
echo -e "${BLUE}[2/7] Checking Environment Configuration...${NC}"

# Check root .env
if [ -f ".env" ]; then
    check_pass "Root .env file exists"
    
    # Check DB_NAME in root .env
    if grep -q "DB_NAME=perp" .env; then
        check_pass "Root .env has correct DB_NAME (perp)"
    else
        check_warn "Root .env DB_NAME might not be 'perp'"
        echo "   Current value: $(grep DB_NAME .env)"
    fi
else
    check_warn "Root .env file not found"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    check_pass "Backend .env file exists"
    
    # Check DB_NAME in backend .env
    if grep -q "DB_NAME=perp" backend/.env; then
        check_pass "Backend .env has correct DB_NAME (perp)"
    else
        check_warn "Backend .env DB_NAME might not be 'perp'"
        echo "   Current value: $(grep DB_NAME backend/.env)"
    fi
    
    # Check USE_MYSQL
    if grep -q "USE_MYSQL=true" backend/.env; then
        check_pass "MySQL is enabled"
    else
        check_warn "USE_MYSQL is not set to true"
    fi
else
    check_fail "Backend .env file not found"
fi

echo ""
echo -e "${BLUE}[3/7] Checking Migration Files...${NC}"

# Check if migration files exist
if [ -f "backend/migrations/20250115000001-create-anonymous-reviews.js" ]; then
    check_pass "Anonymous reviews migration exists"
else
    check_fail "Anonymous reviews migration NOT found"
fi

if [ -f "backend/migrations/20250115000002-create-performance-appraisals.js" ]; then
    check_pass "Performance appraisals migration exists"
else
    check_fail "Performance appraisals migration NOT found"
fi

# Check manual creation script
if [ -f "backend/scripts/create-review-tables-perp.js" ]; then
    check_pass "Manual table creation script exists (backup)"
else
    check_warn "Manual table creation script not found"
fi

echo ""
echo -e "${BLUE}[4/7] Checking Dependencies...${NC}"

# Check if node_modules exists in backend
if [ -d "backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_warn "Backend dependencies not installed (run: npm run backend:install)"
fi

# Check if node_modules exists in frontend
if [ -d "frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_warn "Frontend dependencies not installed (run: npm run frontend:install)"
fi

echo ""
echo -e "${BLUE}[5/7] Checking Database Models...${NC}"

# Check if review models exist
if [ -f "backend/models/AnonymousReview.js" ]; then
    check_pass "AnonymousReview model exists"
else
    check_fail "AnonymousReview model NOT found"
fi

if [ -f "backend/models/PerformanceAppraisal.js" ]; then
    check_pass "PerformanceAppraisal model exists"
else
    check_fail "PerformanceAppraisal model NOT found"
fi

echo ""
echo -e "${BLUE}[6/7] Checking API Routes...${NC}"

# Check if review routes exist
if [ -f "backend/routes/reviews.js" ]; then
    check_pass "Review routes file exists"
else
    check_fail "Review routes file NOT found"
fi

# Check if review controller exists
if [ -f "backend/controllers/reviewController.js" ]; then
    check_pass "Review controller exists"
else
    check_fail "Review controller NOT found"
fi

# Check if review service exists
if [ -f "frontend/src/services/reviewService.js" ]; then
    check_pass "Frontend review service exists"
else
    check_fail "Frontend review service NOT found"
fi

echo ""
echo -e "${BLUE}[7/7] Checking Deployment Scripts...${NC}"

# Check deploy script
if [ -f "scripts/deploy.sh" ]; then
    check_pass "Deployment script exists"
    if [ -x "scripts/deploy.sh" ]; then
        check_pass "Deployment script is executable"
    else
        check_warn "Deployment script is not executable (run: chmod +x scripts/deploy.sh)"
    fi
else
    check_fail "Deployment script NOT found"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}           Summary                           ${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "  1. Review DEPLOYMENT_GUIDE.md"
    echo "  2. Run: npm run deploy"
    echo "  3. Verify migrations: npm run migrate:status"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found.${NC}"
    echo -e "${YELLOW}Review warnings above before deploying.${NC}"
    echo ""
    echo -e "${YELLOW}You can proceed with deployment, but address warnings if possible.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found.${NC}"
    fi
    echo ""
    echo -e "${RED}Please fix errors before deploying.${NC}"
    exit 1
fi
