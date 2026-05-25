/* eslint-env node */
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
const EMBEDDING_DIMENSION = Number(process.env.EMBEDDING_DIMENSION || 2048);

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const buildEmbeddingPrompt = (text, purpose = 'document') => {
  const instruction = purpose === 'query' ? 'Represent this search query for retrieving relevant passages:' : 'Represent this passage for retrieval:';
  return `${instruction}\n${text}`;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: { message: 'Method Not Allowed' } });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return json(500, { error: { message: 'Missing GEMINI_API_KEY' } });

  try {
    const payload = JSON.parse(event.body || '{}');
    const text = String(payload?.text || '').trim();
    const purpose = payload?.purpose === 'query' ? 'query' : 'document';

    if (!text) return json(400, { error: { message: 'text is required' } });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: { parts: [{ text: buildEmbeddingPrompt(text, purpose) }] },
        outputDimensionality: EMBEDDING_DIMENSION,
      }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || data?.error) {
      return json(response.status || 500, {
        error: {
          message: data?.error?.message || 'Gemini embedding request failed',
          code: data?.error?.code || data?.error?.status,
        },
      });
    }

    const embedding = data?.embedding?.values;
    if (!Array.isArray(embedding) || !embedding.length) {
      return json(502, { error: { message: 'Invalid Gemini embedding response' } });
    }

    return json(200, { embedding });
  } catch (error) {
    return json(500, { error: { message: error?.message || 'Unexpected error' } });
  }
};
