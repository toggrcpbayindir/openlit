# Coin Calculation Terminal Application

Bu terminal tabanlı Python uygulaması, iş parametrelerine göre coin değerlerini hesaplar ve sonuçları yarım saatlik zaman dilimlerinde gösterir.

## Özellikler

- 🖥️ **Interaktif Terminal Arayüzü**: Kullanıcı dostu menü sistemi
- 📊 **Coin Hesaplama Algoritması**: Çoklu parametreye dayalı hesaplama
- ⏰ **Zaman Serisi Görünümü**: Yarım saatlik dilimler halinde sonuç gösterimi
- 📈 **İstatistiksel Analiz**: Toplam ve ortalama değerler
- ✅ **Validasyon**: Girdi doğrulama ve hata kontrolü

## Algoritma

Coin değeri şu formüle göre hesaplanır:

```
Coin = (W_i × D_i × P_i × S_i) × (T_ideal / T_real) × time_interval
```

Burada:
- **W_i**: İş zorluk katsayısı
- **D_i**: Öncelik katsayısı  
- **T_ideal**: İdeal süre (saat)
- **T_real**: Gerçek süre (saat)
- **P_i**: Talep katsayısı
- **S_i**: Stratejik katsayı
- **time_interval**: Zaman dilimi (varsayılan: 0.5 saat)

## Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.8+
- Standart Python kütüphaneleri (harici bağımlılık yok)

### Çalıştırma

1. **İnteraktif Mode** (Ana Uygulama):
```bash
python coin_calculator.py
```

2. **Demo Mode** (Örnek verilerle test):
```bash
python demo_coin_calculator.py
```

## Kullanım Kılavuzu

### Ana Menü Seçenekleri

1. **Yeni iş ekle**: İş parametrelerini girerek sisteme yeni iş ekler
2. **İş özetini göster**: Eklenen tüm işlerin parametrelerini listeler  
3. **Coin değerlerini hesapla ve göster**: Zaman serisi analizi yapar
4. **Çıkış**: Uygulamadan çıkar

### İş Parametreleri Girişi

Bir iş eklerken şu parametreler istenir:

- **İş adı**: İşin tanımlayıcı adı (opsiyonel)
- **İş zorluk katsayısı (W_i)**: Pozitif sayı
- **Öncelik katsayısı (D_i)**: Pozitif sayı
- **İdeal süre (T_ideal)**: Saat cinsinden pozitif sayı
- **Gerçek süre (T_real)**: Saat cinsinden pozitif sayı
- **Talep katsayısı (P_i)**: Pozitif sayı
- **Stratejik katsayı (S_i)**: Pozitif sayı

### Örnek Kullanım

```
İş adı: Web Geliştirme
İş zorluk katsayısı (W_i): 3.0
Öncelik katsayısı (D_i): 2.0
İdeal süre - saat (T_ideal): 8.0
Gerçek süre - saat (T_real): 6.0
Talep katsayısı (P_i): 1.5
Stratejik katsayı (S_i): 2.2
```

## Çıktı Formatı

### Zaman Serisi Tablosu
```
Zaman   Web Geliştir   Veri Analizi   UI Tasarım     
-----------------------------------------------------
14:00   13.2000        4.4460         4.4800         
14:30   13.2000        4.4460         4.4800         
15:00   13.2000        4.4460         4.4800         
...
```

### İstatistiksel Özet
Her iş için:
- Toplam coin değeri
- Ortalama coin değeri
- Zaman verimliliği faktörü
- Performans değerlendirmesi

## Dosya Yapısı

```
├── coin_calculator.py      # Ana uygulama
├── demo_coin_calculator.py # Demo script
└── README_coin_calculator.md # Bu dosya
```

## Sınıf Yapısı

### `JobParameters`
İş parametrelerini tutar:
- `name`: İş adı
- `w_i`: Zorluk katsayısı
- `d_i`: Öncelik katsayısı
- `t_ideal`: İdeal süre
- `t_real`: Gerçek süre
- `p_i`: Talep katsayısı
- `s_i`: Stratejik katsayı

### `CoinCalculator`
Ana hesaplama motoru:
- `calculate_coin_value()`: Tek iş için coin hesabı
- `add_job()`: İş ekleme
- `calculate_time_series()`: Zaman serisi üretimi

### `TerminalInterface`
Kullanıcı arayüzü:
- `get_job_parameters()`: Parametreleri alma
- `display_time_series()`: Sonuçları gösterme
- `main_menu()`: Ana menü döngüsü

## Hata Yönetimi

- Negatif veya sıfır değerler için uyarı
- Geçersiz sayısal girişler için tekrar istem
- Beklenmeyen hatalar için güvenli çıkış

## Geliştirme Notları

- Uygulama tamamen Türkçe arayüze sahiptir
- Modüler tasarım sayesinde kolayca genişletilebilir
- Harici bağımlılık bulunmaz
- Python 3.8+ ile uyumludur

## Lisans

Apache-2.0 Lisansı altında yayınlanmıştır.