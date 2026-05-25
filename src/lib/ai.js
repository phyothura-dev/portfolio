import { extractText, getDocumentProxy } from 'unpdf';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_FALLBACK_MODEL = import.meta.env.VITE_GROQ_FALLBACK_MODEL || 'openai/gpt-oss-120b';
const GEMINI_EMBEDDING_MODEL = import.meta.env.VITE_GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
const EMBEDDING_DIMENSION = Number(import.meta.env.VITE_EMBEDDING_DIMENSION || 2048);

const sanitizeAssistantText = (text = '') => {
  return String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();
};

const createApiError = (provider, fallbackMessage, response, data) => {
  const message = data?.error?.message || fallbackMessage;
  const error = new Error(message);
  error.provider = provider;
  error.status = response?.status;
  error.code = data?.error?.code || data?.error?.type;
  return error;
};

const callGroq = async ({ prompt, model = GROQ_MODEL }) => {
  if (!GROQ_API_KEY) {
    const error = new Error('Groq API Key missing');
    error.provider = 'groq';
    error.code = 'missing_api_key';
    throw error;
  }

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
  };

  if (model.includes('qwen3')) {
    body.reasoning_format = 'hidden';
  }

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

  if (!response.ok || data?.error) {
    throw createApiError('groq', 'Groq request failed', response, data);
  }

  return sanitizeAssistantText(data?.choices?.[0]?.message?.content || '');
};

const callOpenRouter = async ({ prompt, model = 'openai/gpt-oss-120b:free', base64Data = null, isEmbedding = false }) => {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API Key missing');

  const endpoint = isEmbedding ? 'embeddings' : 'chat/completions';
  const body = isEmbedding
    ? { model, input: prompt }
    : {
        model,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: prompt }, ...(base64Data ? [{ type: 'image_url', image_url: { url: `data:application/pdf;base64,${base64Data}` } }] : [])],
          },
        ],
      };

  const response = await fetch(`https://openrouter.ai/api/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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

  if (!response.ok || data?.error) {
    throw createApiError('openrouter', 'OpenRouter request failed', response, data);
  }

  return isEmbedding ? data.data[0].embedding : sanitizeAssistantText(data?.choices?.[0]?.message?.content || '');
};

const buildEmbeddingPrompt = (text, purpose = 'document') => {
  const instruction =
    purpose === 'query'
      ? 'Represent this search query for retrieving relevant passages:'
      : 'Represent this passage for retrieval:';
  return `${instruction}\n${text}`;
};

const callGeminiEmbedding = async (text, purpose = 'document') => {
  if (!GEMINI_API_KEY) {
    const error = new Error('Gemini API Key missing');
    error.provider = 'gemini';
    error.code = 'missing_api_key';
    throw error;
  }

  const embeddingInput = buildEmbeddingPrompt(text, purpose);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: {
        parts: [{ text: embeddingInput }],
      },
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
    throw createApiError('gemini', 'Gemini embedding request failed', response, data);
  }

  const embedding = data?.embedding?.values;
  if (!Array.isArray(embedding) || !embedding.length) {
    const error = new Error('Invalid Gemini embedding response');
    error.provider = 'gemini';
    error.code = 'invalid_embedding_response';
    throw error;
  }

  return embedding;
};

export const extractPdfText = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text || '';
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Could not extract text from PDF');
  }
};

export const chunkText = (text, maxChars = 1000) => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if (currentChunk.length + word.length + 1 > maxChars) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
};

export const getEmbedding = async (text, options = {}) => {
  const { purpose = 'document' } = options;
  try {
    return await callGeminiEmbedding(text, purpose);
  } catch (error) {
    throw new Error(error?.message || 'Embedding failed');
  }
};

export const generateChatResponse = async (question, context) => {
  const prompt = `You are a friendly and polite AI assistant representing Thura and this portfolio. 

Follow these instructions to craft the perfect response:
1. Tone: Warm, engaging, and highly professional. Speak as if you are a personal representative of Thura.
2. Language: Always respond in the SAME language used by the user. If the user asks in Myanmar (Burmese), respond in Myanmar (Burmese) clearly and naturally.
3. Length: Be very concise and to the point. Keep your answers short (maximum 2-3 sentences) unless the user explicitly asks for detailed information. Avoid long paragraphs.
4. Format: Use clear language. Break up information into short bullet points if listing things.
5. Source Material: Answer the user's question ONLY using the information provided in the CONTEXT below.
6. Missing Info: If the CONTEXT does not contain the answer, warmly let the user know that you don't have that specific information on hand, but they can reach out to Thura directly. 
7. Accuracy: Do NOT guess, invent, or hallucinate facts that are outside the provided context.

CONTEXT:
${context ? context : 'No relevant information found in the knowledge base.'}

USER QUESTION:
${question}`;

  try {
    return await callGroq({ prompt });
  } catch (error) {
    if (error?.status === 400 && GROQ_FALLBACK_MODEL && GROQ_FALLBACK_MODEL !== GROQ_MODEL) {
      try {
        return await callGroq({ prompt, model: GROQ_FALLBACK_MODEL });
      } catch {
        return await callOpenRouter({ prompt });
      }
    }
  }
};
