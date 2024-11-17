/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { SummarizerRequest, SummarizerResponse } from './types';
import { handleMiddlewares } from './middleware';
import { ContentExtractorService } from './services/content-extractor.service';
import { ContentSummarizerService } from './services/content-summarizer.service';
import { getEnvVars, wordCount } from './utils';
import { validateUrl } from './middleware/validate-url.middleware';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const middlewares: Response | null = handleMiddlewares(request);
		if (middlewares) return middlewares;

		const { url, options }: SummarizerRequest = await request.json();

		const urlValidator: Response | null = validateUrl(url);
		if (urlValidator) return urlValidator;

		const content: string | Response = await (new ContentExtractorService).execute(url);
		if (typeof content !== 'string') return content;

		const { apiKey, model, tokenCoefficient, minTokenCount, temperatures } = getEnvVars(env);
		const summarizerService = new ContentSummarizerService(apiKey, {
			style: options.style,
			wordCount: options.wordCount,
			model,
			tokenCoefficient,
			minTokenCount,
			temperatures
		});
		const summary: string = await summarizerService.execute(content);

		const responseContent: SummarizerResponse = {
			summary,
			originalUrl: url,
			wordCount: wordCount(summary)
		};

		return new Response(JSON.stringify(responseContent), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
} satisfies ExportedHandler<Env>;
