import { UrlValidationError } from '../errors/url-validation.error';

export function validateUrl(url: string): Response | null {
	if (! url || ! URL.canParse(url)) {
		const error = new UrlValidationError(
			'Bad Request',
			400,
			'INVALID_URL',
		);

		console.error(error);
		return error.toJsonResponse();
	}

	return null;
}
