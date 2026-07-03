-- CreateTable
CREATE TABLE `report_jobs` (
    `id` VARCHAR(36) NOT NULL,
    `requestedById` VARCHAR(36) NOT NULL,
    `reportType` VARCHAR(50) NOT NULL,
    `format` VARCHAR(10) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `filters` JSON NULL,
    `filePath` VARCHAR(500) NULL,
    `fileName` VARCHAR(255) NULL,
    `fileSize` INTEGER NULL,
    `errorMessage` VARCHAR(500) NULL,
    `generatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `report_jobs_requestedById_idx`(`requestedById`),
    INDEX `report_jobs_reportType_idx`(`reportType`),
    INDEX `report_jobs_status_idx`(`status`),
    INDEX `report_jobs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_downloads` (
    `id` VARCHAR(36) NOT NULL,
    `reportJobId` VARCHAR(36) NOT NULL,
    `downloadedById` VARCHAR(36) NOT NULL,
    `downloadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` VARCHAR(500) NULL,

    INDEX `report_downloads_reportJobId_idx`(`reportJobId`),
    INDEX `report_downloads_downloadedById_idx`(`downloadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `report_jobs` ADD CONSTRAINT `report_jobs_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_downloads` ADD CONSTRAINT `report_downloads_reportJobId_fkey` FOREIGN KEY (`reportJobId`) REFERENCES `report_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_downloads` ADD CONSTRAINT `report_downloads_downloadedById_fkey` FOREIGN KEY (`downloadedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
