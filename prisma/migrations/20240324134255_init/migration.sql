/*
  Warnings:

  - You are about to drop the column `dateFrom` on the `Safra` table. All the data in the column will be lost.
  - You are about to drop the column `dateTo` on the `Safra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Safra` DROP COLUMN `dateFrom`,
    DROP COLUMN `dateTo`;
