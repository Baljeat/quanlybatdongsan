CREATE DATABASE  IF NOT EXISTS `quanlybatdongsan` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quanlybatdongsan`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: quanlybatdongsan
-- ------------------------------------------------------
-- Server version	9.1.0
-- Table structure for table `khachhang`
--

DROP TABLE IF EXISTS `khachhang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khachhang` (
  `khid` int NOT NULL AUTO_INCREMENT,
  `nvid` int DEFAULT NULL,
  `hoten` varchar(100) NOT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `diachitt` varchar(255) DEFAULT NULL,
  `cmnd` varchar(20) DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `gioitinh` tinyint(1) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `loaikh` tinyint(1) DEFAULT NULL,
  `mota` varchar(255) DEFAULT NULL,
  `trangthai` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`khid`),
  UNIQUE KEY `UNIQUE_CMND` (`cmnd`),
  KEY `nvid` (`nvid`),
  CONSTRAINT `khachhang_ibfk_1` FOREIGN KEY (`nvid`) REFERENCES `nhanvien` (`nvid`) ON DELETE SET NULL,
  CONSTRAINT `CHECK_CMND_HopLe` CHECK (((length(`cmnd`) in (9,12)) and regexp_like(`cmnd`,_utf8mb4'^[0-9]+$')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khachhang`
--

LOCK TABLES `khachhang` WRITE;
/*!40000 ALTER TABLE `khachhang` DISABLE KEYS */;
INSERT INTO `khachhang` VALUES (1,1,'Trần Văn Sếp','789 CMT8, Tân Bình, TP.HCM','789 CMT8, Tân Bình','079123456789','1985-02-28','0911222333',1,'tranvansep@gmail.com',1,'Khách VIP đầu tư lướt sóng',1),(2,2,'Lê Thu Thủy','321 Hùng Vương, Quận 5, TP.HCM','321 Hùng Vương, Quận 5','079987654321','1990-08-15','0944555666',0,'thuy.le@gmail.com',0,'Khách tìm thuê chung cư',1);
/*!40000 ALTER TABLE `khachhang` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `yeucaukhachhang`
--

LOCK TABLES `yeucaukhachhang` WRITE;
/*!40000 ALTER TABLE `yeucaukhachhang` DISABLE KEYS */;
/*!40000 ALTER TABLE `yeucaukhachhang` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 18:28:21
