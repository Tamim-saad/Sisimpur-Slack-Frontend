import { appConfig } from "../common/config";

const getAuthUser = () =>
  JSON.parse(localStorage.getItem(appConfig.CURRENT_USER_KEY));

export const isUserLoggedIn = () => Boolean(getAuthUser());

export const getAccessToken = () => getAuthUser()?.accessToken;

export const getRefreshToken = () => getAuthUser()?.refreshToken;

console.log(appConfig.BASE_URL);
export const signup = async ({ name, password }) => {
  try {
    const response = await fetch(`${appConfig.BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      throw new Error(
        `Signup failed: ${response.status} ${response.statusText}`
      );
    }

    console.log("Signup successful!");
    return response.json(); // Return response data if needed
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
};

export const login = async ({ name, password }) => {
  console.log("Sending login request...");

  const requestBody = JSON.stringify({ name, password });
  console.log("Request Body:", requestBody);

  try {
    const response = await fetch(`${appConfig.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
      credentials: "include", // ✅ Ensure cookies are included
    });

    console.log("Response Status:", response.status);

    if (response.status === 204) {
      console.log("Login successful, but no content returned.");
      localStorage.setItem(appConfig.CURRENT_USER_KEY, name);
      localStorage.setItem(appConfig.CURRENT_USER_KEY, password);
      return { message: "Login successful, session started." };
    }

    if (!response.ok) {
      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem(appConfig.CURRENT_USER_KEY);
};
