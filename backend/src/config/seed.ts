import Category from '../models/Category';

export const seedDatabase = async () => {
  try {
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database with sample data...');

    await Category.bulkCreate([
      { name: 'חשמלאי', description: 'שירותי חשמל ותיקונים', image: '⚡', fatherCategory: 'תחזוקה' },
      { name: 'אינסטלטור', description: 'שירותי אינסטלציה', image: '🔧', fatherCategory: 'תחזוקה' },
      { name: 'טכנאי מחשבים', description: 'תיקון מחשבים ותמיכה טכנית', image: '💻', fatherCategory: 'טכנולוגיה' },
      { name: 'מיזוג אוויר', description: 'התקנה ותיקון מזגנים', image: '❄️', fatherCategory: 'תחזוקה' },
      { name: 'מנעולן', description: 'שירותי מנעולנות', image: '🔑', fatherCategory: 'תחזוקה' },
      { name: 'צבעי', description: 'צביעת דירות ומשרדים', image: '🎨', fatherCategory: 'שיפוצים' },
      { name: 'נגר', description: 'עבודות עץ ונגרות', image: '🪚', fatherCategory: 'שיפוצים' },
      { name: 'גנן', description: 'גינון ותחזוקת גינות', image: '🌳', fatherCategory: 'שירותים כלליים' },
      { name: 'מוביל', description: 'שירותי הובלה', image: '🚚', fatherCategory: 'שירותים כלליים' },
      { name: 'מכונאי', description: 'תיקון ואחזקת רכב', image: '🔩', fatherCategory: 'רכב' },
      { name: 'ניקיון', description: 'שירותי ניקיון', image: '✨', fatherCategory: 'שירותים כלליים' },
      { name: 'מכשירי חשמל', description: 'תיקון מכשירי חשמל ביתיים', image: '🏠', fatherCategory: 'תחזוקה' },
    ]);

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
