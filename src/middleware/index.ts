import { handleCors } from './cors.middleware';
import { RequestValidationMiddleware } from './request-validation.middleware';
import { SummarizerRequest } from '../types';

export function handleMiddlewares(request: Request) {
	const middlewares = [
		handleCors,
		(new RequestValidationMiddleware).validateHttpMethod
	];

	for (const middleware of middlewares) {
		const result = middleware(request)
		if (result)
			return result;
	}

	return null;
}

export function validateRequestParams(body: SummarizerRequest) {
	const service = new RequestValidationMiddleware();
	const validators = [
		service.validateUrlParam(body.url),
		service.validateStyleParam(body.options.style),
		service.validateWordCountParam(body.options.wordCount)
	];

	for (const validator of validators) {
		if (validator)
			return validator;
	}

	return null;
}
