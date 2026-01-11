import fs from "fs";
import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createCarWithOwner } from "#db/queries/cars";
import { createReview } from "#db/queries/reviews";
import { addFavorite } from "#db/queries/favorites";

await db.connect();
await seed();
await db.end();

async function isEmptyDB() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM users");
  return rows[0].count === 0;
}

async function seed() {
  if (!(await isEmptyDB())) {
    console.log("Database not empty — skipping seed.");
    return;
  }

  const creds = [];

  // Create first user
  const username1 = "alice";
  const password1 = "password123";
  const user1 = await createUser(username1, password1);
  creds.push({ username: username1, password: password1 });

  // Create a car and link to user1 (images as JSON array)
  const car1 = await createCarWithOwner(
    user1.id,
    "A reliable compact",
    ["https://picsum.photos/seed/car1/800/600"],
    "Toyota",
    "Corolla",
    2020
  );

  // Add favorite and review by user1
  await addFavorite(user1.id, car1.id);
  await createReview(user1.id, car1.id, "Love this car!", 5);

  // Create second user
  const username2 = "bob";
  const password2 = "secret";
  const user2 = await createUser(username2, password2);
  creds.push({ username: username2, password: password2 });

  // Create second car and link to user2
  const car2 = await createCarWithOwner(
    user2.id,
    "Sporty and fun",
    ["https://picsum.photos/seed/car2/800/600", "https://picsum.photos/seed/car2b/800/600"],
    "Honda",
    "Civic",
    2018
  );

  // user1 favorites car2, user2 reviews car1
  await addFavorite(user1.id, car2.id);
  await createReview(user2.id, car1.id, "Nice condition", 4);

  // Write plaintext credentials to JSON for testing
  fs.writeFileSync(
    "./seed-credentials.json",
    JSON.stringify({ credentials: creds }, null, 2)
  );

  console.log("Seeding complete — credentials written to seed-credentials.json");
}
