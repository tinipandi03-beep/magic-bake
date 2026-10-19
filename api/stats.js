export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Access-Control-Allow-Origin', '*');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) {
    return response.status(503).json({
      error: 'Analytics belum dikonfigurasi. Isi VERCEL_ANALYTICS_TOKEN dan VERCEL_PROJECT_ID di Environment Variables Vercel.'
    });
  }

  const params = new URLSearchParams({ projectId });
  if (teamId) params.set('teamId', teamId);
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

  try {
    const [totalRes, todayRes, weekRes] = await Promise.all([
      fetch(`https://api.vercel.com/v1/query/web-analytics/visits/count?${params}`, { headers }),
      fetch(`https://api.vercel.com/v1/query/web-analytics/visits/count?${new URLSearchParams({ ...Object.fromEntries(params), from: new Date(new Date().setHours(0,0,0,0)).toISOString(), to: new Date().toISOString() })}`, { headers }),
      fetch(`https://api.vercel.com/v1/query/web-analytics/visits/aggregate?${new URLSearchParams({ ...Object.fromEntries(params), from: new Date(Date.now()-6*86400000).toISOString(), to: new Date().toISOString(), by: 'day' })}`, { headers })
    ]);
    const raw = await Promise.all([totalRes.json(), todayRes.json(), weekRes.json()]);
    const failed = [totalRes, todayRes, weekRes].find(r => !r.ok);
    if (failed) return response.status(502).json({ error: 'Vercel Analytics API gagal merespons. Periksa token, project ID, dan pengaturan Analytics.', detail: raw.find((_, i) => ![totalRes,todayRes,weekRes][i].ok) });
    return response.status(200).json({ total: raw[0], today: raw[1], daily: raw[2], updatedAt: new Date().toISOString() });
  } catch (error) {
    return response.status(500).json({ error: 'Tidak dapat mengambil statistik sekarang.' });
  }
}
