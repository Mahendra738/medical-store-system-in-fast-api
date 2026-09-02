function Dashboard({ onLogout, onNavigate }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "admin";

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>Nova Care Medical</h1>
          <p>Chemist and Druggist</p>
        </div>

        <button onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">

        <h2>Dashboard</h2>

        <div className="dashboard-grid">

          {/* Medicines */}
          <button
            className="dashboard-card"
            onClick={() => onNavigate("medicines")}
          >
            <h3>Medicines</h3>
            <p>
              Manage medicines and inventory.
            </p>
          </button>

          {/* Sales & Billing */}
          <button
            className="dashboard-card sales-card"
            onClick={() => onNavigate("sales")}
          >
            <h3>Sales & Billing</h3>
            <p>
              Create bills and process medicine sales.
            </p>
          </button>

          <button
            className="dashboard-card"
            onClick={() =>
              onNavigate("sales-history")
            }
          >
            <h3>Sales History</h3>

            <p>
              View previous bills and completed sales.
            </p>
          </button>

          {/* Inventory */}
          <button
            className="dashboard-card"
            onClick={() => onNavigate("inventory")}
          >
            <h3>Inventory</h3>
            <p>
              Check and update stock.
            </p>
          </button>

          <button
            className="dashboard-card"
            onClick={() => onNavigate("categories")}
          >
            <h3>Categories</h3>
            <p>
              Manage medicine categories.
            </p>
          </button>

          {isAdmin && (
            <button
              className="dashboard-card"
              onClick={() =>
                onNavigate("users")
              }
            >
              <h3>User Management</h3>
              <p>
                Manage staff and manager accounts.
              </p>
            </button>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;