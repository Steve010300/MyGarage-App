import express from "express";
const app = express();
export default app;

import usersRouter from "#api/users";
import carsRouter from "#api/cars";
import favoritesRouter from "#api/favorites";
import reviewsRouter from "#api/reviews";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import cors from "cors";
import morgan from "morgan";

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));

app.use(morgan("dev"));

// Allow larger JSON bodies (e.g. base64-encoded images from the frontend)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(getUserFromToken);

app.get("/", (req, res) => res.send("Hello, World!"));

app.use("/users", usersRouter);
app.use("/cars", carsRouter);
app.use("/favorites", favoritesRouter);
app.use("/reviews", reviewsRouter);

app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  // Express/body-parser uses this type for oversized request bodies.
  if (err && err.type === "entity.too.large") {
    return res.status(413).send("Upload too large. Please use a smaller image.");
  }
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});
