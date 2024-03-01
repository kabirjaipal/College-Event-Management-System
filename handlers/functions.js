import crypto from "crypto";

export function generatePassword() {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomPart += charset[randomIndex];
  }

  const uniquePassword = "ace24" + randomPart;
  return uniquePassword;
}

export function createUsername(fullName) {
  const lowercaseName = fullName.toLowerCase();
  const sanitizedName = lowercaseName.replace(/[^a-z0-9]/g, "");
  const username = sanitizedName + Math.floor(Math.random() * 1000);
  return username;
}

export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function generateUniqueId(prefix) {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${timestamp}_${randomString}`;
}
