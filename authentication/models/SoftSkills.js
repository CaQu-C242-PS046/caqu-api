const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const SoftSkills = sequelize.define('SoftSkills', {
  id_ss: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_ss: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: false
  },
  artikel: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: false
  },
  video: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false
  },
  videoId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
  }
}, {
  tableName: 'softSkill',
  timestamps: false,
});


module.exports = SoftSkills;