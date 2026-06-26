export class AppError extends Error {
  constructor(public message: string, public code?: string, public status = 500) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED", 401);
  }
}
