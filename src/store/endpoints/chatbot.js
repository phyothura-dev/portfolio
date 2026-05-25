import { ApiService } from '../ApiService';
import { supabase } from '../../lib/supabase';
import { extractPdfText, getEmbedding, generateChatResponse, chunkText } from '../../lib/ai';

export const ChatbotApi = ApiService.injectEndpoints({
  endpoints: (builder) => ({
    uploadKnowledge: builder.mutation({
      queryFn: async ({ file, textContent }) => {
        try {
          let combinedContent = textContent || '';

          if (file) {
            const pdfText = await extractPdfText(file);
            combinedContent += (combinedContent ? '\n\n' : '') + pdfText;
          }

          if (combinedContent) {
            const chunks = chunkText(combinedContent, 800);

            for (const chunk of chunks) {
              const embedding = await getEmbedding(chunk, { purpose: 'document' });
              const { error: dbError } = await supabase.from('knowledge_base').insert([{ content: chunk, embedding: embedding }]);
              if (dbError) throw new Error(dbError.message);
            }
          }
          return { data: 'Success' };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
    }),
    askChatbot: builder.mutation({
      queryFn: async ({ question }) => {
        try {
          let context = '';

          try {
            const queryEmbedding = await getEmbedding(question, { purpose: 'query' });
            const { data: matches, error: rpcError } = await supabase.rpc('match_knowledge', {
              query_embedding: queryEmbedding,
              match_threshold: 0.0,
              match_count: 5,
            });

            if (rpcError) throw new Error(rpcError.message);
            context = matches?.map((m) => m.content).join('\n\n') || '';
          } catch {
            context = '';
          }

          const reply = await generateChatResponse(question, context);

          return { data: reply };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
    }),
  }),
});

export const { useUploadKnowledgeMutation, useAskChatbotMutation } = ChatbotApi;
