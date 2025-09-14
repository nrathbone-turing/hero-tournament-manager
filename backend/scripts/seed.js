// File: backend/scripts/seed.js
// Purpose: Load seed JSON data into memory (or forward to Flask API later).
// Notes:
// - Uses Node fs + path to load JSON files.
// - Currently just logs counts. Replace TODO section to POST to Flask API
//   or integrate directly with DB if you set up a JS ORM later.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load a seed file from backend/seeds/
function loadSeed(file) {
  const data = fs.readFileSync(
    path.join(__dirname, "..", "seeds", file),
    "utf-8"
  );
  return JSON.parse(data);
}

// Load seed data
const events = loadSeed("events.json");
const entrants = loadSeed("entrants.json");
const matches = loadSeed("matches.json");

// Log summary
console.log("🌱 Seeding data...");
console.log("Events:", events.length);
console.log("Entrants:", entrants.length);
console.log("Matches:", matches.length);
