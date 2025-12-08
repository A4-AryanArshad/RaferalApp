#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📱 Sharing App with Client${NC}"
echo ""

# Check if backend is running
if ! pgrep -f "ts-node-dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend server is not running!${NC}"
    echo "Starting backend server..."
    cd "$(dirname "$0")"
    npm run dev > /dev/null 2>&1 &
    sleep 3
    echo -e "${GREEN}✅ Backend started${NC}"
    echo ""
fi

echo -e "${GREEN}🚀 Starting Expo with tunnel mode...${NC}"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  • Create a shareable link/QR code"
echo "  • Work from anywhere (not just local network)"
echo "  • Allow client to test immediately"
echo ""
echo -e "${BLUE}Instructions for your client:${NC}"
echo "  1. Install 'Expo Go' app from App Store/Play Store"
echo "  2. Scan the QR code that appears below"
echo "  3. Or enter the link manually in Expo Go"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

cd "$(dirname "$0")/AirbnbReferralApp"
npx expo start --tunnel

