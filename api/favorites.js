import express from "express";
import requireBody from "#middleware/requireBody";
import getUserFromToken from "#middleware/getUserFromToken";
import {
	addFavorite,
	getFavorites,
	getFavoritesByUserId,
	removeFavoriteForUser,
	isFavorite,
	getFavoritesWithCars,
} from "#db/queries/favorites";

const router = express.Router();

// Add a favorite (user must be authenticated)
router.post("/", getUserFromToken, requireBody(["carId"]), async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const { carId } = req.body;
	    const exists = await isFavorite(req.user.id, carId);
	    if (exists) return res.status(409).send("Already favorited.");
	    const favorite = await addFavorite(req.user.id, carId);
	    res.status(201).send(favorite);
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).send("Internal server error");
    }
});

// Get current user's favorites with car details
router.get("/me", getUserFromToken, async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const favorites = await getFavoritesWithCars(req.user.id);
	    res.send(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).send("Internal server error");
    }
});

// Remove favorite by id (ensure belongs to user)
router.delete("/:id", getUserFromToken, async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const deleted = await removeFavoriteForUser(req.params.id, req.user.id);
	    if (!deleted) return res.status(404).send("Favorite not found.");
	    res.send(deleted);
    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).send("Internal server error");
    }
});


export default router;

