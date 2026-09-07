import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function SalesReports({ onNavigate }) {
  const [period, setPeriod] = useState("today");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        period,
      };

      // Send dates only for custom report
      if (period === "custom") {
        if (!startDate || !endDate) {
          setLoading(false);
          return;
        }

        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await api.get("/sales/reports", {
        params,
      });

      setReport(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load sales report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== "custom") {
      fetchReport();
    }
  }, [period]);

  const handleCustomReport = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    fetchReport();
  };

  if (loading) {
    return (
      <div className="sales-report-loading">
        Loading sales report...
      </div>
    );
  }

  return (
    <div className="sales-reports-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="sales-reports-header">

        <button
          className="back-button"
          onClick={() => onNavigate("dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>Sales Reports</h1>

        <p>
          Analyze sales performance and business activity.
        </p>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="sales-report-error">
          {error}
        </div>
      )}

      {/* =========================
          PERIOD FILTER
      ========================= */}

      <div className="sales-report-filters">

        <button
          className={period === "today" ? "active" : ""}
          onClick={() => {
            setPeriod("today");
            setError("");
          }}
        >
          Today
        </button>

        <button
          className={period === "week" ? "active" : ""}
          onClick={() => {
            setPeriod("week");
            setError("");
          }}
        >
          This Week
        </button>

        <button
          className={period === "month" ? "active" : ""}
          onClick={() => {
            setPeriod("month");
            setError("");
          }}
        >
          This Month
        </button>

        <button
          className={period === "year" ? "active" : ""}
          onClick={() => {
            setPeriod("year");
            setError("");
          }}
        >
          This Year
        </button>

        <button
          className={period === "custom" ? "active" : ""}
          onClick={() => {
            setPeriod("custom");
            setError("");
          }}
        >
          Custom
        </button>

      </div>

      {/* =========================
          CUSTOM DATE RANGE
      ========================= */}

      {period === "custom" && (

        <div className="sales-report-section">

          <h2>Custom Date Range</h2>

          <div className="custom-date-range">

            <div className="form-group">

              <label>
                From Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label>
                To Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
              />

            </div>

            <button
              className="custom-report-button"
              onClick={handleCustomReport}
            >
              Apply
            </button>

          </div>

        </div>

      )}

      {/* =========================
          REPORT
      ========================= */}

      {report && (

        <>

          {/* =========================
              SUMMARY CARDS
          ========================= */}

          <div className="sales-report-summary">

            <div className="sales-report-summary-card">
              <h3>Total Sales</h3>

              <p>
                ₹{Number(
                  report.summary.total_sales
                ).toFixed(2)}
              </p>
            </div>

            <div className="sales-report-summary-card">
              <h3>Total Bills</h3>

              <p>
                {report.summary.total_bills}
              </p>
            </div>

            <div className="sales-report-summary-card">
              <h3>Items Sold</h3>

              <p>
                {report.summary.total_items_sold}
              </p>
            </div>

            <div className="sales-report-summary-card">
              <h3>Total Discount</h3>

              <p>
                ₹{Number(
                  report.summary.total_discount
                ).toFixed(2)}
              </p>
            </div>

            <div className="sales-report-summary-card">
              <h3>Average Bill</h3>

              <p>
                ₹{Number(
                  report.summary.average_bill
                ).toFixed(2)}
              </p>
            </div>

          </div>

          {/* =========================
              SALES TREND
          ========================= */}

          <div className="sales-report-section">

            <h2>Sales Trend</h2>

            {report.sales_by_date.length === 0 ? (

              <div className="sales-report-empty">
                No sales found for this period.
              </div>

            ) : (

              <div className="sales-report-table-wrapper">

                <table className="sales-report-table">

                  <thead>

                    <tr>
                      <th>Date</th>
                      <th>Sales</th>
                      <th>Bills</th>
                    </tr>

                  </thead>

                  <tbody>

                    {report.sales_by_date.map((item) => (

                      <tr key={item.date}>

                        <td>
                          {item.date}
                        </td>

                        <td className="sales-report-money">
                          ₹{Number(
                            item.sales
                          ).toFixed(2)}
                        </td>

                        <td>
                          {item.bills}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* =========================
              TOP MEDICINES
          ========================= */}

          <div className="sales-report-section">

            <h2>Top-Selling Medicines</h2>

            {report.top_medicines.length === 0 ? (

              <div className="sales-report-empty">
                No medicine sales found for this period.
              </div>

            ) : (

              <div className="sales-report-table-wrapper">

                <table className="sales-report-table">

                  <thead>

                    <tr>
                      <th>Medicine</th>
                      <th>Quantity Sold</th>
                      <th>Revenue</th>
                    </tr>

                  </thead>

                  <tbody>

                    {report.top_medicines.map((item) => (

                      <tr key={item.medicine_id}>

                        <td>
                          {item.medicine_name}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td className="sales-report-money">
                          ₹{Number(
                            item.revenue
                          ).toFixed(2)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* =========================
              CATEGORY PERFORMANCE
          ========================= */}

          <div className="sales-report-section">

            <h2>Category Performance</h2>

            {report.category_sales.length === 0 ? (

              <div className="sales-report-empty">
                No category sales found for this period.
              </div>

            ) : (

              <div className="sales-report-table-wrapper">

                <table className="sales-report-table">

                  <thead>

                    <tr>
                      <th>Category</th>
                      <th>Quantity Sold</th>
                      <th>Revenue</th>
                    </tr>

                  </thead>

                  <tbody>

                    {report.category_sales.map((item) => (

                      <tr key={item.category_name}>

                        <td>
                          {item.category_name}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td className="sales-report-money">
                          ₹{Number(
                            item.revenue
                          ).toFixed(2)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default SalesReports;