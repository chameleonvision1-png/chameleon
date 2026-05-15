import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

/**
 * Vertex AI provider for ALL Gemini models.
 * 
 * Gemini 3.x models require location='global' on Vertex AI.
 * Older models (2.5, 2.0, etc.) work on regional endpoints (us-central1).
 * 
 * Billing goes through Google Cloud billing ($310 credit available)
 * instead of AI Studio prepay.
 */
function getVertexClient(location: string) {
  const base64Creds = process.env.GOOGLE_VERTEX_CREDENTIALS_BASE64;

  if (base64Creds) {
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(Buffer.from(base64Creds, 'base64').toString('utf-8'));
    } catch {
      throw new Error('GOOGLE_VERTEX_CREDENTIALS_BASE64 contains invalid base64 or JSON');
    }
    if (typeof json.client_email !== 'string' || !json.client_email ||
        typeof json.private_key !== 'string' || !json.private_key) {
      throw new Error('Vertex credentials missing required fields: client_email and private_key');
    }
    return createVertex({
      project: (typeof json.project_id === 'string' && json.project_id) || 'sync-marketplace',
      location,
      googleAuthOptions: {
        credentials: {
          client_email: json.client_email,
          private_key: json.private_key,
        },
      },
    });
  }

  return createVertex({
    project: process.env.GOOGLE_VERTEX_PROJECT || 'sync-marketplace',
    location,
  });
}

// Gemini 3.x models are only available on the 'global' Vertex AI endpoint
function getLocationForModel(modelId: string): string {
  if (modelId.startsWith('gemini-3')) {
    return 'global';
  }
  return process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';
}

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

    // Dynamic model from canvas config, default to Gemini 3.1 Pro
    const modelId = (typeof config.model === 'string' && config.model.trim())
      ? config.model.trim()
      : 'gemini-3.1-pro-preview';

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

    // Convert UIMessage format (parts[]) to simple {role, content} for the model
    const allowedRoles = new Set<string>(['user', 'assistant']);
    const formattedMessages = messages
      .filter((m: any) => allowedRoles.has(m.role))
      .map((m: { role: 'user' | 'assistant'; parts?: any[]; content?: string }) => ({
        role: m.role,
        content: m.parts
          ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
          : (typeof m.content === 'string' ? m.content : ''),
      }));

    // Route to the right Vertex AI location based on model generation
    const location = getLocationForModel(modelId);
    const vertex = getVertexClient(location);

    console.log(`Sandbox: [Vertex AI / ${location}] model=${modelId}, msgs=${formattedMessages.length}`);
    const model = vertex(modelId);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Sandbox API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
