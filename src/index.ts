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
import { handleMiddlewares, validateRequestParams } from './middleware';
import { ContentExtractorService } from './services/content-extractor.service';
import { ContentSummarizerService } from './services/content-summarizer.service';
import { getEnvVars, wordCount } from './utils';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const middlewares: Response | null = handleMiddlewares(request);
		if (middlewares) return middlewares;

		const { url, options }: SummarizerRequest = await request.json();

		const requestParamsValidator: Response | null = validateRequestParams({ url, options });
		if (requestParamsValidator) return requestParamsValidator;

		const content: string | Response = await (new ContentExtractorService).execute(url);
		if (typeof content !== 'string') return content;

		const { apiKey, model, tokenCoefficient, minTokenCount, maxTokenCount, temperatures } = getEnvVars(env);
		const summarizerService = new ContentSummarizerService(apiKey, {
			style: options.style,
			wordCount: options.wordCount,
			model,
			tokenCoefficient,
			minTokenCount,
			maxTokenCount,
			temperatures
		});
		const summary: string | Response = await summarizerService.execute(content);
		if (summary instanceof Response) return summary;

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
