/*
  Warnings:

  - Added the required column `dateFrom` to the `Safra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTo` to the `Safra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Safra` ADD COLUMN `dateFrom` DATETIME(3) NOT NULL,
    ADD COLUMN `dateTo` DATETIME(3) NOT NULL;
