/*
  Warnings:

  - You are about to drop the column `mediaLinks` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `screenshots` on the `Game` table. All the data in the column will be lost.
  - Added the required column `plannedReleaseDate` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('PARAGRAPH', 'IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "mediaLinks",
DROP COLUMN "screenshots",
ADD COLUMN     "plannedReleaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ContentChunk" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" "ContentType" NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
