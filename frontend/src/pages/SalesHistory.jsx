import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function SalesHistory({ onNavigate }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sales/");
      setSales(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to load sales history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="sales-history-page">

      <div className="page-header">
        <div>
          <button
            className="back-button"
            onClick={() => onNavigate("dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h2>Sales History</h2>

          <p>
            View previous bills and completed sales.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchSales}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="sales-history-card">

        {loading ? (
          <div className="history-empty">
            Loading sales...
          </div>
        ) : sales.length === 0 ? (
          <div className="history-empty">
            No sales found.
          </div>
        ) : (
          <div className="sales-history-table-wrapper">

            <table className="sales-history-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>

                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="sales-history-row"
                    onClick={() => onNavigate(`sale-${sale.id}`)}
                    >

                    <td>
                      <strong>
                        {sale.invoice_number}
                      </strong>
                    </td>

                    <td>
                      {sale.created_at
                        ? new Date(
                            sale.created_at
                          ).toLocaleString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      {sale.customer_name ||
                        "Walk-in Customer"}
                    </td>

                    <td>
                      {sale.items?.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      ) || 0}
                    </td>

                    <td>
                      ₹
                      {Number(
                        sale.subtotal
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹
                      {Number(
                        sale.discount
                      ).toFixed(2)}
                    </td>

                    <td className="history-total">
                      ₹
                      {Number(
                        sale.total_amount
                      ).toFixed(2)}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default SalesHistory;