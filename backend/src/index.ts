import express from 'express';
import cors from 'cors';
import { testConnection, syncDatabase, sequelize } from './config/database';
import initializeDatabase from './config/initDb';
import { seedDatabase } from './config/seed';
import './models/sequelizeModels'; // Import models to register them
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';
import employeeRoutes from './routes/employeeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import quoteRoutes from './routes/quoteRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import complaintRoutes from './routes/complaintRoutes';
import adminRoutes from './routes/adminRoutes';
import loggingMiddleware from './middleware/loggingMiddleware';

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
async function start() {
  console.log('🚀 Starting server...');

  try {
    console.log('📦 Initializing database...');

    // TEMPORARILY DISABLED - Testing if sync causes infinite loop
    // Initialize database (create if not exists)
    // if (process.env.SYNC_DB === 'true') {
    //   console.log('🔧 Running database initialization...');
    //   await initializeDatabase();
    // }

    // Test database connection
    console.log('🔌 Testing database connection...');
    await testConnection();

    // Sync database schema
    if (process.env.SYNC_DB === 'true') {
      console.log('🔄 Syncing database schema...');
      await syncDatabase();
    }

    // Seed database with sample data (only when explicitly enabled)
    if (process.env.SEED_DB === 'true') {
      console.log('🌱 Seeding database...');
      await seedDatabase();
    }

    const PORT = Number(process.env.PORT) || 3000;
    console.log(`🎯 Attempting to listen on port ${PORT}...`);

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
}

console.log('🏁 Calling start function...');
start().catch((error) => {
  console.error('💥 Unhandled error in start():', error);
  process.exit(1);
});
