import OpenAI from 'openai';
import { SummaryOptions } from '../types';

export class OpenAIService {
	private client: OpenAI;

	constructor(private readonly apiKey: string) {
		if (! apiKey) {
			throw new OpenAI.OpenAIError('OpenAI API key is required');
		}

		this.client = new OpenAI({ apiKey });
	}

	async summarize(content: string, options: SummaryOptions): Promise<string> {
		try {
			const response = await this.client.chat.completions.create({
				model: options.model,
				messages: [
					{
						role: 'system',
						content: this.systemPrompt(options.style, options.wordCount)
					},
					{
						role: 'user',
						content
					}
				],
				temperature: options.temperatures[options.style],
				max_tokens: this.calculateMaxTokens(options.style, options.wordCount, options.minTokenCount),
			});

			return response.choices[0].message.content?.trim() ?? '';
		}
		catch (error) {
			if (error instanceof OpenAI.APIError) {
				throw new OpenAI.APIError(error.status, error, error.message, error.headers);
			}

			if (error instanceof Error) {
				throw new OpenAI.OpenAIError(`Failed to generate summary: ${error.message}`);
			}

			throw new OpenAI.OpenAIError('Failed to generate summary due to an unknown error.');
		}
	}

	private systemPrompt(style: SummaryOptions['style'] = 'concise', wordCount: SummaryOptions['wordCount'] = 150): string {
		const prompts = {
			'concise': 'Create a clear and concise summary',
			'bullet-points': 'Create a bullet-point summary with key points',
			'detailed': 'Create a comprehensive and detailed summary'
		};

		return `You are a content summarizer specialized in creating ${style} summaries.
			${prompts[style]} of approximately ${wordCount} words.
			Focus on the main ideas and key information.
			Maintain a professional and objective tone.`;
	}

	private calculateMaxTokens(
		style: SummaryOptions['style'],
		wordCount: SummaryOptions['wordCount'],
		minTokenCount: SummaryOptions['minTokenCount']
	): number {
		const baseTokens = Math.ceil((wordCount ?? 150) * 1.33);

		const tokensPerStyle = {
			'concise': Math.min(baseTokens, minTokenCount.concise),
			'bullet-points': Math.min(baseTokens + 50, minTokenCount['bullet-points']),
			'detailed': Math.min(baseTokens + 100, minTokenCount.detailed)
		}

		return tokensPerStyle[style];
	}
}
