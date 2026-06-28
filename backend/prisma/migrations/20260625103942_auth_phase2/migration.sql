-- AlterTable
ALTER TABLE `users` ADD COLUMN `address` VARCHAR(255) NULL,
    ADD COLUMN `gardenSpaceType` VARCHAR(50) NULL,
    ADD COLUMN `gardeningExperience` VARCHAR(50) NULL,
    ADD COLUMN `language` VARCHAR(30) NULL,
    ADD COLUMN `phone` VARCHAR(30) NULL;
