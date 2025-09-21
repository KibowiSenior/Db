-- SGX Core

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database
CREATE DATABASE IF NOT EXISTS `sgxcorev1` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sgxcorev1`;

-- --------------------------------------------------------
-- Table structure for table `apartments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `apartments`;
CREATE TABLE `apartments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `citizenid` varchar(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`),
  KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample apartment data
INSERT INTO `apartments` (`id`, `name`, `type`, `label`, `citizenid`) VALUES
(10, 'apartment11794', 'apartment1', 'Apartments 1794', 'KBN48829'),
(14, 'apartment19123', 'apartment1', 'Apartments 9123', 'JIY91569'),
(15, 'apartment19470', 'apartment1', 'Apartments 9470', 'TDN82412'),
(16, 'apartment17851', 'apartment1', 'Apartments 7851', 'QEZ87736'),
(17, 'apartment18617', 'apartment1', 'Apartments 8617', 'XGI09387'),
(18, 'apartment14479', 'apartment1', 'Apartments 4479', 'OGB23731');

-- --------------------------------------------------------
-- Table structure for table `bank_accounts`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `bank_accounts`;
CREATE TABLE `bank_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(11) DEFAULT NULL,
  `account_name` varchar(50) DEFAULT NULL,
  `account_balance` int(11) NOT NULL DEFAULT 0,
  `account_type` enum('shared','job','gang') NOT NULL,
  `users` longtext DEFAULT '[]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_name` (`account_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `bank_statements`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `bank_statements`;
CREATE TABLE `bank_statements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(11) DEFAULT NULL,
  `account_name` varchar(50) DEFAULT 'checking',
  `amount` int(11) DEFAULT NULL,
  `reason` varchar(50) DEFAULT NULL,
  `statement_type` enum('deposit','withdraw') DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `bans`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `bans`;
CREATE TABLE `bans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `license` varchar(50) DEFAULT NULL,
  `discord` varchar(50) DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `expire` int(11) DEFAULT NULL,
  `bannedby` varchar(255) NOT NULL DEFAULT 'LeBanhammer',
  PRIMARY KEY (`id`),
  KEY `license` (`license`),
  KEY `discord` (`discord`),
  KEY `ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `players`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(11) NOT NULL,
  `cid` int(11) DEFAULT NULL,
  `license` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `money` text NOT NULL,
  `charinfo` text DEFAULT NULL,
  `job` text NOT NULL,
  `gang` text DEFAULT NULL,
  `position` text NOT NULL,
  `metadata` text NOT NULL,
  `inventory` longtext DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`citizenid`),
  KEY `id` (`id`),
  KEY `last_updated` (`last_updated`),
  KEY `license` (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample player data
INSERT INTO `players` (`id`, `citizenid`, `cid`, `license`, `name`, `money`, `charinfo`, `job`, `gang`, `position`, `metadata`, `inventory`, `last_updated`) VALUES
(1912, 'JIY91569', 1, 'license:615cd127368c5800a4a41ca27970b1e8048a0e4f', 'delhisehu213', '{"black_money":0,"bank":5000,"casino":0,"cash":500,"crypto":0}', '{"firstname":"John","cid":"1","gender":0,"phone":"4148725065","birthdate":"1990-01-01","nationality":"USA","lastname":"Doe","account":"US06QBCore7980423761"}', '{"type":"leo","name":"police","onduty":false,"label":"Los Santos Police Department","isboss":false,"grade":{"payment":500,"isboss":false,"name":"Officer","level":1}}', '{"grade":{"name":"none","level":0},"isboss":false,"name":"none","label":"No Gang Affiliation"}', '{"x":427.91,"y":-1003.96,"z":30.69}', '{"bloodtype":"A+","phonedata":{"InstalledApps":[],"SerialNumber":37988837},"hunger":100,"thirst":100,"stress":0,"armor":0}', '[]', NOW());

-- --------------------------------------------------------
-- Table structure for table `player_vehicles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_vehicles`;
CREATE TABLE `player_vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `license` varchar(50) DEFAULT NULL,
  `citizenid` varchar(11) DEFAULT NULL,
  `vehicle` varchar(50) DEFAULT NULL,
  `hash` varchar(50) DEFAULT NULL,
  `mods` longtext DEFAULT NULL,
  `plate` varchar(8) NOT NULL,
  `fakeplate` varchar(8) DEFAULT NULL,
  `garage` varchar(50) DEFAULT NULL,
  `fuel` int(11) DEFAULT 100,
  `engine` float DEFAULT 1000,
  `body` float DEFAULT 1000,
  `state` int(11) DEFAULT 1,
  `depotprice` int(11) NOT NULL DEFAULT 0,
  `drivingdistance` int(50) DEFAULT NULL,
  `status` text DEFAULT NULL,
  `balance` int(11) NOT NULL DEFAULT 0,
  `paymentamount` int(11) NOT NULL DEFAULT 0,
  `paymentsleft` int(11) NOT NULL DEFAULT 0,
  `financetime` int(11) NOT NULL DEFAULT 0,
  `logs` longtext DEFAULT '[]',
  PRIMARY KEY (`id`),
  KEY `plate` (`plate`),
  KEY `citizenid` (`citizenid`),
  KEY `license` (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `playerskins`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `playerskins`;
CREATE TABLE `playerskins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `skin` text NOT NULL,
  `active` tinyint(2) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`),
  KEY `active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_messages`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_messages`;
CREATE TABLE `phone_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `number` varchar(50) DEFAULT NULL,
  `messages` text DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`),
  KEY `number` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_tweets`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_tweets`;
