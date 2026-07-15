-- CreateTable
CREATE TABLE `user` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('CUSTOMER', 'PROVIDER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_email_verified` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_phone_key`(`phone`),
    INDEX `user_role_idx`(`role`),
    INDEX `user_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_profile` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `bio` TEXT NULL,
    `experience_years` SMALLINT NULL,
    `city` VARCHAR(100) NOT NULL,
    `area` VARCHAR(200) NULL,
    `address` TEXT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `service_radius_km` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `avg_rating` DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    `total_reviews` INTEGER NOT NULL DEFAULT 0,
    `total_bookings` INTEGER NOT NULL DEFAULT 0,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `provider_profile_user_id_key`(`user_id`),
    INDEX `provider_profile_city_idx`(`city`),
    INDEX `provider_profile_is_verified_idx`(`is_verified`),
    INDEX `provider_profile_avg_rating_idx`(`avg_rating`),
    INDEX `provider_profile_latitude_longitude_idx`(`latitude`, `longitude`),
    INDEX `provider_profile_is_available_idx`(`is_available`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `category_name_key`(`name`),
    UNIQUE INDEX `category_slug_key`(`slug`),
    INDEX `category_is_active_idx`(`is_active`),
    INDEX `category_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service` (
    `id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `price_type` ENUM('FIXED', 'HOURLY', 'STARTING_AT') NOT NULL DEFAULT 'FIXED',
    `duration_minutes` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `service_provider_id_idx`(`provider_id`),
    INDEX `service_category_id_idx`(`category_id`),
    INDEX `service_price_idx`(`price`),
    INDEX `service_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_image` (
    `id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_image_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_gallery` (
    `id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `caption` VARCHAR(300) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `provider_gallery_provider_id_idx`(`provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability` (
    `id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `day_of_week` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    `start_time` TIME(0) NOT NULL,
    `end_time` TIME(0) NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,

    INDEX `availability_provider_id_idx`(`provider_id`),
    UNIQUE INDEX `availability_provider_id_day_of_week_start_time_key`(`provider_id`, `day_of_week`, `start_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking` (
    `id` CHAR(36) NOT NULL,
    `booking_number` VARCHAR(20) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `scheduled_date` DATE NOT NULL,
    `scheduled_time` TIME(0) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `notes` TEXT NULL,
    `quoted_price` DECIMAL(10, 2) NOT NULL,
    `final_price` DECIMAL(10, 2) NULL,
    `cancellation_reason` TEXT NULL,
    `cancelled_by` ENUM('CUSTOMER', 'PROVIDER', 'SYSTEM') NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `booking_booking_number_key`(`booking_number`),
    INDEX `booking_customer_id_idx`(`customer_id`),
    INDEX `booking_provider_id_idx`(`provider_id`),
    INDEX `booking_service_id_idx`(`service_id`),
    INDEX `booking_status_idx`(`status`),
    INDEX `booking_scheduled_date_idx`(`scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` TEXT NULL,
    `is_hidden` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `review_booking_id_key`(`booking_id`),
    INDEX `review_provider_id_created_at_idx`(`provider_id`, `created_at`),
    INDEX `review_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorite_customer_id_provider_id_key`(`customer_id`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation` (
    `id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conversation_booking_id_key`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_participant` (
    `id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `last_read_at` DATETIME(3) NULL,

    UNIQUE INDEX `conversation_participant_conversation_id_user_id_key`(`conversation_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `sender_id` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `message_type` ENUM('TEXT', 'IMAGE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `message_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED', 'NEW_REVIEW', 'NEW_MESSAGE', 'PROVIDER_VERIFIED', 'SYSTEM') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `reference_id` CHAR(36) NULL,
    `reference_type` VARCHAR(50) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_user_id_is_read_created_at_idx`(`user_id`, `is_read`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_token_token_hash_key`(`token_hash`),
    INDEX `refresh_token_user_id_idx`(`user_id`),
    INDEX `refresh_token_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report` (
    `id` CHAR(36) NOT NULL,
    `reporter_id` CHAR(36) NOT NULL,
    `reported_user_id` CHAR(36) NULL,
    `reported_review_id` CHAR(36) NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `admin_notes` TEXT NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_status_idx`(`status`),
    INDEX `report_reporter_id_idx`(`reporter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `provider_profile` ADD CONSTRAINT `provider_profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service` ADD CONSTRAINT `service_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service` ADD CONSTRAINT `service_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_image` ADD CONSTRAINT `service_image_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_gallery` ADD CONSTRAINT `provider_gallery_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability` ADD CONSTRAINT `availability_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `favorite_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `favorite_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `provider_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_reported_user_id_fkey` FOREIGN KEY (`reported_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_reported_review_id_fkey` FOREIGN KEY (`reported_review_id`) REFERENCES `review`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
