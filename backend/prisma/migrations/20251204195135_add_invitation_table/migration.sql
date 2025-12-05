-- CreateTable
CREATE TABLE "firm" (
    "firm_id" TEXT NOT NULL,
    "firm_name" VARCHAR(255) NOT NULL,
    "firm_address" TEXT,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "subscription_tier" VARCHAR(50) NOT NULL DEFAULT 'Basic',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "firm_pkey" PRIMARY KEY ("firm_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "last_login" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "invitation_id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255),
    "created_by" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "accepted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("invitation_id")
);

-- CreateTable
CREATE TABLE "template" (
    "template_id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "template_name" VARCHAR(255) NOT NULL,
    "template_description" TEXT,
    "template_content" JSONB NOT NULL,
    "category" VARCHAR(100),
    "created_by" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "template_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "demand_letter" (
    "letter_id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "template_id" TEXT,
    "created_by" TEXT NOT NULL,
    "case_reference" VARCHAR(100),
    "client_name" VARCHAR(255) NOT NULL,
    "defendant_name" VARCHAR(255) NOT NULL,
    "incident_date" DATE,
    "demand_amount" DECIMAL(15,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "content" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "finalized_at" TIMESTAMPTZ,

    CONSTRAINT "demand_letter_pkey" PRIMARY KEY ("letter_id")
);

-- CreateTable
CREATE TABLE "source_document" (
    "document_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "extracted_text" TEXT,
    "document_type" VARCHAR(100),
    "processing_status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "source_document_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "letter_version" (
    "version_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "change_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letter_version_pkey" PRIMARY KEY ("version_id")
);

-- CreateTable
CREATE TABLE "collaboration" (
    "collaboration_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "change_type" VARCHAR(50) NOT NULL,
    "change_data" JSONB NOT NULL,
    "position" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaboration_pkey" PRIMARY KEY ("collaboration_id")
);

-- CreateTable
CREATE TABLE "ai_refinement" (
    "refinement_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "ai_model" VARCHAR(100) NOT NULL,
    "input_content" TEXT NOT NULL,
    "output_content" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "processing_time_ms" INTEGER,
    "token_count" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "ai_refinement_pkey" PRIMARY KEY ("refinement_id")
);

-- CreateTable
CREATE TABLE "export" (
    "export_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "exported_by" TEXT NOT NULL,
    "export_format" VARCHAR(10) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_size" BIGINT,
    "exported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_pkey" PRIMARY KEY ("export_id")
);

-- CreateIndex
CREATE INDEX "idx_firm_name" ON "firm"("firm_name");

-- CreateIndex
CREATE INDEX "idx_firm_active" ON "firm"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_firm" ON "user"("firm_id");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_active" ON "user"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "idx_invitation_firm" ON "invitation"("firm_id");

-- CreateIndex
CREATE INDEX "idx_invitation_email" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "idx_invitation_token" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "idx_invitation_expires" ON "invitation"("expires_at");

-- CreateIndex
CREATE INDEX "idx_template_firm" ON "template"("firm_id");

-- CreateIndex
CREATE INDEX "idx_template_category" ON "template"("category");

-- CreateIndex
CREATE INDEX "idx_template_default" ON "template"("is_default");

-- CreateIndex
CREATE UNIQUE INDEX "unique_template_name_per_firm" ON "template"("firm_id", "template_name");

-- CreateIndex
CREATE INDEX "idx_letter_firm" ON "demand_letter"("firm_id");

-- CreateIndex
CREATE INDEX "idx_letter_created_by" ON "demand_letter"("created_by");

-- CreateIndex
CREATE INDEX "idx_letter_status" ON "demand_letter"("status");

-- CreateIndex
CREATE INDEX "idx_letter_template" ON "demand_letter"("template_id");

-- CreateIndex
CREATE INDEX "idx_letter_client" ON "demand_letter"("client_name");

-- CreateIndex
CREATE INDEX "idx_letter_defendant" ON "demand_letter"("defendant_name");

-- CreateIndex
CREATE INDEX "idx_letter_firm_status" ON "demand_letter"("firm_id", "status");

-- CreateIndex
CREATE INDEX "idx_letter_firm_created_at" ON "demand_letter"("firm_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_source_document_letter" ON "source_document"("letter_id");

-- CreateIndex
CREATE INDEX "idx_source_document_uploaded_by" ON "source_document"("uploaded_by");

-- CreateIndex
CREATE INDEX "idx_source_document_status" ON "source_document"("processing_status");

-- CreateIndex
CREATE INDEX "idx_source_document_type" ON "source_document"("document_type");

-- CreateIndex
CREATE INDEX "idx_letter_version_letter" ON "letter_version"("letter_id");

-- CreateIndex
CREATE INDEX "idx_letter_version_created_at" ON "letter_version"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "unique_letter_version" ON "letter_version"("letter_id", "version_number");

-- CreateIndex
CREATE INDEX "idx_collaboration_letter" ON "collaboration"("letter_id");

-- CreateIndex
CREATE INDEX "idx_collaboration_user" ON "collaboration"("user_id");

-- CreateIndex
CREATE INDEX "idx_collaboration_timestamp" ON "collaboration"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_collaboration_type" ON "collaboration"("change_type");

-- CreateIndex
CREATE INDEX "idx_ai_refinement_letter" ON "ai_refinement"("letter_id");

-- CreateIndex
CREATE INDEX "idx_ai_refinement_requested_by" ON "ai_refinement"("requested_by");

-- CreateIndex
CREATE INDEX "idx_ai_refinement_status" ON "ai_refinement"("status");

-- CreateIndex
CREATE INDEX "idx_ai_refinement_created_at" ON "ai_refinement"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_export_letter" ON "export"("letter_id");

-- CreateIndex
CREATE INDEX "idx_export_user" ON "export"("exported_by");

-- CreateIndex
CREATE INDEX "idx_export_date" ON "export"("exported_at" DESC);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firm"("firm_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firm"("firm_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firm"("firm_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_letter" ADD CONSTRAINT "demand_letter_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firm"("firm_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_letter" ADD CONSTRAINT "demand_letter_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template"("template_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_letter" ADD CONSTRAINT "demand_letter_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_document" ADD CONSTRAINT "source_document_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "demand_letter"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_document" ADD CONSTRAINT "source_document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_version" ADD CONSTRAINT "letter_version_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "demand_letter"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_version" ADD CONSTRAINT "letter_version_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration" ADD CONSTRAINT "collaboration_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "demand_letter"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration" ADD CONSTRAINT "collaboration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_refinement" ADD CONSTRAINT "ai_refinement_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "demand_letter"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_refinement" ADD CONSTRAINT "ai_refinement_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export" ADD CONSTRAINT "export_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "demand_letter"("letter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export" ADD CONSTRAINT "export_exported_by_fkey" FOREIGN KEY ("exported_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
