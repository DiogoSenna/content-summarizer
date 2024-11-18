import { handleCors } from './cors.middleware';
import { RequestValidationMiddleware } from './request-validation.middleware';
import { SummarizerRequest } from '../types';

export function handleMiddlewares(request: Request): Response | null {
	const middlewares = [
		handleCors,
		(new RequestValidationMiddleware).validateHttpMethod
	];

	for (const middleware of middlewares) {
		const result: Response | null = middleware(request)
		if (result)
			return result;
	}

	return null;
}

export function validateRequestParams(body: SummarizerRequest): Response | null {
	const service = new RequestValidationMiddleware();
	const validators: (Response | null)[] = [
		service.validateUrlParam(body.url),
		body.options?.style ? service.validateStyleParam(body.options.style) : null,
		body.options?.wordCount ? service.validateWordCountParam(body.options.wordCount): null
	];

	for (const validator of validators) {
		if (validator)
			return validator;
	}

	return null;
}
