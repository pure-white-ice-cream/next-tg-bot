/**
 * 完整的响应类型（联合类型）
 */
export type TelegramApiResponse<T> = TelegramSuccessResponse<T> | TelegramErrorResponse;

/**
 * 成功时的响应结构
 */
interface TelegramSuccessResponse<T> {
  ok: true;
  description?: string;
  result: T;
}

/**
 * 失败时的响应结构
 */
interface TelegramErrorResponse {
  ok: false;
  description: string;
  error_code: number;
}
