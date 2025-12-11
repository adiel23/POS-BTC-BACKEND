-- CreateTable
CREATE TABLE `merchants` (
    `pubkey` VARCHAR(191) NOT NULL,
    `lightning_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `merchants_lightning_address_key`(`lightning_address`),
    PRIMARY KEY (`pubkey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
