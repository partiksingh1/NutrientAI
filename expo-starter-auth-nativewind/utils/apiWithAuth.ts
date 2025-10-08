import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Ensure only one refresh runs at a time across the app
let refreshInFlight: Promise<void> | null = null;

const performTokenRefresh = async (): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const refreshRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (refreshRes.status === 200) {
    const data = await refreshRes.json();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    return;
  }

  // On 401/403 or other failure, clear tokens to force re-login
  const errText = await refreshRes.text();
  console.error("Refresh failed:", refreshRes.status, errText);
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, "user_data"]);
  throw new Error("Session expired. Please login again.");
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  if (!token) throw new Error("No access token found");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && refreshToken) {
    // Single-flight: share one refresh among concurrent callers
    if (!refreshInFlight) {
      refreshInFlight = performTokenRefresh()
        .catch(e => {
          throw e;
        })
        .finally(() => {
          refreshInFlight = null;
        });
    }

    await refreshInFlight;
    return fetchWithAuth(url, options, false);
  }

  return response;
};
