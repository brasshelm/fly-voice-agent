# Voice Agent System - Fly.io

Multi-tenant voice AI platform for handling inbound phone calls with customizable prompts per client.

## Overview

This is a cost-effective voice agent that:
- Handles inbound calls via Twilio
- Uses real-time speech-to-text (Deepgram)
- Powers conversations with AI (Groq/Gemini with automatic fallback)
- Generates natural voice responses (Cartesia)
- Collects caller information
- Sends data to your webhook
- Scales to zero when idle (pay only when calls are active)

## Features

- **Multi-tenant**: Each client gets custom prompts, branding, and Q&A
- **Real-time conversations**: Natural voice interactions
- **Smart routing**: Groq primary, Gemini fallback
- **Data collection**: Gathers service requests, contact info, urgency
- **Metrics API**: Monitor usage, costs, and performance
- **Auto-scaling**: Zero cost when idle

## Tech Stack

- **Fly.io**: On-demand WebSocket server
- **Twilio**: Phone numbers + call routing
- **Neon Postgres**: Client configs & call data
- **Deepgram Nova-3**: Speech-to-text
- **Groq Llama 3.3 70B**: Primary LLM (~200ms)
- **Gemini 2.0 Flash**: Fallback LLM
- **Cartesia Sonic**: Text-to-speech

## Project Structure

```
fly-voice-agent/
├── src/
│   ├── server.js              # Main WebSocket server + API
│   ├── config/
│   ├── db/
│   │   ├── neon.js            # Database client
│   │   └── queries.js         # User & call queries
│   ├── services/
│   │   ├── twilio-handler.js  # Main conversation orchestrator
│   │   ├── deepgram.js        # Speech-to-text
│   │   ├── llm-router.js      # LLM with fallback
│   │   ├── groq-client.js     # Groq API
│   │   ├── gemini-client.js   # Gemini API
│   │   ├── cartesia.js        # Text-to-speech
│   │   ├── prompt-builder.js  # Dynamic prompts
│   │   ├── post-call.js       # Webhook integration
│   │   └── metrics.js         # System metrics
│   ├── prompts/
│   │   └── template.js        # Prompt template
│   └── utils/
│       └── logger.js          # Structured logging
├── db-schema-extensions.sql   # Database setup
├── fly.toml                   # Fly.io config
├── Dockerfile                 # Container definition
├── package.json
├── DEPLOYMENT.md              # Detailed deployment guide
└── README.md
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Run the SQL script on your Neon database
psql "your-neon-connection-string" < db-schema-extensions.sql
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Local Development
```bash
npm run dev
```

### 5. Deploy to Fly.io
```bash
fly auth login
fly launch --name voice-agent --no-deploy
fly secrets set DATABASE_URL="your-neon-url"
fly secrets set DEEPGRAM_API_KEY="..."
fly secrets set GROQ_API_KEY="..."
fly secrets set GOOGLE_API_KEY="..."
fly secrets set CARTESIA_API_KEY="..."
fly secrets set WEBHOOK_URL="..."
fly secrets set WEBHOOK_SECRET="..."
fly secrets set METRICS_API_KEY="$(openssl rand -hex 32)"
fly deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Configuration

### User Configuration

Each user in the database has customizable fields:

```sql
UPDATE leadsaveai.users
SET
  business_name = 'ABC Plumbing',
  industry = 'plumbing',
  service_types = '["emergency plumbing", "drain cleaning"]'::jsonb,
  business_qa = '{
    "Do you work weekends?": "Yes, 24/7",
    "How much does it cost?": "Most jobs are $150-500"
  }'::jsonb,
  callback_window = 'within 2 hours',
  notification_phone = '+15559876543',
  notification_email = 'owner@abcplumbing.com'
WHERE user_id = 'user-uuid';
```

The AI will use these variables to customize conversations.

## API Endpoints

### Health Check
```bash
GET /health
# Returns: { status: 'up', active_calls: 0, uptime_seconds: 123 }
```

### Detailed Health
```bash
GET /health/detailed
# Returns: Database connection status + server status
```

### Metrics (Protected)
```bash
GET /metrics
Headers: X-API-Key: your-metrics-api-key
# Returns: Detailed system metrics
```

### WebSocket
```
wss://your-app.fly.dev/stream
# Twilio connects here for call streams
```

## Cost Estimates

Per 10,000 minutes (2,000 calls × 5min avg):

| Component | Cost/month |
|-----------|------------|
| Fly.io | $2-5 |
| Deepgram | $77 |
| Groq | $3-4 |
| Cartesia | $200 |
| Twilio Voice | $85 |
| Twilio Recording | $25 |
| Neon Postgres | $0 |
| **TOTAL** | **~$392** |

vs Bland.ai: ~$900/month
**Savings: 56%**

## Monitoring

### View Logs
```bash
fly logs
```

### Check Metrics
```bash
curl -H "X-API-Key: your-key" https://voice-agent.fly.dev/metrics
```

### Database Queries
```sql
-- Recent calls
SELECT * FROM leadsaveai.calls ORDER BY created_at DESC LIMIT 10;

-- Calls by user
SELECT u.business_name, COUNT(*) as calls
FROM leadsaveai.calls c
JOIN leadsaveai.users u ON c.user_id = u.user_id
GROUP BY u.business_name;
```

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Watch Mode
```bash
npm run dev
```

## Architecture

```
Call → Twilio → WebSocket → Fly.io Voice Agent
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
                Deepgram        Groq/Gemini     Cartesia
                  (STT)           (LLM)           (TTS)
                                    ↓
                              Neon Postgres
                                    ↓
                            Your Webhook API
```

## Security

- All API keys stored as Fly.io secrets
- HTTPS/WSS encryption for all connections
- Metrics endpoint protected with API key
- Webhook authenticated with Bearer token
- Database uses SSL/TLS

## Troubleshooting

### App won't start
```bash
fly logs
fly secrets list
```

### Database issues
```bash
# Test connection
psql "your-database-url"
```

### Twilio issues
- Check WebSocket URL in TwiML
- Verify app is running: `fly status`
- Test health: `curl https://your-app.fly.dev/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: Open a GitHub issue
- **Fly.io**: https://fly.io/docs/
- **Twilio**: https://www.twilio.com/docs/
