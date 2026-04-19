import * as quoteDAL from '../dal/quoteDAL';

export const getAllQuotes = async (): Promise<any[]> => {
  return quoteDAL.findAll();
};

export const getQuoteById = async (id: number): Promise<any | null> => {
  return quoteDAL.findById(id);
};

export const getQuotesByCustomer = async (
  customerId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
  return quoteDAL.findByCustomerId(customerId, options);
};

export const getQuotesByProfessional = async (
  professionalId: number,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ quotes: any[]; total: number }> => {
  return quoteDAL.findByProfessionalId(professionalId, options);
};

export const createQuote = async (quoteData: {
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
  return quoteDAL.create(quoteData);
};

export const updateQuote = async (
  id: number,
  updates: Partial<{
    status: string;
    respondedAt: Date;
  }>
): Promise<any | null> => {
  return quoteDAL.update(id, updates);
};

export const deleteQuote = async (id: number): Promise<boolean> => {
  return quoteDAL.delete_(id);
};

export const createQuoteResponse = async (responseData: {
  quoteId: number;
  professionalId: number;
  price: number;
  availability: string;
  notes?: string;
  validUntil: Date;
}): Promise<any> => {
  // Update quote status to 'responded'
  await quoteDAL.update(responseData.quoteId, {
    status: 'responded',
    respondedAt: new Date(),
  });

  return quoteDAL.createResponse(responseData);
};

export const getQuoteResponse = async (
  quoteId: number
): Promise<any | null> => {
  return quoteDAL.findResponseByQuoteId(quoteId);
};

export const acceptQuote = async (quoteId: number): Promise<any | null> => {
  return quoteDAL.update(quoteId, { status: 'accepted' });
};

export const rejectQuote = async (quoteId: number): Promise<any | null> => {
  return quoteDAL.update(quoteId, { status: 'rejected' });
};
