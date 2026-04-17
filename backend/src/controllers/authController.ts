import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import User from "../models/User";
import { create } from "node:domain";
import { log } from "node:console";

config();
const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response) => {
  log("Received registration request with body:", req.body);

  try {
    const { firstName, lastName, email, password, address } = req.body;
    console.log("Received registration data:", {
      firstName,
      lastName,
      email,
      password,
      address,
    });

    console.log(123);
    try {
      const allUsersInDB = await User.findAll();
      console.log("all users in DB", allUsersInDB);
    } catch (err) {
      console.error("Error fetching users from DB:", err);
    }
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    log("Checking if user already exists with email:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    console.log({ existingUser });

    if (existingUser) {
      console.log("user already exsits, throw error!", { existingUser });

      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log({ password, hashedPassword });

    // Create new user
    const newUser = await User.create({
      firstName: firstName || null,
      lastName: lastName || null,
      address: address || null,
      id: Math.floor(Math.random() * 1000000),
      email,
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEntrance: new Date(),
    });

    const payload = { id: newUser.get("id"), email: newUser.get("email") };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    const safeUser = {
      id: newUser.get("id"),
      firstName: newUser.get("firstName"),
      lastName: newUser.get("lastName"),
      email: newUser.get("email"),
      role: newUser.get("role") || "customer",
    };
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare hashed passwords
    const hashedPassword = (user.get("password") as string) || "";
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user.get("id"), email: user.get("email") };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    const safeUser = {
      id: user.get("id"),
      firstName: user.get("firstName"),
      lastName: user.get("lastName"),
      email: user.get("email"),
      role: user.get("role") || "customer",
    };
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // Validate against environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ message: "Admin authentication not configured" });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Create admin user object
    const adminUser = {
      id: 0, // Special ID for admin
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      role: 'admin',
    };

    const payload = { id: 0, email: adminEmail, role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    res.json({ token, user: adminUser });
  } catch (err) {
    res.status(500).json({ message: "Admin login error", error: err });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeUser = {
      id: user.get("id"),
      firstName: user.get("firstName"),
      lastName: user.get("lastName"),
      email: user.get("email"),
      role: user.get("role") || "customer",
    };
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err });
  }
};
