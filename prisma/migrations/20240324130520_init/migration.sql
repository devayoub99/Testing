/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CustomerToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `_CustomerToProduct` DROP FOREIGN KEY `_CustomerToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CustomerToProduct` DROP FOREIGN KEY `_CustomerToProduct_B_fkey`;

-- DropTable
DROP TABLE `Product`;

-- DropTable
DROP TABLE `_CustomerToProduct`;

-- CreateTable
CREATE TABLE `Safra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `dateFrom` DATETIME(3) NOT NULL,
    `dateTo` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `programme` VARCHAR(191) NOT NULL,
    `offer` VARCHAR(191) NOT NULL,
    `ranking` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerToSafra` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CustomerToSafra_AB_unique`(`A`, `B`),
    INDEX `_CustomerToSafra_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Safra` ADD CONSTRAINT `Safra_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToSafra` ADD CONSTRAINT `_CustomerToSafra_A_fkey` FOREIGN KEY (`A`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToSafra` ADD CONSTRAINT `_CustomerToSafra_B_fkey` FOREIGN KEY (`B`) REFERENCES `Safra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
