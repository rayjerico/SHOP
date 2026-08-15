
import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("access_token")
  );

  const [isLoading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    setIsAuthenticated(!!token);

    console.log("Access token exists:", !!token);

    setLoading(false);
  }, [location]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
