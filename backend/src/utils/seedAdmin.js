/*
  utils/seedAdmin.js - Ensure default admin user exists (from .env)
*/

import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  if (!adminEmail || !adminPassword) {
    return; // not configured
  }

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) return; // admin already exists

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashed,
    role: 'admin',
  });
}
