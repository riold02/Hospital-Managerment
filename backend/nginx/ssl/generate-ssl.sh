#!/bin/bash
# ============================================================================
# SSL Certificate Generation Script for Development
# Hospital Management System
# ============================================================================

echo "🔐 Generating SSL certificates for development..."

# Create SSL directory if not exists
mkdir -p /etc/nginx/ssl

# Generate private key
openssl genrsa -out /etc/nginx/ssl/server.key 2048

# Generate certificate signing request
openssl req -new -key /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.csr -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=Hospital Management/OU=IT Department/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in /etc/nginx/ssl/server.csr -signkey /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt

# Set proper permissions
chmod 600 /etc/nginx/ssl/server.key
chmod 644 /etc/nginx/ssl/server.crt

# Remove CSR file
rm /etc/nginx/ssl/server.csr

echo "✅ SSL certificates generated successfully!"
echo "📍 Certificate: /etc/nginx/ssl/server.crt"
echo "🔑 Private Key: /etc/nginx/ssl/server.key"
echo ""
echo "⚠️  NOTE: These are self-signed certificates for development only!"
echo "   Browsers will show security warnings. For production, use proper SSL certificates."
