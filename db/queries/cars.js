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
  const sql = `SELECT * FROM cars WHERE make = $1`;
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