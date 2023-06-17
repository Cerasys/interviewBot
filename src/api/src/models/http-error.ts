export class HttpError extends Error {
  code: any;
  constructor(message: string, errorCode: any) {
    super(message);
    this.code = errorCode;
  }
}