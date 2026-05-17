'use server';

import {
  adaptiveQuestionGeneration,
  AdaptiveQuestionGenerationInput,
} from '@/ai/flows/adaptive-question-generation';
import {
  generateLearningModule,
  LearningModuleInput,
} from '@/ai/flows/ai-generated-learning-modules';

export async function getLearningModule(input: LearningModuleInput) {
  try {
    const module = await generateLearningModule(input);
    return { success: true, data: module };
  } catch (error) {
    console.error('Error generating learning module:', error);
    return { success: false, error: 'Failed to generate learning module.' };
  }
}

export async function getAdaptiveQuestion(
  input: AdaptiveQuestionGenerationInput
) {
  try {
    const question = await adaptiveQuestionGeneration(input);
    return { success: true, data: question };
  } catch (error) {
    console.error('Error generating adaptive question:', error);
    return { success: false, error: 'Failed to generate adaptive question.' };
  }
}
