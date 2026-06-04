import { Request, Response } from "express";
import Employee from "../models/Employee";
import Quote from "../models/Quote";
import { sequelize } from "../config/database";
import { Op } from "sequelize";

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          association: "categories",
          through: { attributes: [] },
        },
        {
          association: "reviews",
          include: ["user"],
        },
      ],
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', (error as Error).message);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(Number(id), {
      include: [
        {
          association: "categories",
          through: { attributes: [] },
        },
        {
          association: "reviews",
          include: ["user"],
        },
      ],
    });
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee" });
  }
};

export const getEmployeesByCategory = (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      res.status(400).json({ message: "categoryId query parameter required" });
      return;
    }

    // This endpoint would query employees by category if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
};

export const getEmployeesByArea = (req: Request, res: Response) => {
  try {
    const { area } = req.query;
    if (!area) {
      res.status(400).json({ message: "area query parameter required" });
      return;
    }

    // This endpoint would query employees by area if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
};

export const getEmployeesByRating = (req: Request, res: Response) => {
  try {
    const { minRating } = req.query;
    if (!minRating) {
      res.status(400).json({ message: "minRating query parameter required" });
      return;
    }

    // This endpoint would query employees by rating if needed
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, area, gender, email, phone, description, yearsOfExperience, workingHours, services, certificates } = req.body;

    if (!firstName || !lastName || !phone) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      area,
      gender,
      email,
      phone,
      description,
      yearsOfExperience,
      workingHours,
      services,
      certificates,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error creating employee" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findByPk(Number(id));
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    await employee.update(updates);
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee" });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(Number(id));
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    await employee.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee" });
  }
};

// GET /api/employees/:id/stats - Get professional dashboard stats
export const getEmployeeStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(Number(id));
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Count quotes by status
    const [pendingCount, respondedCount, acceptedCount, totalCount] = await Promise.all([
      Quote.count({ where: { professionalId: Number(id), status: 'pending' } }),
      Quote.count({ where: { professionalId: Number(id), status: 'responded' } }),
      Quote.count({ where: { professionalId: Number(id), status: 'accepted' } }),
      Quote.count({ where: { professionalId: Number(id) } }),
    ]);

    const conversionRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

    res.json({
      profileViews: {
        today: 0,
        week: 0,
        month: 0,
      },
      requests: {
        new: pendingCount,
        inProgress: respondedCount,
        completed: acceptedCount,
      },
      conversionRate,
    });
  } catch (error) {
    console.error("Error fetching employee stats:", (error as Error).message);
    res.status(500).json({ message: "Error fetching employee stats" });
  }
};

// GET /api/employees/:id/recent-requests - Get recent quote requests for professional
export const getRecentRequests = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 5;

    const quotes = await Quote.findAll({
      where: { professionalId: Number(id) },
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        { association: 'customer', attributes: ['id', 'firstName', 'lastName'] },
        { association: 'category', attributes: ['id', 'name'] },
      ],
    });

    const requests = quotes.map((quote: any) => ({
      id: String(quote.id),
      customerId: String(quote.customerId),
      customerName: quote.customer
        ? `${quote.customer.firstName} ${quote.customer.lastName}`
        : quote.guestName || 'אורח',
      professionalId: String(quote.professionalId),
      professionalName: '',
      categoryId: String(quote.categoryId),
      answers: quote.answers || [],
      description: quote.description,
      urgency: quote.urgency,
      responseMethod: quote.responseMethod,
      status: quote.status,
      createdAt: quote.createdAt,
      respondedAt: quote.respondedAt,
    }));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching recent requests:", (error as Error).message);
    res.status(500).json({ message: "Error fetching recent requests" });
  }
};

// GET /api/employees/search - Search employees with filters
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { query, category, city, gender, minRating, shomerShabbat, page = 1, limit = 100 } = req.query;
    const offset = ((Number(page) || 1) - 1) * (Number(limit) || 100);

    const where: any = { status: 'approved' };

    // Filter by search query (search in firstName, lastName, description)
    if (query) {
      const searchTerm = `%${query}%`;
      where[Op.or] = [
        sequelize.where(sequelize.fn('LOWER', sequelize.col('firstName')), 'LIKE', searchTerm.toLowerCase()),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('lastName')), 'LIKE', searchTerm.toLowerCase()),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), 'LIKE', searchTerm.toLowerCase()),
      ];
    }

    // Filter by city/area
    if (city) {
      where.area = city;
    }

    // Filter by gender
    if (gender) {
      where.gender = gender;
    }

    // Filter professionals who do not work on Saturday
    if (shomerShabbat === 'true') {
      where[Op.and] = [
        { workingHours: { Saturday: null } },
      ];
    }

    // Find employees
    const { count: total, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        {
          association: 'categories',
          through: { attributes: [] },
          where: category ? { id: Number(category) } : undefined,
          required: category ? true : false,
        },
        {
          association: 'reviews',
          required: false,
          attributes: ['id', 'priceRate', 'serviceRate', 'performanceRate'],
        },
      ],
      offset,
      limit: Number(limit) || 100,
      distinct: true,
      order: [['createdAt', 'DESC']],
    });

    // Map to response format with calculated ratings
    const professionals = employees
      .map((emp: any) => {
        const reviews = emp.reviews || [];
        const reviewCount = reviews.length;
        const avgPrice = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.priceRate || 0), 0) / reviewCount : 0;
        const avgService = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.serviceRate || 0), 0) / reviewCount : 0;
        const avgPerformance = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.performanceRate || 0), 0) / reviewCount : 0;
        const overallRating = reviewCount > 0 ? (avgPrice + avgService + avgPerformance) / 3 : 0;

        return {
          id: String(emp.id),
          email: emp.email,
          firstName: emp.firstName,
          lastName: emp.lastName,
          phone: emp.phone,
          city: emp.area,
          gender: emp.gender,
          role: 'professional',
          status: emp.status,
          categoryId: emp.categories?.[0]?.id?.toString() || '',
          categoryName: emp.categories?.[0]?.name || '',
          description: emp.description,
          yearsOfExperience: emp.yearsOfExperience,
          serviceAreas: [emp.area].filter(Boolean),
          workingHours: emp.workingHours,
          services: emp.services || [],
          certificates: emp.certificates || [],
          rating: {
            overall: Number(overallRating.toFixed(1)),
            reliability: Number(avgPerformance.toFixed(1)),
            service: Number(avgService.toFixed(1)),
            availability: 4.5,
            price: Number(avgPrice.toFixed(1)),
            professionalism: Number(avgPerformance.toFixed(1)),
          },
          reviewCount,
          isVerified: emp.status === 'approved',
          approvedAt: emp.approvedAt,
          createdAt: emp.createdAt,
          updatedAt: emp.updatedAt,
        };
      })
      .filter(prof => !minRating || prof.rating.overall >= Number(minRating));

    const pageSize = Number(limit) || 100;
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      professionals,
      total,
      page: Number(page) || 1,
      limit: pageSize,
      totalPages,
    });
  } catch (error) {
    console.error('Error searching employees:', (error as Error).message);
    res.status(500).json({ message: 'Error searching employees' });
  }
};
