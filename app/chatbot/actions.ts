'use server';

import { chatbot, ChatbotInput } from '@/ai/flows/chatbot';

export async function getChatbotResponse(input: ChatbotInput) {
  try {
    const response = await chatbot(input);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return { success: false, error: 'Failed to get response from the chatbot.' };
  }
}
