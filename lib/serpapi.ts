export type SerpMentionResult = {
  title: string;
  url: string;
  snippet: string;
  displayLink?: string;
  sourceQuery: string;
};

type SerpApiOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
  displayed_link?: string;
};

const negativeQueryTerms = "scam OR fraud OR complaint OR bad OR fake OR poor OR worst OR avoid OR issue OR problem";

export function buildBrandQueries(brandName: string, keywords: string[]) {
  const uniqueTerms = Array.from(new Set([brandName, ...keywords].map((term) => term.trim()).filter(Boolean)));
  return uniqueTerms.flatMap((term) => [
    `site:reddit.com "${term}"`,
    `site:reddit.com "${term}" ${negativeQueryTerms}`,
  ]);
}

export async function searchRedditWithSerpApi(query: string): Promise<SerpMentionResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey || apiKey.includes("place_your")) {
    throw new Error("SERPAPI_API_KEY is missing.");
  }

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: apiKey,
    num: "10",
    hl: "en",
    gl: "us",
    tbs: "qdr:d",
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SerpApi request failed with ${response.status}.`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return (data.organic_results || [])
    .map((item: SerpApiOrganicResult) => ({
      title: item.title || "Untitled Reddit result",
      url: item.link || "",
      snippet: item.snippet || "",
      displayLink: item.displayed_link,
      sourceQuery: query,
    }))
    .filter((item: SerpMentionResult) => item.url.includes("reddit.com"));
}
