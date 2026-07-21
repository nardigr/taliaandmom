-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteTitle" TEXT NOT NULL DEFAULT 'Talja&mom — Modë femrash',
    "siteDescription" TEXT NOT NULL DEFAULT 'Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.',
    "siteKeywords" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "businessDescription" TEXT,
    "businessPhone" TEXT,
    "businessEmail" TEXT,
    "businessAddress" TEXT,
    "businessCity" TEXT,
    "businessCountry" TEXT,
    "ogImage" TEXT,
    "ga4MeasurementId" TEXT,
    "googleSiteVerification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSeo" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "pageTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_pageSlug_sectionKey_key" ON "PageContent"("pageSlug", "sectionKey");

-- CreateIndex
CREATE INDEX "PageContent_pageSlug_idx" ON "PageContent"("pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PageSeo_pageSlug_key" ON "PageSeo"("pageSlug");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_deviceType_idx" ON "PageView"("deviceType");

-- CreateIndex
CREATE INDEX "PageView_browser_idx" ON "PageView"("browser");
