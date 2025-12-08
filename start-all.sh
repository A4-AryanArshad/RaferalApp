#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Backend & Mobile App...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    kill $BACKEND_PID $EXPO_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start Backend Server
echo -e "${GREEN}📡 Starting Backend Server...${NC}"
cd "$(dirname "$0")"
npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   → http://localhost:3000"
echo ""

# Wait a bit for backend to start
sleep 3

# Start Expo App
echo -e "${GREEN}📱 Starting Expo App...${NC}"
cd "$(dirname "$0")/AirbnbReferralApp"
npx expo start --ios --localhost > /dev/null 2>&1 &
EXPO_PID=$!
echo -e "${GREEN}✅ Expo started (PID: $EXPO_PID)${NC}"
echo ""

echo -e "${BLUE}✨ Both services are running!${NC}"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait

