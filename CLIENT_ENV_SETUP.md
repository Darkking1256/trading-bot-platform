# Client Environment Setup

## Environment Configuration

Create a `client/.env` file with the following variables:

```bash
# Development (Local)
VITE_API_BASE=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_DEMO_MODE=true

# Production (Update with your backend URL)
# VITE_API_BASE=https://your-backend-url.com
# VITE_SOCKET_URL=https://your-backend-url.com
# VITE_DEMO_MODE=false
```

## Testing Options

### Option 1: Frontend-Only Demo (Netlify)
- Works without any backend
- Click "Start Demo" to see simulated trading
- All data is generated client-side

### Option 2: Local Backend Testing
1. Start the minimal server: `npm run minimal`
2. Update `client/.env` to point to `http://localhost:5001`
3. Start the client: `cd client && npm start`
4. Click "Start Live" to connect to the backend

### Option 3: Full Backend Testing
1. Start the main server: `npm start`
2. Update `client/.env` to point to `http://localhost:5000`
3. Start the client: `cd client && npm start`
4. Use all trading features with real backend

## Production Deployment

1. Deploy your backend to Railway/Render/Fly/EC2
2. Update the production URLs in `client/.env`
3. Set `VITE_DEMO_MODE=false`
4. Deploy the client to Netlify

## Troubleshooting

- **Connection errors**: Check if the backend is running and the URL is correct
- **CORS issues**: Ensure the backend has CORS enabled
- **Socket connection fails**: Verify the Socket.IO path and port
- **Demo mode not working**: Check browser console for JavaScript errors
