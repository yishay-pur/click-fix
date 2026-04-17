import Quote from '../models/Quote';
import QuoteResponse from '../models/QuoteResponse';
import User from '../models/User';
import Employee from '../models/Employee';
import Category from '../models/Category';

/**
 * Quote Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  try {
    return Quote.findAll({
      include: [
        { model: User, as: 'customer' },
        { model: Employee, as: 'professional' },
        { model: Category, as: 'category' },
        { model: QuoteResponse, as: 'response' },
      ],
    });
  } catch (error) {
    console.error("Error in quoteDAL.findAll:", error);
    throw error;
  }
};

export const findById = async (id: number): Promise<any | null> => {
  try {
    return Quote.findByPk(id, {
      include: [
        { model: User, as: 'customer' },
        { model: Employee, as: 'professional' },
        { model: Category, as: 'category' },
        { model: QuoteResponse, as: 'response' },
      ],
    });
  } catch (error) {
    console.error("Error in quoteDAL.findById:", error);
    throw error;
  }
};

export const findByCustomerId = async (
  customerId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
  try {
    const { page = 1, limit = 10, status } = options || {};
    const offset = (page - 1) * limit;

    const where: any = { customerId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Quote.findAndCountAll({
      where,
      include: [
        { model: Employee, as: 'professional' },
        { model: Category, as: 'category' },
        { model: QuoteResponse, as: 'response' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return { quotes: rows, total: count };
  } catch (error) {
    console.error("Error in quoteDAL.findByCustomerId:", error);
    throw error;
  }
};

export const findByProfessionalId = async (
  professionalId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
  try {
    const { page = 1, limit = 10, status } = options || {};
    const offset = (page - 1) * limit;

    const where: any = { professionalId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Quote.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer' },
        { model: Category, as: 'category' },
        { model: QuoteResponse, as: 'response' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return { quotes: rows, total: count };
  } catch (error) {
    console.error("Error in quoteDAL.findByProfessionalId:", error);
    throw error;
  }
};

export const create = async (quoteData: {
  customerId: number | null;
  professionalId: number;
  categoryId: number;
  guestName?: string | null;
  guestEmail?: string | null;
  answers: Array<{
    questionId: string;
    question: string;
    answer: string | string[] | number;
  }>;
  description?: string;
  urgency: 'low' | 'medium' | 'high';
  responseMethod: 'system' | 'phone';
}): Promise<any> => {
  try {
    return Quote.create(quoteData as any);
  } catch (error) {
    console.error("Error in quoteDAL.create:", error);
    throw error;
  }
};

export const update = async (
  id: number,
  updates: Partial<{
    status: string;
    respondedAt: Date;
  }>
): Promise<any | null> => {
  try {
    const quote = await Quote.findByPk(id);
    if (!quote) return null;
    await quote.update(updates as any);
    return quote;
  } catch (error) {
    console.error("Error in quoteDAL.update:", error);
    throw error;
  }
};

export const delete_ = async (id: number): Promise<boolean> => {
  try {
    const deleted = await Quote.destroy({ where: { id } });
    return deleted > 0;
  } catch (error) {
    console.error("Error in quoteDAL.delete_:", error);
    throw error;
  }
};

// QuoteResponse DAL functions
export const createResponse = async (responseData: {
  quoteId: number;
  professionalId: number;
  price: number;
  availability: string;
  notes?: string;
  validUntil: Date;
}): Promise<any> => {
  try {
    return QuoteResponse.create(responseData as any);
  } catch (error) {
    console.error("Error in quoteDAL.createResponse:", error);
    throw error;
  }
};

export const findResponseByQuoteId = async (
  quoteId: number
): Promise<any | null> => {
  try {
    return QuoteResponse.findOne({
      where: { quoteId },
      include: [{ model: Employee, as: 'professional' }],
    });
  } catch (error) {
    console.error("Error in quoteDAL.findResponseByQuoteId:", error);
    throw error;
  }
};
