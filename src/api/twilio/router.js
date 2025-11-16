/**
 * Twilio Smart Router
 *
 * Routes incoming calls based on the number called:
 * - +14374282102: Hangs up immediately (dead number)
 * - All other numbers: Connects to Fly.io WebSocket voice agent
 *
 * Usage:
 * Point ALL Twilio numbers to this single URL:
 * https://fly-voice-agent-red-darkness-2650.fly.dev/api/twilio/router
 */

import { logger } from '../../utils/logger.js';

const routerLogger = logger.child('TWILIO_ROUTER');

// Number that should hang up immediately
const BLOCKED_NUMBER = '+14374282102';

// WebSocket stream URL for voice agent
const STREAM_URL = process.env.FLY_STREAM_URL || 'wss://fly-voice-agent-red-darkness-2650.fly.dev/stream';

/**
 * Escape XML special characters
 */
function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate TwiML for hanging up
 */
function generateHangupTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
}

/**
 * Generate TwiML for connecting to voice agent stream
 */
function generateStreamTwiML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${STREAM_URL}" />
  </Connect>
  <Pause length="60"/>
</Response>`;
}

/**
 * Generate TwiML for playing ringback tone then redirecting
 */
function generateRingbackTwiML(redirectUrl) {
  const ringbackUrl = process.env.RINGBACK_URL || 'https://gincvicclrzfhkhi.public.blob.vercel-storage.com/ringback.wav';
  const loops = 5; // 5 seconds (assumes 1-second WAV)

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play loop="${loops}">${xmlEscape(ringbackUrl)}</Play>
  <Redirect method="POST">${xmlEscape(redirectUrl)}</Redirect>
</Response>`;
}

/**
 * Router endpoint handler
 */
export function handleTwilioRouter(req, res) {
  const { To, From, CallSid } = req.body;

  // Get action from query parameter
  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action');

  routerLogger.info('Incoming call received', {
    to: To,
    from: From,
    callSid: CallSid,
    action: action || 'ringback',
  });

  // Check if this is the blocked number
  if (To === BLOCKED_NUMBER) {
    routerLogger.info('Blocked number called - hanging up', {
      number: To,
      callSid: CallSid,
    });

    res.type('text/xml');
    return res.send(generateHangupTwiML());
  }

  // Phase 2: Connect to voice agent stream
  if (action === 'stream') {
    routerLogger.info('Connecting to voice agent stream', {
      to: To,
      from: From,
      callSid: CallSid,
      streamUrl: STREAM_URL,
    });

    res.type('text/xml');
    return res.send(generateStreamTwiML());
  }

  // Phase 1: Play ringback tone, then redirect to stream
  const redirectUrl = new URL(url.toString());
  redirectUrl.searchParams.set('action', 'stream');

  routerLogger.info('Playing ringback tone', {
    to: To,
    from: From,
    callSid: CallSid,
    redirectUrl: redirectUrl.toString(),
  });

  res.type('text/xml');
  return res.send(generateRingbackTwiML(redirectUrl.toString()));
}
