const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kirala",
});


db.connect((err) => {
    if (err) {
        console.error("Veritabanı bağlantısı başarısız:", err);
        process.exit(1); 
    } else {
        console.log("Veritabanı bağlantısı başarılı.");
    }
});


const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static('public'));


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM login WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            res.status(500).json({ success: false, message: 'Bir hata oluştu.' });
            return;
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
        }
    });
});


app.get("/data", async (req, res) => {
    const result = {};
    const { startDate, endDate } = req.query;

    try {
        
        let dateFilter = "";
        const params = [];

        
        if (startDate && endDate) {
            dateFilter = "WHERE kiralama.bas_tarih BETWEEN ? AND ? OR kiralama.bit_tarih BETWEEN ? AND ?";
            params.push(startDate, endDate, startDate, endDate); 
        } else if (startDate) {
            dateFilter = "WHERE kiralama.bas_tarih >= ? OR kiralama.bit_tarih >= ?";
            params.push(startDate, startDate); 
        } else if (endDate) {
            dateFilter = "WHERE kiralama.bit_tarih <= ?";
            params.push(endDate); 
        }

        
        const [
            subeCount,
            aracCount,
            merkezCount,
            mostRentedBayi,
            segmentData,
            yakitData,
            sanzimanData,
            subeData,
            kasaData,
            bolgeData
        ] = await Promise.all([
            runQuery(`SELECT COUNT(id) AS count FROM sube`),
            runQuery(`SELECT COUNT(id) AS count FROM sube_arac`),
            runQuery(`
                SELECT COUNT(DISTINCT sube_arac.sube_id) AS count
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                ${dateFilter}
            `, params),
            runQuery(`
                SELECT sube.sube_adi AS bayi_adi, COUNT(*) AS toplam
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN sube ON sube_arac.sube_id = sube.id
                ${dateFilter}
                GROUP BY sube.id
                ORDER BY toplam DESC
                LIMIT 1
            `, params),
            runQuery(`
                SELECT arac.segment AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN arac ON sube_arac.arac_id = arac.id
                ${dateFilter}
                GROUP BY arac.segment
            `, params),
            runQuery(`
                SELECT arac.yakit_tipi AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN arac ON sube_arac.arac_id = arac.id
                ${dateFilter}
                GROUP BY arac.yakit_tipi
            `, params),
            runQuery(`
                SELECT arac.vites AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN arac ON sube_arac.arac_id = arac.id
                ${dateFilter}
                GROUP BY arac.vites
            `, params),
            runQuery(`
                SELECT sube.sube_tur AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN sube ON sube_arac.sube_id = sube.id
                ${dateFilter}
                GROUP BY sube.sube_tur
            `, params),
            runQuery(`
                SELECT arac.kasa_tipi AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN arac ON sube_arac.arac_id = arac.id
                ${dateFilter}
                GROUP BY arac.kasa_tipi
            `, params),
            runQuery(`
                SELECT bolge.bolge_adi AS label, COUNT(*) AS value
                FROM kiralama
                JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
                JOIN sube ON sube_arac.sube_id = sube.id
                JOIN sehir ON sube.sehir_id = sehir.id
                JOIN bolge ON sehir.bolge_id = bolge.id
                ${dateFilter}
                GROUP BY bolge.bolge_adi
            `, params)
        ]);

        
        console.log("subeCount", subeCount);
        console.log("aracCount", aracCount);
        console.log("merkezCount", merkezCount);
        console.log("mostRentedBayi", mostRentedBayi);

        result.subeCount = subeCount[0]?.count || 0;
        result.aracCount = aracCount[0]?.count || 0;
        result.merkezCount = merkezCount[0]?.count || 0;
        result.mostRentedBayi = mostRentedBayi[0]?.bayi_adi || "Veri yok";
        result.segmentData = formatChartData(segmentData);
        result.yakitData = formatChartData(yakitData);
        result.sanzimanData = formatChartData(sanzimanData);
        result.subeData = formatChartData(subeData);
        result.kasaData = formatChartData(kasaData);
        result.bolgeData = formatChartData(bolgeData);

        res.json(result);

    } catch (err) {
        console.error("Veri alınamadı:", err);
        res.status(500).json({ error: "Veri alınamadı" });
    }
});


