import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// यह लाइन .env फाइल के वेरिएबल्स को लोड कर देगी
dotenv.config();

export default defineConfig({
  schema: "./db/schema.js",
  out: "./drizzle",
  dialect: "turso", 
  dbCredentials: {
    // अब यहाँ कोई असली डेटा नहीं है, सिर्फ वेरिएबल्स के नाम हैं
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});