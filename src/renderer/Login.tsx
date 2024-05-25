import React, { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

const BACKEND_URI = "http://localhost:8000";

function myFetch(url: string, options: RequestInit) {
  const token = localStorage.getItem("access-token");

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return fetch(url, options);
}

export default function Login() {
  const [error, setError] = useState<string | undefined>(undefined);
  const { login } = useUser();

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    let data: any = Object.fromEntries(formData.entries());

    if (data["remember"] === "on") {
      data["remember"] = true;
    } else {
      data["remember"] = false;
    }

    try {
      await login(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={formSubmit}>
      <div className="flex flex-col mx-auto mt-32 w-3/5 max-w-xl gap-2">
        <div className="flex flex-row text-2xl font-bold items-center gap-4">
          U.S.I. Login
        </div>
        <input type="text" name="username" placeholder="username" />
        <input type="password" name="password" placeholder="password" />

        <div className="flex flex-row gap-2">
          <input type="checkbox" id="remember" name="remember" />
          <label htmlFor="remember" className="select-none">
            Remember me
          </label>
        </div>

        <button type="submit" className="mt-2">
          Login
        </button>

        {error && <div className="text-red-500">{error}</div>}
      </div>
    </form>
  );
}

const userAtom = atom<string | undefined>(undefined);

export function useUser() {
  const [user, setUser] = useAtom(userAtom);

  const getUserFromToken = () => {
    const token = localStorage.getItem("access-token");

    if (!token || token === "undefined") {
      return;
    }

    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);

    const userId = parsedPayload.sub;
    setUser(userId);
  }

  const login = async (data: any) => {
    const response = await myFetch(`${BACKEND_URI}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status < 500) {
        const errorData = await response.json();
        const message = errorData.detail;

        getUserFromToken(); // user might already be logged in
        throw new Error(message);
      } else {
        throw new Error("Server error");
      }
    }

    const token = await response.json();
    localStorage.setItem("access-token", token["access-token"]);

    getUserFromToken();
  };

  const logout = () => {
    localStorage.removeItem("access-token");
    setUser(undefined);
  }

  useEffect(() => {
    getUserFromToken();
  }, []);

  // const logout = () => {

  return { user, login, logout };
}