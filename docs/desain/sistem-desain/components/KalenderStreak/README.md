# KalenderStreak

Kalender bulanan berupa titik tinta yang menunjukkan kebiasaan menulis tanpa angka berlebihan; ciri khas RanahMenulis.

| Hari | Titik |
| --- | --- |
| Target tercapai | Lingkaran penuh `ink` 14px |
| Ada tulisan, belum target | Cincin 1.5px `ink` 14px |
| Kosong | Titik `line-strong` 4px, opacity `opacity-dot-empty` 0.3 |
| Hari ini | Sel bergaris 1px `ink` |
| Masa depan | Tanpa titik |

- Grid 7 kolom, sel 36px. Minggu dimulai Senin [usulan]: S S R K J S M.
- Di atasnya: angka streak `figure` + "hari berturut-turut", lalu progres hari ini sebagai garis 4px (`line` → `ink`) dengan angka `tabular-nums`.
- Saat target hari ini tercapai, cincin hari ini terisi tinta (300ms, sekali) dan angka naik. Satu-satunya perayaan: tanpa konfeti, lencana, atau suara.
- Setiap sel punya `aria-label` berisi tanggal dan keadaannya; hari ini `aria-current="date"`.
- Data streak pribadi; tampil di profil hanya bila penulis memilih.
- **Ponsel [usulan]:** `rm-cal--touch`, sel minimal 48px dan selebar kolom, supaya setiap hari bisa diketuk (target sentuh 44px). Desktop tetap 36px. Titik tetap 14px.
