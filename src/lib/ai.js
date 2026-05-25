import { extractText, getDocumentProxy } from 'unpdf';

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

const callChatCompletion = async (prompt) => {
  const response = await fetch('/.netlify/functions/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.error) {
    throw createApiError('chat', 'AI chat request failed', response, data);
  }

  return sanitizeAssistantText(data?.reply || '');
};

const callGeminiEmbedding = async (text, purpose = 'document') => {
  const response = await fetch('/.netlify/functions/gemini-embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      purpose,
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

  const embedding = data?.embedding;
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
1. Tone: Warm, engaging, and professional. Speak as if you are a personal representative of Thura.
2. Language: If the user asks in Myanmar (Burmese), respond in Myanmar (Burmese). If the user asks in English, respond in English. Always use clear, natural, and fluent language.
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
    return await callChatCompletion(prompt);
  } catch (error) {
    throw new Error(error?.message || 'Chat response failed');
  }
};
