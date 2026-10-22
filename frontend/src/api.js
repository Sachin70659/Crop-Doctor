export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const cleanPath = (path.startsWith("/") ? path : `/${path}`).replace(/\/+/g, "/");
  const url = `${API_URL}${cleanPath}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      "Unable to connect to Crop Doctor server. Please ensure the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
    throw new Error(data.error || "Request failed.");
  }

  return data;
}
