import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "attendance_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query, params = []) {
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function executeTransaction(queries) {
  const connection = await getConnection()
  const conn = await connection.getConnection()

  try {
    await conn.beginTransaction()

    const results = []
    for (const { query, params } of queries) {
      const [result] = await conn.execute(query, params)
      results.push(result)
    }

    await conn.commit()
    return results
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}
