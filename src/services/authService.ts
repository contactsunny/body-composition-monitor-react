import { getApiUrl } from "../config/api";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../config/firebase";

export interface ApiUser {
  userId: string | null;
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  email: string;
  imageUrl: string;
  appleUserId: string | null;
  lastActiveDate: string;
}

export interface ApiLoginResponse {
  status: string;
  message: string;
  error: string | null;
  data: {
    user: ApiUser;
    token: string;
  };
}

export interface LoginResponse {
  user: ApiUser;
  token: string;
}

/**
 * Sign in with Google using Firebase Auth
 * @returns Promise with the ID token
 */
export const signInWithGoogle = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  // Try popup first everywhere; if blocked/closed, fall back to redirect
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error: any) {
    const code = error?.code as string | undefined;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/popup-blocked" ||
      code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      throw new Error("__AUTH_REDIRECT__");
    }
    throw error;
  }
};

/**
 * Login with backend API using Firebase ID token
 * @param idToken - Firebase ID token
 * @returns Promise with login response containing user and token
 */
export const loginWithBackend = async (
  idToken: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(getApiUrl("/user/firebase/login"), {
      method: "POST",
      mode: "cors", // Explicitly set CORS mode
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const apiResponse: ApiLoginResponse = await response.json();

    // Check HTTP status first
    if (!response.ok) {
      throw new Error(
        apiResponse.message ||
          apiResponse.error ||
          `HTTP error! status: ${response.status}`
      );
    }

    // Check if status indicates success
    if (apiResponse.status !== "0" || apiResponse.error) {
      throw new Error(
        apiResponse.message || apiResponse.error || "Login failed"
      );
    }

    // Extract user and token from data object
    const loginResponse: LoginResponse = {
      user: apiResponse.data.user,
      token: apiResponse.data.token,
    };

    return loginResponse;
  } catch (error: any) {

    // Check if it's a CORS error
    if (
      error.message?.includes("access control") ||
      error.message?.includes("CORS") ||
      error.name === "TypeError"
    ) {
      throw new Error(
        "CORS Error: The backend server is not allowing requests from this origin. " +
          "Please ensure the backend API has CORS enabled and allows requests from " +
          window.location.origin
      );
    }

    throw error;
  }
};

/**
 * Complete Google login flow: Firebase Auth -> Backend API
 * @returns Promise with login response
 */
export const completeGoogleLogin = async (): Promise<LoginResponse> => {
  const idToken = await signInWithGoogle();
  const loginResponse = await loginWithBackend(idToken);
  return loginResponse;
};

/**
 * If a previous redirect-based login occurred, complete it and return LoginResponse.
 */
export const completeRedirectLoginIfPresent = async (): Promise<LoginResponse | null> => {
  const result = await getRedirectResult(auth);
  if (!result || !result.user) return null;
  const idToken = await result.user.getIdToken();
  return await loginWithBackend(idToken);
};
