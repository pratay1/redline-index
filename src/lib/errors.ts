export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}
export class UnauthorizedError extends AppError {
  constructor() {
    super("Authentication is required.", 401);
  }
}
export class ForbiddenError extends AppError {
  constructor() {
    super("You do not have permission to perform this action.", 403);
  }
}
