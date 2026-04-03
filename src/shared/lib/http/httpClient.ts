import { appConfig } from "@/config/appConfig";
import { getStoredAccessToken } from "@/features/auth/auth-storage";

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

function logDebug(message: string, meta?: unknown) {
  if (!appConfig.isDevelopment) {
    return;
  }

  if (meta === undefined) {
    console.info(`[orbit:http] ${message}`);
    return;
  }

  console.info(`[orbit:http] ${message}`, meta);
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${appConfig.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseError(response: Response): Promise<HttpError> {
  let message = `Request failed with status ${response.status}.`;

  try {
    const payload = (await response.json()) as {
      detail?: string;
      message?: string;
      error?: string;
    };

    message = payload.detail ?? payload.message ?? payload.error ?? message;
  } catch {
    // Ignore JSON parsing failures and keep the default message.
  }

  return new HttpError(message, response.status);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? getStoredAccessToken();
  const headers = new Headers(options.headers);
  const isJsonBody =
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData);

  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = buildUrl(path);
  const method = options.method ?? "GET";

  logDebug(`${method} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    body: isJsonBody ? JSON.stringify(options.body) : (options.body as BodyInit | null | undefined),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const httpClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
