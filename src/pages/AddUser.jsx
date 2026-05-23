import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer",
    phone: "",
    designation: "",
    department: "",
    isActive: true,
  });

  const [error, setError] = useState("");

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
      await API.post("/users", formData);
      navigate("/users");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Add User
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

          <Input
            label="Password *"
            name="password"
            type="password"
            value={formData.password}
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
            placeholder="Frontend Developer"
          />

          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Development"
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

          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
              Save User
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

export default AddUser;