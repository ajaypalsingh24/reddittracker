export type Classification = {
  sentiment: "positive" | "neutral" | "negative";
  risk_score: number;
  reason: string;
  recommended_action: "ignore" | "monitor" | "reply" | "escalate";
};

const negativeWords = [
  "scam",
  "fraud",
  "fake",
  "bad",
  "poor",
  "worst",
  "complaint",
  "avoid",
  "issue",
  "problem",
  "not recommended",
  "refund",
  "broken",
  "terrible",
  "lawsuit",
];

const positiveWords = ["great", "good", "excellent", "love", "best", "helpful", "recommended", "happy"];

function clampRisk(score: number) {
  return Math.max(1, Math.min(10, Math.round(score)));
}

export function ruleBasedClassify(title: string, snippet: string): Classification {
  const text = `${title} ${snippet}`.toLowerCase();
  const negativeHits = negativeWords.filter((word) => text.includes(word));
  const positiveHits = positiveWords.filter((word) => text.includes(word));

  if (negativeHits.length > 0) {
    const risk = clampRisk(5 + negativeHits.length + (text.includes("scam") || text.includes("fraud") ? 2 : 0));
    return {
      sentiment: "negative",
      risk_score: risk,
      reason: `Matched negative terms: ${negativeHits.slice(0, 4).join(", ")}.`,
      recommended_action: risk >= 8 ? "escalate" : "reply",
    };
  }

  if (positiveHits.length > 0) {
    return {
      sentiment: "positive",
      risk_score: 1,
      reason: `Matched positive terms: ${positiveHits.slice(0, 3).join(", ")}.`,
      recommended_action: "ignore",
    };
  }

  return {
    sentiment: "neutral",
    risk_score: 2,
    reason: "No strong positive or negative language detected.",
    recommended_action: "monitor",
  };
}

function normalizeClassification(value: Partial<Classification>, fallback: Classification): Classification {
  const sentiment = ["positive", "neutral", "negative"].includes(value.sentiment ?? "")
    ? (value.sentiment as Classification["sentiment"])
    : fallback.sentiment;
  const action = ["ignore", "monitor", "reply", "escalate"].includes(value.recommended_action ?? "")
    ? (value.recommended_action as Classification["recommended_action"])
    : fallback.recommended_action;

  return {
    sentiment,
    risk_score: clampRisk(Number(value.risk_score ?? fallback.risk_score)),
    reason: String(value.reason || fallback.reason).slice(0, 280),
    recommended_action: action,
  };
}

export async function classifyMention(title: string, snippet: string): Promise<Classification> {
  const fallback = ruleBasedClassify(title, snippet);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.includes("place_your")) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Classify brand-risk Reddit search results. Return JSON only with sentiment, risk_score, reason, recommended_action. sentiment must be positive, neutral, or negative. risk_score must be 1-10. recommended_action must be ignore, monitor, reply, or escalate.",
          },
          {
            role: "user",
            content: `Title: ${title}\nSnippet: ${snippet}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    return normalizeClassification(JSON.parse(content), fallback);
  } catch {
    return fallback;
  }
}
