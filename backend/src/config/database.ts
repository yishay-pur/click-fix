import { Sequelize } from "sequelize";
import { config } from "dotenv";
// Load environment variables
config();

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || "";

export const sequelize = new Sequelize(DB_CONNECTION_STRING, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(await sequelize.query("SELECT 1"));
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    throw error;
  }
};
