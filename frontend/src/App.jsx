import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState(
      Boolean(
        localStorage.getItem("access_token")
      )
    );

  const [page, setPage] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  if (page === "medicines") {
    return (
      <Medicines
        onNavigate={setPage}
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      onNavigate={setPage}
    />
  );
}

export default App;