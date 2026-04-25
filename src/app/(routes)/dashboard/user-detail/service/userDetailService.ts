// src/app/(routes)/user-detail/service/userDetailService.ts
import { getAuthHeader } from "@/helper/helper";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  profileImage?: string;
  joinedDate: string;
  role?: {
    _id: string;
    name: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
}

export async function updateUser(payload: UpdateUserPayload) {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }
  
  const res = await fetch(`${API_BASE_URL}/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Update failed";
    try {
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  
  return res.json();
}

export async function getUserDetailForProfile() {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }
  
  const res = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    let msg = "Get user detail failed";
    try {
      const err = await res.json();
      msg = err?.message || err?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  
  return res.json();
}