import type { Mention, Brand } from "@prisma/client";

type EmailResult = {
  sent: boolean;
  status: string;
  error?: string;
};

export async function sendNegativeMentionEmail(brand: Brand, mention: Mention): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  const to = process.env.ALERT_EMAIL_TO;

  if (!apiKey || apiKey.includes("place_your") || !from || !to) {
    return { sent: false, status: "skipped", error: "Email environment variables are missing." };
  }

  const detectedTime = mention.detectedAt.toISOString();
  const html = `
    <h2>Negative Reddit mention detected</h2>
    <p><strong>Brand:</strong> ${brand.name}</p>
    <p><strong>Title:</strong> ${mention.title}</p>
    <p><strong>Snippet:</strong> ${mention.snippet}</p>
    <p><strong>URL:</strong> <a href="${mention.url}">${mention.url}</a></p>
    <p><strong>Sentiment:</strong> ${mention.sentiment}</p>
    <p><strong>Risk score:</strong> ${mention.riskScore}/10</p>
    <p><strong>Reason:</strong> ${mention.reason}</p>
    <p><strong>Recommended action:</strong> ${mention.recommendedAction}</p>
    <p><strong>Detected time:</strong> ${detectedTime}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[Reddit Alert] ${brand.name}: ${mention.title.slice(0, 90)}`,
      html,
      text: [
        "Negative Reddit mention detected",
        `Brand: ${brand.name}`,
        `Title: ${mention.title}`,
        `Snippet: ${mention.snippet}`,
        `URL: ${mention.url}`,
        `Sentiment: ${mention.sentiment}`,
        `Risk score: ${mention.riskScore}/10`,
        `Reason: ${mention.reason}`,
        `Recommended action: ${mention.recommendedAction}`,
        `Detected time: ${detectedTime}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    return { sent: false, status: "failed", error: await response.text() };
  }

  return { sent: true, status: "sent" };
}
