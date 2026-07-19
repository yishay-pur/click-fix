import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import User from "../models/User";
import { findByEmail } from "../dal/userDAL";
import Employee from "../models/Employee";

config();
const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, city, street, houseNumber } =
      req.body;
    const addressParts = [street, houseNumber, city].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(" ") : null;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstName: firstName || null,
      lastName: lastName || null,
      address: address || null,
      id: Math.floor(Math.random() * 1000000),
      email,
      password: hashedPassword,
      role: "customer",
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
    console.error(err);
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
    if (!user) {
      const employee = await Employee.findOne({ where: { email } });

      if (
        !employee ||
        !employee.get("password") ||
        !(await bcrypt.compare(password, employee.get("password") as string))
      ) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = { id: employee.get("id"), email: employee.get("email") };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

      const safeemployee = {
        id: employee.get("id"),
        firstName: employee.get("firstName"),
        lastName: employee.get("lastName"),
        email: employee.get("email"),
        role: employee.get("role") || "professional",
      };
      return res.json({ token, user: safeemployee });
    }

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
    console.log(1, { email, password });

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const adminOrManager = await findByEmail(email);

    console.log(2, { adminOrManager });

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (
      !adminOrManager ||
      (!adminOrManager.get("isManager") && !adminOrManager.get("isAdmin")) ||
      (!(await bcrypt.compare(
        password,
        adminOrManager.get("password") as string
      )) &&
        password !== adminOrManager.get("password"))
    ) {
      console.log(4, { adminOrManager, email, password });
      if (email === adminEmail && password === adminPassword) {
        console.log("skip validation for me because i am so cool");

        const payload = { id: 0, email, role: "admin", isAdmin: true };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
        return res.json({
          token,
          user: {
            email: adminEmail,
            role: "admin",
            isAdmin: true,
            firstName: "Admin",
            lastName: "Programer",
          },
        });
      }

      return res
        .status(500)
        .json({ message: "Admin authentication not configured" });
    }

    const payload = {
      id: 0,
      email: adminOrManager.get("email"),
      role: adminOrManager.get("isAdmin") ? "admin" : "manager",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    res.json({ token, user: adminOrManager });
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
