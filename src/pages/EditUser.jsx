import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "developer",
    phone: "",
    designation: "",
    department: "",
    isActive: true,
  });

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const res = await API.get(`/users/${id}`);

      const user = res.data.user;

      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "developer",
        phone: user.phone || "",
        designation: user.designation || "",
        department: user.department || "",
        isActive: user.isActive,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load user");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const value =
      e.target.name === "isActive"
        ? e.target.value === "true"
        : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.put(`/users/${id}`, formData);

      if (newPassword.trim()) {
        await API.put(`/users/${id}/password`, {
          password: newPassword,
        });
      }

      navigate("/users");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Edit User
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4"
        >
          <Input
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 font-medium">Role *</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
              <option value="client">Client</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />

          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 font-medium">Status</label>

            <select
              name="isActive"
              value={String(formData.isActive)}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
              Update User
            </button>

            <button
              type="button"
              onClick={() => navigate("/users")}
              className="bg-gray-100 px-6 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
      />
    </div>
  );
}

export default EditUser;