function formatChartData(rows) {
    return {
        labels: rows.map(row => row.label || "Tanımsız"),
        data: rows.map(row => row.value || 0),
    };
}


app.get("/branches", (req, res) => {
    const query = "SELECT id, sube_adi FROM sube";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Şube bilgileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Şubeler yüklenemedi." });
        }
        res.json(results);
    });
});


app.post("/filtered-data", (req, res) => {
    const { branchId, filters } = req.body;

    let filterQuery = "AND sube_arac.sube_id = ?";
    const filterParams = [branchId];

    
    if (filters) {
        if (filters.segment) {
            filterQuery += " AND arac.segment = ?";
            filterParams.push(filters.segment);
        }
        if (filters.kasa_tipi) {
            filterQuery += " AND arac.kasa_tipi = ?";
            filterParams.push(filters.kasa_tipi);
        }
        if (filters.vites) {
            filterQuery += " AND arac.vites = ?";
            filterParams.push(filters.vites);
        }
        if (filters.yakit_tipi) {
            filterQuery += " AND arac.yakit_tipi = ?";
            filterParams.push(filters.yakit_tipi);
        }
    }

    const queries = {
        totalVehicles: `
            SELECT COUNT(*) AS totalVehicles 
            FROM sube_arac 
            JOIN arac ON sube_arac.arac_id = arac.id
            WHERE 1=1 ${filterQuery}`,

        totalRentals: `
            SELECT   SUM(DATEDIFF(kiralama.bit_tarih, kiralama.bas_tarih)) AS totalRentals
            FROM kiralama 
            JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
            JOIN arac ON sube_arac.arac_id = arac.id
            WHERE 1=1 ${filterQuery}
        `,


        monthlyIncome: `
            SELECT COALESCE(SUM(toplam_ucret), 0) AS monthlyIncome 
            FROM kiralama 
            JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
            JOIN arac ON sube_arac.arac_id = arac.id
            WHERE 1=1 ${filterQuery}`,

        rentalTrends: `
            SELECT 
                MONTH(kiralama.bas_tarih) AS month, 
                COUNT(*) AS rentalCount 
            FROM kiralama 
            JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
            JOIN arac ON sube_arac.arac_id = arac.id
            WHERE 1=1 ${filterQuery}
            GROUP BY MONTH(kiralama.bas_tarih)
            ORDER BY MONTH(kiralama.bas_tarih)`
    };
    


    
    
    
app.post("/filtered-vehicle-data", (req, res) => {
    const { branchId } = req.body;

    
    const query = `
        SELECT arac.marka, arac.model, arac.segment, arac.vites, arac.kasa_tipi, arac.yakit_tipi
        FROM sube_arac
        JOIN arac ON sube_arac.arac_id = arac.id
        WHERE sube_arac.sube_id = ?
    `;

    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error("Araç bilgileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Araçlar yüklenemedi." });
        }

        
        res.json({ vehicles: results });
    });
});
    
  
    
    Promise.all([
        runQuery(queries.totalVehicles, filterParams),
        runQuery(queries.totalRentals, filterParams),
        runQuery(queries.monthlyIncome, filterParams),
        runQuery(queries.rentalTrends, filterParams),
    ])
        .then(([totalVehicles, totalRentals, monthlyIncome, rentalTrends]) => {
            const rentalTrendsData = {
                labels: rentalTrends.map((row) => `Ay ${row.month}`),
                datasets: [
                    {
                        label: "Aylık Kiralama Sayısı",
                        data: rentalTrends.map((row) => row.rentalCount),
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderWidth: 2,
                        fill: true,
                    },
                ],
            };

            res.json({
                totalVehicles: totalVehicles[0].totalVehicles,
                totalRentals: totalRentals[0].totalRentals,
                monthlyIncome: monthlyIncome[0].monthlyIncome,
                rentalTrends: rentalTrendsData,
            });
        })
        .catch((err) => {
            console.error("Veriler çekilirken hata oluştu:", err);
            res.status(500).json({ error: "Veriler yüklenemedi." });
        });
});


