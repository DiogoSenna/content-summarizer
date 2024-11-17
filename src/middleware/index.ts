import { handleCors } from './cors.middleware';
import { validateRequest } from './validate-request.middleware';
import { validateUrl } from './validate-url.middleware';
import { SummarizerRequest } from '../types';

export async function handleMiddleware(request: Request): Promise<Response|null> {
	const corsMiddleware = handleCors(request);
	if (corsMiddleware)
		return corsMiddleware;

	const requestMiddleware = validateRequest(request);
	if (requestMiddleware)
		return requestMiddleware;

	const { url }: SummarizerRequest = await request.json();

	const urlMiddleware = validateUrl(url);
	if (urlMiddleware)
		return urlMiddleware;

	return null;
}
