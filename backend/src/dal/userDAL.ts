import User from "../models/User";

/**
 * User Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  try {
    return User.findAll();
  } catch (error) {
    console.error("Error in userDAL.findAll:", error);
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return User.findByPk(id);
  } catch (error) {
    console.error("Error in userDAL.findById:", error);
    throw error;
  }
};

export const findByEmail = async (email: string): Promise<any | null> => {
  try {
    return User.findOne({ where: { email } });
  } catch (error) {
    console.error("Error in userDAL.findByEmail:", error);
    throw error;
  }
};

export const findByUsername = async (
  username: string
): Promise<any | null> => {
  try {
    return User.findOne({ where: { username } });
  } catch (error) {
    console.error("Error in userDAL.findByUsername:", error);
    throw error;
  }
};

export const create = async (user: Omit<any, "id" | "reviews">): Promise<any> => {
  try {
    return User.create(user as any);
  } catch (error) {
    console.error("Error in userDAL.create:", error);
    throw error;
  }
};

export const update = async (
  id: number,
  updates: Partial<Omit<any, "id" | "reviews">>
): Promise<any | null> => {
  try {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(updates as any);
    return user;
  } catch (error) {
    console.error("Error in userDAL.update:", error);
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    console.error("Error in userDAL.delete_:", error);
    throw error;
  }
};
