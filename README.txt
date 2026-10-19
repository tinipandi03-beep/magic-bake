MAGIC BAKE — WEBSITE + DASHBOARD STATISTIK VERCEL

ISI FOLDER
- index.html       : website utama Magic Bake (foto tertanam di file)
- dashboard.html   : dashboard statistik, tanpa login
- api/stats.js     : fungsi server yang mengambil statistik Vercel
- vercel.json      : konfigurasi Vercel
- package.json     : metadata proyek

CARA DEPLOY
1. Upload folder proyek ini ke repository GitHub (jangan upload token rahasia).
2. Di Vercel, pilih Add New Project lalu impor repository tersebut.
3. Deploy proyek.
4. Buka Project Settings > Environment Variables dan tambahkan:
   VERCEL_ANALYTICS_TOKEN = token Vercel API dengan akses baca Analytics
   VERCEL_PROJECT_ID = ID proyek Vercel (bukan nama domain)
   VERCEL_TEAM_ID = ID team jika proyek berada di team; opsional untuk akun personal
5. Aktifkan Web Analytics pada proyek Vercel, lalu deploy ulang.
6. Setelah redeploy, website utama ada di domain root dan dashboard di /dashboard.html.

PENTING
- Jangan pernah menaruh VERCEL_ANALYTICS_TOKEN di HTML atau membagikannya.
- Dashboard ini tidak memakai login, sesuai permintaan. Karena itu siapa pun yang mengetahui URL dashboard dapat melihat statistik. Tidak ditautkan dari halaman utama bukan berarti terlindungi.
- Vercel Web Analytics memerlukan traffic setelah diaktifkan; data lama sebelum pemasangan tidak akan otomatis muncul.
- API analytics dapat memerlukan penyesuaian parameter sesuai bentuk respons/akses akun Vercel. Jika statistik gagal, cek respons endpoint dan izin token.
- “Realtime” tidak dijamin per detik; data analitik dapat memiliki jeda pemrosesan.
- Data halaman utama disalin dari file Magic-Bake.html yang tersedia saat pembuatan paket.
