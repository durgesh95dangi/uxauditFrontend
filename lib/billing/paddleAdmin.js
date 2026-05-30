import { Environment, Paddle } from "@paddle/paddle-node-sdk";

function getPaddleClient() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return null;

  const environment =
    (process.env.PADDLE_ENVIRONMENT || "sandbox").toLowerCase() === "production"
      ? Environment.production
      : Environment.sandbox;

  return new Paddle(apiKey, { environment });
}

function monthToDateRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const toIsoDate = (value) => value.toISOString().slice(0, 10);

  return {
    start: toIsoDate(start),
    end: toIsoDate(end)
  };
}

function parseMetricUsd(response) {
  if (response == null) return null;

  if (typeof response === "number") return response;

  const data = response.data ?? response;
  const rows = Array.isArray(data) ? data : [data];

  let totalCents = 0;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;

    const raw =
      row.total ??
      row.amount ??
      row.value ??
      row.mrr ??
      row.revenue ??
      row.total_amount;

    if (raw == null) continue;

    const numeric = Number(raw);
    if (Number.isNaN(numeric)) continue;

    totalCents += numeric;
  }

  if (totalCents === 0) return 0;
  return totalCents >= 1000 ? totalCents / 100 : totalCents;
}

export async function fetchPaddleMetrics() {
  const paddle = getPaddleClient();
  if (!paddle) {
    return { configured: false };
  }

  const range = monthToDateRange();

  try {
    const [mrrResponse, revenueResponse] = await Promise.all([
      paddle.metrics.getMonthlyRecurringRevenue(range),
      paddle.metrics.getRevenue(range)
    ]);

    return {
      configured: true,
      available: true,
      mrrUsd: parseMetricUsd(mrrResponse),
      revenueThisMonthUsd: parseMetricUsd(revenueResponse),
      periodStart: range.start,
      periodEnd: range.end
    };
  } catch (error) {
    console.error("[paddleAdmin] metrics fetch failed:", error?.message || error);
    return {
      configured: true,
      available: false,
      error: error?.message || "Could not load Paddle metrics"
    };
  }
}
