/* eslint-env node */
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || process.env.VITE_GROQ_FALLBACK_MODEL || 'openai/gpt-oss-120b';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const sanitizeAssistantText = (text = '') =>
  String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

const createApiError = (provider, fallbackMessage, response, data) => {
  const message = data?.error?.message || fallbackMessage;
  const error = new Error(message);
  error.provider = provider;
  error.status = response?.status;
  error.code = data?.error?.code || data?.error?.type;
  return error;
};

const callGroq = async ({ prompt, model = GROQ_MODEL }) => {
  if (!GROQ_API_KEY) throw new Error('Groq API Key missing');

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
  };

  if (model.includes('qwen3')) body.reasoning_format = 'hidden';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.error) throw createApiError('groq', 'Groq request failed', response, data);
  return sanitizeAssistantText(data?.choices?.[0]?.message?.content || '');
};

const callOpenRouter = async ({ prompt, model = OPENROUTER_MODEL }) => {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API Key missing');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.error) throw createApiError('openrouter', 'OpenRouter request failed', response, data);
  return sanitizeAssistantText(data?.choices?.[0]?.message?.content || '');
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: { message: 'Method Not Allowed' } });

  try {
    const payload = JSON.parse(event.body || '{}');
    const prompt = String(payload?.prompt || '').trim();
    if (!prompt) return json(400, { error: { message: 'prompt is required' } });

    try {
      const reply = await callGroq({ prompt });
      return json(200, { reply });
    } catch (error) {
      if (error?.status === 400 && GROQ_FALLBACK_MODEL && GROQ_FALLBACK_MODEL !== GROQ_MODEL) {
        try {
          const reply = await callGroq({ prompt, model: GROQ_FALLBACK_MODEL });
          return json(200, { reply });
        } catch {
          // fallback below
        }
      }
    }

    const reply = await callOpenRouter({ prompt });
    return json(200, { reply });
  } catch (error) {
    return json(500, { error: { message: error?.message || 'Unexpected error' } });
  }
};
