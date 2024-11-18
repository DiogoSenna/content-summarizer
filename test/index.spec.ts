// test/index.spec.ts
import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { SummarizerRequest, SummarizerResponse } from '../src/types';

describe('Content Summarizer Worker POST Endpoint', () => {
	it('returns a summary for a valid request', async () => {
		const body: SummarizerRequest = {
			url: 'https://en.wikipedia.org/wiki/Bitcoin',
			options: {
				style: 'bullet-points',
				wordCount: 450,
			},
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(200);

		const responseBody: SummarizerResponse = await response.json();

		expect(responseBody).toHaveProperty('summary');
		expect(responseBody).toHaveProperty('originalUrl', body.url);
		expect(responseBody).toHaveProperty('wordCount');
		expect(typeof responseBody.summary).toBe('string');
	}, 15000);

	it('throws http method error when not a POST request', async () => {
		const response: Response = await SELF.fetch('http://localhost:8787/', {
			headers: {'Content-Type': 'application/json'}
		});

		expect(response.status).toBe(405);
	});

	it('fails returning a summary without a url', async () => {
		const body = {
			options: {
				style: 'bullet-points',
				wordCount: 450,
			}
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(400);
	});

	it('fails returning a summary with an invalid url', async () => {
		const body: SummarizerRequest = {
			url: 'https://en.wikipedia.org/wiki/Bitcoin32423dfsfsd',
			options: {
				style: 'bullet-points',
				wordCount: 450,
			},
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(404);
	});

	it('fails returning a summary with an invalid style', async () => {
		const body = {
			url: 'https://en.wikipedia.org/wiki/Bitcoin',
			options: {
				style: 'invalid',
				wordCount: 450,
			},
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(422);
	});

	it('fails returning a summary with an invalid style type', async () => {
		const body = {
			url: 'https://en.wikipedia.org/wiki/Bitcoin',
			options: {
				style: 123,
				wordCount: 450,
			},
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(422);
	});

	it('fails returning a summary with an invalid wordCount type', async () => {
		const body = {
			url: 'https://en.wikipedia.org/wiki/Bitcoin',
			options: {
				style: 123,
				wordCount: "450",
			},
		};

		const response: Response = await SELF.fetch('http://localhost:8787/', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});

		expect(response.status).toBe(422);
	});
});
