-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'OPEN_TO_OPPORTUNITIES', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "TechnologyCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'ORM', 'DEVOPS', 'CLOUD', 'TESTING', 'SECURITY', 'MOBILE', 'TOOLS');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_DEVELOPMENT', 'DEMO_AVAILABLE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PERSONAL', 'COMMERCIAL', 'SAAS', 'ACADEMIC', 'OPEN_SOURCE', 'LABORATORY');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DIAGRAM');

-- CreateEnum
CREATE TYPE "DeploymentProvider" AS ENUM ('AWS', 'AZURE', 'GOOGLE_CLOUD', 'VERCEL', 'NETLIFY', 'CLOUDFLARE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PLANNED', 'ACTIVE', 'INACTIVE', 'FAILED');

-- CreateEnum
CREATE TYPE "DeploymentEnvironment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "SecurityLabStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "singleton" BOOLEAN NOT NULL DEFAULT true,
    "fullName" VARCHAR(160) NOT NULL,
    "professionalTitle" VARCHAR(200) NOT NULL,
    "headline" VARCHAR(300),
    "biography" TEXT,
    "location" VARCHAR(200),
    "email" VARCHAR(254),
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "resumeUrl" TEXT,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "category" "TechnologyCategory" NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "websiteUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(500),
    "description" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "architecture" TEXT,
    "technicalChallenges" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "projectType" "ProjectType",
    "repositoryUrl" TEXT,
    "demoUrl" TEXT,
    "documentationUrl" TEXT,
    "coverImageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATE,
    "completedAt" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTechnology" (
    "projectId" UUID NOT NULL,
    "technologyId" UUID NOT NULL,

    CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY ("projectId","technologyId")
);

-- CreateTable
CREATE TABLE "ProjectMedia" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "altText" VARCHAR(500),
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDeployment" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "provider" "DeploymentProvider" NOT NULL,
    "environment" "DeploymentEnvironment" NOT NULL,
    "deploymentUrl" TEXT,
    "deploymentStatus" "DeploymentStatus" NOT NULL DEFAULT 'PLANNED',
    "region" VARCHAR(100),
    "description" TEXT,
    "deployedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProjectDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" UUID NOT NULL,
    "organization" VARCHAR(200) NOT NULL,
    "position" VARCHAR(200) NOT NULL,
    "employmentType" "EmploymentType",
    "location" VARCHAR(200),
    "description" TEXT,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" UUID NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "degree" VARCHAR(200) NOT NULL,
    "fieldOfStudy" VARCHAR(200),
    "description" TEXT,
    "startedAt" DATE NOT NULL,
    "completedAt" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "issuer" VARCHAR(200) NOT NULL,
    "credentialUrl" TEXT,
    "issuedAt" DATE NOT NULL,
    "expiresAt" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLab" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "summary" VARCHAR(500),
    "description" TEXT,
    "methodology" TEXT,
    "toolsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "findings" TEXT,
    "remediation" TEXT,
    "repositoryUrl" TEXT,
    "reportUrl" TEXT,
    "status" "SecurityLabStatus" NOT NULL DEFAULT 'PLANNED',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SecurityLab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" UUID NOT NULL,
    "senderName" VARCHAR(160) NOT NULL,
    "senderEmail" VARCHAR(254) NOT NULL,
    "subject" VARCHAR(250) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_singleton_key" ON "Profile"("singleton");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_slug_key" ON "Technology"("slug");

-- CreateIndex
CREATE INDEX "Technology_category_sortOrder_idx" ON "Technology"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_isPublished_isFeatured_sortOrder_idx" ON "Project"("isPublished", "isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectTechnology_technologyId_idx" ON "ProjectTechnology"("technologyId");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_sortOrder_idx" ON "ProjectMedia"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectDeployment_projectId_environment_deploymentStatus_idx" ON "ProjectDeployment"("projectId", "environment", "deploymentStatus");

-- CreateIndex
CREATE INDEX "Experience_sortOrder_startedAt_idx" ON "Experience"("sortOrder", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityLab_slug_key" ON "SecurityLab"("slug");

-- CreateIndex
CREATE INDEX "SecurityLab_isPublished_status_idx" ON "SecurityLab"("isPublished", "status");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeployment" ADD CONSTRAINT "ProjectDeployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma no representa CHECK en el esquema. Conservar estas reglas en futuras migraciones.
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_singleton_true_check" CHECK (singleton = true);
ALTER TABLE "Project" ADD CONSTRAINT "Project_dates_check"
  CHECK ("completedAt" IS NULL OR "startedAt" IS NULL OR "completedAt" >= "startedAt");
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_dates_check"
  CHECK ("endedAt" IS NULL OR "endedAt" >= "startedAt");
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_current_check"
  CHECK (NOT "isCurrent" OR "endedAt" IS NULL);
ALTER TABLE "Education" ADD CONSTRAINT "Education_dates_check"
  CHECK ("completedAt" IS NULL OR "completedAt" >= "startedAt");
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_dates_check"
  CHECK ("expiresAt" IS NULL OR "expiresAt" >= "issuedAt");
