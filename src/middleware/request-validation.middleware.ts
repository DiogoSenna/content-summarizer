import { corsHeaders } from './cors.middleware';
import { RequestValidationError } from '../errors/request-validation.error';

export class RequestValidationMiddleware {
	validateHttpMethod(request: Request): Response | null {
		if (request.method !== 'POST') {
			const error = new RequestValidationError(
				'Method not allowed',
				405,
				'METHOD_NOT_ALLOWED'
			);

			console.log(error);
			return error.toJsonResponse(corsHeaders);
		}

		return null;
	}

	validateUrlParam(url: string): Response | null {
		if (! url || ! URL.canParse(url)) {
			const error = new RequestValidationError(
				'Invalid or missing URL',
				400,
				'BAD_REQUEST',
			);

			console.log(error);
			return error.toJsonResponse();
		}

		return null;
	}

	validateStyleParam(style: unknown): Response | null {
		let error: RequestValidationError | null = null;

		if (typeof style !== 'string') {
			error = new RequestValidationError(
				`The style parameter must be a string`,
				422,
				'UNPROCESSABLE_ENTITY',
			);
		}

		if (typeof style === 'string' && ! (['concise', 'detailed', 'bullet-points'].includes(style))) {
			error = new RequestValidationError(
				"The chosen style is invalid. It must be one of the following values: 'concise', 'detailed', 'bullet-points'",
				422,
				'UNPROCESSABLE_ENTITY',
			);
		}

		if (error) {
			console.log(error);
			return error.toJsonResponse();
		}

		return null;
	}

	validateWordCountParam(wordCount: unknown) {
		if (typeof wordCount !== 'number' && ! Number.isInteger(wordCount)) {
			const error = new RequestValidationError(
				`The wordCount parameter must be an integer`,
				422,
				'UNPROCESSABLE_ENTITY',
			);

			console.log(error);
			return error.toJsonResponse();
		}

		return null;
	}
}
