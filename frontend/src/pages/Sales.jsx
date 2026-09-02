import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import "../App.css";

function Sales({ onNavigate }) {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState("");
  const [finalSellingPrice, setFinalSellingPrice] = useState("");

  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [billDiscount, setBillDiscount] = useState("0");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invoice shown after successful sale
  const [completedSale, setCompletedSale] = useState(null);

  // =========================
  // GET MEDICINES
  // =========================

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
          "Unable to load medicines."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =========================
  // SEARCH MEDICINES
  // =========================

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchMedicines();
      return;
    }

    try {
      setError("");

      const response = await api.get(
        "/medicines/search",
        {
          params: {
            name: search.trim(),
          },
        }
      );

      setMedicines(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to search medicines."
      );
    }
  };

  // =========================
  // SELECT MEDICINE
  // =========================

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);

    setQuantity(1);

    const mrp = Number(medicine.mrp);
    const normalSellingPrice = Number(
      medicine.selling_price
    );

    const defaultDiscount =
      mrp > 0
        ? ((mrp - normalSellingPrice) / mrp) * 100
        : 0;

    setDiscountPercent(
      Math.max(0, defaultDiscount).toFixed(2)
    );

    setFinalSellingPrice(
      normalSellingPrice.toFixed(2)
    );
  };

  // =========================
  // CUSTOMER DISCOUNT %
  // Based on MRP
  // =========================

  const handleDiscountChange = (event) => {
    const value = event.target.value;

    setDiscountPercent(value);

    if (!selectedMedicine || value === "") {
      setFinalSellingPrice("");
      return;
    }

    const discount = Number(value);
    const mrp = Number(selectedMedicine.mrp);

    if (Number.isNaN(discount)) {
      return;
    }

    const finalPrice =
      mrp - (mrp * discount) / 100;

    setFinalSellingPrice(
      Math.max(0, finalPrice).toFixed(2)
    );
  };

  // =========================
  // MANUAL FINAL SELLING PRICE
  // =========================

  const handleFinalPriceChange = (event) => {
    const value = event.target.value;

    setFinalSellingPrice(value);

    if (!selectedMedicine || value === "") {
      setDiscountPercent("");
      return;
    }

    const mrp = Number(selectedMedicine.mrp);
    const finalPrice = Number(value);

    if (
      mrp > 0 &&
      !Number.isNaN(finalPrice)
    ) {
      const discount =
        ((mrp - finalPrice) / mrp) * 100;

      setDiscountPercent(
        discount.toFixed(2)
      );
    }
  };

  // =========================
  // PRICE INFORMATION
  // =========================

  const priceInformation = useMemo(() => {
    if (!selectedMedicine) {
      return null;
    }

    const mrp = Number(selectedMedicine.mrp);

    const normalSellingPrice = Number(
      selectedMedicine.selling_price
    );

    const finalPrice = Number(
      finalSellingPrice
    );

    if (Number.isNaN(finalPrice)) {
      return null;
    }

    const difference =
      finalPrice - normalSellingPrice;

    const differencePercent =
      normalSellingPrice > 0
        ? (Math.abs(difference) /
            normalSellingPrice) *
          100
        : 0;

    const customerSaving =
      mrp - finalPrice;

    return {
      mrp,
      normalSellingPrice,
      finalPrice,
      difference,
      differencePercent,
      customerSaving,
    };
  }, [
    selectedMedicine,
    finalSellingPrice,
  ]);

  // =========================
  // ADD MEDICINE TO CART
  // =========================

  const handleAddToCart = () => {
    if (!selectedMedicine) {
      alert("Please select a medicine.");
      return;
    }

    const qty = Number(quantity);

    const finalPrice = Number(
      finalSellingPrice
    );

    const normalSellingPrice = Number(
      selectedMedicine.selling_price
    );

    const mrp = Number(
      selectedMedicine.mrp
    );

    if (
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (
      qty >
      Number(selectedMedicine.stock_quantity)
    ) {
      alert(
        `Only ${selectedMedicine.stock_quantity} units are available.`
      );
      return;
    }

    if (
      Number.isNaN(finalPrice) ||
      finalPrice < 0
    ) {
      alert(
        "Please enter a valid final selling price."
      );
      return;
    }

    /*
      IMPORTANT

      Customer discount is calculated from MRP.

      But the backend sale discount should represent
      the discount from NORMAL SELLING PRICE to FINAL
      SELLING PRICE.

      Example:

      MRP = 100
      Normal selling price = 80
      Final customer price = 75

      Customer gets ₹25 discount from MRP.

      But backend needs ₹5 discount from selling price.
    */

    const backendItemDiscount =
      Math.max(
        0,
        normalSellingPrice - finalPrice
      );

    const customerDiscountAmount =
      Math.max(
        0,
        mrp - finalPrice
      );

    const customerDiscountPercent =
      mrp > 0
        ? (customerDiscountAmount / mrp) * 100
        : 0;

    const item = {
      medicine_id: selectedMedicine.id,

      medicine_name: selectedMedicine.name,

      batch_number:
        selectedMedicine.batch_number,

      quantity: qty,

      mrp,

      normal_selling_price:
        normalSellingPrice,

      selling_price: finalPrice,

      backend_discount:
        backendItemDiscount,

      customer_discount_amount:
        customerDiscountAmount,

      customer_discount_percent:
        customerDiscountPercent,

      total_price: Number(
        (finalPrice * qty).toFixed(2)
      ),

      available_stock:
        Number(
          selectedMedicine.stock_quantity
        ),
    };

    setCart((previous) => [
      ...previous,
      item,
    ]);

    // Reset medicine selection
    setSelectedMedicine(null);
    setSearch("");
    setQuantity(1);
    setDiscountPercent("");
    setFinalSellingPrice("");
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const handleRemoveItem = (index) => {
    setCart((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // =========================
  // BILL CALCULATIONS
  // =========================

  const totalMrp = cart.reduce(
    (total, item) =>
      total +
      item.mrp * item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.total_price,
    0
  );

  const customerSavings =
    Math.max(
      0,
      totalMrp - subtotal
    );

  const additionalBillDiscount =
    Math.max(
      0,
      Number(billDiscount) || 0
    );

  const totalAmount = Math.max(
    0,
    subtotal - additionalBillDiscount
  );

  // =========================
  // CREATE SALE
  // =========================

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      alert(
        "Please add at least one medicine."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      /*
        Save current cart before clearing it.

        This is important because the backend response
        does not contain the full medicine information.
      */

      const invoiceItems =
        cart.map((item) => ({
          medicine_id:
            item.medicine_id,

          medicine_name:
            item.medicine_name,

          batch_number:
            item.batch_number,

          quantity:
            item.quantity,

          mrp:
            item.mrp,

          normal_selling_price:
            item.normal_selling_price,

          selling_price:
            item.selling_price,

          customer_discount_amount:
            item.customer_discount_amount,

          customer_discount_percent:
            item.customer_discount_percent,

          total_price:
            item.total_price,
        }));

      const payload = {
        customer_name:
          customerName.trim() || null,

        discount:
          additionalBillDiscount,

        items: cart.map((item) => ({
          medicine_id:
            item.medicine_id,

          quantity:
            item.quantity,

          /*
            Send discount from normal selling price,
            NOT from MRP.
          */
          discount:
            item.backend_discount,
        })),
      };

      const response = await api.post(
        "/sales/",
        payload
      );

      const sale =
        response.data;

      // =========================
      // BUILD COMPLETE INVOICE
      // =========================

      const invoice = {
        invoice_number:
          sale.invoice_number,

        customer_name:
          customerName.trim() ||
          null,

        items:
          invoiceItems,

        total_mrp:
          totalMrp,

        customer_savings:
          customerSavings,

        subtotal:
          subtotal,

        discount:
          additionalBillDiscount,

        total_amount:
          totalAmount,
      };

      setCompletedSale(
        invoice
      );

      setSuccess(
        `Sale completed successfully. Invoice: ${sale.invoice_number}`
      );

      // Clear current bill
      setCart([]);

      setCustomerName("");

      setBillDiscount("0");

      // Refresh stock
      await fetchMedicines();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to complete sale."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PRINT BILL
  // =========================

  const handlePrintBill = () => {
    window.print();
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="sales-page">

      {/* =========================
          HEADER
      ========================= */}

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

          <h2>
            Sales & Billing
          </h2>

          <p>
            Create customer bills and
            manage medicine sales
          </p>

        </div>

      </div>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* =========================
          SALES LAYOUT
      ========================= */}

      <div className="sales-layout">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="sales-left">

          <div className="sales-card">

            <h3>
              Add Medicine
            </h3>

            {/* SEARCH */}

            <div className="search-section">

              <input
                type="text"
                placeholder="Search medicine..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleSearch();
                  }
                }}
              />

              <button
                onClick={handleSearch}
              >
                Search
              </button>

            </div>

            {/* SEARCH RESULTS */}

            {!selectedMedicine &&
              search &&
              medicines.length > 0 && (

                <div className="sales-medicine-results">

                  {medicines.map(
                    (medicine) => (

                      <button
                        key={medicine.id}
                        className="sales-medicine-result"
                        onClick={() =>
                          handleSelectMedicine(
                            medicine
                          )
                        }
                      >

                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          Batch:{" "}
                          {
                            medicine.batch_number
                          }
                        </span>

                        <span>
                          Stock:{" "}
                          {
                            medicine.stock_quantity
                          }
                        </span>

                        <span>
                          MRP: ₹
                          {Number(
                            medicine.mrp
                          ).toFixed(2)}
                        </span>

                      </button>

                    )
                  )}

                </div>

              )}

            {/* SELECTED MEDICINE */}

            {selectedMedicine && (

              <div className="selected-medicine">

                <div className="selected-medicine-header">

                  <div>

                    <h4>
                      {
                        selectedMedicine.name
                      }
                    </h4>

                    <p>
                      Batch:{" "}
                      {
                        selectedMedicine.batch_number
                      }
                    </p>

                  </div>

                  <button
                    className="clear-button"
                    onClick={() => {
                      setSelectedMedicine(
                        null
                      );
                      setDiscountPercent("");
                      setFinalSellingPrice("");
                    }}
                  >
                    Change
                  </button>

                </div>

                {/* PRICE INFORMATION */}

                <div className="price-information">

                  <div className="price-box">

                    <span>
                      MRP
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedMedicine.mrp
                      ).toFixed(2)}
                    </strong>

                  </div>

                  <div className="price-box normal-price-box">

                    <span>
                      Normal Selling Price
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedMedicine.selling_price
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>

                {/* BILLING INPUTS */}

                <div className="billing-price-grid">

                  <div className="form-group">

                    <label>
                      Customer Discount %
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        discountPercent
                      }
                      onChange={
                        handleDiscountChange
                      }
                    />

                    <small>
                      Calculated from MRP
                    </small>

                  </div>

                  <div className="form-group">

                    <label>
                      Final Selling Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        finalSellingPrice
                      }
                      onChange={
                        handleFinalPriceChange
                      }
                    />

                    <small>
                      Actual price customer pays
                    </small>

                  </div>

                  <div className="form-group">

                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={
                        selectedMedicine.stock_quantity
                      }
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* PRICE SUMMARY */}

                {priceInformation && (

                  <div className="price-summary">

                    <div>
                      Customer saves:

                      <strong>
                        ₹
                        {Math.max(
                          0,
                          priceInformation.customerSaving
                        ).toFixed(2)}
                      </strong>
                    </div>

                    {priceInformation.difference < 0 && (

                      <div className="price-warning">

                        🔴 ₹
                        {Math.abs(
                          priceInformation.difference
                        ).toFixed(2)}

                        {" "}
                        (
                        {
                          priceInformation
                            .differencePercent
                            .toFixed(2)
                        }
                        %)

                        {" "}
                        below normal selling price

                      </div>

                    )}

                    {priceInformation.difference === 0 && (

                      <div className="price-normal">

                        Normal selling price

                      </div>

                    )}

                    {priceInformation.difference > 0 && (

                      <div className="price-positive">

                        🟢 ₹
                        {priceInformation.difference.toFixed(
                          2
                        )}

                        {" "}
                        (
                        {
                          priceInformation
                            .differencePercent
                            .toFixed(2)
                        }
                        %)

                        {" "}
                        above normal selling price

                      </div>

                    )}

                  </div>

                )}

                {/* ADD */}

                <button
                  className="add-to-cart-button"
                  onClick={
                    handleAddToCart
                  }
                >
                  + Add to Bill
                </button>

              </div>

            )}

          </div>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="sales-right">

          <div className="sales-card">

            <h3>
              Current Bill
            </h3>

            {/* CUSTOMER */}

            <div className="form-group">

              <label>
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                placeholder="Optional"
              />

            </div>

            {/* CART */}

            {cart.length === 0 ? (

              <div className="empty-state">

                No medicines added to bill.

              </div>

            ) : (

              <div className="bill-items">

                {cart.map(
                  (item, index) => (

                    <div
                      className="bill-item"
                      key={`${item.medicine_id}-${index}`}
                    >

                      <div className="bill-item-main">

                        <strong>
                          {item.medicine_name}
                        </strong>

                        <span>
                          Batch:{" "}
                          {item.batch_number}
                        </span>

                        <span>
                          Qty:{" "}
                          {item.quantity}
                        </span>

                        <span>
                          ₹
                          {item.selling_price.toFixed(
                            2
                          )} each
                        </span>

                      </div>

                      <div className="bill-item-right">

                        <strong>
                          ₹
                          {item.total_price.toFixed(
                            2
                          )}
                        </strong>

                        <button
                          className="remove-item-button"
                          onClick={() =>
                            handleRemoveItem(
                              index
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

            {/* =========================
                BILL SUMMARY
            ========================= */}

            <div className="bill-summary">

              <div>

                <span>
                  MRP Total
                </span>

                <strong>
                  ₹
                  {totalMrp.toFixed(2)}
                </strong>

              </div>

              <div>

                <span>
                  Customer Savings
                </span>

                <strong>
                  ₹
                  {customerSavings.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toFixed(2)}
                </strong>

              </div>

              <div className="form-group">

                <label>
                  Additional Bill Discount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={billDiscount}
                  onChange={(event) =>
                    setBillDiscount(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="bill-total">

                <span>
                  Final Total
                </span>

                <strong>
                  ₹
                  {totalAmount.toFixed(2)}
                </strong>

              </div>

            </div>

            {/* COMPLETE SALE */}

            <button
              className="complete-sale-button"
              onClick={
                handleCreateSale
              }
              disabled={
                loading ||
                cart.length === 0
              }
            >

              {loading
                ? "Processing..."
                : "Complete Sale"}

            </button>

          </div>

        </div>

      </div>

      {/* ==================================================
          INVOICE POPUP
      ================================================== */}

      {completedSale && (

        <div className="invoice-overlay">

          <div className="invoice-modal">

            {/* HEADER */}

            <div className="invoice-header">

              <div>

                <h2>
                  Nova Care Medical
                </h2>

                <p>
                  Chemist and Druggist
                </p>

              </div>

              <div className="invoice-title">

                <strong>
                  INVOICE
                </strong>

                <span>
                  {
                    completedSale.invoice_number
                  }
                </span>

              </div>

            </div>

            <div className="invoice-divider" />

            {/* CUSTOMER */}

            <div className="invoice-customer">

              <span>
                Customer
              </span>

              <strong>
                {
                  completedSale.customer_name ||
                  "Walk-in Customer"
                }
              </strong>

            </div>

            {/* ITEMS */}

            <div className="invoice-items">

              <div className="invoice-item invoice-item-header">

                <span>
                  Medicine
                </span>

                <span>
                  Batch
                </span>

                <span>
                  Qty
                </span>

                <span>
                  MRP
                </span>

                <span>
                  Price
                </span>

                <span>
                  Total
                </span>

              </div>

              {completedSale.items.map(
                (item, index) => (

                  <div
                    className="invoice-item"
                    key={`${item.medicine_id}-${index}`}
                  >

                    <span>
                      {item.medicine_name}
                    </span>

                    <span>
                      {item.batch_number}
                    </span>

                    <span>
                      {item.quantity}
                    </span>

                    <span>
                      ₹
                      {Number(
                        item.mrp
                      ).toFixed(2)}
                    </span>

                    <span>
                      ₹
                      {Number(
                        item.selling_price
                      ).toFixed(2)}
                    </span>

                    <span>
                      ₹
                      {Number(
                        item.total_price
                      ).toFixed(2)}
                    </span>

                  </div>

                )
              )}

            </div>

            {/* SUMMARY */}

            <div className="invoice-summary">

              <div>

                <span>
                  MRP Total
                </span>

                <strong>
                  ₹
                  {Number(
                    completedSale.total_mrp
                  ).toFixed(2)}
                </strong>

              </div>

              <div>

                <span>
                  Customer Savings
                </span>

                <strong>
                  ₹
                  {Number(
                    completedSale.customer_savings
                  ).toFixed(2)}
                </strong>

              </div>

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {Number(
                    completedSale.subtotal
                  ).toFixed(2)}
                </strong>

              </div>

              <div>

                <span>
                  Bill Discount
                </span>

                <strong>
                  ₹
                  {Number(
                    completedSale.discount
                  ).toFixed(2)}
                </strong>

              </div>

              <div className="invoice-total">

                <span>
                  TOTAL
                </span>

                <strong>
                  ₹
                  {Number(
                    completedSale.total_amount
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

            <div className="invoice-thank-you">

              Thank you for shopping
              with Nova Care Medical!

            </div>

            {/* ACTIONS */}

            <div className="invoice-actions">

              <button
                className="print-invoice-button"
                onClick={
                  handlePrintBill
                }
              >
                🖨 Print Bill
              </button>

              <button
                className="close-invoice-button"
                onClick={() =>
                  setCompletedSale(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;