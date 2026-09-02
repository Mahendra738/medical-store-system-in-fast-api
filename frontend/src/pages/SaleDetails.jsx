import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function SaleDetails({ saleId, onNavigate }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/sales/${saleId}`);
        setSale(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
            "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [saleId]);

  if (loading) {
    return (
      <div className="sales-history-page">
        <div className="history-empty">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sales-history-page">
        <div className="error-message">
          {error}
        </div>

        <button
          className="back-button"
          onClick={() => onNavigate("sales-history")}
        >
          ← Back to Sales History
        </button>
      </div>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <div className="sales-history-page">

      <div className="page-header">
        <div>
          <button
            className="back-button"
            onClick={() => onNavigate("sales-history")}
          >
            ← Back to Sales History
          </button>

          <h2>
            Invoice {sale.invoice_number}
          </h2>

          <p>
            {sale.created_at
              ? new Date(
                  sale.created_at
                ).toLocaleString("en-IN")
              : "-"}
          </p>
        </div>
      </div>

      <div className="invoice-detail-card">

        <div className="invoice-detail-header">

          <div>
            <h1>Nova Care Medical</h1>
            <p>Chemist and Druggist</p>
          </div>

          <div>
            <strong>INVOICE</strong>
            <span>
              {sale.invoice_number}
            </span>
          </div>

        </div>

        <div className="invoice-detail-customer">

          <span>Customer</span>

          <strong>
            {sale.customer_name ||
              "Walk-in Customer"}
          </strong>

        </div>

        <div className="invoice-detail-table-wrapper">

          <table className="invoice-detail-table">

            <thead>
              <tr>
                <th>Medicine</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Selling Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {sale.items?.map((item) => (

                <tr key={item.id}>

                  <td>
                    Medicine #{item.medicine_id}
                  </td>

                  <td>
                    {item.quantity}
                  </td>

                  <td>
                    ₹{Number(item.mrp).toFixed(2)}
                  </td>

                  <td>
                    ₹
                    {Number(
                      item.selling_price
                    ).toFixed(2)}
                  </td>

                  <td>
                    ₹
                    {Number(
                      item.discount
                    ).toFixed(2)}
                  </td>

                  <td>
                    ₹
                    {Number(
                      item.total_price
                    ).toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="invoice-detail-summary">

          <div>
            <span>MRP Total</span>
            <strong>
              ₹
              {sale.items
                ?.reduce(
                  (total, item) =>
                    total +
                    Number(item.mrp) *
                      item.quantity,
                  0
                )
                .toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>
              ₹
              {Number(
                sale.subtotal
              ).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              ₹
              {Number(
                sale.discount
              ).toFixed(2)}
            </strong>
          </div>

          <div className="invoice-detail-total">
            <span>TOTAL</span>
            <strong>
              ₹
              {Number(
                sale.total_amount
              ).toFixed(2)}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SaleDetails;