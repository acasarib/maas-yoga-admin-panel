/**
 * Script to create a service account + API key for external integrations.
 *
 * Usage:
 *   node scripts/create-api-key.js "Key Name" email@domain.local "permission1,permission2"
 *
 * Example:
 *   node scripts/create-api-key.js "External System" external@maasyoga.local "student:read,course:read"
 */

import "../env.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { user, apiKey, sequelize } from "../app/db/index.js";
import { SERVICE_ACCOUNT_ROLE, API_KEY_PERMISSIONS } from "../app/utils/constants.js";

const KEY_NAME = process.argv[2];
const EMAIL = process.argv[3];
const PERMISSIONS_STR = process.argv[4] || "";

if (!KEY_NAME || !EMAIL) {
  console.error("❌ Error: missing required arguments");
  console.error("   Usage: node scripts/create-api-key.js <name> <email> [permissions]");
  console.error("\n   Example:");
  console.error('   node scripts/create-api-key.js "External System" external@maasyoga.local "student:read,course:read"');
  console.error("\n   Available permissions:");
  Object.entries(API_KEY_PERMISSIONS).forEach(([key, val]) => {
    console.error(`     - ${val}`);
  });
  process.exit(1);
}

const permissionsList = PERMISSIONS_STR
  ? PERMISSIONS_STR.split(",").map((p) => p.trim())
  : [];

// Validate permissions
const validPerms = Object.values(API_KEY_PERMISSIONS);
const invalidPerms = permissionsList.filter((p) => !validPerms.includes(p));
if (invalidPerms.length) {
  console.error(`❌ Error: invalid permissions: ${invalidPerms.join(", ")}`);
  process.exit(1);
}

try {
  // Check if email already exists
  const existingUser = await user.findOne({ where: { email: EMAIL } });
  if (existingUser) {
    console.error(`❌ Error: email ${EMAIL} already exists`);
    process.exit(1);
  }

  // Create service account user
  console.log(`Creating service account ${EMAIL}...`);
  const newUser = await user.create({
    email: EMAIL,
    firstName: KEY_NAME,
    lastName: "",
    role: SERVICE_ACCOUNT_ROLE,
    status: "active",
    password: null,
  });
  console.log(`✓ Service account created: ${newUser.id}`);

  // Generate API key
  const keySecret = `ak_${crypto.randomBytes(32).toString("hex")}`;
  const keyPrefix = keySecret.slice(0, 20);
  const keyHash = await bcrypt.hash(keySecret, 10);

  console.log(`Creating API key: ${KEY_NAME}...`);
  await apiKey.create({
    userId: newUser.id,
    keyPrefix,
    keyHash,
    name: KEY_NAME,
    permissions: permissionsList,
  });
  console.log(`✓ API key created\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📌 API Key Secret (SAVE THIS, YOU CANNOT RECOVER IT):\n`);
  console.log(`   ${keySecret}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\nKey Details:`);
  console.log(`  Name:        ${KEY_NAME}`);
  console.log(`  Email:       ${EMAIL}`);
  console.log(`  Permissions: ${permissionsList.length ? permissionsList.join(", ") : "(none)"}`);
  console.log(`\nUsage:`);
  console.log(`  curl -H "X-Api-Key: ${keySecret.slice(0, 20)}..." https://api.example.com/api/v1/students`);
  console.log("\n");

  await sequelize.close();
  process.exit(0);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  await sequelize.close();
  process.exit(1);
}
