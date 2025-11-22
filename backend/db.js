// backend/db.js (crea la conexión al servidor MySQL) MySQL (localhost o remoto)

//El archivo db.js crea la conexión con la base de datos usando las variables del archivo .env.


import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

