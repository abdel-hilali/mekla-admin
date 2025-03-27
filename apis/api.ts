export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const fetchOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers: headers,
    };

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      throw new Error("Authentication required. Please log in again.");
    }

    return response;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}