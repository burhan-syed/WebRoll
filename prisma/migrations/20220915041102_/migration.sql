/*
  Warnings:

  - The primary key for the `Sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(48)`.
  - The primary key for the `Tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tags` table. All the data in the column will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoriesToSite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SiteToTags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[site_id,sessionId]` on the table `Likes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `Reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Likes_site_id_ip_key` ON `Likes`;

-- DropIndex
DROP INDEX `Tags_id_key` ON `Tags`;

-- AlterTable
ALTER TABLE `Likes` MODIFY `sessionId` VARCHAR(48) NOT NULL;

-- AlterTable
ALTER TABLE `Reports` ADD COLUMN `categoryID` INTEGER NULL,
    ADD COLUMN `sessionId` VARCHAR(48) NOT NULL,
    ADD COLUMN `type` ENUM('CATEGORY', 'BROKEN', 'TAGS', 'TOS', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `Sessions` DROP PRIMARY KEY,
    ADD COLUMN `last_accessed` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `role` ENUM('BOT', 'USER', 'MOD', 'ADMIN', 'BANNED') NOT NULL DEFAULT 'USER',
    MODIFY `id` VARCHAR(48) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Tags` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`tag`);

-- DropTable
DROP TABLE `Site`;

-- DropTable
DROP TABLE `_CategoriesToSite`;

-- DropTable
DROP TABLE `_SiteToTags`;

-- CreateTable
CREATE TABLE `Sites` (
    `id` VARCHAR(21) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `source_link` VARCHAR(191) NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `dislikes` INTEGER NOT NULL DEFAULT 0,
    `reports` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `allow_embed` BOOLEAN NOT NULL DEFAULT true,
    `privacy` BOOLEAN NOT NULL DEFAULT false,
    `adult` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('REVIEW', 'APPROVED', 'REPORTED', 'REJECTED', 'BANNED') NOT NULL DEFAULT 'REVIEW',
    `submitter_ip` VARCHAR(45) NOT NULL,
    `submitted_id` VARCHAR(48) NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `img_key` VARCHAR(191) NULL,

    UNIQUE INDEX `Sites_id_key`(`id`),
    UNIQUE INDEX `Sites_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteTags` (
    `siteID` VARCHAR(191) NOT NULL,
    `tagID` VARCHAR(48) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(48) NOT NULL,
    `status` ENUM('REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',

    PRIMARY KEY (`siteID`, `tagID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriesToSites` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(21) NOT NULL,

    UNIQUE INDEX `_CategoriesToSites_AB_unique`(`A`, `B`),
    INDEX `_CategoriesToSites_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Likes_site_id_sessionId_key` ON `Likes`(`site_id`, `sessionId`);
