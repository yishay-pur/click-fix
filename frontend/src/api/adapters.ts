/**
 * Adapters - Translation layer between Server API and Frontend UI
 *
 * The server returns data in a specific format, but the UI expects different structures.
 * These adapters convert server responses to UI-compatible formats.
 */

import type { Chat, Message } from "../types/chat.types";
import type { Notification } from "../types/notification.types";
import type { Complaint } from "../types/complaint.types";
import type {
  ServerChat,
  ServerMessage,
  ServerNotification,
  ServerComplaint,
  ServerAuthResponse,
  ServerCategory,
  ServerEmployee,
  ServerReview,
  ServerUser,
} from "../types/server.types";
import {
  Category,
  Professional,
  RatingBreakdown,
  Review,
  User,
  UserRole,
} from "../types";

export const adaptServerAuthToUser = (
  serverAuth: ServerAuthResponse,
  role: UserRole = "customer"
): { user: User; token: string } => {
  return {
    token: serverAuth.token,
    user: {
      id: serverAuth.user.id.toString(),
      email: serverAuth.user.email,
      firstName: serverAuth.user.firstName || "",
      lastName: serverAuth.user.lastName || "",
      phone: "",
      role: (serverAuth.user.role as UserRole) || role,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
};

/**
 * Convert full server user to frontend User
 */
export const adaptServerUserToUser = (
  serverUser: ServerUser,
  role: UserRole = "customer"
): User => {
  return {
    id: serverUser.id.toString(),
    email: serverUser.email,
    firstName: serverUser.firstName || "",
    lastName: serverUser.lastName || "",
    phone: "",
    city: serverUser.address || undefined,
    role,
    status: "active",
    createdAt: new Date(serverUser.createdAt),
    updatedAt: new Date(serverUser.updatedAt),
  };
};

// ============================================
// Employee to Professional Adapters
// ============================================

/**
 * Convert server Employee to frontend Professional format
 */
export const adaptEmployeeToProfessional = (
  employee: ServerEmployee
): Professional => {
  const rating = calculateRatingFromServerReviews(employee.reviews || []);
  const category = employee.categories?.[0];

  return {
    id: employee.id.toString(),
    email: employee.email || "",
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    phone: employee.phone,
    city: employee.area || undefined,
    role: "professional",
    status: "approved",
    categoryId: category?.id?.toString() || "",
    categoryName: category?.name || "",
    description: category?.description || "",
    yearsOfExperience: undefined,
    serviceAreas: employee.area ? [employee.area] : [],
    workingHours: [],
    services: [],
    certificates: [],
    profileImage: undefined,
    rating,
    reviewCount: employee.reviews?.length || 0,
    isVerified: true,
    createdAt: new Date(employee.createdAt),
    updatedAt: new Date(employee.updatedAt),
  };
};

/**
 * Calculate rating breakdown from server reviews
 */
const calculateRatingFromServerReviews = (
  reviews: ServerReview[]
): RatingBreakdown => {
  if (!reviews || reviews.length === 0) {
    return {
      overall: 0,
      reliability: 0,
      service: 0,
      availability: 0,
      price: 0,
      professionalism: 0,
    };
  }

  const totals = reviews.reduce(
    (acc, review) => ({
      price: acc.price + (review.priceRate || 0),
      service: acc.service + (review.serviceRate || 0),
      performance: acc.performance + (review.performanceRate || 0),
    }),
    { price: 0, service: 0, performance: 0 }
  );

  const count = reviews.length;
  const priceAvg = totals.price / count;
  const serviceAvg = totals.service / count;
  const performanceAvg = totals.performance / count;
  const overall = (priceAvg + serviceAvg + performanceAvg) / 3;

  return {
    overall: Math.round(overall * 10) / 10,
    reliability: Math.round(performanceAvg * 10) / 10,
    service: Math.round(serviceAvg * 10) / 10,
    availability: Math.round(serviceAvg * 10) / 10,
    price: Math.round(priceAvg * 10) / 10,
    professionalism: Math.round(performanceAvg * 10) / 10,
  };
};

// ============================================
// Review Adapters
// ============================================

/**
 * Convert server Review to frontend Review format
 */
export const adaptServerReviewToReview = (
  serverReview: ServerReview
): Review => {
  const avgRating = calculateServerReviewAverage(serverReview);

  return {
    id: serverReview.id.toString(),
    professionalId: serverReview.employeeId?.toString() || "",
    customerId: serverReview.userId?.toString() || "",
    customerName: serverReview.user
      ? `${serverReview.user.firstName} ${serverReview.user.lastName}`
      : "משתמש אנונימי",
    ratings: {
      reliability: serverReview.performanceRate || 0,
      service: serverReview.serviceRate || 0,
      availability: serverReview.serviceRate || 0,
      price: serverReview.priceRate || 0,
      professionalism: serverReview.performanceRate || 0,
    },
    overallRating: avgRating,
    content: serverReview.comment || "",
    isVerified: true,
    createdAt: new Date(serverReview.createdAt),
    updatedAt: serverReview.updatedAt
      ? new Date(serverReview.updatedAt)
      : undefined,
  };
};

const calculateServerReviewAverage = (review: ServerReview): number => {
  const ratings = [
    review.priceRate,
    review.serviceRate,
    review.performanceRate,
  ].filter((r): r is number => r !== null && r !== undefined);
  if (ratings.length === 0) return 0;
  return (
    Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) /
    10
  );
};

// ============================================
// Category Adapters
// ============================================

// Map father categories to icons
const categoryIconMap: Record<string, string> = {
  "חשמל ואלקטרוניקה": "Zap",
  "שירותים כלליים": "Wrench",
  "קוסמטיקה וטיפוח": "Sparkles",
  "מבנה ואינסטלציה": "Droplet",
  "עיצוב ןאדריכלות": "Paintbrush",
};

/**
 * Convert server Category to frontend Category format
 */
export const adaptServerCategoryToCategory = (
  serverCategory: ServerCategory
): Category => {
  return {
    id: serverCategory.id.toString(),
    name: serverCategory.name,
    icon: categoryIconMap[serverCategory.fatherCategory || ""] || "Briefcase",
    description: serverCategory.description,
    defaultQuestions: [],
    isActive: true,
    order: serverCategory.id,
    professionalCount: 0,
  };
};

// ============================================
// Chat Adapters
// ============================================

/**
 * Convert server Chat to frontend Chat format
 */
export const adaptServerChatToChat = (serverChat: ServerChat): Chat => {
  return {
    id: serverChat.id.toString(),
    customerId: serverChat.customerId.toString(),
    customerName: serverChat.customer
      ? `${serverChat.customer.firstName} ${serverChat.customer.lastName}`
      : "",
    professionalId: serverChat.professionalId.toString(),
    professionalName: serverChat.professional
      ? `${serverChat.professional.firstName} ${serverChat.professional.lastName}`
      : "",
    professionalImage: undefined,
    quoteRequestId: serverChat.quoteRequestId?.toString(),
    lastMessage: serverChat.lastMessage
      ? adaptServerMessageToMessage(serverChat.lastMessage)
      : undefined,
    unreadCount: serverChat.unreadCount,
    createdAt: new Date(serverChat.createdAt),
    updatedAt: new Date(serverChat.updatedAt),
  };
};

/**
 * Convert server Message to frontend Message format
 */
export const adaptServerMessageToMessage = (
  serverMessage: ServerMessage
): Message => {
  return {
    id: serverMessage.id.toString(),
    chatId: serverMessage.chatId.toString(),
    senderId: serverMessage.senderId.toString(),
    senderType: serverMessage.senderType,
    type: serverMessage.type,
    content: serverMessage.content,
    quoteData: serverMessage.quoteData,
    imageUrl: serverMessage.imageUrl || undefined,
    isRead: serverMessage.isRead,
    createdAt: new Date(serverMessage.createdAt),
  };
};

// ============================================
// Notification Adapters
// ============================================

/**
 * Convert server Notification to frontend Notification format
 */
export const adaptServerNotificationToNotification = (
  serverNotification: ServerNotification
): Notification => {
  return {
    id: serverNotification.id.toString(),
    userId: serverNotification.userId.toString(),
    type: serverNotification.type,
    title: serverNotification.title,
    content: serverNotification.content,
    link: serverNotification.link || undefined,
    channels: serverNotification.channels as Notification["channels"],
    isRead: serverNotification.isRead,
    createdAt: new Date(serverNotification.createdAt),
  };
};

// ============================================
// Complaint Adapters
// ============================================

/**
 * Convert server Complaint to frontend Complaint format
 */
export const adaptServerComplaintToComplaint = (
  serverComplaint: ServerComplaint
): Complaint => {
  return {
    id: serverComplaint.id.toString(),
    userId: serverComplaint.userId.toString(),
    userName: serverComplaint.user
      ? `${serverComplaint.user.firstName} ${serverComplaint.user.lastName}`
      : "",
    type: serverComplaint.type,
    targetProfessionalId: serverComplaint.targetProfessionalId?.toString(),
    targetProfessionalName: serverComplaint.targetProfessional
      ? `${serverComplaint.targetProfessional.firstName} ${serverComplaint.targetProfessional.lastName}`
      : undefined,
    subject: serverComplaint.subject,
    content: serverComplaint.content,
    status: serverComplaint.status,
    adminNotes: serverComplaint.adminNotes || undefined,
    createdAt: new Date(serverComplaint.createdAt),
    updatedAt: new Date(serverComplaint.updatedAt),
    resolvedAt: serverComplaint.resolvedAt
      ? new Date(serverComplaint.resolvedAt)
      : undefined,
    resolvedBy: serverComplaint.resolvedBy?.toString(),
  };
};
