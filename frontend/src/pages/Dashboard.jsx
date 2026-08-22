function Dashboard({
  onLogout,
  onNavigate,
}) {
  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>
          <h1>NovaCare</h1>
          <p>
            Medical & General Store
          </p>
        </div>

        <button onClick={onLogout}>
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        <h2>Dashboard</h2>

        <div className="dashboard-grid">

          <button
            className="dashboard-card"
            onClick={() =>
              onNavigate("medicines")
            }
          >
            <h3>Medicines</h3>

            <p>
              Manage medicines and inventory.
            </p>
          </button>

          <div className="dashboard-card">
            <h3>Inventory</h3>

            <p>
              Check and update stock.
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Categories</h3>

            <p>
              Manage medicine categories.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;