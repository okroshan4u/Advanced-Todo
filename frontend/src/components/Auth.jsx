import React, { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Auth({ setUser }) {
  const [tab, setTab] = useState("login"); 

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = tab === "login" ? "login" : "register";

    const response = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.msg);
      return;
    }

    if (tab === "login") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } else {
      alert("Registration successful! You can log in now.");
      setTab("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 font-semibold transition ${
              tab === "login"
                ? "border-b-4 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>

          <button
            className={`flex-1 py-2 font-semibold transition ${
              tab === "register"
                ? "border-b-4 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {tab === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            {tab === "login" ? "Log In" : "Create Account"}
          </button>

        </form>
      </div>
    </div>
  );
}
