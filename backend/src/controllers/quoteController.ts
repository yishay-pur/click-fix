import { Request, Response } from 'express';
import * as quoteService from '../services/quoteService';
import Employee from '../models/Employee';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// Create a new quote request
export const createQuote = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id || null;
    const { professionalId, answers, description, urgency, responseMethod, guestName, guestEmail } = req.body;

    // If not authenticated, require guest info
    if (!customerId && (!guestName || !guestEmail)) {
      res.status(400).json({ message: 'Guest name and email are required for non-authenticated users' });
      return;
    }

    if (!professionalId || !answers || !urgency || !responseMethod) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Get categoryId from professional or request body
    let categoryId = req.body.categoryId || null;
    if (!categoryId) {
      const professional = await Employee.findByPk(Number(professionalId), {
        include: [{ association: 'categories', through: { attributes: [] } }],
      });
      const proCategories = (professional as any)?.categories || [];
      categoryId = proCategories[0]?.id || null;
    }

    const quote = await quoteService.createQuote({
      customerId,
      professionalId: Number(professionalId),
      categoryId,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      answers,
      description,
      urgency,
      responseMethod,
    });

    res.status(201).json({ quote });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ message: 'Error creating quote', error });
  }
};

// Get all quotes for the current customer
export const getMyQuotes = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const { quotes, total } = await quoteService.getQuotesByCustomer(
      customerId,
      { page, limit, status }
    );

    // Transform quotes to match frontend expected format
    const transformedQuotes = quotes.map((quote: any) => ({
      id: quote.id.toString(),
      customerId: quote.customerId?.toString() || null,
      customerName: quote.guestName || (quote.customer ? `${quote.customer.firstName} ${quote.customer.lastName}` : 'אורח'),
      professionalId: quote.professionalId.toString(),
      professionalName: quote.professional ? `${quote.professional.firstName} ${quote.professional.lastName}` : 'לא ידוע',
      categoryId: quote.category?.name || 'לא ידוע',
      answers: quote.answers || [],
      description: quote.description,
      urgency: quote.urgency,
      responseMethod: quote.responseMethod,
      status: quote.status,
      createdAt: quote.createdAt,
      respondedAt: quote.respondedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      quotes: transformedQuotes,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ message: 'Error fetching quotes', error });
  }
};

// Get incoming quote requests for professional
export const getIncomingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const professionalId = req.user?.id;
    if (!professionalId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const { quotes, total } = await quoteService.getQuotesByProfessional(
      professionalId,
      { page, limit, status }
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      quotes,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    res.status(500).json({ message: 'Error fetching incoming requests', error });
  }
};

// Get a single quote by ID
export const getQuoteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await quoteService.getQuoteById(Number(id));

    if (!quote) {
      res.status(404).json({ message: 'Quote not found' });
      return;
    }

    // Check if user has access to this quote
    const userId = req.user?.id;
    if (quote.customerId !== userId && quote.professionalId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Get response if exists
    const response = await quoteService.getQuoteResponse(Number(id));

    res.status(200).json({ quote, response });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ message: 'Error fetching quote', error });
  }
};

// Professional responds to a quote
export const respondToQuote = async (req: AuthRequest, res: Response) => {
  try {
    const professionalId = req.user?.id;
    if (!professionalId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { price, availability, notes, validUntil } = req.body;

    if (!price || !availability || !validUntil) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const quote = await quoteService.getQuoteById(Number(id));
    if (!quote) {
      res.status(404).json({ message: 'Quote not found' });
      return;
    }

    if (quote.professionalId !== professionalId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const response = await quoteService.createQuoteResponse({
      quoteId: Number(id),
      professionalId,
      price,
      availability,
      notes,
      validUntil: new Date(validUntil),
    });

    res.status(201).json({ response });
  } catch (error) {
    console.error('Error responding to quote:', error);
    res.status(500).json({ message: 'Error responding to quote', error });
  }
};

// Customer accepts a quote
export const acceptQuote = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const quote = await quoteService.getQuoteById(Number(id));

    if (!quote) {
      res.status(404).json({ message: 'Quote not found' });
      return;
    }

    if (quote.customerId !== customerId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const updatedQuote = await quoteService.acceptQuote(Number(id));
    res.status(200).json({ quote: updatedQuote });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({ message: 'Error accepting quote', error });
  }
};

// Customer rejects a quote
export const rejectQuote = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const quote = await quoteService.getQuoteById(Number(id));

    if (!quote) {
      res.status(404).json({ message: 'Quote not found' });
      return;
    }

    if (quote.customerId !== customerId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const updatedQuote = await quoteService.rejectQuote(Number(id));
    res.status(200).json({ quote: updatedQuote });
  } catch (error) {
    console.error('Error rejecting quote:', error);
    res.status(500).json({ message: 'Error rejecting quote', error });
  }
};
