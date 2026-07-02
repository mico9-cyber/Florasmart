-- AlterTable
ALTER TABLE `orders` ADD COLUMN `cancelReason` VARCHAR(500) NULL,
    ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `deliveries` (
    `id` VARCHAR(36) NOT NULL,
    `orderId` VARCHAR(36) NOT NULL,
    `assignedToId` VARCHAR(36) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
    `scheduledAt` DATETIME(3) NULL,
    `pickedUpAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `failedAt` DATETIME(3) NULL,
    `deliveryAddress` VARCHAR(255) NULL,
    `deliveryPhone` VARCHAR(30) NULL,
    `deliveryNotes` VARCHAR(500) NULL,
    `currentLocation` VARCHAR(255) NULL,
    `proofOfDeliveryUrl` VARCHAR(500) NULL,
    `recipientName` VARCHAR(120) NULL,
    `recipientSignature` TEXT NULL,
    `failureReason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `deliveries_orderId_key`(`orderId`),
    INDEX `deliveries_orderId_idx`(`orderId`),
    INDEX `deliveries_assignedToId_idx`(`assignedToId`),
    INDEX `deliveries_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_events` (
    `id` VARCHAR(36) NOT NULL,
    `deliveryId` VARCHAR(36) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `note` VARCHAR(500) NULL,
    `location` VARCHAR(255) NULL,
    `createdById` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `delivery_events_deliveryId_idx`(`deliveryId`),
    INDEX `delivery_events_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_events` ADD CONSTRAINT `delivery_events_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_events` ADD CONSTRAINT `delivery_events_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
