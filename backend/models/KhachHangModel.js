const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const KhachHang = sequelize.define('KhachHang', {
  khid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nvid: { type: DataTypes.INTEGER, allowNull: true },
  hoten: { type: DataTypes.STRING(100), allowNull: false },
  diachi: { type: DataTypes.STRING(255), allowNull: true },
  diachitt: { type: DataTypes.STRING(255), allowNull: true },
  cmnd: { type: DataTypes.STRING(20), allowNull: true, unique: true },
  ngaysinh: { type: DataTypes.DATEONLY, allowNull: true },
  sdt: { type: DataTypes.STRING(15), allowNull: true },
  gioitinh: { type: DataTypes.BOOLEAN, allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true },
  loaikh: { type: DataTypes.BOOLEAN, allowNull: true },
  mota: { type: DataTypes.STRING(255), allowNull: true },
  trangthai: { type: DataTypes.BOOLEAN, allowNull: true }
}, {
  tableName: 'khachhang',
  timestamps: false
});

module.exports = KhachHang;
