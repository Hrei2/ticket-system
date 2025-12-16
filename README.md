# Ticket System

A locally hosted ticketing application with user roles, QR code generation, and scanning.

## Features

- User roles: Admin, Seller, Scanner
- Event management
- Ticket selling with encrypted QR codes
- QR code scanning with age-based color coding
- Responsive design for desktop and mobile
- Local hosting, accessible on local network
- Email delivery via Resend

## Quick Start

### Automatic Setup
- **Windows**: Double-click `start.bat`
- **Linux/Mac**: Run `./start.sh`

### Manual Setup
1. Install dependencies: `npm install` in both backend and frontend folders
2. Build frontend: `npm run build` in frontend folder
3. Start backend: `npm start` in backend folder
4. Access at http://localhost:3001

## Global Hosting

**Can't access your router?** See `ALTERNATIVE_HOSTING.md` for cloud hosting options that don't require router configuration.

For traditional hosting with router access:
- **Complete Guide**: See `HOSTING_GUIDE.md` (PC and Raspberry Pi)
- **Windows PC Guide**: See `WINDOWS_HOSTING_GUIDE.md`
- **Automated Setup**: Run `windows-setup.bat` on Windows

### Quick Windows Setup:
1. Run `windows-setup.bat` as Administrator
2. Copy files to `C:\ticket-system`
3. Configure router port forwarding (ports 80, 443)
4. Point domain to your public IP
5. Run `certbot` for SSL certificate
6. Start the application

## Default Login

- Username: admin
- Password: admin

## Usage

- Admin: Manage users, events, age rules
- Seller: Sell tickets for assigned events
- Scanner: Scan tickets with age verification

## Notes

- Email and .pkpass features are optional and disabled without API keys.
- Database is SQLite, stored locally.
- For Raspberry Pi, ensure Node.js is installed and run similarly.