app.post("/segment-data", (req, res) => {
    const { branchId, startDate, endDate } = req.body;
    let dateFilter = "";
    const params = [branchId];

    if (startDate && endDate) {
        dateFilter = "AND kiralama.bas_tarih BETWEEN ? AND ? OR kiralama.bit_tarih BETWEEN ? AND ?";
        params.push(startDate, endDate, startDate, endDate);
    } else if (startDate) {
        dateFilter = "AND kiralama.bas_tarih >= ? OR kiralama.bit_tarih >= ?";
        params.push(startDate, startDate);
    } else if (endDate) {
        dateFilter = "AND kiralama.bit_tarih <= ?";
        params.push(endDate);
    }

    const query = `
        SELECT arac.segment AS label, COUNT(*) AS value
        FROM kiralama
        JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
        JOIN arac ON sube_arac.arac_id = arac.id
        WHERE sube_arac.sube_id = ?
        ${dateFilter}
        GROUP BY arac.segment
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Segment verileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Segment verileri yüklenemedi." });
        }
        res.json(results);
    });
});


app.post("/fuel-data", (req, res) => {
    const { branchId, startDate, endDate } = req.body;
    let dateFilter = "";
    const params = [branchId];

    if (startDate && endDate) {
        dateFilter = "AND kiralama.bas_tarih BETWEEN ? AND ? OR kiralama.bit_tarih BETWEEN ? AND ?";
        params.push(startDate, endDate, startDate, endDate);
    } else if (startDate) {
        dateFilter = "AND kiralama.bas_tarih >= ? OR kiralama.bit_tarih >= ?";
        params.push(startDate, startDate);
    } else if (endDate) {
        dateFilter = "AND kiralama.bit_tarih <= ?";
        params.push(endDate);
    }

    const query = `
        SELECT arac.yakit_tipi AS label, COUNT(*) AS value
        FROM kiralama
        JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
        JOIN arac ON sube_arac.arac_id = arac.id
        WHERE sube_arac.sube_id = ?
        ${dateFilter}
        GROUP BY arac.yakit_tipi
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Yakıt türü verileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Yakıt türü verileri yüklenemedi." });
        }
        res.json(results);
    });
});


app.post("/transmission-data", (req, res) => {
    const { branchId, startDate, endDate } = req.body;
    let dateFilter = "";
    const params = [branchId];

    if (startDate && endDate) {
        dateFilter = "AND kiralama.bas_tarih BETWEEN ? AND ? OR kiralama.bit_tarih BETWEEN ? AND ?";
        params.push(startDate, endDate, startDate, endDate);
    } else if (startDate) {
        dateFilter = "AND kiralama.bas_tarih >= ? OR kiralama.bit_tarih >= ?";
        params.push(startDate, startDate);
    } else if (endDate) {
        dateFilter = "AND kiralama.bit_tarih <= ?";
        params.push(endDate);
    }

    const query = `
        SELECT arac.vites AS label, COUNT(*) AS value
        FROM kiralama
        JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
        JOIN arac ON sube_arac.arac_id = arac.id
        WHERE sube_arac.sube_id = ?
        ${dateFilter}
        GROUP BY arac.vites
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Şanzıman türü verileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Şanzıman türü verileri yüklenemedi." });
        }
        res.json(results);
    });
});


app.post("/body-type-data", (req, res) => {
    const { branchId, startDate, endDate } = req.body;
    let dateFilter = "";
    const params = [branchId];

    if (startDate && endDate) {
        dateFilter = "AND kiralama.bas_tarih BETWEEN ? AND ? OR kiralama.bit_tarih BETWEEN ? AND ?";
        params.push(startDate, endDate, startDate, endDate);
    } else if (startDate) {
        dateFilter = "AND kiralama.bas_tarih >= ? OR kiralama.bit_tarih >= ?";
        params.push(startDate, startDate);
    } else if (endDate) {
        dateFilter = "AND kiralama.bit_tarih <= ?";
        params.push(endDate);
    }

    const query = `
        SELECT arac.kasa_tipi AS label, COUNT(*) AS value
        FROM kiralama
        JOIN sube_arac ON kiralama.sube_arac_id = sube_arac.id
        JOIN arac ON sube_arac.arac_id = arac.id
        WHERE sube_arac.sube_id = ?
        ${dateFilter}
        GROUP BY arac.kasa_tipi
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Kasa tipi verileri çekilirken hata oluştu:", err);
            return res.status(500).json({ error: "Kasa tipi verileri yüklenemedi." });
        }
        res.json(results);
    });
});



app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});









