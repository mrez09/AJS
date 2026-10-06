import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { getToken, getUser } from "../services/authStorage";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const isAuthenticated = Boolean(token);

  function logout() {
    localStorage.removeItem("ajs_token");
    localStorage.removeItem("ajs_user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        setToken,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
