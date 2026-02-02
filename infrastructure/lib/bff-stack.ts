import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class BffStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import Tasks API URL from exports
    const tasksApiUrl = cdk.Fn.importValue('ConceptoTasksApiUrl');

    // Lambda function configuration
    const lambdaEnvironment = {
      TASKS_API_URL: tasksApiUrl,
      LOG_LEVEL: 'info'
    };

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: lambdaEnvironment,
      logRetention: logs.RetentionDays.ONE_WEEK
    };

    // Lambda Functions
    const createTaskFn = new lambda.Function(this, 'CreateTaskFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-create-task',
      handler: 'handlers/create-task.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const getTaskFn = new lambda.Function(this, 'GetTaskFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-get-task',
      handler: 'handlers/get-task.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const listTasksFn = new lambda.Function(this, 'ListTasksFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-list-tasks',
      handler: 'handlers/list-tasks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const updateTaskFn = new lambda.Function(this, 'UpdateTaskFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-update-task',
      handler: 'handlers/update-task.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const deleteTaskFn = new lambda.Function(this, 'DeleteTaskFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-delete-task',
      handler: 'handlers/delete-task.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // Status Config Lambda Functions
    const createStatusFn = new lambda.Function(this, 'CreateStatusFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-create-status',
      handler: 'handlers/status-config.createStatus',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const getStatusFn = new lambda.Function(this, 'GetStatusFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-get-status',
      handler: 'handlers/status-config.getStatus',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const listStatusesFn = new lambda.Function(this, 'ListStatusesFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-list-statuses',
      handler: 'handlers/status-config.listStatuses',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const updateStatusFn = new lambda.Function(this, 'UpdateStatusFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-update-status',
      handler: 'handlers/status-config.updateStatus',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const deleteStatusFn = new lambda.Function(this, 'DeleteStatusFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-delete-status',
      handler: 'handlers/status-config.deleteStatus',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    const reorderStatusesFn = new lambda.Function(this, 'ReorderStatusesFunction', {
      ...lambdaProps,
      functionName: 'concepto-bff-reorder-statuses',
      handler: 'handlers/status-config.reorderStatuses',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-dist'))
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'BffApi', {
      restApiName: 'Concepto BFF API',
      description: 'Backend for Frontend API for Concepto application',
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
    const tasks = apiRoot.addResource('tasks');
    const task = tasks.addResource('{id}');
    const statuses = apiRoot.addResource('statuses');
    const status = statuses.addResource('{statusKey}');
    const reorder = statuses.addResource('reorder');

    // Task API Methods
    tasks.addMethod('POST', new apigateway.LambdaIntegration(createTaskFn));
    tasks.addMethod('GET', new apigateway.LambdaIntegration(listTasksFn));
    task.addMethod('GET', new apigateway.LambdaIntegration(getTaskFn));
    task.addMethod('PUT', new apigateway.LambdaIntegration(updateTaskFn));
    task.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskFn));

    // Status Config API Methods
    statuses.addMethod('POST', new apigateway.LambdaIntegration(createStatusFn));
    statuses.addMethod('GET', new apigateway.LambdaIntegration(listStatusesFn));
    status.addMethod('GET', new apigateway.LambdaIntegration(getStatusFn));
    status.addMethod('PUT', new apigateway.LambdaIntegration(updateStatusFn));
    status.addMethod('DELETE', new apigateway.LambdaIntegration(deleteStatusFn));
    reorder.addMethod('POST', new apigateway.LambdaIntegration(reorderStatusesFn));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'BFF API Gateway endpoint URL',
      exportName: 'ConceptoBffApiUrl'
    });
  }
}
