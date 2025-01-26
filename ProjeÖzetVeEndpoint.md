# RENTGOKDS
  Bu proje, Rent Go araç kiralama şirketinin çeşitli şubeleri ve araç kiralama
işlemleri üzerine geliştirilmiş olan karar destek sistemine dair bulguları sunmaktadır.
Proje kapsamında, araç kiralama verileri analiz edilerek şubeler arasındaki
performans farkları ve araç tercihleri üzerinde derinlemesine incelemeler yapılmasını
sağlayacak grafikler sunulmuştur.Yönetici değişen durumlara göre karar vermek
istemesi durumunda grafikler üzerinde çeşitli filtrelemeler sağlayabilmektedir.
  Yöneticinin,şubelerde gerçekleşen araç kiralama verilerini çeşitli
özelliklere göre grafikler üzerinde görüntülemesi sağlanmıştır.Yönetici belirli bir
tarih aralığına göre grafikler üzerinde filtreleme yaparak daha özelleştirilmiş verilere
erişebilmekte ve analiz yapabilmektedir.Ayrıca sistem iki şubenin veya aynı şubenin
farklı tarihlerdeki performanslarını karşılaştırmak amacıyla seçilen şubelerin
grafiklerini yan yana görüntülemeyi mümkün kılmaktadır.Bu sayede
yönetici,şubelerdeki kiralama eğilimlerini ve performans farklarını görsel olarak
analiz edebilmekte ve kararlarını bu verilere dayanarak alabilmektedir.

Endpointler:
GET /data: Verileri almak için kullanılıyor.
GET /branches: Şubelerle ilgili bilgileri almak için kullanılıyor.
POST /filtered-data: Belirli filtrelerle veri almak için.
POST /filtered-vehicle-data: Araçlara yönelik filtrelenmiş veri almak için.
POST /segment-data: Segmentlere dair veri almak için.
POST /fuel-data: Yakıt türlerine dair veri almak için.
POST /transmission-data: Şanzıman bilgileri almak için.
POST /body-type-data: Araç gövde tipi bilgilerini almak için.
