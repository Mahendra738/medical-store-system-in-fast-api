import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function Inventory({ onNavigate }) {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/medicines/");
      setMedicines(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const getStockStatus = (medicine) => {
    if (medicine.stock_quantity === 0) {
      return "out";
    }

    if (
      medicine.stock_quantity <=
      medicine.minimum_stock
    ) {
      return "low";
    }

    return "normal";
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return false;
    }

    const difference =
      expiry.getTime() - today.getTime();

    const days =
      difference / (1000 * 60 * 60 * 24);

    return days <= 30;
  };

  const filteredMedicines = medicines.filter(
    (medicine) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        medicine.name
          ?.toLowerCase()
          .includes(searchText) ||
        medicine.generic_name
          ?.toLowerCase()
          .includes(searchText) ||
        medicine.brand_name
          ?.toLowerCase()
          .includes(searchText) ||
        medicine.batch_number
          ?.toLowerCase()
          .includes(searchText);

      if (!matchesSearch) {
        return false;
      }

      const stockStatus =
        getStockStatus(medicine);

      if (filter === "low") {
        return stockStatus === "low";
      }

      if (filter === "out") {
        return stockStatus === "out";
      }

      if (filter === "expired") {
        return isExpired(
          medicine.expiry_date
        );
      }

      if (filter === "expiring") {
        return isExpiringSoon(
          medicine.expiry_date
        );
      }

      return true;
    }
  );

  const totalMedicines = medicines.length;

  const lowStockCount = medicines.filter(
    (medicine) =>
      getStockStatus(medicine) === "low"
  ).length;

  const outOfStockCount = medicines.filter(
    (medicine) =>
      getStockStatus(medicine) === "out"
  ).length;

  const expiredCount = medicines.filter(
    (medicine) =>
      isExpired(medicine.expiry_date)
  ).length;

  const expiringSoonCount = medicines.filter(
    (medicine) =>
      isExpiringSoon(medicine.expiry_date)
  ).length;

  return (
    <div className="inventory-page">

      <div className="page-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              onNavigate("dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <h2>Inventory</h2>

          <p>
            Check medicine stock and expiry status.
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={fetchMedicines}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="inventory-summary">

        <div className="inventory-summary-card">
          <span>Total Medicines</span>
          <strong>{totalMedicines}</strong>
        </div>

        <div className="inventory-summary-card">
          <span>Low Stock</span>
          <strong>{lowStockCount}</strong>
        </div>

        <div className="inventory-summary-card">
          <span>Out of Stock</span>
          <strong>{outOfStockCount}</strong>
        </div>

        <div className="inventory-summary-card">
          <span>Expiring Soon</span>
          <strong>{expiringSoonCount}</strong>
        </div>

        <div className="inventory-summary-card">
          <span>Expired</span>
          <strong>{expiredCount}</strong>
        </div>

      </div>

      <div className="inventory-card">

        <div className="inventory-controls">

          <input
            type="text"
            placeholder="Search medicine, generic name, brand or batch..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <div className="inventory-filters">

            <button
              className={
                filter === "all"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              className={
                filter === "low"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() =>
                setFilter("low")
              }
            >
              Low Stock
            </button>

            <button
              className={
                filter === "out"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() =>
                setFilter("out")
              }
            >
              Out of Stock
            </button>

            <button
              className={
                filter === "expiring"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() =>
                setFilter("expiring")
              }
            >
              Expiring Soon
            </button>

            <button
              className={
                filter === "expired"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() =>
                setFilter("expired")
              }
            >
              Expired
            </button>

          </div>

        </div>

        {loading ? (
          <div className="inventory-empty">
            Loading inventory...
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="inventory-empty">
            No medicines found.
          </div>
        ) : (
          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Minimum</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Drawer</th>
                </tr>
              </thead>

              <tbody>

                {filteredMedicines.map(
                  (medicine) => {

                    const stockStatus =
                      getStockStatus(
                        medicine
                      );

                    const expired =
                      isExpired(
                        medicine.expiry_date
                      );

                    const expiring =
                      isExpiringSoon(
                        medicine.expiry_date
                      );

                    return (
                      <tr
                        key={medicine.id}
                      >

                        <td>
                          <strong>
                            {medicine.name}
                          </strong>

                          {medicine.brand_name && (
                            <small>
                              {
                                medicine.brand_name
                              }
                            </small>
                          )}

                          <small>
                            {
                              medicine.generic_name
                            }
                          </small>
                        </td>

                        <td>
                          {medicine.batch_number}
                        </td>

                        <td>
                          <strong>
                            {
                              medicine.stock_quantity
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            medicine.minimum_stock
                          }
                        </td>

                        <td>

                          {stockStatus ===
                            "out" && (
                            <span className="stock-status out">
                              Out of Stock
                            </span>
                          )}

                          {stockStatus ===
                            "low" && (
                            <span className="stock-status low">
                              Low Stock
                            </span>
                          )}

                          {stockStatus ===
                            "normal" && (
                            <span className="stock-status normal">
                              Normal
                            </span>
                          )}

                        </td>

                        <td>

                          <span
                            className={
                              expired
                                ? "expiry-status expired"
                                : expiring
                                ? "expiry-status expiring"
                                : "expiry-status"
                            }
                          >
                            {
                              medicine.expiry_date
                            }

                            {expired &&
                              " (Expired)"}

                            {!expired &&
                              expiring &&
                              " (Soon)"}
                          </span>

                        </td>

                        <td>
                          {medicine.drawer}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Inventory;