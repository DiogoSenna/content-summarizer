export function getEnvVars(env: Env) {
	return {
		apiKey: env.OPENAI_API_KEY,
		model: env.OPENAI_API_MODEL ?? 'chatgpt-4o-latest',
		tokenCoefficient: env.OPENAI_TOKEN_COEFFICIENT ?? 1.33,
		minTokenCount: {
			'concise': env.OPENAI_CONCISE_MIN_TOKEN_COUNT ?? 150,
			'bullet-points': env.OPENAI_BULLET_MIN_TOKEN_COUNT ?? 250,
			'detailed': env.OPENAI_DETAILED_MIN_TOKEN_COUNT ?? 300
		},
		temperatures: {
			'concise': env.OPENAI_CONCISE_TEMPERATURE ?? 0.3,
			'bullet-points': env.OPENAI_BULLET_TEMPERATURE ?? 0.4,
			'detailed': env.OPENAI_DETAILED_TEMPERATURE ?? 0.5
		}
	};
}
