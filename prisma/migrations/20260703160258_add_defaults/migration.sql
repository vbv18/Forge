-- AlterTable
ALTER TABLE "User" ALTER COLUMN "credits" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "title" DROP NOT NULL;
