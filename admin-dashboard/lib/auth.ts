const TOKEN_KEY = "admin_token";
const NAME_KEY = "admin_name";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(^| )${name}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[2]) : null;
};

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY) || getCookieValue(TOKEN_KEY);
};

export const getAdminName = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(NAME_KEY);
};

export const setAuthSession = (token: string, name?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; max-age=604800; SameSite=Lax`;

  if (name) {
    localStorage.setItem(NAME_KEY, name);
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
};

export const authHeader = (token?: string) => {
  const value = token || getAuthToken();
  return value
    ? {
        Authorization: `Bearer ${value}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};
