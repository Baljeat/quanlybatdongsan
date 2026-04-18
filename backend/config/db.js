const { Sequelize } = require('sequelize'); // Tránh lỗi "Sequelize is not defined"
require('dotenv').config();

// --- Cấu hình kết nối CSDL chính bằng Sequelize ---
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false 
  }
);

// Gom chung toàn bộ Export để hệ thống không bị lỗi
module.exports = { sequelize, Sequelize };
