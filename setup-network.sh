#!/bin/bash

# Network Setup Helper Script for Orbital Mentorship Backend

echo "🚀 Orbital Mentorship Backend - Network Setup"
echo "=============================================="
echo ""

# Detect OS and get IP
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
else
    echo "❌ Unsupported OS. Please set IP manually in .env file"
    exit 1
fi

echo "📍 Detected Local IP: $LOCAL_IP"
echo ""

# Ask user preference
echo "How would you like to run the server?"
echo "1) Local development only (localhost:4000)"
echo "2) Network access (connect from another device)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "✅ Setting up for LOCAL development..."
        cp .env.local .env
        echo "✅ Using .env.local configuration"
        echo "📝 MongoDB: mongodb://localhost:27017/orbital-mentorship-dev"
        echo ""
        echo "To start: npm run dev"
        echo "Access at: http://localhost:4000"
        ;;
    2)
        echo "✅ Setting up for NETWORK access..."
        
        # Create .env with detected IP
        cat > .env << EOF
# Network-enabled configuration
PORT=4000
MONGODB_URI=mongodb://$LOCAL_IP:27017/orbital-mentorship-dev
EOF
        
        echo "✅ Configuration updated"
        echo "📝 MongoDB: mongodb://$LOCAL_IP:27017/orbital-mentorship-dev"
        echo ""
        echo "To start: npm run dev"
        echo "📱 Access from:"
        echo "   - This machine: http://localhost:4000"
        echo "   - Other devices: http://$LOCAL_IP:4000"
        echo ""
        echo "⚠️  Note: Make sure MongoDB is listening on 0.0.0.0, not just localhost"
        echo "    Or ensure other devices can access $LOCAL_IP:27017"
        ;;
    *)
        echo "❌ Invalid choice. Please run again."
        exit 1
        ;;
esac

echo ""
echo "=============================================="
