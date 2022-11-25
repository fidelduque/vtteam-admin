export class ApplicationError extends Error {
  constructor(public statusCode: number, public detail: string) {
    super(`${statusCode}: ${detail}`);
    this.name = 'ApplicationError';
  }
}
