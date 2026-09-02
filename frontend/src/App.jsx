import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Sales from "./pages/Sales";
import SalesHistory from "./pages/SalesHistory";
import SaleDetails from "./pages/SaleDetails";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import UserManagement from "./pages/UserManagement";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [page, setPage] = useState("dashboard");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setShowRegister(false);
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (page === "medicines") {
    return <Medicines onNavigate={setPage} />;
  }

  if (page === "sales") {
    return <Sales onNavigate={setPage} />;
  }
  if (page === "inventory") {
    return <Inventory onNavigate={setPage} />;
  }
  if (page === "categories") {
    return <Categories onNavigate={setPage} />;
  }

  if (page === "sales-history") {
    return (
      <SalesHistory
        onNavigate={setPage}
      />
    );
  }

  if (page === "users") {
    return (
      <UserManagement
        onNavigate={setPage}
      />
    );
  }

  if (page.startsWith("sale-")) {
    const saleId = page.replace("sale-", "");

    return (
      <SaleDetails
        saleId={saleId}
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