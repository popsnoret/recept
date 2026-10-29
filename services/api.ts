import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.0.65:3000/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: Record<string, unknown>;
};

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = options.token ?? (await SecureStore.getItemAsync("authToken"));

  console.log("Token finns:", Boolean(token), "Endpoint:", endpoint);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new Error("Kunde inte nå servern. Kontrollera att backend körs och att telefonen är ansluten till samma wifi som datorn.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Något gick fel.");
  }

  return data as T;
}
