/*
  Warnings:

  - You are about to drop the `_customertosafra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_programmetosafra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `safra` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phoneNumber` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripId` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_customertosafra` DROP FOREIGN KEY `_CustomerToSafra_A_fkey`;

-- DropForeignKey
ALTER TABLE `_customertosafra` DROP FOREIGN KEY `_CustomerToSafra_B_fkey`;

-- DropForeignKey
ALTER TABLE `_programmetosafra` DROP FOREIGN KEY `_ProgrammeToSafra_A_fkey`;

-- DropForeignKey
ALTER TABLE `_programmetosafra` DROP FOREIGN KEY `_ProgrammeToSafra_B_fkey`;

-- DropForeignKey
ALTER TABLE `safra` DROP FOREIGN KEY `Safra_companyId_fkey`;

-- AlterTable
ALTER TABLE `admin` ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `company` ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `day` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `month` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `year` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `passenger` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `tripId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_customertosafra`;

-- DropTable
DROP TABLE `_programmetosafra`;

-- DropTable
DROP TABLE `safra`;

-- CreateTable
CREATE TABLE `Trip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `desc` TEXT NOT NULL,
    `dateFrom` DATETIME(3) NOT NULL,
    `dateTo` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,
    `price` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fromLocation` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `offer` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerToTrip` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CustomerToTrip_AB_unique`(`A`, `B`),
    INDEX `_CustomerToTrip_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProgrammeToTrip` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProgrammeToTrip_AB_unique`(`A`, `B`),
    INDEX `_ProgrammeToTrip_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToTrip` ADD CONSTRAINT `_CustomerToTrip_A_fkey` FOREIGN KEY (`A`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToTrip` ADD CONSTRAINT `_CustomerToTrip_B_fkey` FOREIGN KEY (`B`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProgrammeToTrip` ADD CONSTRAINT `_ProgrammeToTrip_A_fkey` FOREIGN KEY (`A`) REFERENCES `Programme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProgrammeToTrip` ADD CONSTRAINT `_ProgrammeToTrip_B_fkey` FOREIGN KEY (`B`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
