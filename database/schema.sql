-- =====================================================================
--  Sewage Repair Service — complete MySQL database script
--  Database: sewage_repair_service
--
--  Run this whole file in MySQL Workbench (lightning-bolt "Execute all")
--  or from the command line:
--      mysql -u root -p < database/schema.sql
--
--  It matches prisma/schema.prisma exactly (same table names, column
--  names, enum values, indexes and foreign keys).
--
--  WARNING: it DROPS and recreates the five application tables, so any
--  existing data in them is lost.
--
--  Demo logins created below:
--      admin@sewage.local      / Admin123!     (ADMIN)
--      resident1@sewage.local  / Resident123!  (RESIDENT)
--      resident2@sewage.local  / Resident123!  (RESIDENT)
--      resident3@sewage.local  / Resident123!  (RESIDENT)
--  Passwords are stored as bcrypt hashes, never as plain text.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sewage_repair_service
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sewage_repair_service;

-- Prisma stores all DateTime values in UTC, so the seed timestamps below
-- are calculated in UTC too.
SET time_zone = '+00:00';

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `repair_updates`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `inspections`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `firstName`   VARCHAR(100) NOT NULL,
    `lastName`    VARCHAR(100) NOT NULL,
    `email`       VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(30)  NULL,
    `password`    VARCHAR(255) NOT NULL,
    `role`        ENUM('RESIDENT', 'ADMIN') NOT NULL DEFAULT 'RESIDENT',
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------
CREATE TABLE `teams` (
    `id`              INTEGER      NOT NULL AUTO_INCREMENT,
    `name`            VARCHAR(100) NOT NULL,
    `contactNumber`   VARCHAR(30)  NULL,
    `technicianCount` INTEGER      NOT NULL DEFAULT 2,
    `status`          ENUM('ON_DUTY', 'OFF_DUTY') NOT NULL DEFAULT 'ON_DUTY',
    `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)  NOT NULL,

    UNIQUE INDEX `teams_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------
CREATE TABLE `reports` (
    `id`              INTEGER      NOT NULL AUTO_INCREMENT,
    `referenceNumber` INTEGER      NOT NULL,
    `issueType`       ENUM('BURST_PIPE', 'BLOCKED_DRAIN', 'SEWAGE_OVERFLOW', 'OTHER') NOT NULL,
    `location`        VARCHAR(191) NOT NULL,
    `landmark`        VARCHAR(191) NULL,
    `description`     TEXT         NOT NULL,
    `contactPhone`    VARCHAR(30)  NULL,
    `status`          ENUM('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'REPORTED',
    `residentId`      INTEGER      NOT NULL,
    `assignedTeamId`  INTEGER      NULL,
    `eta`             VARCHAR(100) NULL,
    `resolvedAt`      DATETIME(3)  NULL,
    `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)  NOT NULL,

    UNIQUE INDEX `reports_referenceNumber_key`(`referenceNumber`),
    INDEX `reports_residentId_idx`(`residentId`),
    INDEX `reports_assignedTeamId_idx`(`assignedTeamId`),
    INDEX `reports_status_idx`(`status`),
    INDEX `reports_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- repair_updates
-- ---------------------------------------------------------------------
CREATE TABLE `repair_updates` (
    `id`        INTEGER     NOT NULL AUTO_INCREMENT,
    `reportId`  INTEGER     NOT NULL,
    `status`    ENUM('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED') NOT NULL,
    `comment`   TEXT        NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `repair_updates_reportId_idx`(`reportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- inspections
-- ---------------------------------------------------------------------
CREATE TABLE `inspections` (
    `id`             INTEGER      NOT NULL AUTO_INCREMENT,
    `location`       VARCHAR(191) NOT NULL,
    `inspectionDate` DATETIME(3)  NOT NULL,
    `inspectorName`  VARCHAR(100) NOT NULL,
    `findings`       TEXT         NULL,
    `status`         ENUM('SCHEDULED', 'COMPLETED', 'ISSUE_FOUND') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`      DATETIME(3)  NOT NULL,

    INDEX `inspections_inspectionDate_idx`(`inspectionDate`),
    INDEX `inspections_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------
ALTER TABLE `reports`
    ADD CONSTRAINT `reports_residentId_fkey`
    FOREIGN KEY (`residentId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports`
    ADD CONSTRAINT `reports_assignedTeamId_fkey`
    FOREIGN KEY (`assignedTeamId`) REFERENCES `teams`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `repair_updates`
    ADD CONSTRAINT `repair_updates_reportId_fkey`
    FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================
--  SEED / DEMO DATA
-- =====================================================================

-- Users (bcrypt, cost 10)
--   Admin123!     -> $2a$10$byETEum7F50Dw3KCye6MkuEhApRGNt3obxVFBORuWB4frKLarNKK.
--   Resident123!  -> $2a$10$kypzS8XgtrVqiAGBGwUOSem5E0xlLmQUEmGdWEJ9t9kuA9WO7TZHK
INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `phoneNumber`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
    (1, 'Admin', 'User',     'admin@sewage.local',     '021 555 0100', '$2a$10$byETEum7F50Dw3KCye6MkuEhApRGNt3obxVFBORuWB4frKLarNKK.', 'ADMIN',    NOW(3), NOW(3)),
    (2, 'Nomsa', 'Dlamini',  'resident1@sewage.local', '071 234 5678', '$2a$10$kypzS8XgtrVqiAGBGwUOSem5E0xlLmQUEmGdWEJ9t9kuA9WO7TZHK', 'RESIDENT', NOW(3), NOW(3)),
    (3, 'Sipho', 'Ndlovu',   'resident2@sewage.local', '072 345 6789', '$2a$10$kypzS8XgtrVqiAGBGwUOSem5E0xlLmQUEmGdWEJ9t9kuA9WO7TZHK', 'RESIDENT', NOW(3), NOW(3)),
    (4, 'Lwazi', 'Mahlangu', 'resident3@sewage.local', '073 456 7890', '$2a$10$kypzS8XgtrVqiAGBGwUOSem5E0xlLmQUEmGdWEJ9t9kuA9WO7TZHK', 'RESIDENT', NOW(3), NOW(3));

-- Teams
INSERT INTO `teams` (`id`, `name`, `contactNumber`, `technicianCount`, `status`, `createdAt`, `updatedAt`) VALUES
    (1, 'Team A', '021 555 0101', 2, 'ON_DUTY',  NOW(3), NOW(3)),
    (2, 'Team B', '021 555 0102', 2, 'ON_DUTY',  NOW(3), NOW(3)),
    (3, 'Team C', '021 555 0103', 3, 'OFF_DUTY', NOW(3), NOW(3));

-- Reports (timestamps are relative to "now" so the dashboard numbers make sense)
INSERT INTO `reports`
    (`id`, `referenceNumber`, `issueType`, `location`, `landmark`, `description`, `contactPhone`, `status`, `residentId`, `assignedTeamId`, `eta`, `resolvedAt`, `createdAt`, `updatedAt`)
VALUES
    (1, 201, 'BLOCKED_DRAIN', 'Site B, Khayelitsha', 'Behind the community hall',
        'Storm drain is completely blocked and dirty water is pooling on the road.',
        NULL, 'RESOLVED', 2, 1, '1 hour',
        DATE_SUB(NOW(3), INTERVAL 140 HOUR), DATE_SUB(NOW(3), INTERVAL 144 HOUR), DATE_SUB(NOW(3), INTERVAL 140 HOUR)),
    (2, 202, 'BURST_PIPE', 'Harare, Khayelitsha', 'Near Kuyasa station',
        'A sewer pipe has burst next to the pavement. Strong smell and water running into the street.',
        NULL, 'RESOLVED', 3, 2, '2 hours',
        DATE_SUB(NOW(3), INTERVAL 67 HOUR), DATE_SUB(NOW(3), INTERVAL 72 HOUR), DATE_SUB(NOW(3), INTERVAL 67 HOUR)),
    (3, 203, 'BLOCKED_DRAIN', 'Makhaza, Khayelitsha', 'Opposite the primary school gate',
        'Manhole is overflowing after the blockage. Children walk past here every day.',
        NULL, 'IN_PROGRESS', 4, 1, '1 hour',
        NULL, DATE_SUB(NOW(3), INTERVAL 5 HOUR), DATE_SUB(NOW(3), INTERVAL 2 HOUR)),
    (4, 204, 'BURST_PIPE', 'Site C, Khayelitsha', 'Next to the taxi rank',
        'Leaking sewer pipe at the corner. It has been getting worse since yesterday.',
        NULL, 'ASSIGNED', 3, 2, '2 hours',
        NULL, DATE_SUB(NOW(3), INTERVAL 3 HOUR), DATE_SUB(NOW(3), INTERVAL 2 HOUR)),
    (5, 205, 'SEWAGE_OVERFLOW', 'Site C, Harare', 'Near the corner shop',
        'Sewage overflowing near the corner shop. It is running down the street towards the houses.',
        NULL, 'IN_PROGRESS', 2, 2, '45 minutes',
        NULL, DATE_SUB(NOW(3), INTERVAL 90 MINUTE), DATE_SUB(NOW(3), INTERVAL 19 MINUTE)),
    (6, 206, 'SEWAGE_OVERFLOW', 'Ext. 12, Khayelitsha', 'Near local spaza shop',
        'Sewage is coming up through the drain in front of the spaza shop.',
        NULL, 'REPORTED', 4, NULL, NULL,
        NULL, DATE_SUB(NOW(3), INTERVAL 40 MINUTE), DATE_SUB(NOW(3), INTERVAL 40 MINUTE)),
    (7, 207, 'OTHER', 'Town Two, Khayelitsha', 'Outside the clinic',
        'Manhole cover is missing and the opening is a danger to people walking past.',
        NULL, 'REPORTED', 3, NULL, NULL,
        NULL, DATE_SUB(NOW(3), INTERVAL 15 MINUTE), DATE_SUB(NOW(3), INTERVAL 15 MINUTE));

-- Repair updates (the tracking timeline each resident sees)
INSERT INTO `repair_updates` (`reportId`, `status`, `comment`, `createdAt`) VALUES
    -- #201
    (1, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 144 HOUR)),
    (1, 'ASSIGNED',    'Assigned to Team A',                DATE_SUB(NOW(3), INTERVAL 8610 MINUTE)),
    (1, 'IN_PROGRESS', 'Team A is clearing the blockage',   DATE_SUB(NOW(3), INTERVAL 142 HOUR)),
    (1, 'RESOLVED',    'Drain cleared and area cleaned',    DATE_SUB(NOW(3), INTERVAL 140 HOUR)),
    -- #202
    (2, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 72 HOUR)),
    (2, 'ASSIGNED',    'Assigned to Team B',                DATE_SUB(NOW(3), INTERVAL 4280 MINUTE)),
    (2, 'IN_PROGRESS', 'Pipe section being replaced',       DATE_SUB(NOW(3), INTERVAL 70 HOUR)),
    (2, 'RESOLVED',    'New pipe section fitted and tested', DATE_SUB(NOW(3), INTERVAL 67 HOUR)),
    -- #203
    (3, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 5 HOUR)),
    (3, 'ASSIGNED',    'Assigned to Team A',                DATE_SUB(NOW(3), INTERVAL 4 HOUR)),
    (3, 'IN_PROGRESS', 'Team A on site, jetting the line',  DATE_SUB(NOW(3), INTERVAL 2 HOUR)),
    -- #204
    (4, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 3 HOUR)),
    (4, 'ASSIGNED',    'Assigned to Team B',                DATE_SUB(NOW(3), INTERVAL 2 HOUR)),
    -- #205
    (5, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 90 MINUTE)),
    (5, 'ASSIGNED',    'Assigned to Team B',                DATE_SUB(NOW(3), INTERVAL 69 MINUTE)),
    (5, 'ASSIGNED',    'Team B is on the way',              DATE_SUB(NOW(3), INTERVAL 54 MINUTE)),
    (5, 'IN_PROGRESS', 'Repair in progress',                DATE_SUB(NOW(3), INTERVAL 19 MINUTE)),
    -- #206
    (6, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 40 MINUTE)),
    -- #207
    (7, 'REPORTED',    'Report received',                   DATE_SUB(NOW(3), INTERVAL 15 MINUTE));

-- Inspections (weekly sewer monitoring)
INSERT INTO `inspections` (`location`, `inspectionDate`, `inspectorName`, `findings`, `status`, `createdAt`, `updatedAt`) VALUES
    ('Ext. 12, Khayelitsha', DATE_SUB(NOW(3), INTERVAL 2 HOUR), 'Team A',
        'Blocked drain discovered near the spaza shop. Needs clearing.', 'ISSUE_FOUND', NOW(3), NOW(3)),
    ('Site B, Khayelitsha',  DATE_SUB(NOW(3), INTERVAL 7 DAY),  'Team A',
        'All manholes and drains flowing normally.', 'COMPLETED', NOW(3), NOW(3)),
    ('Makhaza, Khayelitsha', DATE_SUB(NOW(3), INTERVAL 1 DAY),  'Team B',
        'Minor debris removed from two drains. No damage found.', 'COMPLETED', NOW(3), NOW(3)),
    ('Harare, Khayelitsha',  DATE_ADD(NOW(3), INTERVAL 2 DAY),  'Team B', NULL, 'SCHEDULED', NOW(3), NOW(3)),
    ('Site C, Khayelitsha',  DATE_ADD(NOW(3), INTERVAL 7 DAY),  'Team C', NULL, 'SCHEDULED', NOW(3), NOW(3));

-- Quick check
SELECT 'users' AS `table`, COUNT(*) AS `rows` FROM `users`
UNION ALL SELECT 'teams', COUNT(*) FROM `teams`
UNION ALL SELECT 'reports', COUNT(*) FROM `reports`
UNION ALL SELECT 'repair_updates', COUNT(*) FROM `repair_updates`
UNION ALL SELECT 'inspections', COUNT(*) FROM `inspections`;
