@echo off
echo === Windows PC Global Hosting Setup ===
echo This script will set up your Windows PC for hosting the ticket system globally
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator - good!
) else (
    echo Please run this script as Administrator!
    pause
    exit /b 1
)

echo.
echo Step 1: Installing Chocolatey...
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"

echo.
echo Step 2: Installing Nginx...
choco install nginx -y

echo.
echo Step 3: Installing Git...
choco install git -y

echo.
echo Step 4: Installing Certbot...
choco install certbot -y

echo.
echo Step 5: Configuring Windows Firewall...
powershell -Command "New-NetFirewallRule -DisplayName 'HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow"
powershell -Command "New-NetFirewallRule -DisplayName 'HTTPS' -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow"

echo.
echo Step 6: Creating application directory...
if not exist "C:\ticket-system" mkdir "C:\ticket-system"

echo.
echo === Setup Complete! ===
echo.
echo Next steps:
echo 1. Copy your ticket-system files to C:\ticket-system
echo 2. Configure your router to forward ports 80 and 443 to this PC
echo 3. Point your domain to this PC's public IP address
echo 4. Follow WINDOWS_HOSTING_GUIDE.md for detailed configuration
echo.
echo Your public IP address is:
powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org').Content"
echo.
pause