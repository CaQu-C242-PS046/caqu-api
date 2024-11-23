const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const CareerRecommendations = sequelize.define('CareerRecommendations', {
    id_carrRec: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recommended_career: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'careerrecommendations',
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
    timestamps: true, 
});

module.exports = CareerRecommendations;
