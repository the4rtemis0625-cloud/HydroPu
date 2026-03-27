'use server';
/**
 * @fileOverview An AI agent that provides growth optimization recommendations for hydroponics systems.
 *
 * - aiGrowthOptimizationRecommendation - A function that handles the generation of recommendations.
 * - AIGrowthOptimizationRecommendationInput - The input type for the aiGrowthOptimizationRecommendation function.
 * - AIGrowthOptimizationRecommendationOutput - The return type for the aiGrowthOptimizationRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGrowthOptimizationRecommendationInputSchema = z.object({
  cropType: z
    .string()
    .describe('The type of crop being grown in the hydroponics system (e.g., "Lettuce", "Tomatoes").'),
  currentReadings: z
    .object({
      pH: z.number().describe('Current pH value of the nutrient solution.'),
      waterTemperature: z.number().describe('Current water temperature in Celsius.'),
      airTemperature: z.number().describe('Current air temperature in Celsius.'),
      humidity: z.number().describe('Current air humidity as a percentage.'),
      ecTds: z.number().describe('Current Electrical Conductivity (EC) or Total Dissolved Solids (TDS) reading of the nutrient solution.'),
    })
    .describe('Current sensor readings from the hydroponics system.'),
  historicalDataSummary: z
    .string()
    .describe('A summary of historical sensor data trends, including notable changes or patterns over time.'),
});
export type AIGrowthOptimizationRecommendationInput = z.infer<
  typeof AIGrowthOptimizationRecommendationInputSchema
>;

const AIGrowthOptimizationRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of tailored recommendations for adjusting environmental parameters to optimize plant growth.'),
  summary: z
    .string()
    .describe('A general summary of the current hydroponics system state and overall guidance.'),
});
export type AIGrowthOptimizationRecommendationOutput = z.infer<
  typeof AIGrowthOptimizationRecommendationOutputSchema
>;

export async function aiGrowthOptimizationRecommendation(
  input: AIGrowthOptimizationRecommendationInput
): Promise<AIGrowthOptimizationRecommendationOutput> {
  return aiGrowthOptimizationRecommendationFlow(input);
}

const aiGrowthOptimizationRecommendationPrompt = ai.definePrompt({
  name: 'aiGrowthOptimizationRecommendationPrompt',
  input: {schema: AIGrowthOptimizationRecommendationInputSchema},
  output: {schema: AIGrowthOptimizationRecommendationOutputSchema},
  prompt: `You are an expert AI hydroponics assistant. Your task is to analyze the provided sensor data for a hydroponics system and offer tailored recommendations to optimize plant growth and yield for the specified crop type.

Here is the information:

Crop Type: {{{cropType}}}

Current Sensor Readings:
- pH: {{{currentReadings.pH}}}
- Water Temperature: {{{currentReadings.waterTemperature}}} °C
- Air Temperature: {{{currentReadings.airTemperature}}} °C
- Humidity: {{{currentReadings.humidity}}} %
- EC/TDS: {{{currentReadings.ecTds}}}

Historical Data Summary:
{{{historicalDataSummary}}}

Based on this data, provide specific, actionable recommendations for adjusting environmental parameters to optimize plant growth for the "{{{cropType}}}" crop. Also, include a general summary of the current system's status and overarching guidance.
`,
});

const aiGrowthOptimizationRecommendationFlow = ai.defineFlow(
  {
    name: 'aiGrowthOptimizationRecommendationFlow',
    inputSchema: AIGrowthOptimizationRecommendationInputSchema,
    outputSchema: AIGrowthOptimizationRecommendationOutputSchema,
  },
  async input => {
    const {output} = await aiGrowthOptimizationRecommendationPrompt(input);
    return output!;
  }
);
