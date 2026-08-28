import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function Medicines({ onNavigate }) {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    brand_name: "",
    category_id: "",
    medicine_type: "Tablet",
    drawer: "",
    batch_number: "",
    expiry_date: "",
    mrp: "",
    purchase_price: "",
    selling_price: "",
    stock: "",
    minimum_stock: 10,
    schedule_type: "OTC",
  });

  const medicineTypes = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Cream",
    "Ointment",
    "Drops",
    "Powder",
    "Inhaler",
    "Other",
  ];

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

  // =========================
  // GET CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");

      setCategories(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to load categories."
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  // =========================
  // GET CATEGORY NAME
  // =========================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category ? category.name : "-";
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchMedicines();
      return;
    }

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLEAR SEARCH
  // =========================

  const handleClearSearch = () => {
    setSearch("");
    fetchMedicines();
  };

  // =========================
  // REDUCE STOCK
  // =========================

  const handleReduceStock = async (medicineId) => {
    const quantity = prompt(
      "Enter quantity to reduce:"
    );

    if (!quantity) {
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      await api.post(
        `/medicines/${medicineId}/reduce-stock`,
        {
          quantity: parsedQuantity,
        }
      );

      await fetchMedicines();

      alert("Stock updated successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to reduce stock."
      );
    }
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD MEDICINE
  // =========================

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        name: formData.name.trim(),

        generic_name:
          formData.generic_name.trim(),

        brand_name:
          formData.brand_name.trim() || null,

        category_id: Number(
          formData.category_id
        ),

        medicine_type:
          formData.medicine_type,

        drawer:
          formData.drawer.trim(),

        batch_number:
          formData.batch_number.trim(),

        expiry_date:
          formData.expiry_date,

        mrp:
          Number(formData.mrp),

        purchase_price:
          Number(formData.purchase_price),

        selling_price:
          Number(formData.selling_price),

        stock:
          Number(formData.stock),

        minimum_stock:
          Number(formData.minimum_stock),

        schedule_type:
          formData.schedule_type,
      };

      console.log(
        "Sending medicine:",
        payload
      );

      await api.post(
        "/medicines/",
        payload
      );

      alert(
        "Medicine added successfully."
      );

      setFormData({
        name: "",
        generic_name: "",
        brand_name: "",
        category_id: "",
        medicine_type: "Tablet",
        drawer: "",
        batch_number: "",
        expiry_date: "",
        mrp: "",
        purchase_price: "",
        selling_price: "",
        stock: "",
        minimum_stock: 10,
        schedule_type: "OTC",
      });

      setShowAddForm(false);

      await fetchMedicines();
    } catch (error) {
      console.error(
        "Add medicine error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
          "Unable to add medicine."
      );
    }
  };

  return (
    <div className="medicines-page">

      {/* =========================
          PAGE HEADER
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

          <h2>Medicines</h2>

          <p>
            Manage medicine inventory
          </p>
        </div>

        <button
          className="add-button"
          onClick={() =>
            setShowAddForm(true)
          }
        >
          + Add Medicine
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =========================
          ADD MEDICINE FORM
      ========================= */}

      {showAddForm && (
        <div className="add-medicine-card">

          <div className="form-header">
            <div>
              <h3>
                Add New Medicine
              </h3>

              <p>
                Enter medicine details
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setShowAddForm(false)
              }
            >
              ×
            </button>
          </div>

          <form
            onSubmit={
              handleAddMedicine
            }
          >

            <div className="medicine-form-grid">

              <div className="form-group">
                <label>
                  Medicine Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Generic Name *
                </label>

                <input
                  type="text"
                  name="generic_name"
                  value={
                    formData.generic_name
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  BRAND NAME
              ========================= */}

              <div className="form-group">

                <label>
                  Brand Name
                </label>

                <input
                  type="text"
                  name="brand_name"
                  value={
                    formData.brand_name
                  }
                  onChange={
                    handleFormChange
                  }
                />

              </div>

              {/* =========================
                  CATEGORY
              ========================= */}

              <div className="form-group">

                <label>
                  Category *
                </label>

                <select
                  name="category_id"
                  value={
                    formData.category_id
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* =========================
                  MEDICINE TYPE
              ========================= */}

              <div className="form-group">

                <label>
                  Medicine Type *
                </label>

                <select
                  name="medicine_type"
                  value={
                    formData.medicine_type
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                >

                  {medicineTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* =========================
                  DRAWER
              ========================= */}

              <div className="form-group">

                <label>
                  Drawer *
                </label>

                <input
                  type="text"
                  name="drawer"
                  value={
                    formData.drawer
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. A, B, 1, 2"
                  maxLength={20}
                  required
                />

                <small>
                  Enter the physical drawer
                  number or name.
                </small>

              </div>

              {/* =========================
                  BATCH NUMBER
              ========================= */}

              <div className="form-group">

                <label>
                  Batch Number *
                </label>

                <input
                  type="text"
                  name="batch_number"
                  value={
                    formData.batch_number
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  EXPIRY DATE
              ========================= */}

              <div className="form-group">

                <label>
                  Expiry Date *
                </label>

                <input
                  type="date"
                  name="expiry_date"
                  value={
                    formData.expiry_date
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  MRP
              ========================= */}

              <div className="form-group">

                <label>
                  MRP *
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="mrp"
                  value={
                    formData.mrp
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  PURCHASE PRICE
              ========================= */}

              <div className="form-group">

                <label>
                  Purchase Price *
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchase_price"
                  value={
                    formData.purchase_price
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  SELLING PRICE
              ========================= */}

              <div className="form-group">

                <label>
                  Selling Price *
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="selling_price"
                  value={
                    formData.selling_price
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  INITIAL STOCK
              ========================= */}

              <div className="form-group">

                <label>
                  Initial Stock *
                </label>

                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />

              </div>

              {/* =========================
                  MINIMUM STOCK
              ========================= */}

              <div className="form-group">

                <label>
                  Minimum Stock
                </label>

                <input
                  type="number"
                  min="0"
                  name="minimum_stock"
                  value={
                    formData.minimum_stock
                  }
                  onChange={
                    handleFormChange
                  }
                />

              </div>

              {/* =========================
                  SCHEDULE
              ========================= */}

              <div className="form-group">

                <label>
                  Schedule Type
                </label>

                <select
                  name="schedule_type"
                  value={
                    formData.schedule_type
                  }
                  onChange={
                    handleFormChange
                  }
                >

                  <option value="OTC">
                    OTC
                  </option>

                  <option value="H">
                    H
                  </option>

                  <option value="H1">
                    H1
                  </option>

                  <option value="X">
                    X
                  </option>

                </select>

              </div>

            </div>

            {/* =========================
                FORM ACTIONS
            ========================= */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setShowAddForm(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
              >
                Save Medicine
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          SEARCH + MEDICINE LIST
      ========================= */}

      {!showAddForm && (
        <>

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
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }

              }}
            />

            <button
              onClick={
                handleSearch
              }
            >
              Search
            </button>

            <button
              className="clear-button"
              onClick={
                handleClearSearch
              }
            >
              Clear
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="empty-state">
              Loading medicines...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            medicines.length ===
              0 && (
              <div className="empty-state">
                No medicines found.
              </div>
            )}

          {/* TABLE */}

          {!loading &&
            medicines.length > 0 && (
              <div className="medicine-table-container">

                <table className="medicine-table">

                  <thead>
                    <tr>

                      <th>Name</th>

                      <th>Generic</th>

                      <th>Brand</th>

                      <th>Type</th>

                      <th>Category</th>

                      <th>Drawer</th>

                      <th>Batch</th>

                      <th>Stock</th>

                      {/* SELLING PRICE */}
                      <th className="price-column selling-price-header">
                        Selling Price
                      </th>

                      {/* MRP */}
                      <th className="price-column mrp-header">
                        MRP
                      </th>

                      {/* PURCHASE PRICE */}
                      <th className="price-column purchase-price-header">
                        Purchase Price
                      </th>

                      <th>Expiry</th>

                      <th>Action</th>

                    </tr>
                  </thead>

                  <tbody>

                    {medicines.map(
                      (medicine) => (

                        <tr
                          key={
                            medicine.id
                          }
                        >

                          {/* NAME */}

                          <td>
                            <strong>
                              {
                                medicine.name
                              }
                            </strong>
                          </td>

                          {/* GENERIC */}

                          <td>
                            {
                              medicine.generic_name
                            }
                          </td>

                          {/* BRAND */}

                          <td>
                            {
                              medicine.brand_name ||
                              "-"
                            }
                          </td>

                          {/* TYPE */}

                          <td>

                            <span className="medicine-type-badge">
                              {
                                medicine.medicine_type ||
                                "-"
                              }
                            </span>
                          </td>

                          <td>
                            {
                              getCategoryName(
                                medicine.category_id
                              )
                            }
                          </td>

                          <td>
                            <span className="drawer-badge">
                              📦{" "}
                              {
                                medicine.drawer ||
                                "-"
                              }
                            </span>
                          </td>

                          <td>
                            {
                              medicine.batch_number
                            }
                          </td>

                          <td>
                            <span
                              className={
                                medicine.stock_quantity <=
                                medicine.minimum_stock
                                  ? "low-stock"
                                  : "stock"
                              }
                            >
                              {
                                medicine.stock_quantity
                              }
                            </span>
                          </td>

                          {/* =========================
                              SELLING PRICE
                          ========================= */}

                          <td className="price-column selling-price-cell">
                            ₹
                            {Number(
                              medicine.selling_price
                            ).toFixed(2)}
                          </td>

                          {/* =========================
                              MRP
                          ========================= */}

                          <td className="price-column mrp-cell">
                            ₹
                            {Number(
                              medicine.mrp
                            ).toFixed(2)}
                          </td>

                          {/* =========================
                              PURCHASE PRICE
                          ========================= */}

                          <td className="price-column purchase-price-cell">
                            ₹
                            {Number(
                              medicine.purchase_price
                            ).toFixed(2)}
                          </td>

                          <td>
                            {
                              medicine.expiry_date
                            }
                          </td>

                          <td>
                            <button
                              className="reduce-button"
                              onClick={() =>
                                handleReduceStock(
                                  medicine.id
                                )
                              }
                            >
                              Reduce Stock
                            </button>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </>
      )}

    </div>
  );
}

export default Medicines;