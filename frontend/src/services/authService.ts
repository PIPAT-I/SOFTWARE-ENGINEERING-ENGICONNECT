import apiClient from "./apiClient";
import type { Login, Register } from "../interfaces/auth";

// ===== Login Function =====
export async function login(data: Login) {
  return await apiClient
    .post("/auth/login", data)
    .then((res) => res.data)
    .catch((e) => e.response);
}

// ===== Register Function =====
export async function register(data: Register) {
  return await apiClient
    .post("/auth/register", data)
    .then((res) => res.data)
    .catch((e) => e.response);
}
// ------------------------------------
// export async function functionName(params) 
// { return await apiClient 
// 	.method("/path", data) 
// 	.then((res) => res.data) 
// 	.catch((e) => e.response); }
// ------------------------------------
