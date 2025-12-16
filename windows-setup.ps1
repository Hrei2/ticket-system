# Windows PC Hosting Setup Script
# Run this as Administrator in PowerShell

Write-Host "=== Ticket System Windows PC Setup ===" -ForegroundColor Green
Write-Host "This script will help set up your Windows PC for hosting the ticket system globally" -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (!$currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run this script as Administrator!" -ForegroundColor Red
    exit 1
}

# Install Chocolatey (package manager for Windows)
Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    refreshenv
}

# Install Nginx
Write-Host "Installing Nginx..." -ForegroundColor Yellow
choco install nginx -y

# Install Git
Write-Host "Installing Git..." -ForegroundColor Yellow
choco install git -y

# Create application directory
Write-Host "Setting up application directory..." -ForegroundColor Yellow
$appDir = "C:\ticket-system"
if (!(Test-Path $appDir)) {
    New-Item -ItemType Directory -Path $appDir -Force
}

# Copy files (you'll need to do this manually)
Write-Host "To complete setup:" -ForegroundColor Cyan
Write-Host "1. Copy your ticket-system files to C:\ticket-system" -ForegroundColor White
Write-Host "2. Run: cd C:\ticket-system; .\start.bat" -ForegroundColor White
Write-Host "3. Configure Nginx (see HOSTING_GUIDE.md)" -ForegroundColor White
Write-Host "4. Set up SSL certificates" -ForegroundColor White
Write-Host "5. Configure domain DNS" -ForegroundColor White
Write-Host "6. Set up Windows Firewall rules" -ForegroundColor White

# Set up Windows Firewall
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

Write-Host "" -ForegroundColor Green
Write-Host "Windows setup script completed!" -ForegroundColor Green
Write-Host "Next steps in HOSTING_GUIDE.md" -ForegroundColor Green

pause