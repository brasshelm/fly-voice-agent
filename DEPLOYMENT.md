# Voice Agent Deployment Guide

## Prerequisites

1. **Fly.io Account**
   - Sign up at https://fly.io
   - Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

2. **API Keys**
   - Deepgram API key: https://console.deepgram.com/
   - Groq API key: https://console.groq.com/
   - Google Gemini API key: https://aistudio.google.com/
   - Cartesia API key: https://cartesia.ai/
   - Neon Postgres: https://console.neon.tech/

3. **Database Setup**
   - Run the SQL script: `db-schema-extensions.sql`
   - Add at least one user with prompt configuration

## Step 1: Database Setup

```bash
# Connect to your Neon database
psql "postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Run the schema extensions
\i db-schema-extensions.sql

# Verify tables exist
\dt leadsaveai.*
```

## Step 2: Configure Fly.io

```bash
# Login to Fly.io
fly auth login

# Launch your app (first time only)
cd /path/to/fly-voice-agent
fly launch --name voice-agent --no-deploy

# This creates fly.toml - verify the configuration
```

## Step 3: Set Environment Variables

```bash
# Database (from Neon)
fly secrets set DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Voice AI API Keys
fly secrets set DEEPGRAM_API_KEY="your-deepgram-key"
fly secrets set GROQ_API_KEY="your-groq-key"
fly secrets set GOOGLE_API_KEY="your-google-gemini-key"
fly secrets set CARTESIA_API_KEY="your-cartesia-key"

# Your Existing Webhook
fly secrets set WEBHOOK_URL="https://leadsaveai.com/api/webhooks/call-data"
fly secrets set WEBHOOK_SECRET="4907843a2134524e2cad424010570e6a007bdf60840c34a0b14cb69a35d3a431"

# Metrics API Key (generate random)
fly secrets set METRICS_API_KEY="$(openssl rand -hex 32)"

# Verify all secrets are set
fly secrets list
```

## Step 4: Deploy to Fly.io

```bash
# Deploy the application
fly deploy

# Check deployment status
fly status

# View logs
fly logs

# Get your app URL
fly info
# Example: https://voice-agent.fly.dev
```

## Step 5: Configure Twilio

### Option A: TwiML Bins (Recommended)

1. Go to Twilio Console → TwiML Bins
2. Create a new TwiML Bin named "Voice Agent Stream"
3. Add this TwiML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Thank you for calling. Please hold for just a moment while we connect you.
  </Say>
  <Pause length="2"/>

  <!-- Connect to Fly.io voice agent -->
  <Start>
    <Stream url="wss://voice-agent.fly.dev/stream" />
  </Start>

  <!-- Record the call (optional) -->
  <Record
    recordingStatusCallback="https://leadsaveai.com/api/webhook/recording-ready"
    recordingStatusCallbackMethod="POST"
    recordingStatusCallbackEvent="completed"
    trim="trim-silence"
  />
</Response>
```

4. Save the TwiML Bin
5. Copy the TwiML Bin URL
6. Go to your Twilio phone number → Configure → Voice & Fax
7. Set "A CALL COMES IN" to "TwiML Bin" and select your bin

### Option B: Direct Webhook

1. Go to Twilio phone number settings
2. Set "A CALL COMES IN" to "Webhook"
3. URL: `https://your-webhook-server.com/voice`
4. Create endpoint that returns above TwiML

## Step 6: Test Your Setup

```bash
# 1. Check health endpoint
curl https://voice-agent.fly.dev/health

# 2. Check detailed health (includes database)
curl https://voice-agent.fly.dev/health/detailed

# 3. Make a test call to your Twilio number
# Watch logs in real-time:
fly logs

# 4. Check metrics (replace with your key)
curl -H "X-API-Key: your-metrics-api-key" https://voice-agent.fly.dev/metrics
```

## Step 7: Verify Call Flow

After making a test call, verify:

