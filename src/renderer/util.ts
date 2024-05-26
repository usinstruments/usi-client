import { atomWithStorage } from "jotai/utils";

export function myStoredAtom<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(key, initialValue, undefined, { getOnInit: true });
}

export const BACKEND_URI = "http://localhost:8000";

export function myFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem("access-token");

  if (!options) {
    options = {};
  }

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return fetch(`${BACKEND_URI}${url}`, options);
}