export class HttpError extends Error {
  code: any;
  status: any;
  constructor(message: string, errorCode?: any) {
    super(message);
    this.code = errorCode;
  }
}