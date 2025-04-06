import { CustomError } from './custom-error';

export class NotAuthenticatedError extends CustomError {
  statusCode = 401;

  constructor() {
    super('Not Authenticated');

    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'Not authenticated. Please log in to access this resource.',
      },
    ];
  }
}
