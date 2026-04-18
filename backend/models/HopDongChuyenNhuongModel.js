// File: backend/models/HopDongChuyenNhuong.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HopDongChuyenNhuong = sequelize.define('HopDongChuyenNhuong', {
  cnid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  khid: { type: DataTypes.INTEGER, allowNull: false }, // Khách hàng
  bdsid: { type: DataTypes.INTEGER, allowNull: false }, // Bất động sản
  dcid: { type: DataTypes.INTEGER, allowNull: true, unique: true }, // HĐ Đặt cọc liên kết (UNIQUE)
  giatri: { type: DataTypes.FLOAT, allowNull: false },
  ngaylap: { type: DataTypes.DATE, allowNull: false },
  trangthai: { type: DataTypes.BOOLEAN, defaultValue: true } 
}, {
  tableName: 'hopdongchuyennhuong',
  timestamps: false
});

module.exports = HopDongChuyenNhuong;