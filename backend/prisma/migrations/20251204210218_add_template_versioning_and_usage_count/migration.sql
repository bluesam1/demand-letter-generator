-- AlterTable
ALTER TABLE "template" ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "template_version" (
    "version_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_version_pkey" PRIMARY KEY ("version_id")
);

-- CreateIndex
CREATE INDEX "idx_template_version_template" ON "template_version"("template_id");

-- CreateIndex
CREATE INDEX "idx_template_version_created_at" ON "template_version"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "unique_template_version" ON "template_version"("template_id", "version");

-- AddForeignKey
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_version" ADD CONSTRAINT "template_version_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
