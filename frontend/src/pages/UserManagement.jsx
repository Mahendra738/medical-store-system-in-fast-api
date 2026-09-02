import { useEffect, useState } from "react";
import api from "../api/api";

function UserManagement({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "staff",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/");

      setUsers(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone_number: "",
      password: "",
      role: "staff",
    });

    setShowForm(false);
    setEditingUserId(null);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      setError("");

      await api.post("/users/manage", formData);

      resetForm();
      fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to create user."
      );
    }
  };

  const handleEditUser = (user) => {
    setError("");

    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      password: "",
      role: user.role,
    });

    setEditingUserId(user.id);
    setShowForm(true);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    try {
      setError("");

      await api.put(
        `/users/manage/${editingUserId}`,
        null,
        {
          params: {
            full_name: formData.full_name,
            email: formData.email,
            phone_number: formData.phone_number,
            role: formData.role,
          },
        }
      );

      resetForm();
      fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to update user."
      );
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setError("");

      await api.patch(
        `/users/manage/${user.id}/status`,
        null,
        {
          params: {
            is_active: !user.is_active,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to update user status."
      );
    }
  };

  const openResetPassword = (userId) => {
    setResetPasswordUserId(userId);
    setNewPassword("");
    setError("");
  };

  const closeResetPassword = () => {
    setResetPasswordUserId(null);
    setNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      setError("");

      await api.patch(
        `/users/manage/${resetPasswordUserId}/password`,
        null,
        {
          params: {
            new_password: newPassword,
          },
        }
      );

      closeResetPassword();

      alert("Password updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to reset password."
      );
    }
  };

  return (
    <div className="user-management">

      <header className="user-management-header">

        <div>
          <h1>User Management</h1>

          <p>
            Manage staff and manager accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate("dashboard")
          }
        >
          Back to Dashboard
        </button>

      </header>

      <main className="user-management-content">

        <div className="user-management-actions">

          <h2>Users</h2>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "Add User"}
          </button>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showForm && (
          <form
            className="user-form"
            onSubmit={
              editingUserId
                ? handleUpdateUser
                : handleCreateUser
            }
          >

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            {!editingUserId && (
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="staff">
                  Staff
                </option>

                <option value="manager">
                  Manager
                </option>
              </select>
            </div>

            <button type="submit">
              {editingUserId
                ? "Save Changes"
                : "Create User"}
            </button>

          </form>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="users-table-container">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>

                    <td>{user.full_name}</td>

                    <td>{user.email}</td>

                    <td>{user.phone_number}</td>

                    <td>{user.role}</td>

                    <td>
                      {user.is_active
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditUser(user)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(user)
                        }
                      >
                        {user.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openResetPassword(user.id)
                        }
                      >
                        Reset Password
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </main>

      {resetPasswordUserId && (
        <div className="reset-password-overlay">

          <div className="reset-password-modal">

            <h2>Reset Password</h2>

            <p>
              Enter a new password for this user.
            </p>

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Enter new password"
              autoFocus
            />

            <div className="reset-password-actions">

              <button
                type="button"
                onClick={closeResetPassword}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
              >
                Save Password
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default UserManagement;