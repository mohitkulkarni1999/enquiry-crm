-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: enquirycrm
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enquiry_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `comment_text` varchar(1000) NOT NULL,
  `comment_number` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_enquiry_id` (`enquiry_id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_created_at` (`created_at`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiry` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,3,9,'hi',1,'2025-10-11 12:15:50','2025-10-11 12:15:50'),(2,3,9,'hello',2,'2025-10-11 12:15:56','2025-10-11 12:15:56'),(3,4,9,'he is come tomorrow with family',1,'2025-10-11 23:57:14','2025-10-11 23:57:14'),(4,4,9,'flat booked finally',2,'2025-10-11 23:57:35','2025-10-11 23:57:35');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_admin_profile`
--

DROP TABLE IF EXISTS `crm_admin_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_admin_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `department` varchar(50) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkexs3fgae52lsfq54473uj1r0` (`user_id`),
  CONSTRAINT `FKj9nlyvbpl8y6cx9kxe7ks6rda` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_admin_profile`
--

LOCK TABLES `crm_admin_profile` WRITE;
/*!40000 ALTER TABLE `crm_admin_profile` DISABLE KEYS */;
INSERT INTO `crm_admin_profile` VALUES (4,NULL,10);
/*!40000 ALTER TABLE `crm_admin_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiry`
--

DROP TABLE IF EXISTS `enquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enquiry` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `budget_range` varchar(128) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_email` varchar(150) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `interest_level` varchar(128) DEFAULT NULL,
  `next_follow_up_at` datetime(6) DEFAULT NULL,
  `priority` int DEFAULT NULL,
  `property_type` varchar(128) DEFAULT NULL,
  `remarks` varchar(2000) DEFAULT NULL,
  `source` varchar(128) DEFAULT NULL,
  `status` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `sales_person_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6oqf6t1ig5cs3v5xhqex586ym` (`sales_person_id`),
  CONSTRAINT `FK6oqf6t1ig5cs3v5xhqex586ym` FOREIGN KEY (`sales_person_id`) REFERENCES `sales_person` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiry`
--

LOCK TABLES `enquiry` WRITE;
/*!40000 ALTER TABLE `enquiry` DISABLE KEYS */;
INSERT INTO `enquiry` VALUES (1,'TWENTY_TO_30L','2025-10-08 17:05:58.614796','kulkarnimohit1999@gmail.com','rohan patil','8275139049','MEDIUM',NULL,1,'ONE_BHK',NULL,'ADVERTISEMENT','NEW','2025-10-08 17:07:14.492692',1),(2,'TWENTY_TO_30L','2025-10-08 18:26:39.863231','makad@gmail.com','makad manav','7894561235','HOT',NULL,1,'STUDIO','\"hello sir he is really intrested\"','WALK_IN','BOOKED','2025-10-08 18:55:05.121855',2),(3,'FIFTY_TO_75L','2025-10-11 17:00:46.355129',NULL,'CRB','9766571553','HOT',NULL,1,'TWO_BHK','\"\\\"\\\\\\\"Will visit with family\\\\\\\"\\\\n---\\\\n2. [Date: 11/10/2025 | Time: 10:59 pm] hi\\\"\\n---\\n2. [Date: 11/10/2025 | Time: 11:00 pm] hi\"','ADVERTISEMENT','CLOSED_WON','2025-10-11 17:59:39.030740',5),(4,'TWENTY_TO_30L','2025-10-12 05:25:32.658854','maheshbhatt@gmail.com','mahesh bhattt','9999999998','HOT',NULL,1,'ONE_BHK',NULL,'WALK_IN','CLOSED_WON','2025-10-12 06:23:11.761592',5);
/*!40000 ALTER TABLE `enquiry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','<< Flyway Baseline >>','BASELINE','<< Flyway Baseline >>',NULL,'root','2025-10-08 18:51:45',0,1),(2,'2','fix column sizes','SQL','V2__fix_column_sizes.sql',404335062,'root','2025-10-08 18:51:45',67,1),(3,'3','Create comments table','SQL','V3__Create_comments_table.sql',513264884,'root','2025-10-11 17:37:49',69,0);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_activity`
--

DROP TABLE IF EXISTS `sales_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_activity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activity_date` datetime(6) DEFAULT NULL,
  `activity_type` enum('CALL','DEMO','EMAIL','FOLLOW_UP','MEETING') NOT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `enquiry_id` bigint DEFAULT NULL,
  `sales_person_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK85iqso79k01cnoc785sqa8oi3` (`enquiry_id`),
  KEY `FKmxqmkvuv3d9817wylvqrydk01` (`sales_person_id`),
  CONSTRAINT `FK85iqso79k01cnoc785sqa8oi3` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiry` (`id`),
  CONSTRAINT `FKmxqmkvuv3d9817wylvqrydk01` FOREIGN KEY (`sales_person_id`) REFERENCES `sales_person` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_activity`
--

LOCK TABLES `sales_activity` WRITE;
/*!40000 ALTER TABLE `sales_activity` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_person`
--

DROP TABLE IF EXISTS `sales_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_person` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcv7dt4cujciseg79beu246rnw` (`user_id`),
  CONSTRAINT `FK2rdkdnp4tsb0mj758v36v3svg` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_person`
--

LOCK TABLES `sales_person` WRITE;
/*!40000 ALTER TABLE `sales_person` DISABLE KEYS */;
INSERT INTO `sales_person` VALUES (1,_binary '','2025-10-08 17:02:27.943383','kulkarnimohit1999@gmail.com','mohit','08275139049',NULL),(2,_binary '','2025-10-08 17:26:50.565956','mohan@gmail.com','mohan','8888888888',NULL),(5,_binary '','2025-10-11 17:05:37.756763','akashy@gmail.com','Akash Dharkar','8888555448',NULL);
/*!40000 ALTER TABLE `sales_person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_admin_profile`
--

DROP TABLE IF EXISTS `super_admin_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_admin_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `organization` varchar(100) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm1ms619tutv8x4dix84eig7l0` (`user_id`),
  CONSTRAINT `FKbe6l5807qkw1qck8ownxp3m05` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admin_profile`
--

LOCK TABLES `super_admin_profile` WRITE;
/*!40000 ALTER TABLE `super_admin_profile` DISABLE KEYS */;
INSERT INTO `super_admin_profile` VALUES (2,'Millennium Park',8);
/*!40000 ALTER TABLE `super_admin_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_active` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `organization` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('CRM_ADMIN','SALES','SUPER_ADMIN') DEFAULT NULL,
  `territory` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,_binary '','2025-10-11 17:03:42.557556',NULL,'rohit@gmail.com',NULL,'2025-10-12 06:13:30.012391','Rohit Walankikar','Millennium Park','$2a$10$RUJTt/TpBSbrVGrWKQfj9uTd6WsrLxbysV5hF7pSUM9SCp.wFlr4.',NULL,'SUPER_ADMIN',NULL,'2025-10-12 06:13:30.015920','RohitW'),(9,_binary '','2025-10-11 17:05:37.743822',NULL,'akashy@gmail.com',NULL,'2025-10-12 05:59:43.872411','Akash Dharkar',NULL,'$2a$10$WzdIQMfV4O1ufpC69cFiHObuDfqhiijVrwuUi6glTpU2ccw8lVrj.','8888555448','SALES',NULL,'2025-10-12 05:59:43.873930','AkashD'),(10,_binary '','2025-10-11 17:08:55.078440',NULL,'rahul@gmail.com',NULL,'2025-10-11 17:09:30.430443','Rahul Chilwant',NULL,'$2a$10$DNX7JUqAArl/0bzZ.y/vmuDVA5McppZyEQtNpZz2ShZIxPsVbNX3W','9370906098','CRM_ADMIN',NULL,'2025-10-11 17:09:30.431532','RahulC');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-12 12:39:33
