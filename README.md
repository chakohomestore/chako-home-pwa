# Chako Home Store

Amazon Türkiye ortaklık (affiliate) vitrini. Derleme (build) gerektirmez; klasör olduğu gibi Netlify'da yayınlanır.

## Dosyalar

- `index.html` : sayfanın iskeleti
- `products.json` : TÜM ÜRÜNLER BURADA. Ürün eklemek/silmek için sadece bu dosyayı düzenleyin
- `css/styles.css` : renkler ve görünüm (renkler dosyanın en üstündeki `:root` bölümünde)
- `js/app.js` : kategori ve arama
- `sw.js`, `manifest.webmanifest`, `icon-*.png` : PWA (ana ekrana eklenebilir, çevrimdışı açılır)
- `netlify.toml` : Netlify ayarları, `robots.txt`, `sitemap.xml` : arama motorları için

## Ürün ekleme

`products.json` içindeki `products` listesine, mevcut bir ürünün kopyasını ekleyip düzenleyin:

```json
{
  "id": "u18",
  "name": "Kısa ve anlaşılır ürün adı",
  "category": "mutfak",
  "description": "Tek cümlelik açıklama.",
  "image": "https://m.media-amazon.com/images/I/....jpg",
  "url": "https://link.amazon/....",
  "fullTitle": "Amazon'daki uzun başlık (arama için kullanılır)"
}
```

`category` değeri şunlardan biri olmalı: `mutfak`, `ev`, `robot-supurge`.
Her ürünün `url` alanı SiteStripe ile oluşturduğunuz ortaklık bağlantısı olmalı (komisyonunuz bu bağlantıdaki ortaklık kimliğine yazılır).

## Yayına alma

GitHub'da dosyayı değiştirip "Commit changes" deyin. Netlify birkaç saniye içinde otomatik yayınlar.
Büyük bir değişiklikten sonra `sw.js` içindeki `chako-v1` yazısını `chako-v2` yapın (eski önbellek temizlenir).
