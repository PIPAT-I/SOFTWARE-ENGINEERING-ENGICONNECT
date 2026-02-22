import apiClient from "./apiClient";
import type { PortfolioInterface } from "../interfaces/portfolio";
export async function CreatePortfolio(data: PortfolioInterface) {
  console.log("Creating portfolio with payload:", data);
  return await apiClient
    .post("/portfolios", data)
    .then((res) => res)
    .catch((e) => {
      console.error("Create portfolio error:", e.response?.data);
      return e.response;
    });
}

export async function GetPortfolioById(id: number) {
  return await apiClient
    .get(`/portfolios/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetPortfoliosByUserId(userId: number) {
  return await apiClient
    .get(`/users/${userId}/portfolios`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetMyPortfolios() {
  return await apiClient
    .get("/portfolios/my")
    .then((res) => res)
    .catch((e) => e.response);
}

export async function UpdatePortfolio(
  id: number,
  data: Partial<PortfolioInterface>
) {
  return await apiClient
    .patch(`/portfolios/${id}`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function DeletePortfolio(id: number) {
  return await apiClient
    .delete(`/portfolios/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetPortfolioStatuses() {
  return await apiClient
    .get("/portfolio-statuses")
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetAllPortfolios() {
  return await apiClient
    .get("/portfolios")
    .then((res) => res)
    .catch((e) => e.response);
}

export async function UpdatePortfolioStatus(
  id: number,
  statusID: number,
  comment: string = ""
) {
  const payload = {
    portfolio_status_id: statusID,
    admin_comment: comment,
  };

  return await apiClient
    .patch(`/portfolios/${id}`, payload)
    .then((res) => res)
    .catch((e) => e.response);
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function formatBase64ToDataURL(
  base64: string | undefined,
  mimeType: string = "image/jpeg"
): string {
  if (!base64) return "";
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType};base64,${base64}`;
}
