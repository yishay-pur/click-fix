import Category from "../models/Category";

/**
 * Category Data Access Layer (Sequelize)
 * Handles all database operations for categories
 */

export const findAll = async (): Promise<any[]> => {
  try {
    console.log(66666);
    const categories = await Category.findAll();
    console.log({ categories }, 77777);
    return categories;
  } catch (error) {
    console.error("Error in findAll:", error);
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return Category.findByPk(id);
  } catch (error) {
    console.error("Error in categoryDAL.findById:", error);
    throw error;
  }
};

export const findByFatherCategory = async (
  fatherCategory: string
): Promise<any[]> => {
  try {
    return Category.findAll({ where: { fatherCategory } });
  } catch (error) {
    console.error("Error in categoryDAL.findByFatherCategory:", error);
    throw error;
  }
};

export const create = async (category: Omit<any, "id">): Promise<any> => {
  try {
    return Category.create(category as any);
  } catch (error) {
    console.error("Error in categoryDAL.create:", error);
    throw error;
  }
};

export const update = async (
  id: number,
  updates: Partial<Omit<any, "id">>
): Promise<any | null> => {
  try {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.update(updates as any);
    return category;
  } catch (error) {
    console.error("Error in categoryDAL.update:", error);
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await Category.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    console.error("Error in categoryDAL.delete_:", error);
    throw error;
  }
};
