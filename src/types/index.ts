import OpenAI from 'openai';

export interface SummaryOptions {
	wordCount?: number;
	style?: 'concise' | 'detailed' | 'bullet-points';
	model?: string | OpenAI.Chat.ChatModel;
}

export interface SummaryResponse {
	summary: string;
	originalUrl: string;
	wordCount: number;
}
