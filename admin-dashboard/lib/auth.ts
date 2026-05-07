// const TOKEN_KEY = "admin_token";
const NAME_KEY = "admin_name";

// ✅ Memory only — cleared on browser close/refresh
let memoryToken: string | null = null;
let memoryName: string | null = null;

export const getAuthToken = () => {
  return memoryToken;
};

export const getAdminName = () => {
  return memoryName;
};

export const setAuthSession = (token: string, name?: string) => {
  memoryToken = token;
  if (name) memoryName = name;
};

export const clearAuthSession = () => {
  memoryToken = null;
  memoryName = null;
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