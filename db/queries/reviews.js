import db from "#db/client";

export async function createReview(userId, carId, review, rating) {
  const sql = `
  INSERT INTO reviews
    (user_id, car_id, review, rating)
  VALUES
    ($1, $2, $3, $4)
  RETURNING *
  `;
  const {
      rows: [createdReview],
  } = await db.query(sql, [userId, carId, review, rating]);
  return createdReview;
}

export async function getReviewById(id) {
  const sql = `
  SELECT * FROM reviews WHERE id = $1
  `;
  const {
    rows: [review],
  } = await db.query(sql, [id]);
  return review;
}

  export async function getReviewsByCarId(carId) {
    const sql = `
    SELECT * FROM reviews WHERE car_id = $1 ORDER BY id
    `;
    const { rows: reviews } = await db.query(sql, [carId]);
    return reviews;
  }

  export async function getReviewsByUserId(userId) {
    const sql = `
    SELECT * FROM reviews WHERE user_id = $1 ORDER BY id
    `;
    const { rows: reviews } = await db.query(sql, [userId]);
    return reviews;
  }

  export async function updateReview(id, reviewText, rating) {
    const sql = `
    UPDATE reviews
    SET review = $2,
        rating = $3
    WHERE id = $1
    RETURNING *
    `;
    const {
      rows: [updatedReview],
    } = await db.query(sql, [id, reviewText, rating]);
    return updatedReview;
  }

  export async function deleteReview(id) {
    const sql = `DELETE FROM reviews WHERE id = $1 RETURNING *`;
    const {
      rows: [deletedReview],
    } = await db.query(sql, [id]);
    return deletedReview;
  }

  export async function getReviewStatsForCar(carId) {
    const sql = `
    SELECT COALESCE(AVG(rating),0) AS avg_rating, COUNT(*) AS review_count
    FROM reviews
    WHERE car_id = $1
    `;
    const { rows: [stats] } = await db.query(sql, [carId]);
    return stats;
  }

  export async function getReviewsWithUser(carId) {
    const sql = `
    SELECT reviews.*, users.username
    FROM reviews
    JOIN users ON users.id = reviews.user_id
    WHERE reviews.car_id = $1
    ORDER BY reviews.id
    `;
    const { rows: reviews } = await db.query(sql, [carId]);
    return reviews;
  }