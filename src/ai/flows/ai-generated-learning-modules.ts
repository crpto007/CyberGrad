'use server';

/**
 * @fileOverview Generates tailored learning modules for cybersecurity students.
 *
 * - generateLearningModule - A function that generates a learning module based on the student's learning speed.
 * - LearningModuleInput - The input type for the generateLearningModule function.
 * - LearningModuleOutput - The return type for the generateLearningModule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningModuleInputSchema = z.object({
  topic: z.string().describe('The topic of the cybersecurity learning module.'),
  studentLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The student learning level.'),
  learningSpeed: z
    .enum(['Slow', 'Normal', 'Fast'])
    .describe('The student learning speed.'),
});
export type LearningModuleInput = z.infer<typeof LearningModuleInputSchema>;

const LearningModuleOutputSchema = z.object({
  title: z.string().describe('The title of the learning module.'),
  content: z.string().describe('The content of the learning module.'),
  questions: z.array(z.string()).describe('A list of questions for knowledge testing.'),
});
export type LearningModuleOutput = z.infer<typeof LearningModuleOutputSchema>;

export async function generateLearningModule(
  input: LearningModuleInput
): Promise<LearningModuleOutput> {
  return generateLearningModuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningModulePrompt',
  input: {schema: LearningModuleInputSchema},
  output: {schema: LearningModuleOutputSchema},
  prompt: `You are an expert cybersecurity educator. Generate a learning module on the topic of {{topic}} for a {{studentLevel}} student with a {{learningSpeed}} learning speed.

The learning module should include a title, content, and a list of questions for knowledge testing.

Title:
Content:
Questions:`,
});

const generateLearningModuleFlow = ai.defineFlow(
  {
    name: 'generateLearningModuleFlow',
    inputSchema: LearningModuleInputSchema,
    outputSchema: LearningModuleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
