const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const Staff = sequelize.define('Staff', {
    index_number: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullnames: DataTypes.STRING,
    email: DataTypes.STRING,
    current_location: DataTypes.STRING,
    education_level_id: DataTypes.INTEGER,
    duty_station_id: DataTypes.INTEGER,
    remote_availability: DataTypes.BOOLEAN,
    software_skill_id: DataTypes.INTEGER,
    expertise_level: DataTypes.STRING,
    language_id: DataTypes.INTEGER,
    level_of_responsibility: DataTypes.STRING,
    project_id: DataTypes.INTEGER
}, { tableName: 'staff', timestamps: false });

module.exports = Staff;
