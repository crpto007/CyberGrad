'use server';

/**
 * @fileOverview A flow for adaptive question generation based on user performance.
 *
 * - adaptiveQuestionGeneration - A function that generates questions with difficulty adjusted to the user's skill level.
 * - AdaptiveQuestionGenerationInput - The input type for the adaptiveQuestionGeneration function.
 * - AdaptiveQuestionGenerationOutput - The return type for the adaptiveQuestionGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuestionGenerationInputSchema = z.object({
  topic: z.string().describe('The topic for which a question should be generated.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the question.'),
  userPerformance: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score between 0 and 1 indicating the user performance on previous questions. 0 indicates poor performance, 1 indicates excellent performance.'
    ),
});
export type AdaptiveQuestionGenerationInput = z.infer<typeof AdaptiveQuestionGenerationInputSchema>;

const AdaptiveQuestionGenerationOutputSchema = z.object({
  question: z.string().describe('The generated question.'),
  answer: z.string().describe('The answer to the generated question.'),
  explanation: z.string().describe('The explanation to the answer.'),
  newDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The new difficulty level of the next question.'),
});
export type AdaptiveQuestionGenerationOutput = z.infer<typeof AdaptiveQuestionGenerationOutputSchema>;

export async function adaptiveQuestionGeneration(
  input: AdaptiveQuestionGenerationInput
): Promise<AdaptiveQuestionGenerationOutput> {
  return adaptiveQuestionGenerationFlow(input);
}

const adaptiveQuestionPrompt = ai.definePrompt({
  name: 'adaptiveQuestionPrompt',
  input: {schema: AdaptiveQuestionGenerationInputSchema},
  output: {schema: AdaptiveQuestionGenerationOutputSchema},
  prompt: `You are an expert cybersecurity educator. Generate a question, answer, and explanation for the topic: {{{topic}}}. The current difficulty is {{{difficulty}}}. The user performance on previous questions is {{{userPerformance}}}. Adjust the difficulty of the next question based on the user performance. If the user performance is below 0.3, set the difficulty to easy. If the user performance is between 0.3 and 0.7, set the difficulty to medium. If the user performance is above 0.7, set the difficulty to hard.

Question: {{question}}
Answer: {{answer}}
Explanation: {{explanation}}
New Difficulty: {{newDifficulty}}`,
});

const adaptiveQuestionGenerationFlow = ai.defineFlow(
  {
    name: 'adaptiveQuestionGenerationFlow',
    inputSchema: AdaptiveQuestionGenerationInputSchema,
    outputSchema: AdaptiveQuestionGenerationOutputSchema,
  },
  async input => {
    const {output} = await adaptiveQuestionPrompt(input);
    return output!;
  }
);
