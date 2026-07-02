import { prisma } from "@/lib/prisma";
import { classifyMention } from "@/lib/sentiment";
import { buildBrandQueries, searchRedditWithSerpApi } from "@/lib/serpapi";
import { sendNegativeMentionEmail } from "@/lib/email";

export type ScanSummary = {
  brandsScanned: number;
  queriesRun: number;
  newMentions: number;
  negativeMentions: number;
  urgentMentions: number;
  alertsSent: number;
  errors: string[];
};

export async function scanBrands(brandId?: string): Promise<ScanSummary> {
  const summary: ScanSummary = {
    brandsScanned: 0,
    queriesRun: 0,
    newMentions: 0,
    negativeMentions: 0,
    urgentMentions: 0,
    alertsSent: 0,
    errors: [],
  };

  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      ...(brandId ? { id: brandId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  summary.brandsScanned = brands.length;

  for (const brand of brands) {
    const queries = buildBrandQueries(brand.name, brand.keywords);

    for (const query of queries) {
      summary.queriesRun += 1;

      try {
        const results = await searchRedditWithSerpApi(query);

        for (const result of results) {
          const existing = await prisma.mention.findUnique({ where: { url: result.url } });
          if (existing) {
            continue;
          }

          const classification = await classifyMention(result.title, result.snippet);
          const mention = await prisma.mention.create({
            data: {
              brandId: brand.id,
              title: result.title.slice(0, 500),
              url: result.url,
              displayLink: result.displayLink,
              snippet: result.snippet,
              sourceQuery: result.sourceQuery,
              sentiment: classification.sentiment,
              riskScore: classification.risk_score,
              reason: classification.reason,
              recommendedAction: classification.recommended_action,
              isUrgent: classification.sentiment === "negative" && classification.risk_score >= 8,
            },
          });

          summary.newMentions += 1;

          if (mention.sentiment === "negative") {
            summary.negativeMentions += 1;
            if (mention.isUrgent) {
              summary.urgentMentions += 1;
            }

            const existingAlert = await prisma.alert.findUnique({ where: { mentionId: mention.id } });
            if (!existingAlert) {
              const email = await sendNegativeMentionEmail(brand, mention);
              await prisma.alert.create({
                data: {
                  mentionId: mention.id,
                  recipient: process.env.ALERT_EMAIL_TO || "",
                  provider: "resend",
                  status: email.status,
                  error: email.error || "",
                },
              });

              if (email.sent) {
                summary.alertsSent += 1;
              }
            }
          }
        }
      } catch (error) {
        summary.errors.push(`${brand.name}: ${query}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }

  return summary;
}
