# Global Hosting Guide for Ticket System

## Prerequisites
- A domain name (purchase from Namecheap, GoDaddy, etc.)
- Static IP address from your ISP (or use dynamic DNS)
- Node.js installed on your hosting machine
- Basic Linux/Windows knowledge

## Option 1: Hosting on a PC (Windows/Linux)

### Step 1: Prepare Your PC
1. Ensure your PC stays powered on 24/7
2. Install Node.js (already done)
3. Set up automatic startup

### Step 2: Configure Router Port Forwarding
1. Access your router admin panel (usually 192.168.1.1)
2. Forward port 80 (HTTP) and 443 (HTTPS) to your PC's local IP
3. Find your PC's local IP: `ipconfig` (Windows) or `ifconfig` (Linux)

### Step 3: Install Nginx (Reverse Proxy)
```bash
# On Ubuntu/Debian:
sudo apt update
sudo apt install nginx

# On CentOS/RHEL:
sudo yum install nginx
```

### Step 4: Configure Nginx
Create `/etc/nginx/sites-available/ticket-system`:

```nginx
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ticket-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 6: Auto-Start Application
Create a systemd service `/etc/systemd/system/ticket-system.service`:

```ini
[Unit]
Description=Ticket System
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/ticket-system
ExecStart=/usr/bin/node /path/to/ticket-system/backend/server.js
Restart=always
RestartSec=10
Environment=RESEND_API_KEY=your_api_key_here

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ticket-system
sudo systemctl start ticket-system
```

## Option 2: Hosting on Raspberry Pi 4/5

### Step 1: Prepare Raspberry Pi
1. Install Raspberry Pi OS (64-bit recommended)
2. Update system: `sudo apt update && sudo apt upgrade`
3. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`

### Step 2: Clone and Setup Application
```bash
cd ~
git clone https://github.com/yourusername/ticket-system.git
cd ticket-system
chmod +x start.sh
./start.sh
```

### Step 3: Configure Router Port Forwarding
Same as PC option - forward ports 80 and 443 to your Pi's IP.

### Step 4: Install Nginx on Pi
```bash
sudo apt install nginx
```

### Step 5: Configure Nginx (same as PC option)
Use the same nginx configuration, but change proxy_pass to your Pi's setup.

### Step 6: SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Step 7: Auto-Start (same as PC option)
Create the systemd service file and enable it.

## Domain Configuration

### Step 1: Point Domain to Your IP
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Update DNS records:
   - Type: A
   - Name: @
   - Value: your.public.ip.address
   - Type: CNAME
   - Name: www
   - Value: yourdomain.com

### Step 2: Dynamic DNS (if no static IP)
If your ISP changes your IP, use services like:
- No-IP
- DuckDNS
- FreeDNS

## Security Considerations

### 1. Firewall
```bash
sudo ufw enable
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH access
```

### 2. Fail2Ban (brute force protection)
```bash
sudo apt install fail2ban
```

### 3. Regular Updates
```bash
sudo apt update && sudo apt upgrade
```

### 4. SSL/TLS
Always use HTTPS - Let's Encrypt provides free certificates.

## Monitoring and Maintenance

### 1. Check Application Status
```bash
sudo systemctl status ticket-system
sudo systemctl status nginx
```

### 2. View Logs
```bash
sudo journalctl -u ticket-system -f
sudo tail -f /var/log/nginx/error.log
```

### 3. Backup Database
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 /path/to/ticket-system/backend/tickets.db ".backup /path/to/backups/tickets_$DATE.db"
```

## Troubleshooting

### Common Issues:
1. **Port not accessible**: Check router port forwarding
2. **Domain not resolving**: Wait for DNS propagation (24-48 hours)
3. **SSL errors**: Ensure certificates are valid
4. **Application crashes**: Check logs with `journalctl`

### Performance Tips:
- Use PM2 for process management instead of systemd
- Set up log rotation
- Monitor memory usage
- Consider using a CDN for static assets

## Cost Breakdown
- Domain: $10-20/year
- SSL: Free (Let's Encrypt)
- Electricity: ~$5-10/month for 24/7 operation
- Optional: VPS hosting (~$5-20/month) for better reliability

This setup will make your ticket system globally accessible at your domain!