-- CreateTable
CREATE TABLE `garden_plans` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `width` INTEGER NOT NULL DEFAULT 10,
    `height` INTEGER NOT NULL DEFAULT 10,
    `gridData` JSON NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `tags` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `garden_plans_userId_idx`(`userId`),
    INDEX `garden_plans_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `garden_cells` (
    `id` VARCHAR(36) NOT NULL,
    `planId` VARCHAR(36) NOT NULL,
    `row` INTEGER NOT NULL,
    `col` INTEGER NOT NULL,
    `soilType` VARCHAR(100) NULL,
    `sunExposure` VARCHAR(100) NULL,
    `notes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `garden_cells_planId_idx`(`planId`),
    UNIQUE INDEX `garden_cells_planId_row_col_key`(`planId`, `row`, `col`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `garden_plant_placements` (
    `id` VARCHAR(36) NOT NULL,
    `planId` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `row` INTEGER NOT NULL,
    `col` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `notes` VARCHAR(500) NULL,
    `plantedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `garden_plant_placements_planId_idx`(`planId`),
    INDEX `garden_plant_placements_productId_idx`(`productId`),
    UNIQUE INDEX `garden_plant_placements_planId_productId_row_col_key`(`planId`, `productId`, `row`, `col`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `garden_notes` (
    `id` VARCHAR(36) NOT NULL,
    `planId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `noteType` VARCHAR(50) NOT NULL DEFAULT 'general',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `garden_notes_planId_idx`(`planId`),
    INDEX `garden_notes_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `garden_plans` ADD CONSTRAINT `garden_plans_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `garden_cells` ADD CONSTRAINT `garden_cells_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `garden_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `garden_plant_placements` ADD CONSTRAINT `garden_plant_placements_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `garden_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `garden_plant_placements` ADD CONSTRAINT `garden_plant_placements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `garden_notes` ADD CONSTRAINT `garden_notes_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `garden_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `garden_notes` ADD CONSTRAINT `garden_notes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
