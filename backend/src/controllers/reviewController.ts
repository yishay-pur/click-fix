import { Request, Response } from "express";
import Review from "../models/Review";

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      include: ["user", "employee"],
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', (error as Error).message);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(Number(id), {
      include: ["user", "employee"],
    });
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review", error });
  }
};

export const getReviewsByEmployee = (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) {
      res.status(400).json({ message: "employeeId query parameter required" });
      return;
    }

    // Query reviews by employee if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

export const getReviewsByUser = (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ message: "userId query parameter required" });
      return;
    }

    // Query reviews by user if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

export const getReviewsByRating = (req: Request, res: Response) => {
  try {
    const { minRating } = req.query;
    if (!minRating) {
      res.status(400).json({ message: "minRating query parameter required" });
      return;
    }

    // Query reviews by rating if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId, employeeId, categoryId, priceRate, serviceRate, performanceRate, comment } = req.body;

    if (!userId || !employeeId || priceRate === undefined || serviceRate === undefined || performanceRate === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const review = await Review.create({ userId, employeeId, categoryId, priceRate, serviceRate, performanceRate, comment });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const review = await Review.findByPk(Number(id));
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    await review.update(updates);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(Number(id));
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    await review.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};
