import app from "#app";
import db from "#db/client";

// Load local .env when running outside of a production environment (Render sets NODE_ENV=production)
if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}

const PORT = process.env.PORT ?? 3000;

await db.connect();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
