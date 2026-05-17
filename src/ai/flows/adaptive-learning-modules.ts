'use server';

/**
 * @fileOverview Adapts learning modules based on user interactions and comprehension.
 *
 * - adaptiveLearningModules - A function that returns a learning module tailored to the user's learning needs.
 * - AdaptiveLearningModulesInput - The input type for the adaptiveLearningModules function.
 * - AdaptiveLearningModulesOutput - The return type for the adaptiveLearningModules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveLearningModulesInputSchema = z.object({
  topic: z.string().describe('The topic of the cybersecurity learning module.'),
  studentLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The student learning level.'),
  learningSpeed: z
    .enum(['Slow', 'Normal', 'Fast'])
    .describe('The student learning speed.'),
  userInteraction: z
    .string()
    .describe('A description of the user interaction with the previous learning module.'),
  userComprehension: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score between 0 and 1 indicating the user comprehension of the previous learning module. 0 indicates poor comprehension, 1 indicates excellent comprehension.'
    ),
});
export type AdaptiveLearningModulesInput = z.infer<typeof AdaptiveLearningModulesInputSchema>;

const AdaptiveLearningModulesOutputSchema = z.object({
  title: z.string().describe('The title of the learning module.'),
  content: z.string().describe('The content of the learning module, adapted based on user interaction and comprehension.'),
  questions: z.array(z.string()).describe('A list of questions for knowledge testing.'),
  feedback: z.string().describe('Feedback for the user based on their interaction and comprehension.'),
  difficultyAdjustment: z
    .string()
    .describe('The adjustment to the difficulty level of the next learning module.'),
});
export type AdaptiveLearningModulesOutput = z.infer<typeof AdaptiveLearningModulesOutputSchema>;

export async function adaptiveLearningModules(
  input: AdaptiveLearningModulesInput
): Promise<AdaptiveLearningModulesOutput> {
  return adaptiveLearningModulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveLearningModulesPrompt',
  input: {schema: AdaptiveLearningModulesInputSchema},
  output: {schema: AdaptiveLearningModulesOutputSchema},
  prompt: `You are an expert cybersecurity educator. Generate a learning module on the topic of {{topic}} for a {{studentLevel}} student with a {{learningSpeed}} learning speed. The user interaction with the previous learning module was: {{userInteraction}}. The user comprehension of the previous learning module is: {{userComprehension}}. Adapt the content and questions of this learning module based on the user's interaction and comprehension. Provide feedback to the user based on their interaction and comprehension. Adjust the difficulty level of the next learning module based on the user's performance.

Title:
Content:
Questions:
Feedback:
Difficulty Adjustment:`,
});

const adaptiveLearningModulesFlow = ai.defineFlow(
  {
    name: 'adaptiveLearningModulesFlow',
    inputSchema: AdaptiveLearningModulesInputSchema,
    outputSchema: AdaptiveLearningModulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
