#!/bin/bash

# Full deployment script for VPS
echo "🚀 Starting deployment..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create production environment file
echo "⚙️ Setting up production environment..."
cp .env.production .env

# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
echo "🔧 Starting backend server..."
pm2 start server.js --name "parenting-website"

# Setup nginx (if needed)
echo "🌐 Setting up web server..."
sudo apt update
sudo apt install nginx -y

# Create nginx config
sudo tee /etc/nginx/sites-available/parenting-website << EOF
server {
    listen 80;
    server_name your-subdomain.yourdomain.com;

    # Frontend static files
    location / {
        root /path/to/your/project/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/parenting-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://your-subdomain.yourdomain.com"
