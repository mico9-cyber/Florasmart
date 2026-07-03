-- CreateTable
CREATE TABLE `chatbot_conversations` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `contextType` VARCHAR(50) NULL,
    `contextId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    INDEX `chatbot_conversations_userId_idx`(`userId`),
    INDEX `chatbot_conversations_status_idx`(`status`),
    INDEX `chatbot_conversations_contextType_idx`(`contextType`),
    INDEX `chatbot_conversations_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_messages` (
    `id` VARCHAR(36) NOT NULL,
    `conversationId` VARCHAR(36) NOT NULL,
    `sender` VARCHAR(10) NOT NULL,
    `message` TEXT NOT NULL,
    `intent` VARCHAR(50) NULL,
    `responseType` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chatbot_messages_conversationId_idx`(`conversationId`),
    INDEX `chatbot_messages_sender_idx`(`sender`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_feedback` (
    `id` VARCHAR(36) NOT NULL,
    `conversationId` VARCHAR(36) NOT NULL,
    `messageId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `rating` VARCHAR(20) NOT NULL,
    `comment` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chatbot_feedback_conversationId_idx`(`conversationId`),
    INDEX `chatbot_feedback_messageId_idx`(`messageId`),
    INDEX `chatbot_feedback_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_knowledge_base` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `keywords` TEXT NULL,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chatbot_knowledge_base_category_idx`(`category`),
    INDEX `chatbot_knowledge_base_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chatbot_conversations` ADD CONSTRAINT `chatbot_conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_messages` ADD CONSTRAINT `chatbot_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chatbot_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_feedback` ADD CONSTRAINT `chatbot_feedback_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chatbot_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_feedback` ADD CONSTRAINT `chatbot_feedback_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `chatbot_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_feedback` ADD CONSTRAINT `chatbot_feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
