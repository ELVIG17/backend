type ApiError = { message?: string };

export async function http<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
    credentials: "include", // cookie auth
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      (data as ApiError | null)?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}