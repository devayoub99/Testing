/*
  Warnings:

  - You are about to drop the column `programme` on the `safra` table. All the data in the column will be lost.
  - You are about to drop the column `timeEnd` on the `safra` table. All the data in the column will be lost.
  - You are about to drop the column `timeStart` on the `safra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `safra` DROP COLUMN `programme`,
    DROP COLUMN `timeEnd`,
    DROP COLUMN `timeStart`;

-- CreateTable
CREATE TABLE `Programme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayNum` INTEGER NOT NULL,
    `program` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProgrammeToSafra` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProgrammeToSafra_AB_unique`(`A`, `B`),
    INDEX `_ProgrammeToSafra_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProgrammeToSafra` ADD CONSTRAINT `_ProgrammeToSafra_A_fkey` FOREIGN KEY (`A`) REFERENCES `Programme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProgrammeToSafra` ADD CONSTRAINT `_ProgrammeToSafra_B_fkey` FOREIGN KEY (`B`) REFERENCES `Safra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
