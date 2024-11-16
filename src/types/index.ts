import OpenAI from 'openai';

export interface SummaryOptions {
	style: 'concise' | 'detailed' | 'bullet-points';
	wordCount?: number;
	model: string | OpenAI.Chat.ChatModel;
	tokenCoefficient: number;
	temperatures: {[key in SummaryOptions['style']]: number};
	minTokenCount: {[key in SummaryOptions['style']]: number};
}

export interface SummaryRequest {
	url: string;
	options: SummaryOptions;
}

export interface SummaryResponse {
	summary: string;
	originalUrl: string;
	wordCount: number;
}
