export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (request.method !== "GET") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return response.status(503).json({
      error: "VERCEL_ANALYTICS_TOKEN atau VERCEL_PROJECT_ID belum diatur."
    });
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  // Rentang total dimulai dari tanggal awal yang aman.
  const totalStart = new Date(
  Date.now() - 30 * 24 * 60 * 60 * 1000
);

  function makeParams(since, until, by) {
    const params = new URLSearchParams({
      projectId,
      since: since.toISOString(),
      until: until.toISOString()
    });

    if (teamId) params.set("teamId", teamId);
    if (by) params.set("by", by);

    return params;
  }

  async function getAnalytics(path, params) {
    const res = await fetch(
      `https://api.vercel.com/v1/query/web-analytics/${path}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        JSON.stringify({
          status: res.status,
          detail: data
        })
      );
    }

    return data;
  }

  try {
    const [total, today, daily] = await Promise.all([
      getAnalytics(
        "visits/count",
        makeParams(totalStart, now)
      ),
      getAnalytics(
        "visits/count",
        makeParams(todayStart, now)
      ),
      getAnalytics(
        "visits/aggregate",
        makeParams(weekStart, now, "day")
      )
    ]);

    return response.status(200).json({
      total,
      today,
      daily,
      updatedAt: now.toISOString()
    });
  } catch (error) {
    return response.status(502).json({
      error: "Gagal mengambil data Vercel Analytics.",
      detail: error.message
    });
  }
}
