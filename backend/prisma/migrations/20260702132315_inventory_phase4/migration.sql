-- CreateTable
CREATE TABLE `inventory_locations` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `address` VARCHAR(255) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `inventory_locations_code_key`(`code`),
    INDEX `inventory_locations_code_idx`(`code`),
    INDEX `inventory_locations_active_idx`(`active`),
    INDEX `inventory_locations_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_levels` (
    `id` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `locationId` VARCHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `reservedQuantity` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 10,
    `reorderPoint` INTEGER NOT NULL DEFAULT 5,
    `maxStockLevel` INTEGER NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stock_levels_productId_idx`(`productId`),
    INDEX `stock_levels_locationId_idx`(`locationId`),
    INDEX `stock_levels_quantity_idx`(`quantity`),
    UNIQUE INDEX `stock_levels_productId_locationId_key`(`productId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movements` (
    `id` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `locationId` VARCHAR(36) NOT NULL,
    `movementType` VARCHAR(30) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `previousQuantity` INTEGER NOT NULL,
    `newQuantity` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `referenceType` VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    `referenceId` VARCHAR(36) NULL,
    `note` TEXT NULL,
    `performedById` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_movements_productId_idx`(`productId`),
    INDEX `inventory_movements_locationId_idx`(`locationId`),
    INDEX `inventory_movements_movementType_idx`(`movementType`),
    INDEX `inventory_movements_performedById_idx`(`performedById`),
    INDEX `inventory_movements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `inventory_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `inventory_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
