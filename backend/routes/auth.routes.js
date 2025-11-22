import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

export const router = Router();

// Usa pool desde db.js
import { db as pool } from "../db.js";

router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // 1️⃣ Buscar usuario en tabla usuarios
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, correo, password, rol FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];

    // 2️⃣ Verificar password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 3️⃣ Si es psicólogo → obtener id_psicologo
    let id_psicologo = null;
    if (user.rol === "psicologo") {
      const [p] = await pool.query(
        "SELECT id_psicologo FROM psicologos WHERE id_usuario = ?",
        [user.id_usuario]
      );
      id_psicologo = p[0]?.id_psicologo || null;
    }

    const roleNumber = user.rol === "admin" ? 1 : 2;

    // 4️⃣ Crear token
    const token = jwt.sign(
      { id_usuario: user.id_usuario, role: roleNumber, id_psicologo },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    delete user.password;

    res.json({
      ok: true,
      message: "Login exitoso",
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        role: roleNumber,
        id_psicologo
      },
      token
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
