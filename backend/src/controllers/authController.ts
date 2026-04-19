import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import User from '../models/User';
import Employee from '../models/Employee';

config();
const JWT_SECRET = process.env.JWT_SECRET || '';

export interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, address } = req.body;
    console.log('Received registration data:', {
      firstName,
      lastName,
      email,
      password,
      address,
    });

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstName: firstName || null,
      lastName: lastName || null,
      address: address || null,
      id: Math.floor(Math.random() * 1000000),
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEntrance: new Date(),
    });

    const payload = { id: newUser.get('id'), email: newUser.get('email') };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    const safeUser = {
      id: newUser.get('id'),
      firstName: newUser.get('firstName'),
      lastName: newUser.get('lastName'),
      email: newUser.get('email'),
      role: newUser.get('role') || 'customer',
    };
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password are required' });

    // Check users table first (customers/admins)
    const user = await User.findOne({ where: { email } });
    if (user) {
      const hashedPassword = (user.get('password') as string) || '';
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordValid)
        return res.status(401).json({ message: 'Invalid credentials' });

      const payload = { id: user.get('id'), email: user.get('email') };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      const safeUser = {
        id: user.get('id'),
        firstName: user.get('firstName'),
        lastName: user.get('lastName'),
        email: user.get('email'),
        role: user.get('role') || 'customer',
      };
      return res.json({ token, user: safeUser });
    }

    // Check employees table (professionals)
    const employee = await Employee.findOne({ where: { email } });
    if (!employee) return res.status(401).json({ message: 'Invalid credentials' });

    const empPassword = employee.password || '';
    const isEmpPasswordValid = await bcrypt.compare(password, empPassword);
    if (!isEmpPasswordValid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: employee.id, email: employee.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      user: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: 'professional',
        status: employee.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err });
  }
};

export const registerProfessional = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      categoryId,
      yearsOfExperience,
      description,
      serviceAreas,
      workingHours,
      services,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists in either table
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'כתובת האימייל כבר קיימת במערכת' });
    }
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(409).json({ message: 'כתובת האימייל כבר קיימת במערכת' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee record
    const newEmployee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      area: serviceAreas?.[0] || null,
      description: description || null,
      yearsOfExperience: yearsOfExperience || null,
      workingHours: workingHours || null,
      services: services || null,
      status: 'pending',
    });

    const payload = { id: newEmployee.id, email: newEmployee.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({
      token,
      user: {
        id: newEmployee.id,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        role: 'professional',
        status: newEmployee.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      // Check employees table
      const employee = await Employee.findByPk(req.user.id);
      if (!employee) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: 'professional',
        status: employee.status,
      });
    }

    const safeUser = {
      id: user.get('id'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName'),
      email: user.get('email'),
      role: user.get('role') || 'customer',
    };
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
};
