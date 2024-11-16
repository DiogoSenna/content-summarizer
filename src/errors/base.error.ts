export class BaseError extends Error {
	public readonly timestamp: Date;

	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly code?: string,
		public readonly details?: Record<string, unknown>,
	) {
		super(message);
		this.name = this.constructor.name;
		this.timestamp = new Date();

		Error.captureStackTrace(this, this.constructor);
	}

	toJson(): string {
		return JSON.stringify({
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			code: this.code,
			details: this.details,
			timestamp: this.timestamp,
			stack: this.stack,
		});
	}

	toJsonResponse(): Response {
		return new Response(this.toJson(), {
			status: this.statusCode ?? 500,
			headers: {
				'Content-Type': 'application/json',
			}
		});
	}
}
