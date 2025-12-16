#!/bin/bash

echo "Starting Ticket System..."
echo

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    read -p "Press enter to exit"
    exit 1
fi

echo
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    read -p "Press enter to exit"
    exit 1
fi

echo
echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error building frontend"
    read -p "Press enter to exit"
    exit 1
fi

echo
echo "Starting backend server..."
cd ../backend
export RESEND_API_KEY="re_7ZVFQ9mn_7Afk9byav3wT941SW33F5F7n"
node server.js &
SERVER_PID=$!

echo
echo "Ticket System is starting up..."
echo "Backend server should be available at: http://localhost:3001"
echo "Server PID: $SERVER_PID"
echo
echo "Press Ctrl+C to stop the server and exit"

# Wait for the server process
wait $SERVER_PID