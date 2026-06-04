import * as categoryDAL from "../dal/categoryDAL";

export const getAllCategories = async (): Promise<any[]> => {
  return categoryDAL.findAll();
};

export const getCategoryById = async (id: number): Promise<any | null> => {
  try {
    return categoryDAL.findById(id);
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    throw error;
  }
};

export const createCategory = async (category: any): Promise<any> => {
  return categoryDAL.create(category);
};

export const updateCategory = async (
  id: number,
  updates: Partial<any>
): Promise<any | null> => {
  return categoryDAL.update(id, updates);
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  return categoryDAL.delete_(id);
};

export const getCategoriesByFatherCategory = async (
  fatherCategory: string
): Promise<any[]> => {
  return categoryDAL.findByFatherCategory(fatherCategory);
};
