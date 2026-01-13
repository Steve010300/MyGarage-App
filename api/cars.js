import express from "express";
import requireBody from "#middleware/requireBody";
import getUserFromToken from "#middleware/getUserFromToken";
import {
	createCar,
	createCarWithOwner,
    getCarById,
    getCarWithOwnerById,
	getAllCars,
	updateCar,
	deleteCar,
	getCarsByMake,
	searchCars,
	getCarsWithReviewStats,
    getCarsByOwnerId,
	getMyCars,
} from "#db/queries/cars";
import { getMyCars as checkMyCars } from "#db/queries/cars";

const router = express.Router();

// Public routes
router.get("/", async (req, res) => {
	try {
        const cars = await getAllCars();
	res.send(cars); 
    } catch (error) {
        console.error("Error fetching all cars:", error);
        res.status(500).send("Internal server error");  
    }
});

router.get("/stats", async (req, res) => {
	try {
        const cars = await getCarsWithReviewStats();
        res.send(cars);
    } catch (error) {
        console.error("Error fetching cars with review stats:", error);
        res.status(500).send("Internal server error");
    }   
});

router.get("/search", async (req, res) => {
	try {
        const term = req.query.term || "";
        const cars = await searchCars(term);
        res.send(cars);
    } catch (error) {
        console.error("Error searching cars:", error);
        res.status(500).send("Internal server error");  
    }
});

router.get("/make/:make", async (req, res) => {
	try {
        const cars = await getCarsByMake(req.params.make);
	    res.send(cars);
    } catch (error) {
        console.error("Error fetching cars by make:", error);
        res.status(500).send("Internal server error");
    }
});

// Current user's uploaded cars
router.get("/me", getUserFromToken, async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Authentication required.");
        const cars = await getCarsByOwnerId(req.user.id);
        res.send(cars);
    } catch (error) {
        console.error("Error fetching my cars:", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/:id", async (req, res) => {
	try {
        const car = await getCarWithOwnerById(req.params.id);
	    if (!car) return res.status(404).send("Car not found.");
	    res.send(car);
    } catch (error) {
        console.error("Error fetching car:", error);
        res.status(500).send("Internal server error");
    }
});

// Protected routes (attach user if token provided)
router.post("/", getUserFromToken, requireBody(["description", "images", "make", "model", "year"]), async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
        const { description, images, make, model, year } = req.body;
        const created = await createCarWithOwner(req.user.id, description, images, make, model, year);
        res.status(201).send(created);
    } catch (error) {
        console.error("Error creating car:", error);
        res.status(500).send("Internal server error");
    }
});     

router.patch("/:id", getUserFromToken, async (req, res) => {
	try {if (!req.user) return res.status(401).send("Authentication required.");
	    const { description, images, make, model, year } = req.body;
	    // verify ownership via my_cars pivot
	    const owned = await checkMyCars(req.user.id, req.params.id);
	    if (!owned || owned.length === 0) return res.status(403).send("Not owner of this car.");
	    const updated = await updateCar(req.params.id, description, images, make, model, year);
	    res.send(updated);
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).send("Internal server error");
    }
});

router.delete("/:id", getUserFromToken, async (req, res) => {
	try {
        if (!req.user) return res.status(401).send("Authentication required.");
	    const owned = await checkMyCars(req.user.id, req.params.id);
	    if (!owned || owned.length === 0) return res.status(403).send("Not owner of this car.");
	    const deleted = await deleteCar(req.params.id);
	    res.send(deleted);
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).send("Internal server error");
    }
});

export default router;