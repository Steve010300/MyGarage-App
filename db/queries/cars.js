import db from "#db/client";

export async function createCar(description, images, make, model, year) {
  const sql = `
  INSERT INTO cars
    (description, images, make, model, year)
  VALUES
    ($1, $2, $3, $4, $5)
  RETURNING *
  `;
  const imagesParam = typeof images === "string" ? images : JSON.stringify(images);
  const {
    rows: [car],
  } = await db.query(sql, [description, imagesParam, make, model, year]);
  return car;
}

export async function getCarById(id) {
  const sql = `
  SELECT * FROM cars WHERE id = $1
  `;
  const {
    rows: [car],
  } = await db.query(sql, [id]);
  return car;
}

export async function getCarWithOwnerById(id) {
  const sql = `
  SELECT DISTINCT ON (cars.id)
    cars.*,
    users.id AS owner_id,
    users.username AS owner_username
  FROM cars
  LEFT JOIN my_cars ON my_cars.car_id = cars.id
  LEFT JOIN users ON users.id = my_cars.user_id
  WHERE cars.id = $1
  ORDER BY cars.id, my_cars.id ASC
  `;
  const {
    rows: [car],
  } = await db.query(sql, [id]);
  return car;
}

export async function getAllCars() {
  const sql = `SELECT * FROM cars`;
  const { rows: cars } = await db.query(sql);
  return cars;
}

export async function updateCar(id, description, images, make, model, year) {
  const sql = `
  UPDATE cars
  SET description = $2,
      images = $3,
      make = $4,
      model = $5,
      year = $6
  WHERE id = $1
  RETURNING *
  `;
  const imagesParam = typeof images === "string" ? images : JSON.stringify(images);
  const {
    rows: [car],
  } = await db.query(sql, [id, description, imagesParam, make, model, year]);
  return car;
}

export async function deleteCar(id) {
  const sql = `DELETE FROM cars WHERE id = $1 RETURNING *`;
  const {
    rows: [car],
  } = await db.query(sql, [id]);
  return car;
}

export async function getCarsByMake(make) {
  const sql = `SELECT * FROM cars WHERE LOWER(make) = LOWER($1)`;
  const { rows: cars } = await db.query(sql, [make]);
  return cars;
}

export async function searchCars(term) {
  const sql = `
  SELECT * FROM cars
  WHERE make ILIKE $1 OR model ILIKE $1 OR description ILIKE $1
  `;
  const q = `%${term}%`;
  const { rows: cars } = await db.query(sql, [q]);
  return cars;
}

export async function getCarsWithReviewStats() {
  const sql = `
  SELECT cars.*, COALESCE(AVG(reviews.rating),0) AS avg_rating, COUNT(reviews.id) AS review_count
  FROM cars
  LEFT JOIN reviews ON reviews.car_id = cars.id
  GROUP BY cars.id
  `;
  const { rows: cars } = await db.query(sql);
  return cars;
}

export async function getCarsByOwnerId(userId) {
  const sql = `
  SELECT cars.*, COALESCE(AVG(reviews.rating),0) AS avg_rating, COUNT(reviews.id) AS review_count
  FROM my_cars
  JOIN cars ON cars.id = my_cars.car_id
  LEFT JOIN reviews ON reviews.car_id = cars.id
  WHERE my_cars.user_id = $1
  GROUP BY cars.id, my_cars.id
  ORDER BY my_cars.id DESC
  `;
  const { rows: cars } = await db.query(sql, [userId]);
  return cars;
}


export async function getMyCars(userId, carId) {
  const sql = `
  SELECT * FROM my_cars WHERE user_id = $1 AND car_id = $2
  `;
  const { rows: myCars } = await db.query(sql, [userId, carId]);
  return myCars;
}

export async function createCarWithOwner(userId, description, images, make, model, year) {
  try {
    await db.query("BEGIN");
    const insertCarSql = `
      INSERT INTO cars (description, images, make, model, year)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const imagesParam = typeof images === "string" ? images : JSON.stringify(images);
    const { rows: [car] } = await db.query(insertCarSql, [description, imagesParam, make, model, year]);

    const insertPivotSql = `
      INSERT INTO my_cars (user_id, car_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    await db.query(insertPivotSql, [userId, car.id]);

    await db.query("COMMIT");
    return car;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}