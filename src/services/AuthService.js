// src/services/AuthService.js

const API = import.meta.env.VITE_API_URL; // YA incluye /api

// 🔹 Login
export const login = async (correo, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error en login");
  }

  if (data.token) {
    const userData = {
      ...data.user,
      id_psicologo: data.user?.id_psicologo || null,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  return data;
};

// 🔹 Registro de psicólogos
export const register = async ({
  cedula_profesional,
  nombre,
  correo,
  password,
  especialidad,
}) => {
  const token = getToken();

  const res = await fetch(`${API}/psicologos/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cedula_profesional,
      nombre,
      correo,
      password,
      especialidad,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Error en registro");

  return data;
};

// 🔹 Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// 🔹 Obtener usuario
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// 🔹 Cambiar contraseña
export const changePassword = async (oldPassword, newPassword) => {
  const token = getToken();

  const res = await fetch(`${API}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Error");

  return data;
};

// 🔹 Token
export const getToken = () => localStorage.getItem("token");
