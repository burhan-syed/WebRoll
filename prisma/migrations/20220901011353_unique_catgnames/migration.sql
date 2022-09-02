/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Categories` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Likes` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Reports` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Site` ADD COLUMN `privacy` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Tags` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateIndex
CREATE UNIQUE INDEX `Categories_category_key` ON `Categories`(`category`);
