-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `channel` VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NULL,
    `data` JSON NULL,
    `readAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(20) NOT NULL DEFAULT 'SENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_channel_idx`(`channel`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_readAt_idx`(`readAt`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `emailEnabled` BOOLEAN NOT NULL DEFAULT true,
    `inAppEnabled` BOOLEAN NOT NULL DEFAULT true,
    `orderUpdates` BOOLEAN NOT NULL DEFAULT true,
    `deliveryUpdates` BOOLEAN NOT NULL DEFAULT true,
    `inventoryAlerts` BOOLEAN NOT NULL DEFAULT true,
    `loyaltyUpdates` BOOLEAN NOT NULL DEFAULT true,
    `subscriptionUpdates` BOOLEAN NOT NULL DEFAULT true,
    `gardenReminders` BOOLEAN NOT NULL DEFAULT true,
    `marketingEmails` BOOLEAN NOT NULL DEFAULT false,
    `securityAlerts` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_userId_key`(`userId`),
    INDEX `notification_preferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `templateName` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `errorMessage` VARCHAR(500) NULL,
    `providerMessageId` VARCHAR(255) NULL,
    `metadata` JSON NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_logs_userId_idx`(`userId`),
    INDEX `email_logs_toEmail_idx`(`toEmail`),
    INDEX `email_logs_status_idx`(`status`),
    INDEX `email_logs_templateName_idx`(`templateName`),
    INDEX `email_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_templates_name_key`(`name`),
    INDEX `notification_templates_name_idx`(`name`),
    INDEX `notification_templates_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
