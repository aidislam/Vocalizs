'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered voice suggestions
 * based on the tone and style of the input text.
 *
 * - `suggestSuitableVoices`: A function that suggests suitable voices based on input text.
 * - `VoiceSelectionInput`: The input type for the `suggestSuitableVoices` function.
 * - `VoiceSelectionOutput`: The output type for the `suggestSuitableVoices` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceSelectionInputSchema = z.object({
  inputText: z
    .string()
    .describe('The text for which a suitable voice is to be selected.'),
});
export type VoiceSelectionInput = z.infer<typeof VoiceSelectionInputSchema>;

const VoiceSelectionOutputSchema = z.object({
  suggestedVoices: z
    .array(z.string())
    .describe(
      'An array of suggested voice names that best suit the tone and style of the input text.'
    ),
});
export type VoiceSelectionOutput = z.infer<typeof VoiceSelectionOutputSchema>;

export async function suggestSuitableVoices(
  input: VoiceSelectionInput
): Promise<VoiceSelectionOutput> {
  return voiceSelectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceSelectionPrompt',
  input: {schema: VoiceSelectionInputSchema},
  output: {schema: VoiceSelectionOutputSchema},
  prompt: `You are an AI voice selection assistant. Given the following text, suggest a list of voices that would be suitable for reading it. Only provide the names of the voices, comma separated.

Text: {{{inputText}}}

Consider these voices: Algenib, Achernar.
`,
});

const voiceSelectionFlow = ai.defineFlow(
  {
    name: 'voiceSelectionFlow',
    inputSchema: VoiceSelectionInputSchema,
    outputSchema: VoiceSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
