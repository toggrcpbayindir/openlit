# Productivity Coin Tracking System

Bu dokümantasyon OpenLIT platformuna entegre edilmiş olan productivity coin tracking sistemini açıklamaktadır.

## Genel Bakış

Productivity sistem, kullanıcıların günlük görevlerini önceliklendirmelerine, zorluk derecelerine göre ağırlıklandırmalarına ve tamamlama performanslarına göre coin kazanmalarına olanak sağlar.

## Temel Özellikler

### 1. Görev Yönetimi
- Görev oluşturma, düzenleme ve silme
- Öncelik seviyesi (1-5 skala)
- Zorluk derecesi (1-5 skala)
- Tahmini süre (saat cinsinden)
- Durum takibi (Beklemede, Devam Ediyor, Tamamlandı, İptal Edildi)

### 2. Coin Değerleme Algoritması

#### Formula
```
Coin = (öncelik × zorluk × süre) × temel_çarpan × verimlilik_bonusu
```

#### Parametreler
- **Temel Çarpan**: 10
- **Verimlilik Bonusu**: 
  - 1.2 (eğer görev ≤1 saatte tamamlanırsa)
  - 1.0 (diğer durumlar)

#### Örnekler
- Düşük öncelik (1), düşük zorluk (1), 0.5 saat → 6 coin
- Orta öncelik (3), orta zorluk (3), 2 saat → 180 coin
- Yüksek öncelik (5), yüksek zorluk (5), 1 saat → 300 coin (bonus ile)

### 3. Zaman Serisi ve Analytics
- Günlük coin kazancı grafiği
- Haftalık/aylık trend analizi
- Verimlilik metrikleri (görev/saat)
- Ortalama öncelik ve zorluk seviyeleri

### 4. Günlük Raporlama
- Tamamlanan görevler özeti
- Kazanılan toplam coin
- Verimlilik analizi
- Kişiselleştirilmiş öneriler ve insights

## Veritabanı Yapısı

### ProductivityTask
```sql
- id: String (Primary Key)
- title: String
- description: String (Optional)
- priority: Integer (1-5)
- difficulty: Integer (1-5)
- status: Enum (pending, in_progress, completed, cancelled)
- userId: String (Foreign Key)
- estimatedHours: Float
- actualHours: Float (Optional)
- coinsEarned: Float
- completedAt: DateTime (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### CoinRecord
```sql
- id: String (Primary Key)
- taskId: String (Foreign Key)
- userId: String (Foreign Key)
- amount: Float
- reason: String
- timestamp: DateTime
- metadata: String (JSON)
```

### DailyProductivitySummary
```sql
- id: String (Primary Key)
- userId: String (Foreign Key)
- date: DateTime
- totalCoins: Float
- tasksCompleted: Integer
- totalHours: Float
- avgPriority: Float
- avgDifficulty: Float
- efficiency: Float
- createdAt: DateTime
- updatedAt: DateTime
```

## API Endpoints

### Görev Yönetimi
- `GET /api/productivity/tasks` - Görevleri listele
- `POST /api/productivity/tasks` - Yeni görev oluştur
- `PUT /api/productivity/tasks/[id]` - Görevi güncelle
- `DELETE /api/productivity/tasks/[id]` - Görevi sil

### Coin ve İstatistikler
- `GET /api/productivity/coins` - Coin geçmişi ve istatistikler
- `GET /api/productivity/reports` - Günlük rapor
- `POST /api/productivity/reports/generate` - Rapor oluştur

## Kullanım Senaryoları

### Senaryo 1: Yüksek Verimlilik Günü
```
Görevler:
1. Kritik hata düzeltme (P:5, D:4, 0.5 saat) → 120 coin
2. Önemli özellik geliştirme (P:4, D:3, 1 saat) → 144 coin
3. Dokümantasyon (P:3, D:2, 2 saat) → 120 coin

Toplam: 384 coin, 3.5 saat, 0.857 görev/saat
```

### Senaryo 2: Dengeli Verimlilik Günü
```
Görevler:
1. Orta düzey geliştirme (P:3, D:3, 2 saat) → 180 coin
2. Test yazma (P:2, D:4, 3 saat) → 240 coin
3. Code review (P:4, D:2, 1.5 saat) → 120 coin

Toplam: 540 coin, 6.5 saat, 0.462 görev/saat
```

## Optimizasyon Stratejileri

### 1. Verimlilik Bonusu
- Büyük görevleri ≤1 saatlik parçalara böl
- Hızlı tamamlama için %20 bonus kazan
- Konsantrasyonu artır

### 2. Öncelik ve Zorluk Dengeleme
- Yüksek öncelikli görevlere odaklan
- Zorluk seviyesini beceri düzeyine göre ayarla
- Lineer çarpım avantajını kullan

### 3. Süre Yönetimi
- Gerçekçi süre tahminleri yap
- Uzun görevler için azalan getiri yok
- Sürekli günlük tamamlama oranı hedefle

## Teknoloji Stack

### Backend
- **Framework**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js

### Frontend
- **Framework**: Next.js with React
- **UI Library**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks

### Database Schema
- **ORM**: Prisma
- **Migrations**: Automated with Prisma
- **Seeding**: Custom seed scripts

## Kurulum ve Kullanım

### 1. Database Migration
```bash
cd src/client
npx prisma db push
```

### 2. Uygulama Başlatma
```bash
npm run dev
```

### 3. Productivity Sayfasına Erişim
- Browser'da `http://localhost:3000/productivity` adresine git
- Sidebar'dan "Productivity" linkine tıkla

### 4. İlk Görev Oluşturma
1. "New Task" butonuna tıkla
2. Görev bilgilerini doldur
3. Öncelik ve zorluk seviyelerini ayarla
4. "Create Task" butonuna tıkla

## Test Senaryoları

Sistem, comprehensive test senaryolarıyla doğrulanmıştır:
- 9 farklı coin hesaplama testi
- 3 produktivite senaryosu testi
- Edge case validasyonları
- Algorithm accuracy verification

Test dosyası: `tests/productivity-algorithm.test.js`

## Gelecek Geliştirmeler

1. **Auto-evaluation**: Görev karmaşıklığının otomatik tespiti
2. **Machine Learning**: Kişiselleştirilmiş zorluk ve süre önerileri
3. **Team Features**: Takım productivity karşılaştırmaları
4. **Gamification**: Achievement sistemi ve liderlik tabloları
5. **Integration**: Diğer productivity araçlarıyla entegrasyon

## Destek ve Katkı

Bu sistem OpenLIT platformunun bir parçasıdır. Katkıda bulunmak için:
1. Repository'yi fork edin
2. Feature branch oluşturun
3. Changes'ları commit edin
4. Pull request gönderin

## Lisans

Bu proje Apache-2.0 lisansı altında dağıtılmaktadır.