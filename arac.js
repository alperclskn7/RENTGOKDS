document.addEventListener("DOMContentLoaded", () => {
    const subeSelect = document.getElementById("sube-select");
    const fetchButton = document.getElementById("fetch-araclar");
    const aracTableBody = document.querySelector("#arac-table tbody");

    
    fetch('/subeler')
        .then(response => response.json())
        .then(subeler => {
            subeler.forEach(sube => {
                const option = document.createElement("option");
                option.value = sube.id;
                option.textContent = sube.sube_adi;
                subeSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Şubeler yüklenirken hata oluştu:", err));

    function loadBranchVehicles(branchId) {
        fetch(`/araclar/${branchId}`)
            .then(response => response.json())
            .then(araclar => {
                aracTableBody.innerHTML = ""; 
                araclar.forEach(arac => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${arac.arac_id}</td>
                        <td>${arac.plaka}</td>
                        <td>${arac.marka}</td>
                        <td>${arac.model}</td>
                        <td>${arac.segment}</td>
                        <td>${arac.yil}</td>
                    `;
                    aracTableBody.appendChild(row);
                });
            })
            .catch(err => console.error("Araçlar yüklenirken hata oluştu:", err));
    }

   
    fetchButton.addEventListener("click", () => {
        const subeId = subeSelect.value;

        if (!subeId) {
            alert("Lütfen bir şube seçiniz!");
            return;
        }

        loadBranchVehicles(subeId);
    });
});