- [ ] Call connects and greeting plays
- [ ] AI responds to your questions
- [ ] Data is collected properly
- [ ] Call data appears in `leadsaveai.calls` table
- [ ] SMS/email notifications sent
- [ ] Recording URL updated (30-60 seconds after call)

## Monitoring

### View Logs
```bash
# Real-time logs
fly logs

# Filter by instance
fly logs -i instance-id

# Search logs
fly logs | grep ERROR
```

### Check Metrics
```bash
# Health check
curl https://voice-agent.fly.dev/health

# Full metrics (requires API key)
curl -H "X-API-Key: your-key" https://voice-agent.fly.dev/metrics
```

### Monitor Database
```sql
-- Recent calls
SELECT call_id, caller_phone, duration_seconds, urgency_level, created_at
FROM leadsaveai.calls
ORDER BY created_at DESC
LIMIT 10;

-- Calls by user
SELECT u.business_name, COUNT(*) as call_count
FROM leadsaveai.calls c
JOIN leadsaveai.users u ON c.user_id = u.user_id
GROUP BY u.business_name;
```

## Scaling

### Increase Resources
```bash
# Scale memory
fly scale memory 1024

# Scale VM to dedicated CPU
fly scale vm dedicated-cpu-1x

# Scale to multiple regions (for lower latency)
fly regions add lax syd
```

### Auto-scaling (Scale to Zero)

The app is configured to scale to zero when idle:
- `auto_stop_machines = "stop"` - Stop when idle
- `auto_start_machines = true` - Auto-start on request
- `min_machines_running = 0` - Allow zero instances

This means:
- First call after idle period: ~2-3 second cold start
- Subsequent calls: Instant response
- Cost: Only pay when calls are active

## Troubleshooting

### App won't start
```bash
# Check logs
fly logs

# SSH into instance
fly ssh console

# Check environment variables
fly secrets list
```

### Database connection fails
```bash
# Test connection locally
psql "postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Verify DATABASE_URL is set
fly secrets list | grep DATABASE_URL
```

### Twilio connection issues
- Verify WebSocket URL is correct: `wss://voice-agent.fly.dev/stream`
- Check Fly.io app is running: `fly status`
- Test health endpoint: `curl https://voice-agent.fly.dev/health`
- Check Twilio logs: https://console.twilio.com/monitor/logs/calls

### LLM errors
- Check API keys are valid
- Verify rate limits not exceeded
- Check logs for error details
- Gemini fallback should activate automatically

## Cost Optimization

### Current Setup
- Memory: 512MB ($0.0000022/sec when running)
- Auto-scales to zero when idle
- No storage costs (using Neon for DB)

### Estimated Costs
- 100 calls/day × 5min avg = 500 min/day
- Running time: ~500 min/day = ~8.3 hours
- Cost: ~$0.50/day = ~$15/month for infrastructure
- Total with AI APIs: ~$40/month for 100 calls

### Tips
- Use Groq as primary (cheapest LLM)
- Monitor metrics to identify expensive patterns
- Consider caching common responses
- Optimize prompt length to reduce tokens

## Security Best Practices

1. **API Keys**: Never commit to git
2. **Metrics Endpoint**: Protect with strong API key
3. **Webhook**: Use secure secret token
4. **HTTPS**: All connections use TLS
5. **Database**: SSL required for Neon

## Backup & Recovery

### Backup Database
```bash
# Export user configurations
pg_dump -t leadsaveai.users "postgresql://..." > users_backup.sql

# Export call history
pg_dump -t leadsaveai.calls "postgresql://..." > calls_backup.sql
```

### Rollback Deployment
```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback
```

## Support

- Fly.io Docs: https://fly.io/docs/
- Twilio Docs: https://www.twilio.com/docs/voice/twiml/stream
- Deepgram: https://developers.deepgram.com/
- Groq: https://console.groq.com/docs
