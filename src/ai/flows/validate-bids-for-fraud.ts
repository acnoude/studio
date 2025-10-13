'use server';
/**
 * @fileOverview Validates bids for potential fraud using GenAI.
 *
 * - validateBidForFraud - A function that validates a bid for fraud.
 * - ValidateBidForFraudInput - The input type for the validateBidForFraud function.
 * - ValidateBidForFraudOutput - The return type for the validateBidForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateBidForFraudInputSchema = z.object({
  bidAmount: z.number().describe('The amount of the bid.'),
  userEmail: z.string().email().describe('The email address of the user placing the bid.'),
  userName: z.string().describe('The name of the user placing the bid.'),
  itemDescription: z.string().describe('The description of the item being bid on.'),
  currentBid: z.number().describe('The current highest bid on the item.'),
});
export type ValidateBidForFraudInput = z.infer<typeof ValidateBidForFraudInputSchema>;

const ValidateBidForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether or not the bid is potentially fraudulent.'),
  reason: z.string().optional().describe('The reason why the bid is considered potentially fraudulent.'),
});
export type ValidateBidForFraudOutput = z.infer<typeof ValidateBidForFraudOutputSchema>;

export async function validateBidForFraud(input: ValidateBidForFraudInput): Promise<ValidateBidForFraudOutput> {
  return validateBidForFraudFlow(input);
}

const validateBidForFraudPrompt = ai.definePrompt({
  name: 'validateBidForFraudPrompt',
  input: {schema: ValidateBidForFraudInputSchema},
  output: {schema: ValidateBidForFraudOutputSchema},
  prompt: `You are an AI assistant that specializes in detecting fraudulent bids in online auctions.
  Analyze the following bid information and determine if the bid is potentially fraudulent.
  Consider factors such as unusually high bid amounts, suspicious user behavior, and inconsistencies in the provided information.

  Bid Amount: {{bidAmount}}
  User Email: {{userEmail}}
  User Name: {{userName}}
  Item Description: {{itemDescription}}
  Current Bid: {{currentBid}}

  Respond with JSON. If the bid is fraudulent, explain the reason why.
  `,
});

const validateBidForFraudFlow = ai.defineFlow(
  {
    name: 'validateBidForFraudFlow',
    inputSchema: ValidateBidForFraudInputSchema,
    outputSchema: ValidateBidForFraudOutputSchema,
  },
  async input => {
    const {output} = await validateBidForFraudPrompt(input);
    return output!;
  }
);
