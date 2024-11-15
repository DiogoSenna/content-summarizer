import OpenAI from "openai";

export class OpenAIService {
	private client: OpenAI;

	constructor(private readonly apiKey: string) {
		if (! apiKey) {
			throw new Error('OpenAI API key is required');
		}

		this.client = new OpenAI({ apiKey });
	}
}
