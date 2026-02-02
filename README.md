# Chairlift BFF (Backend for Frontend)

Backend for Frontend service that aggregates data from multiple Chairlift microservices to provide optimized endpoints for the frontend application.

## Overview

The Chairlift BFF serves as an aggregation layer between the frontend and three backend microservices:

- **Flights Service** - Flight search and management
- **Customers Service** - Customer profile and loyalty management
- **Bookings Service** - Booking creation and management

The BFF provides both passthrough endpoints (direct proxying to backend services) and aggregated endpoints (combining data from multiple services).

## Architecture

```
Frontend → BFF → Flights Service
            ↓  → Customers Service
            ↓  → Bookings Service
```

### Key Features

- **Aggregation**: Combines data from multiple services in parallel using `Promise.all()`
- **Branch Awareness**: Supports feature branch deployments with isolated infrastructure
- **API Gateway**: Single API endpoint for the frontend
- **CloudFormation Integration**: Imports backend service URLs via CloudFormation exports

## API Endpoints

### Flights Endpoints (Passthrough)

- `GET /api/flights/search` - Search flights by origin, destination, and date
- `GET /api/flights/{id}` - Get flight details by ID

### Customers Endpoints (Passthrough)

- `GET /api/customers/{id}` - Get customer profile
- `PUT /api/customers/{id}` - Update customer profile

### Bookings Endpoints (Passthrough)

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/customer/{customerId}` - List all bookings for a customer

### Aggregated Endpoints

- `GET /api/bookings/{id}/details` - Get booking with flight and customer data
  - Fetches booking, flight, and customer in parallel
  - Returns enriched booking object with complete details

- `GET /api/customers/{id}/dashboard` - Get customer dashboard
  - Fetches customer profile and all their bookings
  - Enriches each booking with flight details
  - Returns complete customer dashboard view

## Project Structure

```
src/
├── clients/          # API clients for backend services
│   ├── flights-api.client.ts
│   ├── customers-api.client.ts
│   └── bookings-api.client.ts
├── services/         # Business logic and aggregation
│   └── aggregation.service.ts
├── handlers/         # Lambda function handlers
│   ├── search-flights.handler.ts
│   ├── get-flight.handler.ts
│   ├── get-customer.handler.ts
│   ├── update-customer.handler.ts
│   ├── create-booking.handler.ts
│   ├── list-customer-bookings.handler.ts
│   ├── get-booking-details.handler.ts
│   └── get-customer-dashboard.handler.ts
├── types/            # TypeScript type definitions
│   ├── flight.types.ts
│   ├── customer.types.ts
│   ├── booking.types.ts
│   └── aggregated.types.ts
└── utils/            # Shared utilities
    ├── logger.ts
    └── response.ts

infrastructure/
├── bin/
│   └── app.ts        # CDK app entry point
└── lib/
    ├── bff-stack.ts        # Stack definition
    └── branch-config.ts    # Branch detection logic
```

## Development

### Prerequisites

- Node.js 20.x
- AWS CDK CLI
- AWS credentials configured

### Installation

```bash
npm install
```

### Local Development

Set environment variables for backend service URLs:

```bash
export FLIGHTS_API_URL=http://localhost:3001
export CUSTOMERS_API_URL=http://localhost:3002
export BOOKINGS_API_URL=http://localhost:3003
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Building

```bash
# Compile TypeScript
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Branch-Aware Deployment

The BFF automatically detects the current branch and deploys isolated infrastructure:

- **Main branch**: Deploys as `ChairliftBFFStack` with exports `ChairliftBFFApiUrl`
- **Feature branches**: Deploys as `ChairliftBFFStack-feature-name` with exports `ChairliftBFFApiUrlFeatureName`

### CloudFormation Imports

The BFF imports backend service URLs using branch-aware logic:

```typescript
const flightsUrl = cdk.Fn.importValue(`ChairliftFlightsApiUrl${branchConfig.exportSuffix}`);
const customersUrl = cdk.Fn.importValue(`ChairliftCustomersApiUrl${branchConfig.exportSuffix}`);
const bookingsUrl = cdk.Fn.importValue(`ChairliftBookingsApiUrl${branchConfig.exportSuffix}`);
```

### Deploy to AWS

```bash
# Synthesize CloudFormation template
npm run cdk:synth

# Deploy stack
npm run cdk:deploy

# Destroy stack
npm run cdk:destroy
```

## Aggregation Patterns

### Parallel API Calls

The BFF uses `Promise.all()` to fetch data from multiple services in parallel:

```typescript
// Fetch flight and customer in parallel
const [flight, customer] = await Promise.all([
  this.flightsClient.getFlight(booking.flightId),
  this.customersClient.getCustomer(booking.customerId)
]);
```

### Error Handling

All handlers include comprehensive error handling and logging:

```typescript
try {
  const result = await service.getData(id);
  return createSuccessResponse(result);
} catch (error) {
  logger.error('Error fetching data', { error });
  return createErrorResponse(error.message, 500);
}
```

## Environment Variables

- `FLIGHTS_API_URL` - Flights service API endpoint (set via CloudFormation)
- `CUSTOMERS_API_URL` - Customers service API endpoint (set via CloudFormation)
- `BOOKINGS_API_URL` - Bookings service API endpoint (set via CloudFormation)
- `LOG_LEVEL` - Logging level (default: `info`)

## CI/CD

GitHub Actions automatically:

1. Runs tests on pull requests
2. Deploys feature branches to isolated infrastructure
3. Deploys main branch to production
4. Cleans up infrastructure when feature branches are deleted

## Dependencies

The BFF depends on three backend services:

1. **Flights Service** - Must be deployed first
2. **Customers Service** - Must be deployed second
3. **Bookings Service** - Must be deployed third (depends on Flights and Customers)

The BFF must be deployed after all three backend services.

## License

MIT
