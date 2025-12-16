#!/bin/bash

# Raspberry Pi Setup Script for Ticket System
# Run this on a fresh Raspberry Pi OS installation

echo "=== Ticket System Raspberry Pi Setup ==="
echo "This script will set up your Raspberry Pi for hosting the ticket system globally"
echo

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install SSL tools
echo "Installing SSL tools..."
sudo apt install -y certbot python3-certbot-nginx

# Install Git
echo "Installing Git..."
sudo apt install -y git

# Create application directory
echo "Setting up application directory..."
sudo mkdir -p /opt/ticket-system
sudo chown $USER:$USER /opt/ticket-system

# Clone repository (you'll need to update this URL)
echo "Cloning ticket system repository..."
cd /opt/ticket-system
# git clone https://github.com/yourusername/ticket-system.git .
# For now, copy files manually or use scp/rsync

# Install dependencies (run this after copying files)
echo "To complete setup:"
echo "1. Copy your ticket-system files to /opt/ticket-system"
echo "2. Run: cd /opt/ticket-system && ./start.sh"
echo "3. Configure Nginx (see HOSTING_GUIDE.md)"
echo "4. Set up SSL certificates"
echo "5. Configure domain DNS"

echo
echo "Setup script completed!"
echo "Next steps in HOSTING_GUIDE.md"