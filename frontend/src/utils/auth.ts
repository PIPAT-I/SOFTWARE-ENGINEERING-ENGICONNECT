import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const TOKEN_TYPE_KEY = 'token_type';

interface JWTPayload {
  user_id: number;
  sut_id: string;
  role: string;
  exp: number;
  iat: number;
}

export const setAuthToken = (token: string, tokenType: string = "Bearer") => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
};
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
export const getUserFromToken = (): { user_id: number; sut_id: string; role: string } | null => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.user_id || !decoded.role || !decoded.sut_id) return null;
    return {
      user_id: decoded.user_id,
      sut_id: decoded.sut_id,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};


export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
};
