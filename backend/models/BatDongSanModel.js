const { DataTypes } = require('sequelize');
const {sequelize}  = require('../config/db');

const BatDongSan = sequelize.define('BatDongSan', {
  bdsid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  loaiid: { type: DataTypes.INTEGER, allowNull: true },
  khid: { type: DataTypes.INTEGER, allowNull: true },
  tinhtrang: { type: DataTypes.INTEGER, allowNull: true }, 
  dientich: { type: DataTypes.FLOAT, allowNull: true },
  dongia: { type: DataTypes.FLOAT, allowNull: true },
  masoqsdd: { type: DataTypes.STRING(50), allowNull: true },
  mota: { type: DataTypes.STRING(500), allowNull: true },
  hinhanh: { type: DataTypes.BLOB('long'), allowNull: true },
  chieudai: { type: DataTypes.FLOAT, allowNull: true },
  chieurong: { type: DataTypes.FLOAT, allowNull: true },
  huehong: { type: DataTypes.FLOAT, allowNull: true },
  tenduong: { type: DataTypes.STRING(100), allowNull: true },
  thanhpho: { type: DataTypes.STRING(100), allowNull: true },
  sonha: { type: DataTypes.STRING(50), allowNull: true },
  quan: { type: DataTypes.STRING(100), allowNull: true },
  phuong: { type: DataTypes.STRING(100), allowNull: true }
}, {
  tableName: 'batdongsan',
  timestamps: false
});

module.exports = BatDongSan;