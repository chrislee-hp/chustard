#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Integration E2E Tests${NC}\n"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        echo "  ✓ Stopped API Server (PID: $SERVER_PID)"
    fi
    if [ ! -z "$CUSTOMER_PID" ]; then
        kill $CUSTOMER_PID 2>/dev/null
        echo "  ✓ Stopped Customer SPA (PID: $CUSTOMER_PID)"
    fi
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null
        echo "  ✓ Stopped Admin Web (PID: $ADMIN_PID)"
    fi
    # Kill any remaining processes on these ports
    lsof -ti:3000,3001,3002 2>/dev/null | xargs kill -9 2>/dev/null
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Kill any existing processes on ports
echo -e "${YELLOW}📋 Checking ports...${NC}"
lsof -ti:3000,3001,3002 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# Start API Server
echo -e "${YELLOW}🔧 Starting API Server...${NC}"
cd server
npm run dev > /tmp/api-server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for API Server
echo -n "  Waiting for API Server (port 3000)..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/menu > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

if ! curl -s http://localhost:3000/api/menu > /dev/null 2>&1; then
    echo -e " ${RED}✗ Failed${NC}"
    echo "Check logs: tail -f /tmp/api-server.log"
    exit 1
fi

# Start Customer SPA
echo -e "${YELLOW}🛒 Starting Customer SPA...${NC}"
cd client/customer
npm run dev > /tmp/customer-spa.log 2>&1 &
CUSTOMER_PID=$!
cd ../..

# Wait for Customer SPA
echo -n "  Waiting for Customer SPA (port 3001)..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e " ${RED}✗ Failed${NC}"
    echo "Check logs: tail -f /tmp/customer-spa.log"
    exit 1
fi

# Start Admin Web
echo -e "${YELLOW}👨‍💼 Starting Admin Web...${NC}"
cd client/admin
npm run dev > /tmp/admin-web.log 2>&1 &
ADMIN_PID=$!
cd ../..

# Wait for Admin Web
echo -n "  Waiting for Admin Web (port 3002)..."
for i in {1..30}; do
    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

if ! curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e " ${RED}✗ Failed${NC}"
    echo "Check logs: tail -f /tmp/admin-web.log"
    exit 1
fi

echo -e "\n${GREEN}✅ All servers running!${NC}"
echo -e "  API Server:   http://localhost:3000 (PID: $SERVER_PID)"
echo -e "  Customer SPA: http://localhost:3001 (PID: $CUSTOMER_PID)"
echo -e "  Admin Web:    http://localhost:3002 (PID: $ADMIN_PID)\n"

# Run integration tests
echo -e "${YELLOW}🧪 Running Integration Tests...${NC}\n"
npm run test:e2e -- --project=integration

TEST_EXIT_CODE=$?

# Show results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Integration tests passed!${NC}"
else
    echo -e "${RED}❌ Integration tests failed!${NC}"
    echo -e "\nServer logs:"
    echo -e "  API Server:   tail -f /tmp/api-server.log"
    echo -e "  Customer SPA: tail -f /tmp/customer-spa.log"
    echo -e "  Admin Web:    tail -f /tmp/admin-web.log"
fi

exit $TEST_EXIT_CODE
