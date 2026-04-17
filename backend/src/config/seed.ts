import Category from "../models/Category";
import User from "../models/User";
import Employee from "../models/Employee";
import Review from "../models/Review";
import Chat from "../models/Chat";
import Message from "../models/Message";
import Quote from "../models/Quote";
import Complaint from "../models/Complaint";
import Notification from "../models/Notification";
import EmployeeCategory from "../models/EmployeeCategory";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log("✅ Database already seeded, skipping...");
      //   return;
    }

    console.log("🌱 Seeding database with meaningful mock data...");

    // ===== CREATE CATEGORIES =====
    const categories = categoryCount
      ? await Category.findAll()
      : await Category.bulkCreate([
          {
            name: "חשמלאי",
            description: "שירותי חשמל, תיקון מתקנים חשמליים, התקנות",
            image: "⚡",
            fatherCategory: "חשמל ואלקטרוניקה",
          },
          {
            name: "אולם דרבן",
            description: "שירותי מלאכה עבור רהיטים וציפוי",
            image: "🪛",
            fatherCategory: "מלאכה ועיצוב",
          },
          {
            name: "קוסמטיקאית",
            description: "שירותי קוסמטיקה טבעית וטיפול בעור",
            image: "💅",
            fatherCategory: "קוסמטיקה וטיפוח",
          },
          {
            name: "נקי",
            description: "שירותי ניקיון עמוק ותחזוקה",
            image: "🧹",
            fatherCategory: "שירותים כלליים",
          },
          {
            name: "מאפיה ועוגיות",
            description: "הכנת עוגות יום הולדת ועוגיות מעוצבות",
            image: "🎂",
            fatherCategory: "קולינריה",
          },
          {
            name: "דוג וקט",
            description: "שירותי הסעת יומית לכלבים וחתולים",
            image: "🐕",
            fatherCategory: "טיפול בחיות מחמד",
          },
        ]);

    // ===== CREATE CUSTOMERS (USERS) =====
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await User.bulkCreate([
      {
        firstName: "יוני",
        lastName: "כהן",
        email: "yoni.cohen@email.com",
        password: hashedPassword,
        address: "רחוב הפרחים 25, תל אביב",
        lastEntrance: new Date(),
      },
      {
        firstName: "מיכל",
        lastName: "ליברמן",
        email: "michal.liberman@email.com",
        password: hashedPassword,
        address: "רחוב הזיתון 10, ירושלים",
        lastEntrance: new Date(),
      },
      {
        firstName: "דוד",
        lastName: "גולן",
        email: "david.golan@email.com",
        password: hashedPassword,
        address: "רחוב נמיר 50, חיפה",
        lastEntrance: new Date(),
      },
      {
        firstName: "שרה",
        lastName: "מילר",
        email: "sarah.miller@email.com",
        password: hashedPassword,
        address: "רחוב לוי 15, בית שמש",
        lastEntrance: new Date(),
      },
      {
        firstName: "אור",
        lastName: "בנימיני",
        email: "or.binyamini@email.com",
        password: hashedPassword,
        address: "רחוב התאנה 8, קרית מוצקין",
        lastEntrance: new Date(),
      },
    ]);

    // ===== CREATE PROFESSIONALS (EMPLOYEES) =====
    const employees = await Employee.bulkCreate([
      {
        firstName: "משה",
        lastName: "כהן",
        area: "מרכז",
        gender: "זכר",
        email: "moshe.kohn@email.com",
        password: hashedPassword,
        phone: "0501234567",
        description: "חשמלאי מקצועי עם 15 שנות ניסיון בעבודות ביתיות",
        yearsOfExperience: 15,
        workingHours: {
          Monday: { start: "08:00", end: "18:00" },
          Tuesday: { start: "08:00", end: "18:00" },
          Wednesday: { start: "08:00", end: "18:00" },
          Thursday: { start: "08:00", end: "18:00" },
          Friday: { start: "08:00", end: "16:00" },
          Saturday: null,
          Sunday: { start: "09:00", end: "18:00" },
        },
        services: [
          "חיווט חדש",
          "תיקון ממסרים",
          "התקנת נורות LED",
          "בדיקת בטיחות",
        ],
        certificates: ["רישיון חשמלאי", "הכשרה בטיחות חשמל"],
        status: "approved",
        approvedAt: new Date("2024-01-15"),
        approvedBy: 1,
      },
      {
        firstName: "ליאור",
        lastName: "רביד",
        area: "מרכז",
        gender: "זכר",
        email: "lior.ravid@email.com",
        password: hashedPassword,
        phone: "0502468135",
        description: "נגר ומעצב רהיטים מומחה, עובד עם חומרים איכותיים",
        yearsOfExperience: 10,
        workingHours: {
          Monday: { start: "07:00", end: "17:00" },
          Tuesday: { start: "07:00", end: "17:00" },
          Wednesday: { start: "07:00", end: "17:00" },
          Thursday: { start: "07:00", end: "17:00" },
          Friday: { start: "07:00", end: "14:00" },
          Saturday: null,
          Sunday: { start: "08:00", end: "17:00" },
        },
        services: ["ציפוי רהיטים", "תיקון עץ", "עיצוב מחדש", "ייצור ספסלים"],
        certificates: ["הכשרה בעבודת עץ", "ציפוי מקצועי"],
        status: "approved",
        approvedAt: new Date("2024-02-20"),
        approvedBy: 1,
      },
      {
        firstName: "אביגיל",
        lastName: "עמרם",
        area: "צפון",
        gender: "נקבה",
        email: "avigail.amram@email.com",
        password: hashedPassword,
        phone: "0503369741",
        description: "קוסמטיקאית בעלת דיפלומה בקוסמטיקה טבעית",
        yearsOfExperience: 8,
        workingHours: {
          Monday: { start: "10:00", end: "19:00" },
          Tuesday: { start: "10:00", end: "19:00" },
          Wednesday: { start: "10:00", end: "19:00" },
          Thursday: { start: "10:00", end: "20:00" },
          Friday: { start: "10:00", end: "15:00" },
          Saturday: { start: "11:00", end: "18:00" },
          Sunday: { start: "10:00", end: "19:00" },
        },
        services: ["טיפול בעור", "מניקור", "פדיקור", "ספא ביתי"],
        certificates: ["דיפלומה בקוסמטיקה בטבעית", "סכנת עור מקצועית"],
        status: "approved",
        approvedAt: new Date("2024-01-10"),
        approvedBy: 1,
      },
      {
        firstName: "רחל",
        lastName: "לי",
        area: "דרום",
        gender: "נקבה",
        email: "rachel.lee@email.com",
        password: hashedPassword,
        phone: "0504567890",
        description: "מנקה מקצועית עם 12 שנות ניסיון בניקיון עמוק",
        yearsOfExperience: 12,
        workingHours: {
          Monday: { start: "08:00", end: "17:00" },
          Tuesday: { start: "08:00", end: "17:00" },
          Wednesday: { start: "08:00", end: "17:00" },
          Thursday: { start: "08:00", end: "17:00" },
          Friday: { start: "08:00", end: "14:00" },
          Saturday: null,
          Sunday: null,
        },
        services: [
          "ניקיון עמוק",
          "ניקיון חלונות",
          "ניקיון שטיחים",
          "ניקיון לאחר בנייה",
        ],
        certificates: ["הכשרery בתחזוקה", "בטיחות וטיגיינה"],
        status: "approved",
        approvedAt: new Date("2024-03-05"),
        approvedBy: 1,
      },
      {
        firstName: "יעל",
        lastName: "שנער",
        area: "מרכז",
        gender: "נקבה",
        email: "yael.shnaer@email.com",
        password: hashedPassword,
        phone: "0505689101",
        description: "בשפנית קונדיטור מעוצבת עם חוויה בעוגות מכובדות",
        yearsOfExperience: 6,
        workingHours: {
          Monday: { start: "09:00", end: "17:00" },
          Tuesday: { start: "09:00", end: "17:00" },
          Wednesday: { start: "09:00", end: "17:00" },
          Thursday: { start: "09:00", end: "17:00" },
          Friday: { start: "09:00", end: "15:00" },
          Saturday: { start: "09:00", end: "13:00" },
          Sunday: null,
        },
        services: [
          "עוגות יום הולדת",
          "עוגות קישוט",
          "קאפקייקס מעוצבות",
          "עוגיות",
        ],
        certificates: ["תעודה בקונדיטוריה מקצועית", "הצהרת בטיחות מזון"],
        status: "approved",
        approvedAt: new Date("2024-02-28"),
        approvedBy: 1,
      },
      {
        firstName: "אלכס",
        lastName: "רוזנברג",
        area: "מרכז",
        gender: "זכר",
        email: "alex.rosenberg@email.com",
        password: hashedPassword,
        phone: "0506789012",
        description: "דוג מקצועי עם דוגביל מוסמך וביטוח מלא",
        yearsOfExperience: 4,
        workingHours: {
          Monday: { start: "08:00", end: "18:00" },
          Tuesday: { start: "08:00", end: "18:00" },
          Wednesday: { start: "08:00", end: "18:00" },
          Thursday: { start: "08:00", end: "18:00" },
          Friday: { start: "08:00", end: "16:00" },
          Saturday: { start: "09:00", end: "17:00" },
          Sunday: { start: "09:00", end: "17:00" },
        },
        services: [
          "הסעה יומית",
          "גדילה קוגניטיבית",
          "הצעות גדולה",
          "טיפול וטיפוח",
        ],
        certificates: ["דוגביל מוסמך", "ביודיפנסר בעלי חיים"],
        status: "approved",
        approvedAt: new Date("2024-03-15"),
        approvedBy: 1,
      },
    ]);

    // ===== ASSOCIATE EMPLOYEES WITH CATEGORIES =====
    await EmployeeCategory.bulkCreate([
      { employeeId: employees[0].id, categoryId: categories[0].id },
      { employeeId: employees[1].id, categoryId: categories[1].id },
      { employeeId: employees[2].id, categoryId: categories[2].id },
      { employeeId: employees[3].id, categoryId: categories[3].id },
      { employeeId: employees[4].id, categoryId: categories[4].id },
      { employeeId: employees[5].id, categoryId: categories[5].id },
    ]);

    // ===== CREATE QUOTES =====
    const quotes = await Quote.bulkCreate([
      {
        customerId: users[0].id,
        professionalId: employees[0].id,
        categoryId: categories[0].id,
        answers: [
          {
            questionId: "1",
            question: "מה סוג העיבוד?",
            answer: "תיקון ממסרים",
          },
          { questionId: "2", question: "מה אזור המגורים?", answer: "תל אביב" },
        ],
        description: "צריך לתקן ממסר תאורה בסלון",
        urgency: "high",
        responseMethod: "system",
        status: "responded",
        respondedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        customerId: users[1].id,
        professionalId: employees[1].id,
        categoryId: categories[1].id,
        answers: [
          {
            questionId: "1",
            question: "איזה סוג ציפוי?",
            answer: "ציפוי רהיטים",
          },
          { questionId: "2", question: "כמה פיסות רהיטים?", answer: "3" },
        ],
        description: "צריך לצפות 3 כיסאות בעץ מעץ בוקיין",
        urgency: "medium",
        responseMethod: "phone",
        status: "accepted",
        respondedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        customerId: users[2].id,
        professionalId: employees[2].id,
        categoryId: categories[2].id,
        answers: [
          { questionId: "1", question: "סוג הטיפול?", answer: "טיפול בעור" },
        ],
        description: "טיפול בעור פנים עמוק להסרת כתמים",
        urgency: "low",
        responseMethod: "system",
        status: "pending",
        respondedAt: null,
      },
      {
        guestName: "אנונימי",
        guestEmail: "guest@example.com",
        professionalId: employees[3].id,
        categoryId: categories[3].id,
        answers: [
          {
            questionId: "1",
            question: "סוג הניקיון?",
            answer: "ניקיון עמוק לדירה",
          },
          { questionId: "2", question: "גודל הדירה?", answer: "100 מטר" },
        ],
        description: "דירה חדשה, צריכה ניקיון עמוק לפני ההנחה",
        urgency: "high",
        responseMethod: "phone",
        status: "responded",
        respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ]);

    // ===== CREATE REVIEWS =====
    await Review.bulkCreate([
      {
        userId: users[0].id,
        employeeId: employees[0].id,
        categoryId: categories[0].id,
        priceRate: 4,
        serviceRate: 5,
        performanceRate: 4,
        comment: "משה ביצע עבודה מעולה, מקצועי מאוד וזריז",
      },
      {
        userId: users[1].id,
        employeeId: employees[1].id,
        categoryId: categories[1].id,
        priceRate: 5,
        serviceRate: 5,
        performanceRate: 5,
        comment: "ליאור עשה עבודה מדהימה, הרהיטים נראים כמו חדשים!",
      },
      {
        userId: users[2].id,
        employeeId: employees[2].id,
        categoryId: categories[2].id,
        priceRate: 4,
        serviceRate: 4,
        performanceRate: 4,
        comment: "אביגיל הייתה מקצועית וחביבה מאוד",
      },
    ]);

    // ===== CREATE CHATS =====
    const chats = await Chat.bulkCreate([
      {
        customerId: users[0].id,
        professionalId: employees[0].id,
        quoteRequestId: quotes[0].id,
        unreadCount: 0,
      },
      {
        customerId: users[1].id,
        professionalId: employees[1].id,
        quoteRequestId: quotes[1].id,
        unreadCount: 1,
      },
      {
        customerId: users[2].id,
        professionalId: employees[2].id,
        quoteRequestId: quotes[2].id,
        unreadCount: 0,
      },
    ]);

    // ===== CREATE MESSAGES =====
    await Message.bulkCreate([
      {
        chatId: chats[0].id,
        senderId: employees[0].id,
        senderType: "professional",
        type: "text",
        content: "שלום! קיבלתי את בקשתך, אוכל להגיע מחר בבוקר בשעה 10",
        isRead: true,
      },
      {
        chatId: chats[0].id,
        senderId: users[0].id,
        senderType: "customer",
        type: "text",
        content: "מעולה! זה מושלם עבורי, תודה רבה",
        isRead: true,
      },
      {
        chatId: chats[1].id,
        senderId: employees[1].id,
        senderType: "professional",
        type: "text",
        content: "היי, ראיתי את התמונות של הכיסאות. אוכל לצפות אותם בשבוע הבא",
        isRead: false,
      },
      {
        chatId: chats[2].id,
        senderId: employees[2].id,
        senderType: "professional",
        type: "text",
        content: "בטח! טיפול עמוק יהיה מעולה לעור שלך",
        isRead: true,
      },
    ]);

    // ===== CREATE COMPLAINTS =====
    await Complaint.bulkCreate([
      {
        userId: users[0].id,
        type: "professional",
        targetProfessionalId: employees[0].id,
        subject: "הגיע מאוחר לפגישה",
        content: "המשך לא הגיע בשעה שדוברנו ופג שעתיים",
        status: "resolved",
        adminNotes: "בדקנו, הוא היה בתאונת דרכים. בוצע משוחח",
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedBy: 1,
      },
    ]);

    // ===== CREATE NOTIFICATIONS =====
    await Notification.bulkCreate([
      {
        userId: employees[0].id,
        type: "new_quote_request",
        title: "בקשת הצע חדשה",
        content: "קיבלת בקשת הצע חדשה להתקנת חשמל",
        link: `/quotes/${quotes[0].id}`,
        channels: ["system", "email"],
        isRead: true,
      },
      {
        userId: users[0].id,
        type: "quote_response",
        title: "התשובה לבקשתך פורסמה",
        content: "פרופesional הגיב לבקשת ההצע שלך",
        link: `/quotes/${quotes[0].id}`,
        channels: ["system", "email"],
        isRead: true,
      },
      {
        userId: users[1].id,
        type: "new_message",
        title: "הודעה חדשה",
        content: "קיבלת הודעה חדשה מ ליאור",
        link: `/chats/${chats[1].id}`,
        channels: ["system"],
        isRead: false,
      },
      {
        userId: employees[2].id,
        type: "new_review",
        title: "קיבלת ביקורת חדשה",
        content: "יוצר קיבל ביקורת חדשה של 5 כוכבים!",
        link: `/reviews`,
        channels: ["system", "email"],
        isRead: true,
      },
    ]);

    console.log("✅ Database seeded successfully with meaningful mock data!");
    console.log(`
      📊 Data Summary:
      - ${categories.length} Categories
      - ${users.length} Customers (Users)
      - ${employees.length} Professionals (Employees)
      - ${await Review.count()} Reviews
      - ${quotes.length} Quotes
      - ${await Chat.count()} Chats
      - ${await Message.count()} Messages
      - ${await Complaint.count()} Complaints
      - ${await Notification.count()} Notifications
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    //     throw error;
    //   }
  }
};
