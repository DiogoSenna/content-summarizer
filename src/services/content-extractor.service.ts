import * as cheerio from 'cheerio';
import { ContentExtractionError } from '../errors/content-extration.error';

export class ContentExtractorService {
	async execute(url: string): Promise<string|Response> {
		try {
			const html = await this.fetchHtml(url);
			const selectedContent = this.selectHtmlContent(html);

			return this.cleanSelectedContent(selectedContent);
		}
		catch (error: unknown) {
			return this.handleError(error);
		}
	}

	private async fetchHtml(url: string): Promise<string> {
		const response = await fetch(url);

		if (! response.ok) {
			throw new ContentExtractionError(response.statusText, response.status);
		}

		return response.text();
	}

	private selectHtmlContent(html: string) {
		const $ = cheerio.load(html);

		$('script').remove();
		$('style').remove();
		$('nav').remove();
		$('header').remove();
		$('footer').remove();
		$('iframe').remove();
		$('.ads').remove();
		$('#comments').remove();

		const contentSelectors = [
			'article',
			'[role="main"]',
			'.post-content',
			'.article-content',
			'.entry-content',
			'.content',
			'main',
			'#main-content'
		];

		let mainContent = '';

		for (const selector of contentSelectors) {
			const content = $(selector).text().trim();
			if (content.length > mainContent.length) {
				mainContent = content;
			}
		}

		if (!mainContent) {
			mainContent = $('body').text();
		}

		return mainContent;
	}

	private cleanSelectedContent(content: string): string {
		return content
			.replace(/\s+/g, ' ')
			.replace(/\n+/g, '\n')
			.trim()
			.replace(/&[a-z]+;/gi, ' ')
			.replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
			.replace(/\s+/g, ' ');
	}

	private handleError(error: unknown): Response {
		console.log(error);

		if (error instanceof ContentExtractionError) {
			return error.toJsonResponse();
		}

		if (error instanceof Error) {
			return new Response(error.message, {
				status: 500,
				statusText: 'Internal Server Error'
			});
		}

		return new Response('Sorry, something went wrong', {
			status: 500,
			statusText: 'Internal Server Error'
		});
	}
}
