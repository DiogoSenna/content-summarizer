import OpenAI from 'openai';
import { SummarizerOptions } from '../types';
import { TokenCalculatorService } from './token-calculator.service';

export class ContentSummarizerService {
	private client: OpenAI;

	constructor(apiKey: string, private options: SummarizerOptions) {
		if (! apiKey) {
			const error = new OpenAI.OpenAIError('OpenAI API key is required');
			console.log(error);
			throw error;
		}

		this.options.style = options.style ?? 'concise';

		this.client = new OpenAI({ apiKey });
	}

	async execute(content: string): Promise<string> {
		try {
			const max_tokens: number = await this.calculateMaxTokens(content);
			const wordCount: number = Math.ceil(max_tokens / this.options.tokenCoefficient);

			const response = await this.client.chat.completions.create({
				model: this.options.model,
				messages: [
					{
						role: 'system',
						content: this.systemPrompt(wordCount)
					},
					{
						role: 'user',
						content
					}
				],
				temperature: this.options.temperatures[this.options.style],
				max_tokens,
			});

			return response.choices[0].message.content?.trim() ?? '';
		}
		catch (error) {
			console.log(error);

			if (error instanceof OpenAI.APIError) {
				throw new OpenAI.APIError(error.status, error, error.message, error.headers);
			}

			if (error instanceof Error) {
				throw new OpenAI.OpenAIError(`Failed to generate summary: ${error.message}`);
			}

			throw new OpenAI.OpenAIError('Failed to generate summary due to an unknown error.');
		}
	}

	private systemPrompt(wordCount?: number): string {
		const prompts = {
			'concise': 'Create a clear and concise summary',
			'bullet-points': 'Create a bullet-point summary with key points',
			'detailed': 'Create a comprehensive and detailed summary'
		};

		return `You are a content summarizer specialized in creating ${this.options.style} summaries.
			${prompts[this.options.style]} of approximately ${this.options.wordCount ?? wordCount} words.
			Focus on the main ideas and key information.
			Maintain a professional and objective tone.`;
	}

	private async calculateMaxTokens(content: string): Promise<number> {
		const contentTokens: number = this.options.wordCount
			? Math.ceil(this.options.wordCount * this.options.tokenCoefficient)
			: await (new TokenCalculatorService).execute(content);

		const minTokens = {
			'concise': Math.max(contentTokens * 0.3, this.options.minTokenCount.concise),
			'bullet-points': Math.max(contentTokens * 0.5, this.options.minTokenCount['bullet-points']),
			'detailed': Math.max(contentTokens * 0.7, this.options.minTokenCount.detailed)
		};

		const tokensPerStyle = {
			'concise': Math.max(contentTokens, minTokens.concise),
			'bullet-points': Math.max(contentTokens, minTokens['bullet-points']),
			'detailed': Math.max(contentTokens, minTokens.detailed)
		}

		return Math.min(tokensPerStyle[this.options.style], 3000);
	}
}
