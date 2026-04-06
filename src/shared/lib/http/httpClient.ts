import { appConfig } from "@/config/appConfig";
import { getStoredAccessToken } from "@/features/auth/auth-storage";

export class HttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
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
  let payload: unknown;

  try {
    payload = (await response.json()) as {
      detail?: string;
      message?: string;
      error?: string;
    };

    const parsedPayload = payload as {
      detail?: string | unknown[];
      message?: string;
      error?: string;
    };

    message =
      typeof parsedPayload.detail === "string"
        ? parsedPayload.detail
        : parsedPayload.message ?? parsedPayload.error ?? message;
  } catch {
    // Ignore JSON parsing failures and keep the default message.
  }

  return new HttpError(message, response.status, payload);
}

async function parseSuccessBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    const rawBody = await response.text();
    if (rawBody.trim().length === 0) {
      return undefined as T;
    }

    return rawBody as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new HttpError("Response body is not valid JSON.", response.status);
  }
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

  return parseSuccessBody<T>(response);
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
