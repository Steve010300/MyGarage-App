DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS my_cars;


CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT cars_year_check CHECK (year > 1885)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  review TEXT,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE my_cars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE
);

-- Useful indexes for faster lookups on foreign keys and common filters
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars (make, model);
CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON reviews (car_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car_id ON favorites (car_id);
CREATE INDEX IF NOT EXISTS idx_my_cars_user_id ON my_cars (user_id);
CREATE INDEX IF NOT EXISTS idx_my_cars_car_id ON my_cars (car_id);

-- Prevent duplicate favorites and duplicate my_cars entries
ALTER TABLE favorites
  ADD CONSTRAINT unique_user_car_favorite UNIQUE (user_id, car_id);

ALTER TABLE my_cars
  ADD CONSTRAINT unique_user_car_mycars UNIQUE (user_id, car_id);