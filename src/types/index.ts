import OpenAI from 'openai';

export interface RequestOptions {
	style: 'concise' | 'detailed' | 'bullet-points';
	wordCount?: number;
	model?: string | OpenAI.Chat.ChatModel;
}

export interface ChatOptions {
	tokenCoefficient: number;
	temperatures: {[key in RequestOptions['style']]: number};
	minTokenCount: {[key in RequestOptions['style']]: number};
	model: string | OpenAI.Chat.ChatModel;
}

export type SummarizerOptions = RequestOptions & ChatOptions;

export interface SummarizerRequest {
	url: string;
	options: RequestOptions;
}

export interface SummarizerResponse {
	summary: string;
	originalUrl: string;
	wordCount: number;
}
