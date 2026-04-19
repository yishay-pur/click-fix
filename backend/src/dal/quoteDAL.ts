import Quote from '../models/Quote';
import QuoteResponse from '../models/QuoteResponse';
import User from '../models/User';
import Employee from '../models/Employee';
import Category from '../models/Category';

/**
 * Quote Data Access Layer (Sequelize)
 */

export const findAll = async (): Promise<any[]> => {
  return Quote.findAll({
    include: [
      { model: User, as: 'customer' },
      { model: Employee, as: 'professional' },
      { model: Category, as: 'category' },
      { model: QuoteResponse, as: 'response' },
    ],
  });
};

export const findById = async (id: number): Promise<any | null> => {
  return Quote.findByPk(id, {
    include: [
      { model: User, as: 'customer' },
      { model: Employee, as: 'professional' },
      { model: Category, as: 'category' },
      { model: QuoteResponse, as: 'response' },
    ],
  });
};

export const findByCustomerId = async (
  customerId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
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
};

export const findByProfessionalId = async (
  professionalId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
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
};

export const create = async (quoteData: {
  customerId: number | null;
  professionalId: number;
  categoryId: number | null;
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
  return Quote.create(quoteData as any);
};

export const update = async (
  id: number,
  updates: Partial<{
    status: string;
    respondedAt: Date;
  }>
): Promise<any | null> => {
  const quote = await Quote.findByPk(id);
  if (!quote) return null;
  await quote.update(updates as any);
  return quote;
};

export const delete_ = async (id: number): Promise<boolean> => {
  const deleted = await Quote.destroy({ where: { id } });
  return deleted > 0;
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
  return QuoteResponse.create(responseData as any);
};

export const findResponseByQuoteId = async (
  quoteId: number
): Promise<any | null> => {
  return QuoteResponse.findOne({
    where: { quoteId },
    include: [{ model: Employee, as: 'professional' }],
  });
};
