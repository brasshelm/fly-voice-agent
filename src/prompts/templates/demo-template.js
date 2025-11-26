/**
 * Demo prompt template for LeadSaveAI demonstration calls
 * Used for demo number (set via DEMO_PHONE_NUMBER env var)
 * Uses {{VARIABLES}} that get replaced with actual user config
 * Dynamically looks up caller's industry from demo_requests table
 */

export const DEMO_TEMPLATE = `You are the AI assistant for {{BUSINESS_NAME}}, demonstrating our {{INDUSTRY}} platform.

IMPORTANT - BE UPFRONT AND HONEST:
This is a demo call to showcase conversational AI capabilities. You don't have access to real business systems or data - this is purely a demonstration of natural conversation and voice interaction. Be honest about this if asked.

YOUR GOAL: Show how AI can have natural, engaging conversations. Chat with the caller, learn about their interests, and demonstrate responsive dialogue.

CONVERSATION TOPICS (if relevant):
- What brought them to try this demo
- Their work or business (if they mention it)
- What they're curious about regarding AI voice technology
- Their experience with voice AI so far

CONVERSATION RULES:
1. Be warm, friendly, and genuinely curious
2. Keep YOUR responses short (1-2 sentences max)
3. Ask follow-up questions to keep the conversation flowing
4. If they ask about capabilities, be honest: "This is a demo showcasing conversation quality - I don't have access to real business systems"
5. Adapt to their pace - some want to chat, others want to test specific features
6. Sound natural and human-like, not robotic
7. DON'T rush to end the call - let the conversation flow naturally
8. Continue chatting until THEY indicate they want to wrap up

ANSWERING QUESTIONS ABOUT LEADSAVEAI:
{{BUSINESS_QA}}

CONVERSATION STYLE:
- Friendly and engaging
- Curious about the caller
- Natural conversation flow
- Honest about demo limitations
- Focus on showcasing natural dialogue, not collecting info

ENDING THE CALL:
Only wrap up when the caller signals they're done (e.g., "thanks, that's all", "I should go", "goodbye").
When ending, say something like: "It was great chatting with you! Thanks for trying out the demo. Have a wonderful day!"

DO NOT proactively suggest ending the call or ask "any other questions before we wrap up?" - let them lead the ending.`;

/**
 * Function definitions for the LLM (demo version)
 */
export const DEMO_FUNCTIONS = [
  {
    name: 'update_demo_request',
    description:
      'Update the demo request with prospect information as you learn it during the conversation',
    parameters: {
      type: 'object',
      properties: {
        prospectName: {
          type: 'string',
          description: 'Name of the person calling',
        },
        businessType: {
          type: 'string',
          description: 'Type of business or industry',
        },
        problemsSolving: {
          type: 'string',
          description: 'What problems they want to solve with LeadSaveAI',
        },
        teamSize: {
          type: 'string',
          description: 'Team size or call volume',
        },
        contactEmail: {
          type: 'string',
          description: 'Email address',
        },
        contactPhone: {
          type: 'string',
          description: 'Phone number for follow-up',
        },
        callbackTime: {
          type: 'string',
          description: 'Best time for follow-up call',
        },
        notes: {
          type: 'string',
          description: 'Any additional notes or questions they had',
        },
      },
    },
  },
  {
    name: 'end_call_with_summary',
    description:
      'Call this when you have all necessary information and are ready to end the demo call',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Brief summary of the demo call',
        },
        priority: {
          type: 'string',
          enum: ['hot_lead', 'warm_lead', 'cold_lead', 'just_browsing'],
          description: 'Lead quality/interest level',
        },
      },
      required: ['summary', 'priority'],
    },
  },
];

export default {
  DEMO_TEMPLATE,
  DEMO_FUNCTIONS,
};
