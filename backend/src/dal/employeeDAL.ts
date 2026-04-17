import Employee from "../models/Employee";
import Review from "../models/Review";
import { Op } from "sequelize";

/**
 * Employee Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  try {
    return Employee.findAll({ include: ["reviews"] });
  } catch (error) {
    console.error("Error in employeeDAL.findAll:", error);
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return Employee.findByPk(id, { include: ["reviews", "categories"] });
  } catch (error) {
    console.error("Error in employeeDAL.findById:", error);
    throw error;
  }
};

export const findByCategory = async (categoryId: number): Promise<any[]> => {
  try {
    return Employee.findAll({ where: { categoryId } });
  } catch (error) {
    console.error("Error in employeeDAL.findByCategory:", error);
    throw error;
  }
};

export const findByArea = async (area: string): Promise<any[]> => {
  try {
    return Employee.findAll({ where: { area } });
  } catch (error) {
    console.error("Error in employeeDAL.findByArea:", error);
    throw error;
  }
};

export const findByMinRating = async (minRating: number): Promise<any[]> => {
  try {
    return Employee.findAll({ where: { avgRate: { [Op.gte]: minRating } } as any });
  } catch (error) {
    console.error("Error in employeeDAL.findByMinRating:", error);
    throw error;
  }
};

export const create = async (
  employee: Omit<any, "id" | "reviews">
): Promise<any> => {
  try {
    return Employee.create(employee as any);
  } catch (error) {
    console.error("Error in employeeDAL.create:", error);
    throw error;
  }
};

export const update = async (
  id: number,
  updates: Partial<Omit<any, "id" | "reviews">>
): Promise<any | null> => {
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) return null;
    await employee.update(updates as any);
    return employee;
  } catch (error) {
    console.error("Error in employeeDAL.update:", error);
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await Employee.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    console.error("Error in employeeDAL.delete_:", error);
    throw error;
  }
};

export const updateRatings = async (employeeId: number): Promise<void> => {
  try {
    const reviews = await Review.findAll({ where: { employeeId } });
    if (!reviews || reviews.length === 0) return;

    const count = reviews.length;
    const avgRate = reviews.reduce((s, r) => s + (r.get("rate") as number), 0) / count;
    const avgPriceRate = reviews.reduce((s, r) => s + (r.get("priceRate") as number), 0) / count;
    const avgPerformanceRate = reviews.reduce((s, r) => s + (r.get("performanceRate") as number), 0) / count;
    const avgServiceRate = reviews.reduce((s, r) => s + (r.get("serviceRate") as number), 0) / count;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) return;
    await employee.update({
      avgRate,
      avgPriceRate,
      avgPerformanceRate,
      avgServiceRate,
    } as any);
  } catch (error) {
    console.error("Error in employeeDAL.updateRatings:", error);
    throw error;
  }
};
