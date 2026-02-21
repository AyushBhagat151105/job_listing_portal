export class ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;

  constructor(statusCode: number, message: string, data?: T) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data ?? ({} as T);
    this.timestamp = new Date().toISOString();
  }
}