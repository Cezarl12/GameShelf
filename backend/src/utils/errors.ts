export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Cerere invalidă') {
    super(400, 'BAD_REQUEST', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Neautorizat') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acces interzis') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resursa nu a fost găsită') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict de date') {
    super(409, 'CONFLICT', message);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Serviciu extern indisponibil') {
    super(503, 'SERVICE_UNAVAILABLE', message);
  }
}
