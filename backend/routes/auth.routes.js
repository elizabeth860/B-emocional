// routes/auth.routes.js
import { Router } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// 🔐 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Verificar usuario
    const [rows] = await db.query(
      "SELECT * FROM psicologos WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // JWT
    const token = jwt.sign(
      { id: user.id_psicologo, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    delete user.password;

    res.json({
      ok: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
