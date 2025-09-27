type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions<T = any> {
  url: string;
  method?: FetchMethod;
  body?: T;
  headers?: Record<string, string>;
}

export async function apiFetch<T = any>({ url, method = "GET", body, headers = {} }: FetchOptions<T>) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("API Fetch Error:", err.message);
    throw err;
  }
}
