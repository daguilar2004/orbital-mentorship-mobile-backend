# Running App Locally and on Remote Devices

## Quick Start - Local Development
```bash
npm install
npm run dev
```
Server runs on `http://localhost:4000`

---

## Setup for Remote Device Access

### Step 1: Find Your Host Machine's IP Address

**Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your **local network IP** (usually `192.168.x.x` or `10.x.x.x`), NOT the public internet IP.

### Step 2: Update Configuration

**Option A: Using .env file**
```bash
cp .env.remote .env
# Edit .env and replace YOUR_HOST_IP with your actual machine IP
# Example: MONGODB_URI=mongodb://192.168.1.100:27017/orbital-mentorship-dev
```

**Option B: Direct environment variable**
```bash
export MONGODB_URI=mongodb://YOUR_ACTUAL_IP:27017/orbital-mentorship-dev
npm run dev
```

### Step 3: Start the Server
```bash
npm run dev
```
Server will be available at:
- **Locally:** `http://localhost:4000`
- **Another device:** `http://YOUR_HOST_IP:4000`

### Step 4: Connect from Another Device

On your mobile app or other device, use:
```
http://YOUR_HOST_IP:4000/api/...
```

Example: `http://192.168.1.100:4000/api/health`

---

## Troubleshooting

### "Connection refused on another device"
- ✅ Verify the IP address is correct (check firewall isn't blocking port 4000)
- ✅ Ensure MongoDB is accessible from that device
- ✅ Check both machines are on the same network

### "MongoDB connection failed"
- ✅ Ensure MongoDB is running: `docker run -d -p 27017:27017 mongo:7`
- ✅ Or with systemctl: `sudo systemctl start mongod`

### Network not working between devices
- ✅ Check firewall settings (port 4000 must be open)
- ✅ Ensure both devices are on the same WiFi network
- ✅ Test with `ping YOUR_HOST_IP` from the other device

---

## Production Considerations

For production deployment:
1. Use environment-specific configurations
2. Secure MongoDB with authentication
3. Use HTTPS/TLS certificates
4. Implement proper CORS rules
5. Use a process manager (PM2) for stability
