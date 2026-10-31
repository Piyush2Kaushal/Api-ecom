
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `label` varchar(60) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `line1` varchar(255) NOT NULL,
  `line2` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `county` varchar(255) DEFAULT NULL,
  `postcode` varchar(20) NOT NULL,
  `country` varchar(2) NOT NULL DEFAULT 'GB',
  `phone` varchar(40) DEFAULT NULL,
  `is_default_shipping` tinyint(1) NOT NULL DEFAULT 0,
  `is_default_billing` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_user_id_foreign` (`user_id`),
  CONSTRAINT `addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,'Avesta Admin','admin@avesta.test','$2y$12$OsUqY7yKUHH0SPTrLR0k3uvJL.8YnxAM2mW4kdXeL//X19sWK3eCm',NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_exclusive` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES
(1,'Tenvo','tenvo','Security for a smarter tomorrow','Professional CCTV without the premium price tag. Tenvo brings pro-grade cameras and recorders designed for installers, traders and resellers — reliable, simple to install and competitively priced.',NULL,'images/demo/hero-tenvo.svg',1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'Hikvision','hikvision','World-leading video security','AcuSense, ColorVu and DarkFighter technologies from the world\'s largest video security manufacturer.',NULL,NULL,1,0,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'HiLook','hilook','Smart value by Hikvision','Dependable, easy-to-install CCTV built on Hikvision technology.',NULL,NULL,1,0,1,2,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,'Hizone Pro','hizone-pro','Pro performance, every install','Feature-packed cameras and recorders for professional installers.',NULL,NULL,1,0,1,3,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,'Ajax','ajax','Wireless security, reinvented','Award-winning wireless intruder alarm systems with Jeweller radio technology.',NULL,NULL,1,0,1,4,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `product_variant_id` bigint(20) unsigned DEFAULT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `saved_for_later` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_items_cart_id_foreign` (`cart_id`),
  KEY `cart_items_product_id_foreign` (`product_id`),
  KEY `cart_items_product_variant_id_foreign` (`product_variant_id`),
  CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `token` varchar(64) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `converted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_token_unique` (`token`),
  KEY `carts_user_id_foreign` (`user_id`),
  CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `depth` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `show_in_menu` tinyint(1) NOT NULL DEFAULT 1,
  `show_on_home` tinyint(1) NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_sort_order_index` (`parent_id`,`sort_order`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,NULL,'CCTV','cctv',1,'Professional CCTV equipment from leading brands.','images/demo/turret-white.svg',NULL,0,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,1,'IP Cameras','ip-cameras',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,2,'Dome Cameras','dome-cameras',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,2,'Bullet Cameras','bullet-cameras',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,2,'Turret Cameras','turret-cameras',3,NULL,NULL,NULL,2,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,2,'PTZ Cameras','ptz-cameras',3,NULL,NULL,NULL,3,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,1,'Turbo HD Cameras','turbo-hd-cameras',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,7,'Analogue Turrets','analogue-turrets',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(9,7,'Analogue Bullets','analogue-bullets',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(10,1,'CCTV Kits','cctv-kits',2,NULL,'images/demo/dome-white.svg',NULL,2,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(11,10,'IP Kits','ip-kits',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(12,11,'4 Camera Kits','4-camera-kits',4,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(13,12,'5MP Kits','5mp-kits',5,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(14,12,'8MP 4K Kits','8mp-4k-kits',5,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(15,11,'8 Camera Kits','8-camera-kits',4,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(16,10,'Analogue Kits','analogue-kits',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(17,1,'Recorders','recorders',2,NULL,'images/demo/nvr-black.svg',NULL,3,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(18,17,'NVRs','nvrs',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(19,17,'DVRs','dvrs',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(20,NULL,'Intruder Alarm','intruder-alarm',1,'Professional Intruder Alarm equipment from leading brands.','images/demo/alarm-hub.svg',NULL,1,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(21,20,'AX Pro by Hikvision','ax-pro-by-hikvision',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(22,21,'AX Pro Hubs','ax-pro-hubs',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(23,21,'AX Pro Detectors','ax-pro-detectors',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(24,20,'Ajax','ajax',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(25,24,'Ajax Hubs','ajax-hubs',3,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(26,24,'Ajax Detectors','ajax-detectors',3,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(27,24,'Ajax Keypads','ajax-keypads',3,NULL,NULL,NULL,2,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(28,NULL,'Access Control','access-control',1,'Professional Access Control equipment from leading brands.','images/demo/keypad.svg',NULL,2,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(29,28,'Keypads & Readers','keypads-readers',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(30,28,'Video Intercom','video-intercom',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(31,NULL,'Fire Alarm','fire-alarm',1,'Professional Fire Alarm equipment from leading brands.','images/demo/smoke-detector.svg',NULL,3,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(32,31,'Smoke Detectors','smoke-detectors',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(33,31,'Fire Panels','fire-panels',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(34,NULL,'Networking','networking',1,'Professional Networking equipment from leading brands.','images/demo/poe-switch.svg',NULL,4,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(35,34,'PoE Switches','poe-switches',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(36,34,'Cables & Connectors','cables-connectors',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(37,NULL,'Accessories','accessories',1,'Professional Accessories equipment from leading brands.','images/demo/hard-drive.svg',NULL,5,1,1,1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(38,37,'Hard Drives','hard-drives',2,NULL,NULL,NULL,0,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(39,37,'Junction Boxes & Brackets','junction-boxes-brackets',2,NULL,NULL,NULL,1,1,1,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `category_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_product` (
  `category_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`category_id`,`product_id`),
  KEY `category_product_product_id_foreign` (`product_id`),
  CONSTRAINT `category_product_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `category_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `category_product` WRITE;
