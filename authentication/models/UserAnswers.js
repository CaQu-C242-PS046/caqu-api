const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserAnswers = sequelize.define('UserAnswers', {
  id_answer: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  answer: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'useranswers',
  timestamps: true,    
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserAnswers;
