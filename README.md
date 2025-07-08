# Onyx UI Search App

Angular-based search interface for Onyx API.

## Commands

```bash
# Install dependencies
npm install

# Start dev server with API proxy
npm run start

# Start on specific port
npm run start -- --port 4201

# Kill running dev servers
lsof -i :4200,4201 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Build for production
npm run build

# Deploy to S3
./deploy.sh
```

## API Configuration

- API URL: https://sonix.agibot.click
- All requests must include `/api` prefix
- Auth: Bearer token in Authorization header