/*!40000 ALTER TABLE `category_product` DISABLE KEYS */;
INSERT INTO `category_product` VALUES
(8,8);
/*!40000 ALTER TABLE `category_product` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `contact_enquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_enquiries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_enquiries_user_id_foreign` (`user_id`),
  KEY `contact_enquiries_product_id_foreign` (`product_id`),
  KEY `contact_enquiries_status_index` (`status`),
  CONSTRAINT `contact_enquiries_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `contact_enquiries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `contact_enquiries` WRITE;
/*!40000 ALTER TABLE `contact_enquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_enquiries` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coupon_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_coupon_id_foreign` (`coupon_id`),
  KEY `coupon_usages_order_id_foreign` (`order_id`),
  KEY `coupon_usages_user_id_foreign` (`user_id`),
  CONSTRAINT `coupon_usages_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_usages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'percent',
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_subtotal` decimal(12,2) DEFAULT NULL,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `usage_limit` int(10) unsigned DEFAULT NULL,
  `usage_per_customer` int(10) unsigned DEFAULT NULL,
  `used_count` int(10) unsigned NOT NULL DEFAULT 0,
  `allowed_tiers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_tiers`)),
  `applies_to` varchar(20) NOT NULL DEFAULT 'all',
  `applies_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applies_ids`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES
(1,'WELCOME10','10% off first order','percent',10.00,NULL,NULL,NULL,NULL,NULL,1,0,'[\"retailer\"]','all',NULL,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'FREESHIP','Free delivery','free_shipping',0.00,50.00,NULL,NULL,NULL,NULL,NULL,0,NULL,'all',NULL,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'TENVO15','15% off Tenvo','percent',15.00,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'brands','[1]',0,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `email_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_otps` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `purpose` varchar(30) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_otps_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `email_otps` WRITE;
/*!40000 ALTER TABLE `email_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_otps` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `guest_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_customers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guest_customers_email_unique` (`email`),
  KEY `guest_customers_user_id_foreign` (`user_id`),
  CONSTRAINT `guest_customers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `guest_customers` WRITE;
/*!40000 ALTER TABLE `guest_customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_customers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `hero_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_slides` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `eyebrow` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `mobile_image` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `button2_text` varchar(255) DEFAULT NULL,
  `button2_link` varchar(255) DEFAULT NULL,
  `theme` varchar(10) NOT NULL DEFAULT 'dark',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `hero_slides` WRITE;
/*!40000 ALTER TABLE `hero_slides` DISABLE KEYS */;
INSERT INTO `hero_slides` VALUES
(1,'Introducing Tenvo','Professional CCTV. Installer-friendly pricing.','Pro-grade 4K, ColorVu and AcuSense cameras engineered for installers, traders and resellers — without the premium price tag.','images/demo/hero-tenvo.svg',NULL,'Explore Tenvo','/brand/tenvo','Open a trade account','/trade-accounts','dark',1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'Avesta Installer Training','Learn today. Install tomorrow.','Hands-on CCTV & security training from working engineers. Get certified and grow your career.','images/demo/hero-training.svg',NULL,'View courses','/training',NULL,NULL,'dark',1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'Trade & wholesale','Your prices. Your PO numbers. Your pace.','Approved installers unlock trade pricing, pro-forma quotes, quick re-order and priority support.','images/demo/hero-trade.svg',NULL,'Apply for trade','/register?type=trader',NULL,NULL,'dark',1,2,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `hero_slides` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `home_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_sections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(40) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `home_sections` WRITE;
/*!40000 ALTER TABLE `home_sections` DISABLE KEYS */;
INSERT INTO `home_sections` VALUES
(1,'hero',NULL,NULL,'[]',1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'usp',NULL,NULL,'{\"theme\":\"light\",\"items\":[{\"icon\":\"truck\",\"title\":\"Fast UK delivery\",\"text\":\"Same-day dispatch before 2pm\"},{\"icon\":\"badge\",\"title\":\"Trade pricing\",\"text\":\"For approved installers\"},{\"icon\":\"shield\",\"title\":\"Manufacturer warranty\",\"text\":\"Up to 3 years cover\"},{\"icon\":\"headset\",\"title\":\"Expert support\",\"text\":\"From engineers who install\"}]}',1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'categories','Shop by category','Everything you need for a complete security installation.','[]',1,2,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,'brand_spotlight','Tenvo. Security for a smarter tomorrow.','Professional CCTV, installer-friendly pricing.','{\"brand_id\":1,\"eyebrow\":\"Exclusive to Avesta\",\"image\":\"images\\/demo\\/spotlight-tenvo.svg\",\"text\":\"Tenvo brings professional-grade CCTV and surveillance solutions designed for security installers, traders and resellers. With reliable technology and competitive trade pricing, Tenvo makes it easier to deliver dependable surveillance to your customers.\",\"features\":[{\"title\":\"3K \\/ 5MP \\/ 4K cameras\",\"text\":\"Sharp, high-resolution video for homes, businesses and sites.\"},{\"title\":\"Smart Hybrid Light\",\"text\":\"Intelligent IR or white-light illumination on demand.\"},{\"title\":\"ColorVu technology\",\"text\":\"Full-colour footage 24\\/7, even in very low light.\"},{\"title\":\"AcuSense AI\",\"text\":\"Human & vehicle detection that cuts false alarms.\"}],\"button_text\":\"Shop Tenvo\",\"button_link\":\"\\/brand\\/tenvo\"}',1,3,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,'products','Tenvo best sellers','Our exclusive range, trusted by installers across the UK.','{\"source\":\"brand\",\"brand_id\":1,\"limit\":8,\"theme\":\"light\"}',1,4,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,'trade_cta','Are you a CCTV installer or reseller?','Unlock trade pricing on every product.','{\"eyebrow\":\"Avesta Trade\",\"text\":\"Apply in two minutes. Your account works immediately at retail prices, and trade pricing switches on automatically once approved.\",\"button_text\":\"Apply for a trade account\",\"button_link\":\"\\/register?type=trader\",\"image\":\"images\\/demo\\/hero-trade.svg\"}',1,5,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,'products','Hikvision kits & cameras',NULL,'{\"source\":\"brand\",\"brand_id\":2,\"limit\":8,\"theme\":\"muted\"}',1,6,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,'banner','Complete CCTV kits, ready to install','Cameras, recorder and storage — matched and tested.','{\"eyebrow\":\"Kits\",\"text\":\"From 4-camera home kits to 8-camera 4K business systems.\",\"image\":\"images\\/demo\\/hero-tenvo.svg\",\"button_text\":\"Shop kits\",\"button_link\":\"\\/category\\/cctv-kits\",\"theme\":\"dark\"}',1,7,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(9,'products','Hizone Pro','Pro performance for every install.','{\"source\":\"brand\",\"brand_id\":4,\"limit\":8,\"theme\":\"light\"}',1,8,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(10,'products','HiLook CCTV',NULL,'{\"source\":\"brand\",\"brand_id\":3,\"limit\":8,\"theme\":\"light\"}',1,9,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(11,'training_cta','Learn today. Install tomorrow.','Professional installer training with real-world experts.','{\"eyebrow\":\"Avesta Training\",\"text\":\"Expert instructors, practical hands-on sessions, certification and ongoing career support.\",\"button_text\":\"Register for training\",\"button_link\":\"\\/training\",\"image\":\"images\\/demo\\/hero-training.svg\"}',1,10,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(12,'brands','Brands we trust',NULL,'[]',1,11,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `home_sections` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `number` varchar(40) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'invoice',
  `amount` decimal(12,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `issued_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_number_unique` (`number`),
  KEY `invoices_order_id_foreign` (`order_id`),
  CONSTRAINT `invoices_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `location` varchar(30) NOT NULL,
  `label` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `new_tab` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_location_index` (`location`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES
(1,'header','Training','/training',0,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'header','Trade','/trade-accounts',0,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'footer_quick','About Us','/about-us',0,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,'footer_quick','Contact Us','/contact',0,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,'footer_quick','Trade Accounts','/trade-accounts',0,2,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,'footer_quick','Our Trainings','/training',0,3,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,'footer_quick','Track an Order','/track',0,4,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,'footer_products','All Products','/shop',0,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(9,'footer_products','Brands','/brands',0,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(10,'footer_products','Tenvo','/brand/tenvo',0,2,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(11,'footer_products','CCTV','/category/cctv',0,3,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(12,'footer_products','Accessories','/category/accessories',0,4,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(13,'footer_help','Delivery','/delivery',0,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(14,'footer_help','Return Policy','/return-policy',0,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(15,'footer_help','Refund Policy','/refund-policy',0,2,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(16,'footer_help','Warranty','/warranty',0,3,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(17,'footer_help','Privacy Policy','/privacy-policy',0,4,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(18,'footer_help','Terms of Service','/terms-of-service',0,5,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_01_01_000100_create_catalog_tables',1),
(5,'2026_01_01_000200_create_sales_tables',1),
(6,'2026_01_01_000300_create_content_tables',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `product_variant_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `variant_label` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `quantity` int(10) unsigned NOT NULL,
  `unit_original_price` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `coupon_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_mode` varchar(10) NOT NULL,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `line_net` decimal(12,2) NOT NULL,
  `line_vat` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  KEY `order_items_product_variant_id_foreign` (`product_variant_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `order_status_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `status` varchar(30) NOT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `customer_notified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_status_histories_order_id_foreign` (`order_id`),
  CONSTRAINT `order_status_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_status_histories` WRITE;
/*!40000 ALTER TABLE `order_status_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_status_histories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `number` varchar(30) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `guest_customer_id` bigint(20) unsigned DEFAULT NULL,
  `cart_id` bigint(20) unsigned DEFAULT NULL,
  `customer_tier` varchar(20) NOT NULL DEFAULT 'retailer',
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shipping_address`)),
  `billing_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`billing_address`)),
  `po_reference` varchar(100) DEFAULT NULL,
  `customer_notes` text DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'GBP',
  `exchange_rate` decimal(12,6) NOT NULL DEFAULT 1.000000,
  `items_subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `savings_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_method_id` bigint(20) unsigned DEFAULT NULL,
  `shipping_method_name` varchar(255) DEFAULT NULL,
  `shipping_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `refunded_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(30) NOT NULL DEFAULT 'pending_payment',
  `payment_status` varchar(30) NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(30) DEFAULT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `stripe_payment_intent` varchar(255) DEFAULT NULL,
  `carrier` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `tracking_url` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `stock_deducted` tinyint(1) NOT NULL DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_number_unique` (`number`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_guest_customer_id_foreign` (`guest_customer_id`),
  KEY `orders_shipping_method_id_foreign` (`shipping_method_id`),
  KEY `orders_created_at_index` (`created_at`),
  KEY `orders_po_reference_index` (`po_reference`),
  KEY `orders_status_index` (`status`),
  KEY `orders_stripe_session_id_index` (`stripe_session_id`),
  CONSTRAINT `orders_guest_customer_id_foreign` FOREIGN KEY (`guest_customer_id`) REFERENCES `guest_customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_shipping_method_id_foreign` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES
(1,'About Us','about-us','<h2>Securing your world since day one</h2><p>Avesta is a UK supplier of professional CCTV, intruder alarm, access control, fire and networking equipment, based in Manchester. We work with homeowners, businesses and — above all — the installers and resellers who keep the UK secure.</p><h3>What makes us different</h3><ul><li><strong>Curated brands</strong> — Tenvo, Hikvision, HiLook, Hizone Pro and Ajax.</li><li><strong>Trade pricing</strong> for approved installers and wholesalers.</li><li><strong>Installer training</strong> delivered by working engineers.</li><li><strong>Real support</strong> from people who install the products we sell.</li></ul>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'Delivery Information','delivery','<h2>Delivery</h2><p>We deliver across the UK. Orders placed before 2pm on a working day are normally dispatched the same day.</p><ul><li>Standard delivery: 2–3 working days</li><li>Next working day: order before 2pm</li><li>Highlands, Islands and Northern Ireland: 3–5 working days</li></ul><p>Delivery prices are shown at checkout. Free delivery applies to qualifying orders over the threshold shown on our website.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'Return Policy','return-policy','<h2>Returns</h2><p>You can return unused items in their original packaging within 30 days of delivery. Please contact us first with your order number so we can issue a returns reference.</p><p>Items must be returned in resaleable condition. We recommend a tracked service for returns.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,'Refund Policy','refund-policy','<h2>Refunds</h2><p>Once your return has been received and inspected we will refund your original payment method within 5 working days. You will receive a credit note by email.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,'Warranty','warranty','<h2>Warranty</h2><p>All products carry the manufacturer\'s warranty — typically 2 to 3 years. Faulty items should be reported to our support team with your order number and a short description of the fault.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,'Privacy Policy','privacy-policy','<h2>Your privacy</h2><p>We only collect the information we need to process your orders, manage your account and — if you opt in — send you offers. We never sell your data. Payments are processed securely by Stripe; we never see or store your card details.</p><p>You can ask us to export or delete your data at any time by contacting us.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,'Terms of Service','terms-of-service','<h2>Terms of Service</h2><p>By placing an order you agree to these terms. Prices are shown in GBP. Trade prices are available only to approved trade accounts. We reserve the right to cancel orders affected by pricing errors and will refund any payment in full.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,'Trade Accounts','trade-accounts','<h3>Who can apply?</h3><p>CCTV and security installers, electricians, integrators, resellers and wholesalers with a registered UK business.</p><h3>What you get</h3><ul><li>Trade or wholesale pricing on the full range</li><li>Download pro-forma quotes and add your PO references</li><li>Quick re-order and order by SKU</li><li>Priority technical support and training</li></ul><h3>How it works</h3><p>Create an account and choose <strong>Trader</strong> or <strong>Wholesaler</strong>. Your account works straight away at retail prices while we review your application — usually within one working day. As soon as you are approved your trade prices appear automatically.</p>',1,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `popups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `popups` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `delay_seconds` int(10) unsigned NOT NULL DEFAULT 5,
  `pages` varchar(20) NOT NULL DEFAULT 'home',
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `popups` WRITE;
/*!40000 ALTER TABLE `popups` DISABLE KEYS */;
/*!40000 ALTER TABLE `popups` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_files` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_files_product_id_foreign` (`product_id`),
  CONSTRAINT `product_files_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_files` WRITE;
/*!40000 ALTER TABLE `product_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_files` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `path` varchar(255) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_foreign` (`product_id`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES
(1,1,'images/demo/dome-white.svg','Tenvo 5MP ColorVu IP Dome Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,1,'images/demo/dome-black.svg','Tenvo 5MP ColorVu IP Dome Camera, 2.8mm',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,2,'images/demo/turret-white.svg','Tenvo 3K Smart Hybrid Light Turret Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,2,'images/demo/turret-black.svg','Tenvo 3K Smart Hybrid Light Turret Camera, 2.8mm',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,3,'images/demo/bullet-white.svg','Tenvo 8MP 4K AcuSense Bullet Camera, 4mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,3,'images/demo/bullet-black.svg','Tenvo 8MP 4K AcuSense Bullet Camera, 4mm',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,4,'images/demo/nvr-8.svg','Tenvo 8 Channel 4K PoE NVR with AcuSense',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,5,'images/demo/dome-white.svg','Tenvo 4 Camera 5MP ColorVu IP Kit with 2TB NVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(9,5,'images/demo/nvr-8.svg','Tenvo 4 Camera 5MP ColorVu IP Kit with 2TB NVR',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(10,6,'images/demo/turret-white.svg','Tenvo 4 Camera 4K AcuSense Turret Kit',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(11,6,'images/demo/nvr-black.svg','Tenvo 4 Camera 4K AcuSense Turret Kit',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(12,7,'images/demo/ptz.svg','Tenvo 4MP 25× Optical Zoom PTZ Camera',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(13,8,'images/demo/turret-white.svg','Hikvision Turbo HD 3K ColorVu Dual-Lens Turret Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(14,9,'images/demo/ptz.svg','Hikvision 2MP 15× DarkFighter AcuSense IR Network PTZ Camera',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(15,10,'images/demo/dome-black.svg','Hikvision 6MP AcuSense ColorVu Dome Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(16,11,'images/demo/nvr-black.svg','Hikvision 16 Channel 4K AcuSense PoE NVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(17,12,'images/demo/dvr-white.svg','Hikvision 4 Channel 3K/5MP AcuSense Turbo HD DVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(18,13,'images/demo/alarm-hub.svg','Hikvision AX Pro Wireless Alarm Hub',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(19,14,'images/demo/smoke-detector.svg','Hikvision AX Pro Wireless PIR Detector',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(20,15,'images/demo/keypad.svg','Hikvision 2-Wire IP Video Intercom Kit',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(21,16,'images/demo/dvr-white.svg','HiLook 4CH 1080P Lite DVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(22,17,'images/demo/nvr-8.svg','HiLook 8CH 5MP Hybrid Smart Motion DVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(23,18,'images/demo/bullet-white.svg','HiLook 4MP IP Bullet Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(24,19,'images/demo/turret-white.svg','HiLook 4 Camera 1080P Turbo HD Kit',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(25,19,'images/demo/dvr-white.svg','HiLook 4 Camera 1080P Turbo HD Kit',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(26,20,'images/demo/turret-black.svg','Hizone Pro 5MP Smart Hybrid Light Turret Camera, Black',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(27,21,'images/demo/dome-white.svg','Hizone Pro 3K ColorVu Dome Camera, 2.8mm',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(28,22,'images/demo/nvr-8.svg','Hizone Pro 8CH AcuSense 2-Way Talk Facial Recognition DVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(29,23,'images/demo/turret-black.svg','Hizone Pro 8 Camera 5MP IP Kit with 4TB NVR',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(30,23,'images/demo/nvr-black.svg','Hizone Pro 8 Camera 5MP IP Kit with 4TB NVR',1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(31,24,'images/demo/alarm-hub.svg','Ajax Hub 2 Plus Wireless Alarm Control Panel, White',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(32,25,'images/demo/smoke-detector.svg','Ajax MotionProtect Wireless PIR Detector',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(33,26,'images/demo/keypad.svg','Ajax KeyPad Plus Wireless Touch Keypad',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(34,27,'images/demo/poe-switch.svg','Tenvo 8-Port Gigabit PoE+ Switch, 120W',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(35,28,'images/demo/smoke-detector.svg','Hikvision Wireless Optical Smoke Detector',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(36,29,'images/demo/hard-drive.svg','4TB Surveillance Hard Drive, 24/7 Rated',0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(37,30,'images/demo/junction-box.svg','Universal Junction Box for Dome & Turret Cameras, White',0,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_specs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_specs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `label` varchar(120) NOT NULL,
  `value` varchar(500) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `product_specs_product_id_foreign` (`product_id`),
  KEY `product_specs_label_value_index` (`label`,`value`),
  CONSTRAINT `product_specs_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_specs` WRITE;
/*!40000 ALTER TABLE `product_specs` DISABLE KEYS */;
INSERT INTO `product_specs` VALUES
(1,1,'Resolution','5MP',0),
(2,1,'Form Factor','Dome',1),
(3,1,'Lens','2.8mm',2),
(4,1,'Technology','ColorVu',3),
(5,1,'IR Range','30m',4),
(6,1,'Protection','IP67 / IK10',5),
(7,1,'Power','PoE (802.3af)',6),
(8,2,'Resolution','3K / 5MP',0),
(9,2,'Form Factor','Turret',1),
(10,2,'Lens','2.8mm',2),
(11,2,'Technology','Smart Hybrid Light',3),
(12,2,'IR Range','30m',4),
(13,2,'Audio','Built-in mic',5),
(14,3,'Resolution','8MP 4K',0),
(15,3,'Form Factor','Bullet',1),
(16,3,'Lens','4mm',2),
(17,3,'Technology','AcuSense',3),
(18,3,'IR Range','40m',4),
(19,4,'Channels','8',0),
(20,4,'Resolution','Up to 8MP',1),
(21,4,'PoE','8 ports',2),
(22,4,'Storage','1 × SATA up to 10TB',3),
(23,4,'Form Factor','Recorder',4),
(24,5,'Channels','4',0),
(25,5,'Resolution','5MP',1),
(26,5,'Technology','ColorVu',2),
(27,5,'Storage','2TB included',3),
(28,5,'Form Factor','Kit',4),
(29,6,'Channels','4',0),
(30,6,'Resolution','8MP 4K',1),
(31,6,'Technology','AcuSense',2),
(32,6,'Storage','2TB included',3),
(33,6,'Form Factor','Kit',4),
(34,7,'Resolution','4MP',0),
(35,7,'Form Factor','PTZ',1),
(36,7,'Lens','25× optical',2),
(37,7,'Technology','DarkFighter',3),
(38,7,'IR Range','150m',4),
(39,8,'Resolution','3K',0),
(40,8,'Form Factor','Turret',1),
(41,8,'Lens','2.8mm',2),
(42,8,'Technology','ColorVu',3),
(43,8,'Channels','1',4),
(44,9,'Resolution','2MP',0),
(45,9,'Form Factor','PTZ',1),
(46,9,'Lens','15× optical',2),
(47,9,'Technology','DarkFighter',3),
(48,9,'IR Range','100m',4),
(49,10,'Resolution','6MP',0),
(50,10,'Form Factor','Dome',1),
(51,10,'Lens','2.8mm',2),
(52,10,'Technology','ColorVu',3),
(53,10,'Audio','Built-in mic',4),
(54,11,'Channels','16',0),
(55,11,'Resolution','Up to 12MP',1),
(56,11,'PoE','16 ports',2),
(57,11,'Storage','2 × SATA',3),
(58,11,'Form Factor','Recorder',4),
(59,12,'Channels','4',0),
(60,12,'Resolution','Up to 5MP',1),
(61,12,'Storage','1 × SATA',2),
(62,12,'Form Factor','Recorder',3),
(63,13,'Technology','Tri-X wireless',0),
(64,13,'Connectivity','Wi-Fi / LAN / 4G',1),
(65,13,'Zones','96',2),
(66,14,'Technology','Tri-X wireless',0),
(67,14,'Range','15m',1),
(68,14,'Pet immune','Up to 30kg',2),
(69,15,'Technology','2-wire',0),
(70,15,'Screen','7\" touch',1),
(71,15,'Form Factor','Kit',2),
(72,16,'Channels','4',0),
(73,16,'Resolution','1080P',1),
(74,16,'Storage','1 × SATA',2),
(75,16,'Form Factor','Recorder',3),
(76,17,'Channels','8',0),
(77,17,'Resolution','5MP',1),
(78,17,'Storage','1 × SATA',2),
(79,17,'Form Factor','Recorder',3),
(80,18,'Resolution','4MP',0),
(81,18,'Form Factor','Bullet',1),
(82,18,'Lens','2.8mm',2),
(83,18,'IR Range','30m',3),
(84,19,'Channels','4',0),
(85,19,'Resolution','1080P',1),
(86,19,'Form Factor','Kit',2),
(87,20,'Resolution','5MP',0),
(88,20,'Form Factor','Turret',1),
(89,20,'Lens','2.8mm',2),
(90,20,'Technology','Smart Hybrid Light',3),
(91,21,'Resolution','3K',0),
(92,21,'Form Factor','Dome',1),
(93,21,'Lens','2.8mm',2),
(94,21,'Technology','ColorVu',3),
(95,22,'Channels','8',0),
(96,22,'Resolution','5MP',1),
(97,22,'Storage','1 × SATA',2),
(98,22,'Form Factor','Recorder',3),
(99,23,'Channels','8',0),
(100,23,'Resolution','5MP',1),
(101,23,'Storage','4TB included',2),
(102,23,'Form Factor','Kit',3),
(103,24,'Technology','Jeweller wireless',0),
(104,24,'Connectivity','Wi-Fi / LAN / 2× SIM',1),
(105,24,'Zones','200',2),
(106,25,'Technology','Jeweller wireless',0),
(107,25,'Range','12m',1),
(108,25,'Pet immune','Up to 20kg',2),
(109,26,'Technology','Jeweller wireless',0),
(110,26,'Access','Code / card / fob',1),
(111,27,'PoE','8 ports',0),
(112,27,'Budget','120W',1),
(113,27,'Uplink','2 × Gigabit',2),
(114,27,'Form Factor','Switch',3),
(115,28,'Technology','Optical',0),
(116,28,'Battery','5 years',1),
(117,29,'Capacity','4TB',0),
(118,29,'Workload','24/7',1),
(119,29,'Interface','SATA III',2),
(120,30,'Colour','White',0),
(121,30,'Material','Aluminium alloy',1);
/*!40000 ALTER TABLE `product_specs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `value` varchar(120) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price_adjustment` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variants_product_id_foreign` (`product_id`),
  CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES
(1,30,'White','JB-UNI-W',0.00,100,NULL,1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,30,'Black','JB-UNI-B',1.00,50,NULL,1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` bigint(20) unsigned DEFAULT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `short_description` varchar(1000) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `key_features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`key_features`)),
  `retail_price` decimal(12,2) DEFAULT NULL,
  `retail_discount_type` varchar(10) NOT NULL DEFAULT 'none',
  `retail_discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `trade_price` decimal(12,2) DEFAULT NULL,
  `trade_discount_type` varchar(10) NOT NULL DEFAULT 'none',
  `trade_discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` decimal(12,2) DEFAULT NULL,
  `wholesale_discount_type` varchar(10) NOT NULL DEFAULT 'none',
  `wholesale_discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_starts_at` timestamp NULL DEFAULT NULL,
  `discount_ends_at` timestamp NULL DEFAULT NULL,
  `vat_mode` varchar(10) NOT NULL DEFAULT 'default',
  `track_stock` tinyint(1) NOT NULL DEFAULT 1,
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `allow_backorder` tinyint(1) NOT NULL DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `option_name` varchar(60) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_new` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `sales_count` int(10) unsigned NOT NULL DEFAULT 0,
  `views` int(10) unsigned NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_category_id_is_active_index` (`category_id`,`is_active`),
  KEY `products_brand_id_is_active_index` (`brand_id`,`is_active`),
  KEY `products_is_active_index` (`is_active`),
  CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,1,3,'Tenvo 5MP ColorVu IP Dome Camera, 2.8mm','tenvo-5mp-colorvu-ip-dome-camera-28mm','TV-IPD5-28','5MP ultra-clear imaging. 24/7 full-colour night vision.','<p><strong>Tenvo 5MP ColorVu IP Dome Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>5MP ultra-clear imaging. 24/7 full-colour night vision. Built-in microphone. Human &amp; vehicle detection. IP67 weatherproof, IK10 vandal-proof.</p>','[\"5MP ultra-clear imaging\",\"24\\/7 full-colour night vision\",\"Built-in microphone\",\"Human & vehicle detection\",\"IP67 weatherproof, IK10 vandal-proof\"]',79.99,'percent',10.00,54.99,'percent',5.00,49.99,'none',0.00,NULL,NULL,'default',1,48,0,NULL,0.600,NULL,1,1,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,1,5,'Tenvo 3K Smart Hybrid Light Turret Camera, 2.8mm','tenvo-3k-smart-hybrid-light-turret-camera-28mm','TV-IPT3K-28','Smart Hybrid Light — IR or white light on demand. 3K resolution.','<p><strong>Tenvo 3K Smart Hybrid Light Turret Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Smart Hybrid Light — IR or white light on demand. 3K resolution. AI motion detection. Two-way audio ready.</p>','[\"Smart Hybrid Light \\u2014 IR or white light on demand\",\"3K resolution\",\"AI motion detection\",\"Two-way audio ready\"]',69.99,'percent',12.00,47.50,'percent',5.00,43.00,'none',0.00,NULL,NULL,'default',1,60,0,NULL,0.600,NULL,1,1,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,1,4,'Tenvo 8MP 4K AcuSense Bullet Camera, 4mm','tenvo-8mp-4k-acusense-bullet-camera-4mm','TV-IPB8-4','True 4K detail. AcuSense false-alarm reduction.','<p><strong>Tenvo 8MP 4K AcuSense Bullet Camera, 4mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>True 4K detail. AcuSense false-alarm reduction. Strobe light &amp; audio deterrent.</p>','[\"True 4K detail\",\"AcuSense false-alarm reduction\",\"Strobe light & audio deterrent\"]',109.99,'fixed',10.00,76.00,'percent',5.00,69.00,'none',0.00,NULL,NULL,'default',1,22,0,NULL,0.600,NULL,1,1,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,1,18,'Tenvo 8 Channel 4K PoE NVR with AcuSense','tenvo-8-channel-4k-poe-nvr-with-acusense','TV-NVR8P','8 PoE ports — one cable per camera. H.265+ compression.','<p><strong>Tenvo 8 Channel 4K PoE NVR with AcuSense</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>8 PoE ports — one cable per camera. H.265+ compression. Free mobile app.</p>','[\"8 PoE ports \\u2014 one cable per camera\",\"H.265+ compression\",\"Free mobile app\"]',189.99,'percent',8.00,132.00,'percent',5.00,119.00,'none',0.00,NULL,NULL,'default',1,18,0,NULL,2.200,NULL,1,1,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(5,1,13,'Tenvo 4 Camera 5MP ColorVu IP Kit with 2TB NVR','tenvo-4-camera-5mp-colorvu-ip-kit-with-2tb-nvr','TV-KIT4-5MP','Complete plug-and-play kit. 4 × 5MP ColorVu cameras.','<p><strong>Tenvo 4 Camera 5MP ColorVu IP Kit with 2TB NVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Complete plug-and-play kit. 4 × 5MP ColorVu cameras. 2TB surveillance HDD pre-installed.</p>','[\"Complete plug-and-play kit\",\"4 \\u00d7 5MP ColorVu cameras\",\"2TB surveillance HDD pre-installed\"]',449.99,'percent',15.00,319.00,'percent',5.00,289.00,'none',0.00,NULL,NULL,'default',1,12,0,NULL,6.500,NULL,1,1,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(6,1,14,'Tenvo 4 Camera 4K AcuSense Turret Kit','tenvo-4-camera-4k-acusense-turret-kit','TV-KIT4-4K','4K clarity on every camera. Smart human/vehicle alerts.','<p><strong>Tenvo 4 Camera 4K AcuSense Turret Kit</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>4K clarity on every camera. Smart human/vehicle alerts.</p>','[\"4K clarity on every camera\",\"Smart human\\/vehicle alerts\"]',599.99,'none',0.00,429.00,'none',0.00,395.00,'none',0.00,NULL,NULL,'default',1,6,0,NULL,6.500,NULL,1,0,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(7,1,6,'Tenvo 4MP 25× Optical Zoom PTZ Camera','tenvo-4mp-25-optical-zoom-ptz-camera','TV-PTZ4-25X','25× optical zoom. Auto-tracking.','<p><strong>Tenvo 4MP 25× Optical Zoom PTZ Camera</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>25× optical zoom. Auto-tracking. 150m IR.</p>','[\"25\\u00d7 optical zoom\",\"Auto-tracking\",\"150m IR\"]',649.99,'percent',5.00,469.00,'percent',5.00,439.00,'none',0.00,NULL,NULL,'default',1,4,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(8,2,5,'Hikvision Turbo HD 3K ColorVu Dual-Lens Turret Camera, 2.8mm','hikvision-turbo-hd-3k-colorvu-dual-lens-turret-camera-28mm','DS-2CE70KF0T-MFS','3K high resolution. ColorVu technology.','<p><strong>Hikvision Turbo HD 3K ColorVu Dual-Lens Turret Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>3K high resolution. ColorVu technology. Dual-lens design. Turbo HD over coax.</p>','[\"3K high resolution\",\"ColorVu technology\",\"Dual-lens design\",\"Turbo HD over coax\"]',62.50,'percent',8.00,44.00,'percent',5.00,40.00,'none',0.00,NULL,NULL,'default',1,35,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(9,2,6,'Hikvision 2MP 15× DarkFighter AcuSense IR Network PTZ Camera','hikvision-2mp-15-darkfighter-acusense-ir-network-ptz-camera','DS-2DE4215IW-DE','15× optical zoom. AcuSense human/vehicle classification.','<p><strong>Hikvision 2MP 15× DarkFighter AcuSense IR Network PTZ Camera</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>15× optical zoom. AcuSense human/vehicle classification. DarkFighter ultra-low-light.</p>','[\"15\\u00d7 optical zoom\",\"AcuSense human\\/vehicle classification\",\"DarkFighter ultra-low-light\"]',261.96,'percent',8.00,199.00,'percent',5.00,185.00,'none',0.00,NULL,NULL,'default',1,9,0,NULL,0.600,NULL,1,1,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(10,2,3,'Hikvision 6MP AcuSense ColorVu Dome Camera, 2.8mm','hikvision-6mp-acusense-colorvu-dome-camera-28mm','DS-2CD2167G2-SU','ColorVu 2.0. AcuSense 2.0.','<p><strong>Hikvision 6MP AcuSense ColorVu Dome Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>ColorVu 2.0. AcuSense 2.0. Built-in mic.</p>','[\"ColorVu 2.0\",\"AcuSense 2.0\",\"Built-in mic\"]',159.99,'none',0.00,112.00,'none',0.00,104.00,'none',0.00,NULL,NULL,'default',1,14,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(11,2,18,'Hikvision 16 Channel 4K AcuSense PoE NVR','hikvision-16-channel-4k-acusense-poe-nvr','DS-7616NXI-K2/16P','16 PoE ports. AcuSense smart search.','<p><strong>Hikvision 16 Channel 4K AcuSense PoE NVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>16 PoE ports. AcuSense smart search. 2 HDD bays.</p>','[\"16 PoE ports\",\"AcuSense smart search\",\"2 HDD bays\"]',489.99,'percent',6.00,362.00,'percent',5.00,339.00,'none',0.00,NULL,NULL,'default',1,7,0,NULL,2.200,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(12,2,19,'Hikvision 4 Channel 3K/5MP AcuSense Turbo HD DVR','hikvision-4-channel-3k5mp-acusense-turbo-hd-dvr','IDS-7204HUHI-M1/S','5-in-1 hybrid recorder. AcuSense on all channels.','<p><strong>Hikvision 4 Channel 3K/5MP AcuSense Turbo HD DVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>5-in-1 hybrid recorder. AcuSense on all channels.</p>','[\"5-in-1 hybrid recorder\",\"AcuSense on all channels\"]',98.99,'percent',10.00,69.00,'percent',5.00,64.47,'none',0.00,NULL,NULL,'default',1,25,0,NULL,2.200,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(13,2,22,'Hikvision AX Pro Wireless Alarm Hub','hikvision-ax-pro-wireless-alarm-hub','DS-PWA96-M-WE','96 wireless zones. Video verification.','<p><strong>Hikvision AX Pro Wireless Alarm Hub</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>96 wireless zones. Video verification. Hik-Connect app.</p>','[\"96 wireless zones\",\"Video verification\",\"Hik-Connect app\"]',179.99,'percent',5.00,128.00,'percent',5.00,118.00,'none',0.00,NULL,NULL,'default',1,15,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(14,2,23,'Hikvision AX Pro Wireless PIR Detector','hikvision-ax-pro-wireless-pir-detector','DS-PDP15P-EG2-WE','Pet immune. 5-year battery.','<p><strong>Hikvision AX Pro Wireless PIR Detector</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Pet immune. 5-year battery.</p>','[\"Pet immune\",\"5-year battery\"]',39.99,'none',0.00,27.50,'none',0.00,25.00,'none',0.00,NULL,NULL,'default',1,80,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(15,2,30,'Hikvision 2-Wire IP Video Intercom Kit','hikvision-2-wire-ip-video-intercom-kit','DS-KIS703-P','Use existing 2-wire cabling. 7-inch indoor station.','<p><strong>Hikvision 2-Wire IP Video Intercom Kit</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Use existing 2-wire cabling. 7-inch indoor station. App call forwarding.</p>','[\"Use existing 2-wire cabling\",\"7-inch indoor station\",\"App call forwarding\"]',299.99,'percent',10.00,218.00,'percent',5.00,205.00,'none',0.00,NULL,NULL,'default',1,8,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(16,3,19,'HiLook 4CH 1080P Lite DVR','hilook-4ch-1080p-lite-dvr','DVR-204G-K1','H.265 Pro+. Compact design.','<p><strong>HiLook 4CH 1080P Lite DVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>H.265 Pro+. Compact design.</p>','[\"H.265 Pro+\",\"Compact design\"]',37.35,'percent',10.00,26.00,'percent',5.00,24.00,'none',0.00,NULL,NULL,'default',1,40,0,NULL,2.200,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(17,3,19,'HiLook 8CH 5MP Hybrid Smart Motion DVR','hilook-8ch-5mp-hybrid-smart-motion-dvr','DVR-208U-M1','Smart motion detection. 5-in-1 hybrid.','<p><strong>HiLook 8CH 5MP Hybrid Smart Motion DVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Smart motion detection. 5-in-1 hybrid.</p>','[\"Smart motion detection\",\"5-in-1 hybrid\"]',94.54,'none',0.00,66.00,'none',0.00,61.00,'none',0.00,NULL,NULL,'default',1,21,0,NULL,2.200,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(18,3,4,'HiLook 4MP IP Bullet Camera, 2.8mm','hilook-4mp-ip-bullet-camera-28mm','IPC-B140H','4MP clarity. PoE powered.','<p><strong>HiLook 4MP IP Bullet Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>4MP clarity. PoE powered.</p>','[\"4MP clarity\",\"PoE powered\"]',39.99,'percent',5.00,27.00,'percent',5.00,24.50,'none',0.00,NULL,NULL,'default',1,55,0,NULL,0.600,NULL,1,0,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(19,3,16,'HiLook 4 Camera 1080P Turbo HD Kit','hilook-4-camera-1080p-turbo-hd-kit','HL-KIT4-1080','Everything included. Great value starter kit.','<p><strong>HiLook 4 Camera 1080P Turbo HD Kit</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Everything included. Great value starter kit.</p>','[\"Everything included\",\"Great value starter kit\"]',199.99,'percent',12.00,139.00,'percent',5.00,129.00,'none',0.00,NULL,NULL,'default',1,16,0,NULL,6.500,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(20,4,5,'Hizone Pro 5MP Smart Hybrid Light Turret Camera, Black','hizone-pro-5mp-smart-hybrid-light-turret-camera-black','HZP-T5-SHL-BK','Smart hybrid light. Built-in mic.','<p><strong>Hizone Pro 5MP Smart Hybrid Light Turret Camera, Black</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Smart hybrid light. Built-in mic. Black housing.</p>','[\"Smart hybrid light\",\"Built-in mic\",\"Black housing\"]',49.99,'percent',10.00,34.00,'percent',5.00,31.00,'none',0.00,NULL,NULL,'default',1,33,0,NULL,0.600,NULL,1,0,1,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(21,4,3,'Hizone Pro 3K ColorVu Dome Camera, 2.8mm','hizone-pro-3k-colorvu-dome-camera-28mm','HZP-D3K-CV','Full-colour 24/7. Vandal resistant.','<p><strong>Hizone Pro 3K ColorVu Dome Camera, 2.8mm</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Full-colour 24/7. Vandal resistant.</p>','[\"Full-colour 24\\/7\",\"Vandal resistant\"]',54.99,'none',0.00,38.00,'none',0.00,35.00,'none',0.00,NULL,NULL,'default',1,28,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(22,4,19,'Hizone Pro 8CH AcuSense 2-Way Talk Facial Recognition DVR','hizone-pro-8ch-acusense-2-way-talk-facial-recognition-dvr','HZP-DVR8-FR','Facial recognition. Two-way audio.','<p><strong>Hizone Pro 8CH AcuSense 2-Way Talk Facial Recognition DVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Facial recognition. Two-way audio.</p>','[\"Facial recognition\",\"Two-way audio\"]',154.30,'percent',10.00,109.00,'percent',5.00,99.00,'none',0.00,NULL,NULL,'default',1,10,0,NULL,2.200,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(23,4,15,'Hizone Pro 8 Camera 5MP IP Kit with 4TB NVR','hizone-pro-8-camera-5mp-ip-kit-with-4tb-nvr','HZP-KIT8-5MP','8 cameras + NVR. 4TB pre-installed.','<p><strong>Hizone Pro 8 Camera 5MP IP Kit with 4TB NVR</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>8 cameras + NVR. 4TB pre-installed.</p>','[\"8 cameras + NVR\",\"4TB pre-installed\"]',849.99,'percent',10.00,615.00,'percent',5.00,579.00,'none',0.00,NULL,NULL,'default',1,3,0,NULL,6.500,NULL,1,1,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(24,5,25,'Ajax Hub 2 Plus Wireless Alarm Control Panel, White','ajax-hub-2-plus-wireless-alarm-control-panel-white','AJ-HUB2PLUS-W','Photo verification. 4 communication channels.','<p><strong>Ajax Hub 2 Plus Wireless Alarm Control Panel, White</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Photo verification. 4 communication channels. Grade 2 certified.</p>','[\"Photo verification\",\"4 communication channels\",\"Grade 2 certified\"]',289.99,'none',0.00,209.00,'none',0.00,195.00,'none',0.00,NULL,NULL,'default',1,11,0,NULL,0.600,NULL,1,1,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(25,5,26,'Ajax MotionProtect Wireless PIR Detector','ajax-motionprotect-wireless-pir-detector','AJ-MP-W','Pet immune. 7-year battery life.','<p><strong>Ajax MotionProtect Wireless PIR Detector</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Pet immune. 7-year battery life.</p>','[\"Pet immune\",\"7-year battery life\"]',54.99,'percent',5.00,39.00,'percent',5.00,36.00,'none',0.00,NULL,NULL,'default',1,64,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(26,5,27,'Ajax KeyPad Plus Wireless Touch Keypad','ajax-keypad-plus-wireless-touch-keypad','AJ-KPP-B','Contactless cards & fobs. Touch keypad.','<p><strong>Ajax KeyPad Plus Wireless Touch Keypad</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Contactless cards &amp; fobs. Touch keypad.</p>','[\"Contactless cards & fobs\",\"Touch keypad\"]',99.99,'none',0.00,72.00,'none',0.00,67.00,'none',0.00,NULL,NULL,'default',1,0,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(27,1,35,'Tenvo 8-Port Gigabit PoE+ Switch, 120W','tenvo-8-port-gigabit-poe-switch-120w','TV-SW8P-120','Extended 250m mode. Unmanaged plug-and-play.','<p><strong>Tenvo 8-Port Gigabit PoE+ Switch, 120W</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Extended 250m mode. Unmanaged plug-and-play.</p>','[\"Extended 250m mode\",\"Unmanaged plug-and-play\"]',89.99,'none',0.00,62.00,'none',0.00,57.00,'none',0.00,NULL,NULL,'default',1,30,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(28,2,32,'Hikvision Wireless Optical Smoke Detector','hikvision-wireless-optical-smoke-detector','DS-PDSMK-S-WE','85dB siren. Wireless.','<p><strong>Hikvision Wireless Optical Smoke Detector</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>85dB siren. Wireless.</p>','[\"85dB siren\",\"Wireless\"]',44.99,'percent',10.00,31.00,'percent',5.00,28.50,'none',0.00,NULL,NULL,'default',1,37,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(29,NULL,38,'4TB Surveillance Hard Drive, 24/7 Rated','4tb-surveillance-hard-drive-247-rated','HDD-4TB-SURV','Designed for 24/7 recording. Supports up to 64 cameras.','<p><strong>4TB Surveillance Hard Drive, 24/7 Rated</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Designed for 24/7 recording. Supports up to 64 cameras.</p>','[\"Designed for 24\\/7 recording\",\"Supports up to 64 cameras\"]',99.99,'none',0.00,74.00,'none',0.00,69.00,'none',0.00,NULL,NULL,'default',1,45,0,NULL,0.600,NULL,1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(30,NULL,39,'Universal Junction Box for Dome & Turret Cameras, White','universal-junction-box-for-dome-turret-cameras-white','JB-UNI-W','Hides cable joints. Weatherproof.','<p><strong>Universal Junction Box for Dome &amp; Turret Cameras, White</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>Hides cable joints. Weatherproof.</p>','[\"Hides cable joints\",\"Weatherproof\"]',14.99,'none',0.00,9.50,'none',0.00,8.50,'none',0.00,NULL,NULL,'default',1,150,0,NULL,0.600,'Colour',1,0,0,0,0,0,NULL,NULL,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `redirects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `redirects` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `from_path` varchar(255) NOT NULL,
  `to_path` varchar(255) NOT NULL,
  `status_code` smallint(5) unsigned NOT NULL DEFAULT 301,
  `hits` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `redirects_from_path_unique` (`from_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `redirects` WRITE;
/*!40000 ALTER TABLE `redirects` DISABLE KEYS */;
/*!40000 ALTER TABLE `redirects` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `stripe_refund_id` varchar(255) DEFAULT NULL,
  `restocked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `refunds_order_id_foreign` (`order_id`),
  CONSTRAINT `refunds_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_product_id_user_id_unique` (`product_id`,`user_id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `shipping_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_methods` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shipping_zone_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `delivery_estimate` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'flat',
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `rates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rates`)),
  `free_shipping_eligible` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shipping_methods_shipping_zone_id_foreign` (`shipping_zone_id`),
  CONSTRAINT `shipping_methods_shipping_zone_id_foreign` FOREIGN KEY (`shipping_zone_id`) REFERENCES `shipping_zones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `shipping_methods` WRITE;
/*!40000 ALTER TABLE `shipping_methods` DISABLE KEYS */;
INSERT INTO `shipping_methods` VALUES
(1,1,'Standard delivery',NULL,'2–3 working days','flat',6.95,NULL,1,1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,1,'Next working day','Order before 2pm','Next working day','flat',12.95,NULL,0,1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,2,'Highlands & Islands delivery',NULL,'3–5 working days','weight',0.00,'[{\"min\":0,\"max\":5,\"cost\":14.95},{\"min\":5,\"max\":20,\"cost\":24.95},{\"min\":20,\"max\":null,\"cost\":39.95}]',0,1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,3,'Northern Ireland delivery',NULL,'3–4 working days','flat',11.95,NULL,1,1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `shipping_methods` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `shipping_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_zones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `countries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`countries`)),
  `postcode_prefixes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`postcode_prefixes`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `shipping_zones` WRITE;
/*!40000 ALTER TABLE `shipping_zones` DISABLE KEYS */;
INSERT INTO `shipping_zones` VALUES
(1,'UK Mainland','[\"GB\"]','[]',1,3,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'Highlands & Islands','[\"GB\"]','[\"HS\",\"IV\",\"KW\",\"ZE\",\"PA20\",\"PA41\",\"PA42\",\"PH17\",\"PH41\",\"KA27\",\"KA28\",\"IM\",\"GY\",\"JE\",\"TR21\"]',1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'Northern Ireland','[\"GB\"]','[\"BT\"]',1,2,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `shipping_zones` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `stock_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `email` varchar(255) NOT NULL,
  `notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_notifications_product_id_email_unique` (`product_id`,`email`),
  CONSTRAINT `stock_notifications_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `stock_notifications` WRITE;
/*!40000 ALTER TABLE `stock_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `trade_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_applications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `requested_tier` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `company_name` varchar(255) NOT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `company_number` varchar(50) DEFAULT NULL,
  `business_type` varchar(80) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `business_address` varchar(500) DEFAULT NULL,
  `monthly_spend` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `rejection_reason` varchar(1000) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trade_applications_user_id_foreign` (`user_id`),
  KEY `trade_applications_status_index` (`status`),
  CONSTRAINT `trade_applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `trade_applications` WRITE;
/*!40000 ALTER TABLE `trade_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `trade_applications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `training_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `price_label` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `training_courses` WRITE;
/*!40000 ALTER TABLE `training_courses` DISABLE KEYS */;
INSERT INTO `training_courses` VALUES
(1,'CCTV Installer Foundation','Hands-on introduction to analogue and IP CCTV: cabling, camera positioning, NVR/DVR setup and remote viewing.','2 days','£50 deposit',1,0,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(2,'Advanced IP & Network Video','PoE budgeting, VLANs, port forwarding alternatives, AcuSense/ColorVu tuning and multi-site management.','1 day','£50 deposit',1,1,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(3,'Intruder Alarm Systems (AX Pro & Ajax)','Wireless alarm design, detector placement, app setup, ARC connectivity and customer handover.','1 day','£50 deposit',1,2,'2026-10-31 04:55:53','2026-10-31 04:55:53'),
(4,'Access Control & Video Intercom','Door entry, maglocks, readers, PSU sizing and intercom commissioning.','1 day','£50 deposit',1,3,'2026-10-31 04:55:53','2026-10-31 04:55:53');
/*!40000 ALTER TABLE `training_courses` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `training_enquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_enquiries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `training_course_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `course_title` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `postcode` varchar(20) DEFAULT NULL,
  `phone` varchar(40) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `training_enquiries_training_course_id_foreign` (`training_course_id`),
  KEY `training_enquiries_user_id_foreign` (`user_id`),
  KEY `training_enquiries_status_index` (`status`),
  CONSTRAINT `training_enquiries_training_course_id_foreign` FOREIGN KEY (`training_course_id`) REFERENCES `training_courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `training_enquiries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `training_enquiries` WRITE;
/*!40000 ALTER TABLE `training_enquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_enquiries` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `tier` varchar(20) NOT NULL DEFAULT 'retailer',
  `company_name` varchar(255) DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `company_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `marketing_opt_in` tinyint(1) NOT NULL DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tier_index` (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `wishlists_product_id_foreign` (`product_id`),
  CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

