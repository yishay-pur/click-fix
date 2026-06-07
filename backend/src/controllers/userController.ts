import { Request, Response } from "express";
import User from "../models/User";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [
        {
          association: "reviews",
          include: ["employee"],
        },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', (error as Error).message);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(Number(id), {
      include: [
        {
          association: "reviews",
          include: ["employee"],
        },
      ],
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, address } = req.body;

    if (!firstName || !lastName || !email) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const user = await User.create({ firstName, lastName, email, password, address });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(Number(id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.update(updates);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(Number(id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
