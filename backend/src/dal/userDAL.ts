import User from "../models/User";

/**
 * User Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  try {
    return User.findAll();
  } catch (error) {
    throw error;
  }
};
export const findAdmins = async () => {
  try {
    return User.findAll({ where: { isAdmin: true } });
  } catch (error) {
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return User.findByPk(id);
  } catch (error) {
    throw error;
  }
};

export const findByEmail = async (email: string) => {
  try {
    return User.findOne({ where: { email } });
  } catch (error) {
    throw error;
  }
};

export const findByUsername = async (
  username: string
): Promise<any | null> => {
  try {
    return User.findOne({ where: { username } });
  } catch (error) {
    throw error;
  }
};

export const create = async (user: Omit<any, "id" | "reviews">): Promise<any> => {
  try {
    return User.create(user as any);
  } catch (error) {
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
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    throw error;
  }
};
