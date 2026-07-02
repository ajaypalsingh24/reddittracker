const baseUrl = process.env.CRON_TARGET_URL || process.env.NEXT_PUBLIC_APP_URL;
const secret = process.env.CRON_SECRET;

if (!baseUrl || !secret) {
  console.error("CRON_TARGET_URL or NEXT_PUBLIC_APP_URL and CRON_SECRET are required.");
  process.exit(1);
}

const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/cron/scan`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

const body = await response.text();
console.log(body);

if (!response.ok) {
  process.exit(1);
}
