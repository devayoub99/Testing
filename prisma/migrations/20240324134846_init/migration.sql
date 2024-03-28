/*
  Warnings:

  - You are about to drop the column `timeEnd` on the `Safra` table. All the data in the column will be lost.
  - You are about to drop the column `timeStart` on the `Safra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Safra` DROP COLUMN `timeEnd`,
    DROP COLUMN `timeStart`;
