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
1.GET /data: Verileri almak için kullanılıyor.
2.GET /branches: Şubelerle ilgili bilgileri almak için kullanılıyor.
3.POST /filtered-data: Belirli filtrelerle veri almak için.
4.POST /filtered-vehicle-data: Araçlara yönelik filtrelenmiş veri almak için.
5.POST /segment-data: Segmentlere dair veri almak için.
6.POST /fuel-data: Yakıt türlerine dair veri almak için.
7.POST /transmission-data: Şanzıman bilgileri almak için.
8.POST /body-type-data: Araç gövde tipi bilgilerini almak için.
9.POST /login::Kullanıcı giriş işlemini gerçekleştirir. İstek gövdesinde (request body) gönderilen kullanıcı adı ve şifre bilgilerini doğrular.
