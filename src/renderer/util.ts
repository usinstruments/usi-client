import { atomWithStorage } from "jotai/utils";
import { connectedAtom } from "./Router.tsx";
import { store } from "./App.tsx";

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

  return fetch(`${BACKEND_URI}${url}`, options).catch((e: Error) => {
    if (e.message === "Failed to fetch") {
      store.set(connectedAtom, false);
      throw new Error("Failed to connect to the server");
    } else {
      throw e;
    }
  }).then((res) => {
    store.set(connectedAtom, true);
    return res;
  });
}