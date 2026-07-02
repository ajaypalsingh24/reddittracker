CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "displayLink" TEXT,
    "snippet" TEXT NOT NULL,
    "sourceQuery" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',
    "riskScore" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL DEFAULT '',
    "recommendedAction" TEXT NOT NULL DEFAULT 'monitor',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "mentionId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT NOT NULL DEFAULT '',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Mention_url_key" ON "Mention"("url");
CREATE UNIQUE INDEX "Alert_mentionId_key" ON "Alert"("mentionId");
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");
CREATE INDEX "Brand_createdAt_idx" ON "Brand"("createdAt");
CREATE INDEX "Mention_brandId_idx" ON "Mention"("brandId");
CREATE INDEX "Mention_sentiment_idx" ON "Mention"("sentiment");
CREATE INDEX "Mention_riskScore_idx" ON "Mention"("riskScore");
CREATE INDEX "Mention_detectedAt_idx" ON "Mention"("detectedAt");
CREATE INDEX "Alert_sentAt_idx" ON "Alert"("sentAt");

ALTER TABLE "Mention" ADD CONSTRAINT "Mention_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_mentionId_fkey" FOREIGN KEY ("mentionId") REFERENCES "Mention"("id") ON DELETE CASCADE ON UPDATE CASCADE;
