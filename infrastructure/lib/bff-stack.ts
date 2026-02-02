import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';
import { BranchConfig } from './branch-config';

export interface BffStackProps extends cdk.StackProps {
  branchConfig: BranchConfig;
}

export class BffStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BffStackProps) {
    super(scope, id, props);

    const { branchConfig } = props;

    // Import all three backend service API URLs from CloudFormation exports (with branch awareness)
    const flightsExportName = `ChairliftFlightsApiUrl${branchConfig.exportSuffix}`;
    const customersExportName = `ChairliftCustomersApiUrl${branchConfig.exportSuffix}`;
    const bookingsExportName = `ChairliftBookingsApiUrl${branchConfig.exportSuffix}`;

    const flightsApiUrl = cdk.Fn.importValue(flightsExportName);
    const customersApiUrl = cdk.Fn.importValue(customersExportName);
    const bookingsApiUrl = cdk.Fn.importValue(bookingsExportName);

    // Lambda function configuration
    const lambdaEnvironment = {
      FLIGHTS_API_URL: flightsApiUrl,
      CUSTOMERS_API_URL: customersApiUrl,
      BOOKINGS_API_URL: bookingsApiUrl,
      LOG_LEVEL: 'info'
    };

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: lambdaEnvironment,
      logRetention: logs.RetentionDays.ONE_WEEK
    };

    // Flights passthrough handlers
    const searchFlightsFn = new lambda.Function(this, 'SearchFlightsFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-search-flights${branchConfig.stackSuffix}`,
      handler: 'handlers/search-flights.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const getFlightFn = new lambda.Function(this, 'GetFlightFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-get-flight${branchConfig.stackSuffix}`,
      handler: 'handlers/get-flight.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // Customers passthrough handlers
    const getCustomerFn = new lambda.Function(this, 'GetCustomerFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-get-customer${branchConfig.stackSuffix}`,
      handler: 'handlers/get-customer.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const updateCustomerFn = new lambda.Function(this, 'UpdateCustomerFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-update-customer${branchConfig.stackSuffix}`,
      handler: 'handlers/update-customer.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // Bookings passthrough handlers
    const createBookingFn = new lambda.Function(this, 'CreateBookingFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-create-booking${branchConfig.stackSuffix}`,
      handler: 'handlers/create-booking.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const listCustomerBookingsFn = new lambda.Function(this, 'ListCustomerBookingsFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-list-customer-bookings${branchConfig.stackSuffix}`,
      handler: 'handlers/list-customer-bookings.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // Aggregated endpoint handlers
    const getBookingDetailsFn = new lambda.Function(this, 'GetBookingDetailsFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-get-booking-details${branchConfig.stackSuffix}`,
      handler: 'handlers/get-booking-details.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const getCustomerDashboardFn = new lambda.Function(this, 'GetCustomerDashboardFunction', {
      ...lambdaProps,
      functionName: `chairlift-bff-get-customer-dashboard${branchConfig.stackSuffix}`,
      handler: 'handlers/get-customer-dashboard.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'BffApi', {
      restApiName: `Chairlift BFF API${branchConfig.stackSuffix}`,
      description: `Backend for Frontend API for Chairlift application (branch: ${branchConfig.branchName})`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ]
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true
      }
    });

    // API Resources
    const apiRoot = api.root.addResource('api');

    // Flights resources
    const flights = apiRoot.addResource('flights');
    const flightsSearch = flights.addResource('search');
    const flight = flights.addResource('{id}');

    // Customers resources
    const customers = apiRoot.addResource('customers');
    const customer = customers.addResource('{id}');
    const customerDashboard = customer.addResource('dashboard');

    // Bookings resources
    const bookings = apiRoot.addResource('bookings');
    const booking = bookings.addResource('{id}');
    const bookingDetails = booking.addResource('details');
    const bookingsCustomer = bookings.addResource('customer');
    const customerBookings = bookingsCustomer.addResource('{customerId}');

    // Flights API Methods
    flightsSearch.addMethod('GET', new apigateway.LambdaIntegration(searchFlightsFn));
    flight.addMethod('GET', new apigateway.LambdaIntegration(getFlightFn));

    // Customers API Methods
    customer.addMethod('GET', new apigateway.LambdaIntegration(getCustomerFn));
    customer.addMethod('PUT', new apigateway.LambdaIntegration(updateCustomerFn));
    customerDashboard.addMethod('GET', new apigateway.LambdaIntegration(getCustomerDashboardFn));

    // Bookings API Methods
    bookings.addMethod('POST', new apigateway.LambdaIntegration(createBookingFn));
    bookingDetails.addMethod('GET', new apigateway.LambdaIntegration(getBookingDetailsFn));
    customerBookings.addMethod('GET', new apigateway.LambdaIntegration(listCustomerBookingsFn));

    // Tag all resources with branch information
    cdk.Tags.of(this).add('Branch', branchConfig.branchName);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: `BFF API Gateway endpoint URL (branch: ${branchConfig.branchName})`,
      exportName: `ChairliftBFFApiUrl${branchConfig.exportSuffix}`
    });
  }
}
