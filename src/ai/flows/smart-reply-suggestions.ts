'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating smart reply suggestions based on a given message.
 *
 * The flow takes a message as input and returns an array of suggested replies.
 *
 * @fileOverview SmartReplySuggestions Flow
 * Contains the {@link generateSmartReplies} function, along with
 * {@link SmartReplySuggestionsInput} and {@link SmartReplySuggestionsOutput} types.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplySuggestionsInputSchema = z.object({
  message: z.string().describe('The current message in the conversation.'),
});
export type SmartReplySuggestionsInput = z.infer<
  typeof SmartReplySuggestionsInputSchema
>;

const SmartReplySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested quick replies.'),
});
export type SmartReplySuggestionsOutput = z.infer<
  typeof SmartReplySuggestionsOutputSchema
>;

/**
 * Generates smart reply suggestions for a given message.
 * @param input - The input containing the message to generate replies for.
 * @returns An object containing an array of suggested replies.
 */
export async function generateSmartReplies(
  input: SmartReplySuggestionsInput
): Promise<SmartReplySuggestionsOutput> {
  return smartReplySuggestionsFlow(input);
}

const smartReplySuggestionsPrompt = ai.definePrompt({
  name: 'smartReplySuggestionsPrompt',
  input: {schema: SmartReplySuggestionsInputSchema},
  output: {schema: SmartReplySuggestionsOutputSchema},
  prompt: `You are a helpful assistant that provides smart reply suggestions for a given message.

  Given the following message:
  {{message}}

  Generate an array of 3 suggested replies that would be appropriate in a conversation.
  The replies should be short and concise.
  Format the output as a JSON object with a "suggestions" field containing an array of strings.
  `,
});

const smartReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'smartReplySuggestionsFlow',
    inputSchema: SmartReplySuggestionsInputSchema,
    outputSchema: SmartReplySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await smartReplySuggestionsPrompt(input);
    return output!;
  }
);
