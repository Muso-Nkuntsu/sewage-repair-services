-- Initial schema (identical to the DDL in database/schema.sql)

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
