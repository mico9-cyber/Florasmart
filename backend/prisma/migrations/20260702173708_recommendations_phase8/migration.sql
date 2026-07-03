-- CreateTable
CREATE TABLE `user_preferences` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `sunlightLevel` VARCHAR(100) NULL,
    `wateringLevel` VARCHAR(100) NULL,
    `petSafeRequired` BOOLEAN NOT NULL DEFAULT false,
    `purpose` VARCHAR(100) NULL,
    `experienceLevel` VARCHAR(50) NULL,
    `spaceType` VARCHAR(50) NULL,
    `preferredCategories` TEXT NULL,
    `preferredColors` VARCHAR(255) NULL,
    `budgetMin` DECIMAL(10, 2) NULL,
    `budgetMax` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_preferences_userId_key`(`userId`),
    INDEX `user_preferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_requests` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `inputData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_requests_userId_idx`(`userId`),
    INDEX `recommendation_requests_type_idx`(`type`),
    INDEX `recommendation_requests_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_results` (
    `id` VARCHAR(36) NOT NULL,
    `requestId` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `reasons` JSON NULL,
    `careNotes` JSON NULL,
    `warnings` JSON NULL,
    `rank` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_results_requestId_idx`(`requestId`),
    INDEX `recommendation_results_productId_idx`(`productId`),
    INDEX `recommendation_results_score_idx`(`score`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_requests` ADD CONSTRAINT `recommendation_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_results` ADD CONSTRAINT `recommendation_results_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `recommendation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_results` ADD CONSTRAINT `recommendation_results_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
