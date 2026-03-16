import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global qui normalise toutes les réponses d'erreur HTTP.
 * Format uniforme : { statusCode, message, error }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.extractError(exception);

    response.status(statusCode).json({ statusCode, message, error, path: request.url });
  }

  private extractError(exception: unknown): { statusCode: number; message: string; error: string } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const msg = (body as Record<string, unknown>).message;
        return {
          statusCode: status,
          message: Array.isArray(msg) ? msg.join(', ') : String(msg),
          error: exception.name,
        };
      }
      return { statusCode: status, message: String(body), error: exception.name };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erreur interne du serveur',
      error: 'InternalServerError',
    };
  }
}
