/*
  Warnings:

  - You are about to drop the column `idPremium` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "idPremium",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
