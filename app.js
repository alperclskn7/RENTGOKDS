document.addEventListener("DOMContentLoaded", () => {
    // Başlangıçta verileri yükle
    loadDashboardData();

    // Filtreleme butonunu dinle
    const filterButton = document.getElementById("filter-button");
    filterButton.addEventListener("click", () => {
        const basTarih = document.getElementById("bas-tarih").value;
        const bitTarih = document.getElementById("bit-tarih").value;

        // Tarihleri kontrol et
        if (!basTarih || !bitTarih) {
            alert("Lütfen başlangıç ve bitiş tarihlerini seçin.");
            return;
        }

        // Dashboard verilerini filtreye göre yükle
        loadDashboardData(basTarih, bitTarih);
    });

    function loadDashboardData(bas_tarih = "", bit_tarih = "") {
        // API çağrısı için URL oluştur
        const query = new URLSearchParams({ startDate: bas_tarih, endDate: bit_tarih }).toString();
        const apiUrl = `http://localhost:3000/data?${query}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Kartları güncelle
                updateDashboard(data);

                // Grafiklerin yeniden oluşturulması
                resetCanvas("segment-chart");
                createBarChart("segment-chart", "Segment Bazlı Kiralamalar", data.segmentData);

                resetCanvas("yakit-chart");
                createPieChart("yakit-chart", "Yakıt Türüne Göre Kiralamalar", data.yakitData);

                resetCanvas("sanziman-chart");
                createDoughnutChart("sanziman-chart", "Şanzıman Türüne Göre Kiralamalar", data.sanzimanData);

                resetCanvas("sube-chart");
                createPolarAreaChart("sube-chart", "Şube Türüne Göre Kiralamalar", data.subeData);

                resetCanvas("kasa-chart");
                createBarChart("kasa-chart", "Kasa Tipine Göre Kiralamalar", data.kasaData);

                resetCanvas("bolge-chart");
                createBarChart("bolge-chart", "Bölgeye Göre Kiralama Sayıları", data.bolgeData);
            })
            .catch((error) => console.error("Veri alınamadı:", error));
    }

    function updateDashboard(data) {
        document.getElementById("sube-count").textContent = `Şube Sayısı: ${data.subeCount}`;
        document.getElementById("arac-count").textContent = `Araç Sayısı: ${data.aracCount}`;
       
        document.getElementById("most-rented-bayi").textContent = `En Çok Kiralama Yapan Şube: ${data.mostRentedBayi}`;
    }

    function resetCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const parent = canvas.parentNode;
        canvas.remove();

        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        parent.appendChild(newCanvas);
    }

    function createBarChart(canvasId, label, chartData) {
        const ctx = document.getElementById(canvasId).getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: label,
                    data: chartData.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.4)',   
                        'rgba(54, 162, 235, 0.4)',   
                        'rgba(255, 206, 86, 0.4)',   
                        'rgba(75, 192, 192, 0.4)',   
                        'rgba(153, 102, 255, 0.4)',  
                        'rgba(255, 159, 64, 0.4)',
                    ],
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    function createPieChart(canvasId, label, chartData) {
        const ctx = document.getElementById(canvasId).getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: label,
                    data: chartData.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.4)',  
                        'rgba(54, 162, 235, 0.4)',   
                        'rgba(255, 206, 86, 0.4)',   
                        'rgba(75, 192, 192, 0.4)',   
                        'rgba(153, 102, 255, 0.4)', 
                    ],
                }],
            },
            options: {
                responsive: true,
            },
        });
    }

    function createDoughnutChart(canvasId, label, chartData) {
        const ctx = document.getElementById(canvasId).getContext("2d");
        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: label,
                    data: chartData.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.4)',   
                        'rgba(54, 162, 235, 0.4)',   
                    ],
                }],
            },
            options: {
                responsive: true,
            },
        });
    }

    function createPolarAreaChart(canvasId, label, chartData) {
        const ctx = document.getElementById(canvasId).getContext("2d");
        new Chart(ctx, {
            type: "polarArea",
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: label,
                    data: chartData.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.4)',   
                        'rgba(54, 162, 235, 0.4)',
                        'rgba(255, 206, 86, 0.4)',   
                        'rgba(75, 192, 192, 0.4)',   
                        'rgba(153, 102, 255, 0.4)',  
                    ],
                }],
            },
            options: {
                responsive: true,
            },
        });
    }
});
