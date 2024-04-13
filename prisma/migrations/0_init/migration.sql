-- CreateTable
CREATE TABLE `SuperAdmin` (
    `id` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SuperAdmin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT '',
    `city` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `website` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `docs` VARCHAR(191) NULL,
    `ranking` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Company_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `day` VARCHAR(191) NOT NULL DEFAULT '',
    `month` VARCHAR(191) NOT NULL DEFAULT '',
    `year` VARCHAR(191) NOT NULL DEFAULT '',
    `country` VARCHAR(191) NOT NULL DEFAULT '',
    `city` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Programme` (
    `id` VARCHAR(191) NOT NULL,
    `dayNum` INTEGER NOT NULL,
    `program` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desc` TEXT NOT NULL,
    `dateFrom` DATETIME(3) NOT NULL,
    `dateTo` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `price` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fromLocation` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `offer` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Passenger` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `year` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT '',
    `city` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `nationality` VARCHAR(191) NOT NULL,
    `passportNumber` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CustomerToTrip` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CustomerToTrip_AB_unique`(`A`, `B`),
    INDEX `_CustomerToTrip_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProgrammeToTrip` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

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

