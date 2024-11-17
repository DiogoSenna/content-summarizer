import { corsHeaders } from './cors.middleware';
import { RequestValidationError } from '../errors/request-validation.error';

export function validateRequest(request: Request): Response | null {
	if (request.method !== 'POST') {
		const error = new RequestValidationError(
			'Method not allowed',
			405,
			'METHOD_NOT_ALLOWED'
		);

		console.error(error);
		return error.toJsonResponse(corsHeaders)
	}

	return null;
}
