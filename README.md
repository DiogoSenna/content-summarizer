# Content Summarizer Service

A Cloudflare Worker that generates summaries of web content using OpenAI's GPT API.

## Features

- URL content extraction
- Customizable summary generation using OpenAI's GPT API
- Configurable summary length and style
- CORS support
- Error handling for invalid URLs and API failures

## Prerequisites

- Node.js (v18 or later)
- Cloudflare account
- OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone git@github.com:DiogoSenna/content-summarizer.git
cd content-summarizer
```

2. Install dependencies:

```bash
npm install
```

## Configuration

The summarizer service can be configured through the `wrangler.toml` file. The following values represent the default configuration. If not explicitly defined, these defaults will be used:

```toml
[vars]
# OpenAI model to use for summarization
OPENAI_API_MODEL = "chatgpt-4o-latest"

# Token adjustment coefficient for summary length
OPENAI_TOKEN_COEFFICIENT = 1.33

# Minimum token counts for different summary styles
OPENAI_CONCISE_MIN_TOKEN_COUNT = 150
OPENAI_BULLET_MIN_TOKEN_COUNT = 250
OPENAI_DETAILED_MIN_TOKEN_COUNT = 300

# Maximum token count for input content
OPENAI_MAX_TOKEN_COUNT = 3000

# Temperature settings for different summary styles
OPENAI_CONCISE_TEMPERATURE = 0.3    # More focused and precise
OPENAI_BULLET_TEMPERATURE = 0.5     # Balanced creativity
OPENAI_DETAILED_TEMPERATURE = 0.7   # More creative and varied
```

These variables control the behavior of the summarization service. Adjust them according to your needs before deployment.

## Development Environment

1. Create a `.dev.vars` file in the project root with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

2. Run the worker locally:

```bash
npm run dev
```

The development server will start at `http://localhost:8787/`. You can test your local worker using curl or any API testing tool:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "options": {
      "style": "bullet-points"
    }
  }'
```

## Production Deployment

1. Configure the OpenAI API key as a secret in your Cloudflare worker:

```bash
npx wrangler secret put OPENAI_API_KEY
```
Enter your OpenAI API key when prompted. This step is required only for production deployment.

2. Deploy to Cloudflare:
```bash
npm run deploy
```

## Usage

Send a POST request to your worker's URL:

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "options": {
      "wordCount": 150,
      "style": "concise"
    }
  }'
```

### Request Format

```typescript
{
	url: string;          // The URL to summarize
	options: {
		wordCount?: number; // Target summary length
		style?: string;     // Summary style: 'concise', 'detailed', or 'bullet-points' (default: 'concise')
	}
}
```

### Response Format

```typescript
{
	summary: string;     // Generated summary
	originalUrl: string; // Input URL
	wordCount: number;   // Actual summary word count
}
```

## Error Handling

The service returns appropriate error responses for:
- Invalid URLs
- Failed content extraction
- OpenAI API errors
- Invalid request formats

Error responses follow a consistent JSON format with the following structure:

```typescript
{
  name: string;      // Error type identifier
  message: string;   // Detailed error description
  statusCode?: number; // HTTP status code (when applicable)
  code?: string;     // Error code identifier (when applicable)
  timestamp: string; // ISO timestamp of when the error occurred
  stack?: string;    // Stack trace (included in development)
}
```

### Error Examples

#### Validation Error
```json
{
  "name": "RequestValidationError",
  "message": "The chosen style is invalid. It must be one of the following values: 'concise', 'detailed', 'bullet-points'",
  "statusCode": 422,
  "code": "UNPROCESSABLE_ENTITY",
  "timestamp": "2024-11-18T04:47:54.628Z",
  "stack": "RequestValidationError: The chosen style is invalid. It must be one of the following values: 'concise', 'detailed', 'bullet-points'\n    at RequestValidationMiddleware.validateStyleParam (index.js:1375:16)\n    at validateRequestParams (index.js:1420:35)\n    at Object.fetch (index.js:21742:36)"
}
```

#### API Error
```json
{
  "name": "OpenaiApiError",
  "message": "429 You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.",
  "timestamp": "2024-11-18T04:48:48.687Z",
  "stack": "OpenaiApiError: 429 You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.\n    at ContentSummarizerService.execute (index.js:21700:23)\n    at async Object.fetch (index.js:21757:21)"
}
```

Note: The `stack` trace is included to help with debugging but may be omitted in production environments.

## Testing

To run tests:
```bash
npm run test
```

## License

MIT
