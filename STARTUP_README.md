# Ticket System Startup Script

This script automatically sets up and starts the ticket system application.

## Email Configuration
The system is configured to send ticket emails via Resend using:
- **API Key:** re_7ZVFQ9mn_7Afk9byav3wT941SW33F5F7n
- **From Email:** noreply.r3gticketsys.tech

## Windows (.bat file)
Double-click `start.bat` to run on Windows systems.

## Linux/Mac (.sh file)
Run `./start.sh` in terminal on Linux or macOS systems.

## What it does:
1. Installs backend dependencies (`npm install` in backend folder)
2. Installs frontend dependencies (`npm install` in frontend folder)
3. Builds the frontend for production (`npm run build`)
4. Starts the backend server (`node server.js`)

## Access the application:
Once started, open your browser and go to: http://localhost:3001

## Default login:
- Username: admin
- Password: admin

## Stopping the server:
- Windows: Close the command prompt window that opens
- Linux/Mac: Press Ctrl+C in the terminal

## Troubleshooting:
If the script fails, check that Node.js is installed and run the commands manually:
```
cd backend && npm install
cd ../frontend && npm install && npm run build
cd ../backend && node server.js
```