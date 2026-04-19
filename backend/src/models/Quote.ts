import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Quote extends Model {
  declare id: number;
  declare customerId: number | null;
  declare professionalId: number;
  declare categoryId: number | null;
  declare guestName: string | null;
  declare guestEmail: string | null;
  declare answers: Array<{
    questionId: string;
    question: string;
    answer: string | string[] | number;
  }>;
  declare description: string | null;
  declare urgency: 'low' | 'medium' | 'high';
  declare responseMethod: 'system' | 'phone';
  declare status: 'pending' | 'responded' | 'accepted' | 'rejected' | 'expired';
  declare respondedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Quote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'customer_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'professional_id',
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'guest_name',
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'guest_email',
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    responseMethod: {
      type: DataTypes.ENUM('system', 'phone'),
      allowNull: false,
      defaultValue: 'system',
      field: 'response_method',
    },
    status: {
      type: DataTypes.ENUM('pending', 'responded', 'accepted', 'rejected', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'responded_at',
    },
  },
  {
    sequelize,
    modelName: 'Quote',
    tableName: 'quotes',
    timestamps: true,
  }
);

export default Quote;
