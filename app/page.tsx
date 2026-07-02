import { prisma } from "@/lib/prisma";
import { createBrand, deleteBrand, runManualScan, updateBrand } from "@/app/actions";

export const dynamic = "force-dynamic";

function sentimentClasses(sentiment: string) {
  if (sentiment === "negative") {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (sentiment === "positive") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default async function DashboardPage() {
  const [brands, mentions, totalMentions, last24Mentions, negativeMentions, urgentMentions] = await Promise.all([
    prisma.brand.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.mention.findMany({
      include: { brand: true },
      orderBy: { detectedAt: "desc" },
      take: 50,
    }),
    prisma.mention.count(),
    prisma.mention.count({
      where: { detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.mention.count({ where: { sentiment: "negative" } }),
    prisma.mention.count({ where: { isUrgent: true } }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">Brand safety dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Reddit Negative Thread Tracker</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor Reddit search results, classify risk with AI, and send email alerts when new negative mentions appear.
            </p>
          </div>
          <form action={runManualScan}>
            <button className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-800">
              Run Scan
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Total mentions", totalMentions],
            ["Last 24 hours", last24Mentions],
            ["Negative mentions", negativeMentions],
            ["Urgent mentions", urgentMentions],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <strong className="mt-3 block text-3xl text-slate-950">{value}</strong>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Add Brand</h2>
            <form action={createBrand} className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Brand name
                <input
                  name="name"
                  required
                  placeholder="Example: Nike"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Keywords
                <textarea
                  name="keywords"
                  rows={4}
                  placeholder="One per line or comma separated"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-600"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
                Active monitoring
              </label>
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                Add Brand
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-950">Tracked Brands</h2>
              <span className="text-sm text-slate-500">{brands.length} total</span>
            </div>
            <div className="mt-4 grid gap-4">
              {brands.map((brand) => (
                <article key={brand.id} className="rounded-lg border border-slate-200 p-4">
                  <form action={updateBrand} className="grid gap-3">
                    <input type="hidden" name="id" value={brand.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
                      <input
                        name="name"
                        defaultValue={brand.name}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                      />
                      <input
                        name="keywords"
                        defaultValue={brand.keywords.join(", ")}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                      />
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input name="isActive" type="checkbox" defaultChecked={brand.isActive} className="h-4 w-4" />
                        Active
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-50">
                        Save
                      </button>
                      <button
                        formAction={runManualScan}
                        name="brandId"
                        value={brand.id}
                        className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800 hover:bg-teal-100"
                      >
                        Scan Brand
                      </button>
                    </div>
                  </form>
                  <form action={deleteBrand} className="mt-2">
                    <input type="hidden" name="id" value={brand.id} />
                    <button className="text-sm font-bold text-red-700 hover:text-red-900">Delete brand</button>
                  </form>
                </article>
              ))}
              {brands.length === 0 && <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Add your first brand to begin monitoring.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-950">Latest Reddit Mentions</h2>
            <span className="text-sm text-slate-500">Newest 50 results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4">Brand</th>
                  <th className="p-4">Mention</th>
                  <th className="p-4">Sentiment</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Detected</th>
                </tr>
              </thead>
              <tbody>
                {mentions.map((mention) => (
                  <tr key={mention.id} className="border-b border-slate-100 align-top">
                    <td className="p-4 text-sm font-semibold text-slate-900">{mention.brand.name}</td>
                    <td className="p-4">
                      <a href={mention.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-950 hover:text-teal-700">
                        {mention.title}
                      </a>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{mention.snippet}</p>
                      <p className="mt-2 text-xs text-slate-500">{mention.reason}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${sentimentClasses(mention.sentiment)}`}>
                        {mention.sentiment}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-950">{mention.riskScore}/10</td>
                    <td className="p-4 text-sm capitalize text-slate-700">{mention.recommendedAction}</td>
                    <td className="p-4 text-sm text-slate-600">{mention.detectedAt.toLocaleString()}</td>
                  </tr>
                ))}
                {mentions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                      No mentions stored yet. Add a brand, add your SerpApi key, then run a scan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
