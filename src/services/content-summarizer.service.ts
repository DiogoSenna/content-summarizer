import OpenAI from 'openai';
import { SummaryOptions } from '../types';

export class ContentSummarizerService {
	private client: OpenAI;

	constructor(apiKey: string, private readonly options: SummaryOptions) {
		if (! apiKey) {
			throw new OpenAI.OpenAIError('OpenAI API key is required');
		}

		this.client = new OpenAI({ apiKey });
	}

	async execute(content: string): Promise<string> {
		try {
			const response = await this.client.chat.completions.create({
				model: this.options.model,
				messages: [
					{
						role: 'system',
						content: this.systemPrompt()
					},
					{
						role: 'user',
						content
					}
				],
				temperature: this.options.temperatures[this.options.style],
				max_tokens: this.calculateMaxTokens(),
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

	private systemPrompt(): string {
		const prompts = {
			'concise': 'Create a clear and concise summary',
			'bullet-points': 'Create a bullet-point summary with key points',
			'detailed': 'Create a comprehensive and detailed summary'
		};

		return `You are a content summarizer specialized in creating ${this.options.style} summaries.
			${prompts[this.options.style]} of approximately ${this.options.wordCount} words.
			Focus on the main ideas and key information.
			Maintain a professional and objective tone.`;
	}

	private calculateMaxTokens(): number {
		const baseTokens = Math.ceil((this.options.wordCount ?? 150) * this.options.tokenCoefficient);

		const tokensPerStyle = {
			'concise': Math.min(baseTokens, this.options.minTokenCount.concise),
			'bullet-points': Math.min(baseTokens + 50, this.options.minTokenCount['bullet-points']),
			'detailed': Math.min(baseTokens + 100, this.options.minTokenCount.detailed)
		}

		return tokensPerStyle[this.options.style];
	}
}
