import type { CreateCertificateRequest, UpdateCertificateRequest } from "../interfaces/certificate";
import apiClient from "./apiClient";

// ดึงรายการทั้งหมด (Log จะขึ้น [GET] /api/certificates)
export async function GetMyCertificate() {
    return await apiClient
        .get(`/certificate`)
        .then((res) => res)
        .catch((e) => e.response);
}

// ดึงรายการของฉัน (ใช้กับนักศึกษาดูใบประกาศของตัวเอง)
export async function GetMyCertificates() {
    return await apiClient
        .get(`/certificate/my`)
        .then((res) => res)
        .catch((e) => e.response);
}

// ดึง Certificate ตาม PostID (Log จะขึ้น [GET] /api/certificates/post/:id)
export async function GetCertificateByPostID(postID: number) {
    return await apiClient
        .get(`/certificate/post/${postID}`)
        .then((res) => res)
        .catch((e) => e.response);
}

// สร้างใหม่ (Log จะขึ้น [POST] /api/certificates)
export async function CreateCertificate(data: CreateCertificateRequest) {
    return await apiClient
        .post(`/certificate`, data)
        .then((res) => res)
        .catch((e) => e.response);
}

// แก้ไข (Log จะขึ้น [PUT] /api/certificates/:id)
export async function UpdateCertificate(id: number, data: UpdateCertificateRequest) {
    return await apiClient
        .put(`/certificate/${id}`, data)
        .then((res) => res)
        .catch((e) => e.response);
}

// ลบ (Log จะขึ้น [DELETE] /api/certificates/:id)
export async function DeleteCertificate(id: number) {
    return await apiClient
        .delete(`/certificate/${id}`)
        .then((res) => res)
        .catch((e) => e.response);
}