import OpenAI from 'openai';
import { SummaryOptions } from '../types';

export class OpenAIService {
	private client: OpenAI;

	constructor(private readonly apiKey: string) {
		if (! apiKey) {
			throw new Error('OpenAI API key is required');
		}

		this.client = new OpenAI({ apiKey });
	}

	async summarize(content: string, options: SummaryOptions): Promise<string> {
		try {
			const response = await this.client.chat.completions.create({
				model: options.model ?? 'chatgpt-4o-latest',
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
				temperature: this.messageTemperature(options.style),
				max_tokens: this.calculateMaxTokens(options.style, options.wordCount),
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

	private messageTemperature(style: SummaryOptions['style'] = 'concise'): number {
		const options = {
			'concise': 0.3,
			'bullet-points': 0.4,
			'detailed': 0.5
		};

		return options[style];
	}

	private calculateMaxTokens(style: SummaryOptions['style'] = 'concise', wordCount: SummaryOptions['wordCount'] = 150): number {
		const baseTokens = Math.ceil(wordCount * 1.33);

		const tokensPerStyle = {
			'concise': Math.min(baseTokens, 150),
			'bullet-points': Math.min(baseTokens + 50, 250),
			'detailed': Math.min(baseTokens + 100, 300)
		}

		return tokensPerStyle[style];
	}
}
