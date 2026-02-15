#!/bin/bash

# KCD Platform - Local Development Setup Script
# This script sets up the development environment and seeds the database

set -e

echo "================================"
echo "KCD Platform - Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}Error: pip3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 and pip3 are installed${NC}"
echo ""

# Navigate to backend directory
cd backend

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip3 install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Seed the database
echo -e "${YELLOW}Seeding database with test users...${NC}"
python3 seed_database.py
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

# Display next steps
echo ""
echo "================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo -e "   ${YELLOW}python -m uvicorn app.main:app --reload${NC}"
echo ""
echo "2. In another terminal, start the frontend:"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Test Credentials:"
echo -e "   ${YELLOW}Email: admin@kcd-agency.com${NC}"
echo -e "   ${YELLOW}Password: admin123456${NC}"
echo ""
echo "API Documentation:"
echo -e "   ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
