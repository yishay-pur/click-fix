import Review from "../models/Review";
import User from "../models/User";
import Employee from "../models/Employee";
import { Op } from "sequelize";

/**
 * Review Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  try {
    return Review.findAll({ include: ["reviewer", "employee"] });
  } catch (error) {
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return Review.findByPk(id, { include: ["reviewer", "employee"] });
  } catch (error) {
    throw error;
  }
};

export const findByEmployee = async (employeeId: number): Promise<any[]> => {
  try {
    return Review.findAll({ where: { employeeId } });
  } catch (error) {
    throw error;
  }
};

export const findByUser = async (userId: number): Promise<any[]> => {
  try {
    return Review.findAll({ where: { reviewerId: userId } });
  } catch (error) {
    throw error;
  }
};

export const findByMinRating = async (minRating: number): Promise<any[]> => {
  try {
    return Review.findAll({ where: { rate: { [Op.gte]: minRating } } as any });
  } catch (error) {
    throw error;
  }
};

export const create = async (
  review: {
    reviewerId?: number;
    employeeId?: number;
    rate: number;
    priceRate: number;
    performanceRate: number;
    serviceRate: number;
    comment: string;
  },
  date?: string
): Promise<any | null> => {
  try {
    const reviewerId = review.reviewerId;
    const employeeId = review.employeeId;
    if (!reviewerId || !employeeId) return null;

    const user = await User.findByPk(reviewerId);
    const employee = await Employee.findByPk(employeeId);
    if (!user || !employee) return null;

    const created = await Review.create({
      reviewerId,
      employeeId,
      rate: review.rate,
      priceRate: review.priceRate,
      performanceRate: review.performanceRate,
      serviceRate: review.serviceRate,
      comment: review.comment,
      createdAt: date,
    } as any);

    return created;
  } catch (error) {
    throw error;
  }
};

export const update = async (
  id: number,
  updates: Partial<{
    rate: number;
    priceRate: number;
    performanceRate: number;
    serviceRate: number;
    comment: string;
  }>
): Promise<any | null> => {
  try {
    const review = await Review.findByPk(id);
    if (!review) return null;
    await review.update(updates as any);
    return review;
  } catch (error) {
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await Review.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    throw error;
  }
};
