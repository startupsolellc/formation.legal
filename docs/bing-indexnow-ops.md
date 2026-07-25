# Bing Keşif & IndexNow — Ops Kaydı

**Tarih:** 2026-07-25
**Kaynak ölçüm:** Bing Webmaster API (tahmin değil, ölçüm)
**Portföy geneli teşhis:** `~/Documents/AI_Knowledge_Base/wiki/icgorusler/bing-child-sitemap-kesif-hatasi.md`

Bu dosya formation.legal'e özgü rakamları ve doğrulama kurallarını tutar. Arızanın
genel anatomisi yukarıdaki wiki notunda; burada tekrarlanmıyor.

---

## 1. Teşhis (2026-07-25, müdahale öncesi)

`sitemap-index.xml` Bing'e 2026-05-22'de gönderilmiş. Bing index'i bir kez okumuş,
içindeki tek `<sitemap>` girdisini saymış, **child sitemap'i hiç getirmemiş.**

| Sinyal | Değer | Yorum |
|---|---|---|
| `GetFeeds.UrlCount` | **1** | Arıza doğrulandı — child hiç getirilmemiş |
| `GetFeeds.LastCrawled` | 2026-05-22 09:26 (= `Submitted`) | Feed 64 gündür donmuş |
| `GetCrawlStats.InIndex` | 87 | Sayfalar indekste — site kör değil |
| `GetCrawlStats.CrawledPages` | günlük 13–25 | Bing aktif tarıyor |
| `GetCrawlStats.InLinks` | 1 | Dış link yok denecek kadar az |
| Trafik (62 gün) | **308 gösterim / 3 tık** | Keşif var, görünürlük yok |
| URL gönderim kotası | 100/gün, 700/ay — **tam** | Hiç URL gönderilmemiş |
| IndexNow | yok | Repoda tek iz yok |

Engel yok: sitemap'teki 42 URL'in tamamı BingBot UA'ya `200` dönüyor, robots.txt
temiz, `BlockedByRobotsTxt: 0`, 4xx yok.

`GetCrawlStats`'taki `Code5xx: 39–60` kayan pencere toplamıdır ve istikrarlı
düşmektedir (60 → 39). Canlı URL'lerin hepsi 200 döndüğü için bu, silinmiş eski
URL'lerden kalan kuyruktur — aktif engel değil.

Kardeş projelerle karşılaştırma: businessnamesearch.us aynı arızada 0 indeks /
0 gösterim aldı. entitysearch.us child sitemap yoluyla `UrlCount: 73` alıp
62 günde 19.299 tık / 1.232.950 gösterim yaptı.

## 2. Yapılan müdahale

| # | İşlem | Kim | Durum |
|---|---|---|---|
| 1 | Bing WMT → `sitemap-0.xml` **child olarak** gönderildi | site sahibi | ✅ doğrulandı |
| 2 | Bing WMT → 42 URL manuel gönderildi | site sahibi | ✅ doğrulandı |
| 3 | IndexNow anahtarı kuruldu (`public/4e3d092ea5871686fc071df6facb1efa.txt`) | kod | ✅ |
| 4 | `robots.txt` artık child sitemap'i de listeliyor | kod | ✅ |
| 5 | `scripts/indexnow-submit.mjs` eklendi | kod | ✅ |
| 6 | İlk IndexNow gönderimi — 42 URL, `HTTP 202` | kod | ✅ 2026-07-25 |

**Müdahale sonrası ölçüm (2026-07-25 14:0x):**

- `GetFeeds` → `sitemap-0.xml`, `UrlCount: 42`, `Status: Success`,
  `LastCrawled: 2026-07-25 14:06` — **1 → 42, arıza kapandı**
- `GetUrlSubmissionQuota` → günlük 100 → **58**, aylık 700 → **658** —
  tam 42 URL'in gönderildiğini kanıtlar

## 3. IndexNow

Anahtar: `4e3d092ea5871686fc071df6facb1efa`
Dosya: `https://formation.legal/4e3d092ea5871686fc071df6facb1efa.txt`

Anahtar gizli değil, zaten public bir dosya. Ama **projeye özgüdür** — bir
domaindeki anahtar başka bir domain için gönderim yetkilendiremez. Başka projeye
kopyalama, her proje kendi anahtarını üretsin.

```sh
node scripts/indexnow-submit.mjs              # canlı sitemap'teki tüm URL'ler
node scripts/indexnow-submit.mjs /costs/xyz   # sadece belirli yollar
```

Script anahtar dosyası canlıda ve anahtara birebir eşit olmadan gönderim yapmaz;
eşleşmeyen anahtar her gönderimi sessiz `403`'e çevirir.

**Kural: IndexNow her zaman deploy'dan SONRA gönderilir, önce değil.** Deploy
Cloudflare üzerinden git push ile tetikleniyor. Önce yeni içeriği canlıda
doğrula — yalnızca *yeni* metinde geçen bir string ile grep'le, eski metinde de
geçen bir string yanlış pozitif verir — sonra gönder.

Dönüş kodları: `200`/`202` başarı · `403` anahtar dosyası eşleşmiyor ·
`422` URL beyan edilen host'ta değil.

## 4. Doğrulama — geçme koşulları

**Gönderim, tamamlanma değildir.** `Status: Success` yalnızca XML'in parse
edildiğini söyler, sayfanın bulunduğunu değil. Bu projede bir gönderim adımı
ancak aşağıdaki sayaçlardan biri hareket ederse "yapıldı" sayılır.

48–72 saat sonra:

```sh
set -a; . ./.env; set +a
S="https://formation.legal/"; B="https://ssl.bing.com/webmaster/api.svc/json"; K="$BING_API_Key"

curl -s --get "$B/GetFeeds"    --data-urlencode "apikey=$K" --data-urlencode "siteUrl=$S"
curl -s --get "$B/GetUrlInfo"  --data-urlencode "apikey=$K" --data-urlencode "siteUrl=$S" \
     --data-urlencode "url=https://formation.legal/costs/annual-report-fees-by-state"
curl -s --get "$B/GetCrawlStats" --data-urlencode "apikey=$K" --data-urlencode "siteUrl=$S"
```

| Koşul | Eşik (2026-07-25 taban) |
|---|---|
| `GetFeeds.UrlCount` | = sayfa sayısı (42) ✅ karşılandı |
| `GetFeeds.LastCrawled` | gönderim tarihinde donmamış, ilerliyor |
| `GetUrlInfo.LastCrawledDate` | `0001-01-01` değil ve tazeleniyor |
| `GetCrawlStats.InIndex` | > 87 |
| `GetRankAndTrafficStats` | günlük gösterim > 20 tabanının üstünde trend |
| `GetUrlSubmissionQuota` | aylık kalan < 700 ✅ (658) |

Başka hiçbir şey kanıt değil.

**Not:** Tarihler `/Date(1784185200000-0700)/` formatında; `0001-01-01` ve
`1601-01-01` sentinel değerlerdir. `Submitted: 1601-01-01` = Bing feed'i
robots.txt'ten kendi bulmuş demektir. Bu makinede Python `urllib`
`CERTIFICATE_VERIFY_FAILED` veriyor — `curl` kullan. API anahtarı `.env`
içindeki `BING_API_Key`; asla log'lama, commit etme, dokümana yazma.
