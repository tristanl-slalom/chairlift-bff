# Concepto Backend for Frontend (BFF)

Backend for Frontend service that provides a simplified API layer between the React frontend and the Tasks microservice.

## Architecture

- **Runtime**: Node.js 20 with TypeScript
- **API**: AWS Lambda + API Gateway (REST)
- **Infrastructure**: AWS CDK
- **CI/CD**: GitHub Actions with OIDC authentication
- **Upstream**: Concepto Tasks Microservice

## Purpose

The BFF serves as an adapter layer that:
- Aggregates and transforms data from microservices for frontend consumption
- Provides frontend-specific endpoints
- Handles error transformation
- Adds logging and monitoring
- Enables future expansion without affecting frontend

## API Endpoints

All endpoints are prefixed with `/api`.

### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title (1-200 chars)",
  "description": "Task description (max 2000 chars)",
  "status": "TODO" | "IN_PROGRESS" | "DONE" (optional)
}

Response: 201 Created
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "TODO",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### List Tasks
```
GET /api/tasks?status=TODO|IN_PROGRESS|DONE

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "TODO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Task
```
GET /api/tasks/{id}

Response: 200 OK / 404 Not Found
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "TODO",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Task
```
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "status": "IN_PROGRESS" (optional)
}

Response: 200 OK / 404 Not Found
{
  "id": "uuid",
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Task
```
DELETE /api/tasks/{id}

Response: 200 OK / 404 Not Found
{
  "message": "Task deleted successfully"
}
```

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- AWS CLI configured (for deployment)
- AWS CDK CLI (`npm install -g aws-cdk`)
- Tasks microservice deployed (for integration)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export TASKS_API_URL=https://your-tasks-api-url.amazonaws.com/prod
```

3. Run tests:
```bash
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

4. Lint code:
```bash
npm run lint
npm run lint:fix
```

5. Build:
```bash
npm run build
```

## Deployment

### Prerequisites

1. AWS OIDC setup completed (see main project README)
2. Tasks microservice deployed (BFF depends on exported stack value)
3. GitHub repository secrets configured:
   - `AWS_ROLE_ARN`
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`

### Manual Deployment

```bash
# Build the project
npm run build

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy (requires Tasks microservice deployed first)
cdk deploy

# View outputs
aws cloudformation describe-stacks \
  --stack-name ConceptoBffStack \
  --query 'Stacks[0].Outputs'
```

### CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs on PRs and pushes to main
  - Linting
  - Type checking
  - Tests
  - Build verification

- **CD Pipeline** (`.github/workflows/cd.yml`): Runs on pushes to main
  - Builds the application
  - Deploys to AWS using CDK
  - Outputs API URL

## Project Structure

```
concepto-bff/
├── src/
│   ├── handlers/           # Lambda function handlers
│   │   └── tasks.handler.ts
│   ├── services/           # Business logic layer
│   │   └── tasks.service.ts
│   ├── clients/            # API clients
│   │   └── tasks-api.client.ts
│   ├── types/              # TypeScript types
│   │   └── task.types.ts
│   └── utils/              # Utilities
│       ├── logger.ts
│       └── response.ts
├── infrastructure/         # AWS CDK code
│   ├── bin/
│   │   └── app.ts
│   └── lib/
│       └── bff-stack.ts
├── .github/
│   └── workflows/         # CI/CD pipelines
│       ├── ci.yml
│       └── cd.yml
├── package.json
├── tsconfig.json
├── jest.config.js
└── cdk.json
```

## Environment Variables

- `TASKS_API_URL`: URL of the Tasks microservice API (required)
- `LOG_LEVEL`: Logging level (default: `info`)
- `AWS_REGION`: AWS region (default: `us-west-2`)

## Error Handling

The BFF translates errors from the Tasks API into appropriate HTTP responses:
- 400: Bad request (validation errors)
- 404: Resource not found
- 500: Internal server error

All errors are logged with context for debugging.

## Testing

Tests use Jest with TypeScript support:
- Unit tests for handlers and services
- Mocked API client for isolated testing
- Coverage thresholds enforced

## Related Repositories

- [concepto-be-tasks](https://github.com/tristanl-slalom/concepto-be-tasks) - Tasks Microservice
- [concepto-fe](https://github.com/tristanl-slalom/concepto-fe) - React Frontend
- [concepto-meta](https://github.com/tristanl-slalom/concepto-meta) - Meta repository with documentation

## License

MIT
