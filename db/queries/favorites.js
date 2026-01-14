import db from "#db/client";

export async function addFavorite(userId, carId) {
  const sql = `
  INSERT INTO favorites
    (user_id, car_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [favorite],
  } = await db.query(sql, [userId, carId]);
  return favorite;
}

export async function getFavorites() {
  const sql = `
  SELECT *
  FROM favorites
  ORDER BY id;
  `;
  const { rows: favorites } = await db.query(sql);
  return favorites;
}

export async function getFavoritesByUserId(userId) {
  const sql = `
  SELECT *
  FROM favorites
  WHERE user_id = $1
  ORDER BY id;
  `;
  const { rows: favorites } = await db.query(sql, [userId]);
  return favorites;  
}

export async function removeFavorite(id) {
  const sql = `
  DELETE
  FROM favorites
  WHERE id = $1
  RETURNING *
  `;
  const {
    rows: [favorite],
  } = await db.query(sql, [id]);
  return favorite;
}

export async function removeFavoriteForUser(id, userId) {
  const sql = `
  DELETE
  FROM favorites
  WHERE id = $1 AND user_id = $2
  RETURNING *
  `;
  const {
    rows: [favorite],
  } = await db.query(sql, [id, userId]);
  return favorite;
}

export async function isFavorite(userId, carId) {
  const sql = `SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2 LIMIT 1`;
  const { rowCount } = await db.query(sql, [userId, carId]);
  return rowCount > 0;
}

export async function getFavoritesWithCars(userId) {
  const sql = `
  SELECT favorites.id AS favorite_id, cars.*
  FROM favorites
  JOIN cars ON cars.id = favorites.car_id
  WHERE favorites.user_id = $1
  ORDER BY favorites.id
  `;
  const { rows: favorites } = await db.query(sql, [userId]);
  return favorites;
}