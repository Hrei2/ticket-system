# Windows PC Global Hosting Guide

## Prerequisites
- Windows 10/11 PC that stays powered on 24/7
- Domain name (purchase from Namecheap, GoDaddy, etc.)
- Node.js installed (already done)
- Administrator access

## Step 1: Install Required Software

### Install Chocolatey (Package Manager)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

### Install Nginx
```powershell
choco install nginx -y
```

### Install Git (if not already installed)
```powershell
choco install git -y
```

## Step 2: Setup Application Directory

Create `C:\ticket-system` and copy your files there, or run the setup script:
```powershell
# Run the Windows setup script as Administrator
powershell -ExecutionPolicy Bypass -File "C:\path\to\ticket-system\windows-setup.ps1"
```

## Step 3: Configure Windows Firewall

Open PowerShell as Administrator and run:
```powershell
# Allow HTTP and HTTPS
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Allow SSH if needed
New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
```

## Step 4: Configure Router Port Forwarding

1. Find your router's admin panel (usually http://192.168.1.1 or http://192.168.0.1)
2. Login with admin credentials
3. Find "Port Forwarding" or "NAT" settings
4. Forward external ports 80 and 443 to your PC's local IP address
5. Find your PC's local IP: Open Command Prompt and run `ipconfig`

Example forwarding rules:
- External Port: 80 → Internal IP: [your.pc.ip] Internal Port: 80
- External Port: 443 → Internal IP: [your.pc.ip] Internal Port: 443

## Step 5: Configure Nginx

### Edit Nginx Configuration
Open `C:\tools\nginx\conf\nginx.conf` and add this server block:

```nginx
# Add this inside the http block, before the existing server block
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Test and Restart Nginx
```powershell
# Test configuration
C:\tools\nginx\nginx.exe -t

# Restart Nginx
C:\tools\nginx\nginx.exe -s reload
```

## Step 6: Domain Configuration

### Point Domain to Your IP
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Go to DNS settings
3. Add these records:

**A Record:**
- Type: A
- Name: @
- Value: [your.public.ip.address]
- TTL: 600

**CNAME Record:**
- Type: CNAME
- Name: www
- Value: yourdomain.com
- TTL: 600

### Find Your Public IP
Visit https://whatismyipaddress.com/ or run:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

## Step 7: SSL Certificate (HTTPS)

### Install Certbot
```powershell
choco install certbot -y
```

### Get SSL Certificate
```powershell
# Stop Nginx temporarily
C:\tools\nginx\nginx.exe -s stop

# Get certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start Nginx again
C:\tools\nginx\nginx.exe
```

### Update Nginx for SSL
Edit `C:\tools\nginx\conf\nginx.conf` and modify the server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate C:/Certbot/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key C:/Certbot/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 8: Auto-Start Application

### Create Windows Service
1. Download NSSM (Non-Sucking Service Manager)
2. Extract to `C:\nssm`
3. Create service:

```powershell
# Create service
C:\nssm\nssm.exe install TicketSystem "C:\Program Files\nodejs\node.exe"
C:\nssm\nssm.exe set TicketSystem AppParameters "C:\ticket-system\backend\server.js"
C:\nssm\nssm.exe set TicketSystem AppDirectory "C:\ticket-system\backend"
C:\nssm\nssm.exe set TicketSystem AppEnvironmentExtra RESEND_API_KEY=re_7ZVFQ9mn_7Afk9byav3wT941SW33F5F7n
C:\nssm\nssm.exe set TicketSystem Description "Ticket System Application"
C:\nssm\nssm.exe set TicketSystem Start SERVICE_AUTO_START

# Start service
C:\nssm\nssm.exe start TicketSystem
```

### Alternative: Scheduled Task
Create a scheduled task to run on startup:
1. Search for "Task Scheduler"
2. Create new task
3. Set to run at logon
4. Action: Start program
5. Program: `C:\ticket-system\start.bat`

## Step 9: Test Your Setup

1. Visit `http://yourdomain.com` (should redirect to HTTPS)
2. Login with admin/admin
3. Test ticket creation and scanning

## Step 10: Security Hardening

### Install Fail2Ban Alternative
```powershell
# Windows Defender Firewall with Advanced Security can help
# Or install a third-party firewall
```

### Regular Updates
```powershell
# Keep Windows updated
# Update Node.js regularly
# Update Nginx: choco upgrade nginx
```

## Troubleshooting

### Common Issues:

1. **Port 80/443 blocked**: Check Windows Firewall and router settings
2. **Domain not working**: Wait 24-48 hours for DNS propagation
3. **SSL errors**: Check certificate paths in nginx.conf
4. **Application not starting**: Check Windows Event Viewer

### Check Services:
```powershell
# Check if Nginx is running
Get-Service nginx

# Check if your application service is running
Get-Service TicketSystem
```

### View Logs:
- Nginx logs: `C:\tools\nginx\logs\`
- Application logs: Check PowerShell console or Event Viewer

## Cost Breakdown
- Domain: $10-20/year
- Electricity: ~$5-10/month for 24/7 operation
- SSL: Free
- Total: ~$15-30/year + electricity

## Backup Strategy
```powershell
# Create backup script (backup.bat)
@echo off
set BACKUP_DIR=C:\ticket-system-backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

# Backup database
copy C:\ticket-system\backend\tickets.db %BACKUP_DIR%\tickets_%DATE%.db

# Backup config files
xcopy C:\tools\nginx\conf %BACKUP_DIR%\nginx_%DATE% /E /I /H /Y

echo Backup completed: %BACKUP_DIR%\tickets_%DATE%.db
```

Your ticket system will now be accessible globally at `https://yourdomain.com`!