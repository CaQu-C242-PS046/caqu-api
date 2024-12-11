const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Recomendation = sequelize.define('Recomendation', {
  id_karir: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_karir: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  skill: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pendidikan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  insight: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  artikel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  playlistId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'karir',
  timestamps: false
});

module.exports = Recomendation;
