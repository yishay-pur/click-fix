import User from "../models/User";

export const findByEmail = async (email: string) => {
  try {
    return User.findOne({ where: { email } });
  } catch (error) {
    throw error;
  }
};
