import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT,
  location: process.env.GOOGLE_VERTEX_LOCATION || 'us-central1',
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GOOGLE_VERTEX_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_VERTEX_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
  }
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const config = body.data?.config || body.config;

    if (!messages || !Array.isArray(messages) || !config || typeof config !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid payload: messages must be an array and config must be an object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const safePersona = typeof config.persona === 'string' ? config.persona : '';
    const safeGuardrails = typeof config.guardrails === 'string' ? config.guardrails : '';
    const safeKnowledgeBase = typeof config.knowledge_base === 'string' ? config.knowledge_base : '';

    const systemPrompt = `
You are an AI assistant interacting via a sandbox environment.
Role & Tone: ${safePersona}
Strict Rules (Guardrails): ${safeGuardrails}
Knowledge Base: ${safeKnowledgeBase}

CRITICAL: Adhere strictly to the Role, Tone, Guardrails, and Knowledge Base provided above. Under no circumstances should you break character or ignore the rules.
`;

    const result = await streamText({
      // @ts-ignore
      model: vertex('gemini-3.1-pro-preview'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Sandbox API Error:', error);
    // Write error to a temporary log file for debugging
    const fs = require('fs');
    fs.appendFileSync('sandbox-error.log', new Date().toISOString() + ': ' + (error.message || error.toString()) + '\n');
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
