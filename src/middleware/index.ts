import { handleCors } from './cors.middleware';
import { validateRequest } from './validate-request.middleware';

export function handleMiddlewares(request: Request) {
	const middlewares = [
		handleCors,
		validateRequest
	];

	for (const middleware of middlewares) {
		const result = middleware(request)
		if (result)
			return result;
	}

	return null;
}
