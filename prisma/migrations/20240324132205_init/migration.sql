/*
  Warnings:

  - Added the required column `docs` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `Safra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Safra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeEnd` to the `Safra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeStart` to the `Safra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `docs` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Safra` ADD COLUMN `desc` TEXT NOT NULL,
    ADD COLUMN `price` VARCHAR(191) NOT NULL,
    ADD COLUMN `timeEnd` VARCHAR(191) NOT NULL,
    ADD COLUMN `timeStart` VARCHAR(191) NOT NULL,
    MODIFY `programme` TEXT NOT NULL,
    MODIFY `offer` TEXT NOT NULL,
    MODIFY `ranking` VARCHAR(191) NULL;
