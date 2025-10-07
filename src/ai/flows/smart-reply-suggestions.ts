'use server';
/**
 * @fileOverview A flow for generating smart reply suggestions in a chat application.
 *
 * - suggestReplies - A function that generates smart replies based on conversation history.
 * - SmartReplyInput - The input type for the suggestReplies function.
 * - SmartReplyOutput - The return type for the suggestReplies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  text: z.string(),
  isFromCurrentUser: z.boolean(),
});

export const SmartReplyInputSchema = z.object({
  history: z.array(MessageSchema),
});
export type SmartReplyInput = z.infer<typeof SmartReplyInputSchema>;

export const SmartReplyOutputSchema = z.object({
  suggestions: z.array(z.string()),
});
export type SmartReplyOutput = z.infer<typeof SmartReplyOutputSchema>;

export async function suggestReplies(input: SmartReplyInput): Promise<SmartReplyOutput> {
  return smartReplyFlow(input);
}

const smartReplyPrompt = ai.definePrompt({
  name: 'smartReplyPrompt',
  input: { schema: SmartReplyInputSchema },
  output: { schema: SmartReplyOutputSchema },
  prompt: `
    You are an AI assistant integrated into a chat application. Your task is to generate three concise, relevant, and natural-sounding smart replies for the current user based on the last few messages of a conversation.

    - The conversation history is provided with messages marked as from the "current user" or the "other user".
    - Your suggestions should be from the perspective of the "current user".
    - The replies should be short, like what you'd see in a messaging app (e.g., "Sounds good!", "I'm not sure", "😂").
    - Do not suggest replies that are questions.
    - Do not include any emojis unless it is the only content of the suggestion.
    - Provide exactly three suggestions.

    Conversation History:
    {{#each history}}
      {{#if this.isFromCurrentUser}}
        You: {{{this.text}}}
      {{else}}
        Other: {{{this.text}}}
      {{/if}}
    {{/each}}

    Generate three smart replies for "You":
  `,
});

const smartReplyFlow = ai.defineFlow(
  {
    name: 'smartReplyFlow',
    inputSchema: SmartReplyInputSchema,
    outputSchema: SmartReplyOutputSchema,
  },
  async (input) => {
    const { output } = await smartReplyPrompt(input);
    return output!;
  }
);
