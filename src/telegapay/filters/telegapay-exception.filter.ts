import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class TelegapayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TelegapayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.debug(`❌ Unexpected error in Telegapay: ${exception.message}`, exception.stack);
    } else {
      message = 'Unknown error occurred';
      this.logger.debug(`❌ Unknown error in Telegapay: ${String(exception)}`);
    }

    // Логируем только ошибки (не 200-299 статусы)
    if (status >= 400) {
      this.logger.debug(`❌ Telegapay API Error ${status}: ${message} for ${request.method} ${request.url}`);
    }

    response.status(status).json({
      success: false,
      error: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}