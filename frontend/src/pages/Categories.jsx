import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

function Categories({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/categories/", {
        name: name.trim(),
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setShowAddForm(false);

      await fetchCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to create category."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);

    setEditName(category.name);
    setEditDescription(category.description || "");

    setShowAddForm(false);
    setError("");
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
    setError("");
  };

  const handleEditCategory = async (event) => {
    event.preventDefault();

    if (!editName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(
        `/categories/${editingCategory.id}`,
        {
          name: editName.trim(),
          description:
            editDescription.trim() || null,
        }
      );

      cancelEditing();

      await fetchCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to update category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/categories/${category.id}`
      );

      await fetchCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Unable to deactivate category."
      );
    }
  };

  return (
    <div className="categories-page">

      <div className="page-header">

        <div>
          <button
            className="back-button"
            onClick={() => onNavigate("dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h2>Categories</h2>

          <p>
            Manage medicine categories.
          </p>
        </div>

        <div className="categories-header-actions">

          <button
            className="refresh-button"
            onClick={fetchCategories}
          >
            ↻ Refresh
          </button>

          <button
            className="add-category-button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingCategory(null);
              setError("");
            }}
          >
            + Add Category
          </button>

        </div>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ADD CATEGORY */}

      {showAddForm && (
        <div className="category-form-card">

          <h3>Add Category</h3>

          <form onSubmit={handleAddCategory}>

            <div className="category-form-group">
              <label>
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter category name"
                disabled={saving}
              />
            </div>

            <div className="category-form-group">
              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter description (optional)"
                rows="3"
                disabled={saving}
              />
            </div>

            <div className="category-form-actions">

              <button
                type="button"
                className="category-cancel-button"
                onClick={() => {
                  setShowAddForm(false);
                  setName("");
                  setDescription("");
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Category"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* EDIT CATEGORY */}

      {editingCategory && (
        <div className="category-form-card">

          <h3>Edit Category</h3>

          <form onSubmit={handleEditCategory}>

            <div className="category-form-group">
              <label>
                Category Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(event) =>
                  setEditName(event.target.value)
                }
                placeholder="Enter category name"
                disabled={saving}
              />
            </div>

            <div className="category-form-group">
              <label>
                Description
              </label>

              <textarea
                value={editDescription}
                onChange={(event) =>
                  setEditDescription(
                    event.target.value
                  )
                }
                placeholder="Enter description (optional)"
                rows="3"
                disabled={saving}
              />
            </div>

            <div className="category-form-actions">

              <button
                type="button"
                className="category-cancel-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-button"
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Category"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* CATEGORY LIST */}

      <div className="categories-card">

        {loading ? (
          <div className="categories-empty">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty">
            No categories found.
          </div>
        ) : (
          <div className="categories-table-wrapper">

            <table className="categories-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {categories.map((category) => (
                  <tr key={category.id}>

                    <td>
                      {category.id}
                    </td>

                    <td>
                      <strong>
                        {category.name}
                      </strong>
                    </td>

                    <td>
                      {category.description || "-"}
                    </td>

                    <td>
                      <span className="category-status">
                        Active
                      </span>
                    </td>

                    <td>
                      <div className="category-action-buttons">

                        <button
                          className="category-edit-button"
                          onClick={() =>
                            startEditing(category)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="category-delete-button"
                          onClick={() =>
                            handleDeleteCategory(category)
                          }
                        >
                          Delete
                        </button>

                      </div>
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

export default Categories;