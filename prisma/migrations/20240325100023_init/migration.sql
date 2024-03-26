/*
  Warnings:

  - Added the required column `timeEnd` to the `Safra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeStart` to the `Safra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Safra` ADD COLUMN `timeEnd` VARCHAR(191) NOT NULL,
    ADD COLUMN `timeStart` VARCHAR(191) NOT NULL;
