import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: RequestInit = {}
): Promise<Response> {
  // Create a new options object to avoid modifying the input
  const newOptions: RequestInit = { ...options };
  
  // Get session ID from local storage for auth
  const sessionId = localStorage.getItem('sessionId');
  
  // Merge headers properly
  newOptions.headers = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "Authorization": `Bearer ${sessionId}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const res = await fetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    ...newOptions
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get session ID from local storage for auth
    const sessionId = localStorage.getItem('sessionId');
    const headers: Record<string, string> = {};
    
    if (sessionId) {
      headers['Authorization'] = `Bearer ${sessionId}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