CREATE TABLE `phone_tweets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `firstName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) DEFAULT NULL,
  `type` varchar(25) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `tweetId` varchar(25) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `stashitems`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `stashitems`;
CREATE TABLE `stashitems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stash` varchar(255) NOT NULL,
  `items` longtext DEFAULT NULL,
  PRIMARY KEY (`stash`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `gloveboxitems`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `gloveboxitems`;
CREATE TABLE `gloveboxitems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plate` varchar(255) NOT NULL,
  `items` longtext DEFAULT NULL,
  PRIMARY KEY (`plate`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `trunkitems`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `trunkitems`;
CREATE TABLE `trunkitems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plate` varchar(255) NOT NULL,
  `items` longtext DEFAULT NULL,
  PRIMARY KEY (`plate`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_mails`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_mails`;
CREATE TABLE `player_mails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `sender` varchar(50) DEFAULT NULL,
  `subject` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `read` tinyint(4) DEFAULT 0,
  `mailid` int(11) DEFAULT NULL,
  `date` timestamp NULL DEFAULT current_timestamp(),
  `button` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_jobs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_jobs`;
CREATE TABLE `player_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobname` varchar(50) DEFAULT NULL,
  `employees` text DEFAULT NULL,
  `maxEmployee` tinyint(11) DEFAULT 15,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample job data
INSERT INTO `player_jobs` (`id`, `jobname`, `employees`, `maxEmployee`) VALUES
(1, 'police', '{}', 50),
(2, 'ambulance', '{}', 30),
(3, 'mechanic', '{}', 20),
(4, 'taxi', '{}', 15),
(5, 'realestate', '{}', 10);

-- --------------------------------------------------------
-- Table structure for table `crypto`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `crypto`;
CREATE TABLE `crypto` (
  `crypto` varchar(50) NOT NULL DEFAULT 'qbit',
  `worth` int(11) NOT NULL DEFAULT 0,
  `history` text DEFAULT NULL,
  PRIMARY KEY (`crypto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `crypto` (`crypto`, `worth`, `history`) VALUES
('qbit', 1000, '[]');

-- --------------------------------------------------------
-- Table structure for table `configs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `configs`;
CREATE TABLE `configs` (
  `name` varchar(20) NOT NULL,
  `config` text DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `inventories`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `inventories`;
CREATE TABLE `inventories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(50) NOT NULL,
  `items` longtext DEFAULT '[]',
  PRIMARY KEY (`identifier`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_houses`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_houses`;
CREATE TABLE `player_houses` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `house` varchar(50) NOT NULL,
  `identifier` varchar(50) DEFAULT NULL,
  `citizenid` varchar(50) DEFAULT NULL,
  `keyholders` text DEFAULT NULL,
  `decorations` text DEFAULT NULL,
  `stash` text DEFAULT NULL,
  `outfit` text DEFAULT NULL,
  `logout` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `house` (`house`),
  KEY `citizenid` (`citizenid`),
  KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_chatrooms`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_chatrooms`;
CREATE TABLE `phone_chatrooms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `room_code` varchar(10) NOT NULL,
  `room_name` varchar(15) NOT NULL,
  `room_owner_id` varchar(20) DEFAULT NULL,
  `room_owner_name` varchar(60) DEFAULT NULL,
  `room_members` text DEFAULT '{}',
  `room_pin` varchar(50) DEFAULT NULL,
  `unpaid_balance` decimal(10,2) DEFAULT 0.00,
  `is_pinned` tinyint(1) DEFAULT 0,
  `created` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_code` (`room_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `phone_chatrooms` (`id`, `room_code`, `room_name`, `room_owner_id`, `room_owner_name`, `room_members`, `room_pin`, `unpaid_balance`, `is_pinned`, `created`) VALUES
(1, '911', 'Emergency', 'official', 'Government', '{}', NULL, 0.00, 1, NOW()),
(2, 'news', 'News', 'official', 'Government', '{}', NULL, 0.00, 1, NOW()),
(3, 'events', 'Events', 'official', 'Government', '{}', NULL, 0.00, 1, NOW());

-- --------------------------------------------------------
-- Table structure for table `phone_chatroom_messages`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_chatroom_messages`;
CREATE TABLE `phone_chatroom_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `room_id` int(10) unsigned DEFAULT NULL,
  `member_id` varchar(20) DEFAULT NULL,
  `member_name` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `created` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `houselocations`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `houselocations`;
CREATE TABLE `houselocations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `coords` text DEFAULT NULL,
  `owned` tinyint(2) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `tier` tinyint(4) DEFAULT NULL,
  `garage` text NOT NULL DEFAULT '{"y":0,"x":0,"w":0,"z":0}',
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample house locations
INSERT INTO `houselocations` (`id`, `name`, `label`, `coords`, `owned`, `price`, `tier`, `garage`) VALUES
(1, 'house1', 'Luxury Villa', '{"x": 100.0, "y": 200.0, "z": 30.0, "h": 90.0}', 0, 500000, 3, '{"x": 95.0, "y": 195.0, "z": 30.0, "h": 90.0}'),
(2, 'house2', 'Modern House', '{"x": 150.0, "y": 250.0, "z": 35.0, "h": 180.0}', 0, 350000, 2, '{"x": 145.0, "y": 245.0, "z": 35.0, "h": 180.0}');

-- --------------------------------------------------------
-- Table structure for table `shared_vehicles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `shared_vehicles`;
CREATE TABLE `shared_vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plate` varchar(50) NOT NULL,
  `vehicle` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'None',
  `hash` varchar(50) DEFAULT NULL,
  `fuel` int(11) DEFAULT 100,
  `engine` float DEFAULT 1000,
  `body` float DEFAULT 1000,
  `state` varchar(50) DEFAULT 'Stored',
  `faction` varchar(50) DEFAULT NULL,
  `garage` varchar(50) DEFAULT NULL,
  `mods` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plate` (`plate`),
  KEY `category` (`category`),
  KEY `garage` (`garage`),
  KEY `state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `properties`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `property_id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_citizenid` varchar(50) DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `has_access` longtext DEFAULT '[]',
  `extra_imgs` longtext DEFAULT '[]',
  `furnitures` longtext DEFAULT '[]',
  `for_sale` tinyint(1) NOT NULL DEFAULT 1,
  `price` int(11) NOT NULL DEFAULT 0,
  `shell` varchar(50) NOT NULL,
  `apartment` varchar(50) DEFAULT NULL,
  `door_data` longtext DEFAULT NULL,
  `garage_data` longtext DEFAULT NULL,
  PRIMARY KEY (`property_id`),
  UNIQUE KEY `UQ_owner_apartment` (`owner_citizenid`,`apartment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_contacts`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_contacts`;
CREATE TABLE `player_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_invoices`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_invoices`;
CREATE TABLE `phone_invoices` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `amount` int(11) NOT NULL DEFAULT 0,
  `society` tinytext DEFAULT NULL,
  `sender` varchar(50) DEFAULT NULL,
  `sendercitizenid` varchar(50) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_gallery`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_gallery`;
CREATE TABLE `phone_gallery` (
  `citizenid` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `phone_note`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `phone_note`;
CREATE TABLE `phone_note` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `text` text DEFAULT NULL,
  `lastupdate` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_outfits`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_outfits`;
CREATE TABLE `player_outfits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) DEFAULT NULL,
  `outfitname` varchar(50) NOT NULL DEFAULT '0',
  `model` varchar(50) DEFAULT NULL,
  `props` varchar(1000) DEFAULT NULL,
  `components` varchar(1500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizenid_outfitname_model` (`citizenid`,`outfitname`,`model`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `player_warns`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `player_warns`;
CREATE TABLE `player_warns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `senderIdentifier` varchar(50) DEFAULT NULL,
  `targetIdentifier` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `warnId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `cryptominers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `cryptominers`;
CREATE TABLE `cryptominers` (
  `citizenid` varchar(50) NOT NULL,
  `card` varchar(50) NOT NULL,
  `balance` double NOT NULL,
  PRIMARY KEY (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `crypto_transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `crypto_transactions`;
CREATE TABLE `crypto_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(11) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `message` varchar(50) DEFAULT NULL,
  `date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `dealers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `dealers`;
CREATE TABLE `dealers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '0',
  `coords` longtext DEFAULT NULL,
  `time` longtext DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `house_plants`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `house_plants`;
CREATE TABLE `house_plants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `building` varchar(50) DEFAULT NULL,
  `stage` int(11) DEFAULT 1,
  `sort` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `food` int(11) DEFAULT 100,
  `health` int(11) DEFAULT 100,
  `progress` int(11) DEFAULT 0,
  `coords` text DEFAULT NULL,
  `plantid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `building` (`building`),
  KEY `plantid` (`plantid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `lapraces`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `lapraces`;
CREATE TABLE `lapraces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `checkpoints` text DEFAULT NULL,
  `records` text DEFAULT NULL,
  `creator` varchar(50) DEFAULT NULL,
  `distance` int(11) DEFAULT NULL,
  `raceid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `raceid` (`raceid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `multijobs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `multijobs`;
CREATE TABLE `multijobs` (
  `citizenid` varchar(100) NOT NULL,
  `jobdata` text DEFAULT NULL,
  PRIMARY KEY (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `newspaper`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `newspaper`;
CREATE TABLE `newspaper` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `story_type` varchar(50) NOT NULL DEFAULT '',
  `title` varchar(5000) NOT NULL DEFAULT '',
  `body` varchar(5000) NOT NULL DEFAULT '',
  `date` varchar(50) DEFAULT '',
  `jailed_player` varchar(50) DEFAULT NULL,
  `jailed_time` varchar(50) DEFAULT NULL,
  `image` varchar(250) DEFAULT NULL,
  `publisher` varchar(250) NOT NULL DEFAULT 'Los Santos Newspaper',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `occasion_vehicles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `occasion_vehicles`;
CREATE TABLE `occasion_vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seller` varchar(50) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `plate` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `mods` text DEFAULT NULL,
  `occasionid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `occasionId` (`occasionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `rentvehs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `rentvehs`;
CREATE TABLE `rentvehs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) NOT NULL,
  `vehicle` varchar(50) NOT NULL,
  `plate` varchar(50) NOT NULL,
  `time` int(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `races`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `races`;
CREATE TABLE `races` (
  `owner` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `reward` int(11) DEFAULT NULL,
  `date` longtext DEFAULT NULL,
  `maxplayers` int(11) DEFAULT NULL,
  `route` longtext DEFAULT NULL,
  `id` bigint(20) DEFAULT NULL,
  `players` longtext DEFAULT NULL,
  `luadate` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Commit transaction
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;