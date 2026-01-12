import express from "express";
import requireBody from "#middleware/requireBody";
import getUserFromToken from "#middleware/getUserFromToken";
import {
	createReview,
	getReviewById,
	getReviewsByCarId,
	getReviewsWithUser,
	updateReview,
	deleteReview,
	getReviewsByUserId,
	getReviewStatsForCar,
} from "#db/queries/reviews";

const router = express.Router();

// Create a review (authenticated)
router.post("/", getUserFromToken, requireBody(["carId", "review", "rating"]), async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const { carId, review, rating } = req.body;
	    const created = await createReview(req.user.id, carId, review, rating);
	    res.status(201).send(created);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).send("Internal server error");
    }
});

// Get reviews for a car (with usernames)
router.get("/car/:carId", async (req, res) => {
	try {
        const reviews = await getReviewsWithUser(req.params.carId);
	    res.send(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/stats/:carId", async (req, res) => {
	try {
        const stats = await getReviewStatsForCar(req.params.carId);
        res.send(stats);
    } catch (error) {
        console.error("Error fetching review stats:", error);
        res.status(500).send("Internal server error");
    }
});

// Get review by id
router.get("/:id", async (req, res) => {
	try {
        const r = await getReviewById(req.params.id);
        if (!r) return res.status(404).send("Review not found.");
        res.send(r);
    } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).send("Internal server error");
    }
});

// Update a review (owner only)
router.patch("/:id", getUserFromToken, async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const existing = await getReviewById(req.params.id);
	    if (!existing) return res.status(404).send("Review not found.");
	    if (existing.user_id !== req.user.id) return res.status(403).send("Not allowed.");
	    const { review, rating } = req.body;
	    const updated = await updateReview(req.params.id, review, rating);
	    res.send(updated);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).send("Internal server error");
    }
});

// Delete review (owner only)
router.delete("/:id", getUserFromToken, async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
        const existing = await getReviewById(req.params.id);
        if (!existing) return res.status(404).send("Review not found.");
        if (existing.user_id !== req.user.id) return res.status(403).send("Not allowed.");
        const deleted = await deleteReview(req.params.id);
        res.send(deleted);
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).send("Internal server error"); 
    }
});

// Get reviews by user
router.get("/user/:userId", async (req, res) => {
	try {
        const reviews = await getReviewsByUserId(req.params.userId);
        	res.send(reviews);
    } catch (error) {
        console.error("Error fetching reviews by user:", error);
        res.status(500).send("Internal server error");
    }
});

export default router;