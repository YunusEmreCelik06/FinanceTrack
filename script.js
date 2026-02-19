let rates = {};
let btcPrice = 65000; // API çökerse kullanılacak yedek Bitcoin fiyatı
let goldPrice = 2050; // API çökerse kullanılacak yedek Ons Altın fiyatı
let historyChart;

async function init() {
    try {
        // 1. DÖVİZ VERİLERİNİ ÇEK
        let forexRes = await fetch('https://open.er-api.com/v6/latest/USD');
        let forexData = await forexRes.json();
        rates = forexData.rates || {};

        // 2. KRİPTO VERİLERİNİ ÇEK (Çökerse siteyi bozmaması için ayrı try-catch içinde)
        try {
            let cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
            let cryptoData = await cryptoRes.json();
            if(cryptoData && cryptoData.bitcoin && cryptoData.bitcoin.usd) {
                btcPrice = cryptoData.bitcoin.usd;
            }
        } catch(err) {
            console.log("Kripto API limiti doldu, yedek fiyat kullanılıyor.");
        }

        rates["BTC"] = 1 / btcPrice;
        
        // Ücretsiz API bazen Altın (XAU) verisini göndermez, göndermezse yedeği devreye sok
        if(!rates["XAU"]) { rates["XAU"] = 1 / goldPrice; }

        let usdTry = rates.TRY || 31.50; 
        
        // --- KARTLARI GÜNCELLE ---
        document.getElementById('hero-usd').innerText = usdTry.toFixed(2) + " ₺";
        document.getElementById('hero-eur').innerText = "$" + (1 / (rates.EUR || 0.92)).toFixed(4);
        
        const onsPrice = 1 / rates.XAU;
        const gramPrice = (onsPrice / 31.1035) * usdTry;
        document.getElementById('hero-gold-ons').innerText = "$" + onsPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('hero-gold-gram').innerText = "Gram: " + gramPrice.toFixed(2) + " ₺";

        document.getElementById('hero-btc').innerText = "$" + btcPrice.toLocaleString();

        // --- LİSTE VE ÇEVİRİCİYİ ÇALIŞTIR ---
        renderTable();
        if(document.getElementById('from').children.length === 0) fillSelects();
        calculate();

    } catch (e) { 
        console.error("Ana Sistem Hatası:", e);
        // API tamamen gitse bile çökmeyi engellemek için listeyi ve çeviriciyi tetikle
        renderTable();
        if(document.getElementById('from').children.length === 0) fillSelects();
    }
}

function renderTable() {
    const list = document.getElementById('market-list');
    
    // Güvenli değer atamaları (API bozulursa NaN yazmasın diye)
    const eurUsd = rates.EUR ? (1/rates.EUR).toFixed(4) : "1.0800";
    const gbpUsd = rates.GBP ? (1/rates.GBP).toFixed(4) : "1.2600";
    const usdJpy = rates.JPY ? rates.JPY.toFixed(2) : "150.00";
    
    const pairs = [
        { s: "EUR/USD", v: eurUsd, sym: "$" },
        { s: "GBP/USD", v: gbpUsd, sym: "$" },
        { s: "USD/JPY", v: usdJpy, sym: "¥" },
        { s: "BTC/USD", v: btcPrice, sym: "$" }
    ];

    list.innerHTML = pairs.map(p => `
        <tr>
            <td><strong>${p.s}</strong></td>
            <td>${p.sym === '$' ? '$' : ''}${Number(p.v).toLocaleString()}${p.sym !== '$' ? ' ' + p.sym : ''}</td>
            <td><button class="view-btn" onclick="openHistory('${p.s}', ${parseFloat(p.v)})">View 5Y</button></td>
        </tr>
    `).join('');
}

function openHistory(title, currentPrice) {
    if(!currentPrice || isNaN(currentPrice)) currentPrice = 100; // Hata koruması
    
    document.getElementById('modalTitle').innerText = title + " - 5 Year Analysis";
    document.getElementById('chartModal').style.display = "block";
    
    const years = ["2022", "2023", "2024", "2025", "2026"];
    const simulatedData = [];
    let startPrice = currentPrice * 0.7;
    
    for(let i=0; i<5; i++) {
        simulatedData.push(startPrice + (Math.random() * (currentPrice * 0.05)));
        startPrice += (currentPrice - startPrice) / (5 - i);
    }

    const ctx = document.getElementById('historyChart').getContext('2d');
    if(historyChart) historyChart.destroy();
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Market Price',
                data: simulatedData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function closeModal() { document.getElementById('chartModal').style.display = "none"; }

function fillSelects() {
    const s1 = document.getElementById('from');
    const s2 = document.getElementById('to');
    
    if(!rates || Object.keys(rates).length === 0) return; // Veri yoksa bekle
    
    s1.innerHTML = ''; s2.innerHTML = '';
    
    Object.keys(rates).sort().forEach(code => {
        s1.add(new Option(code, code)); s2.add(new Option(code, code));
    });
    
    if(rates['USD']) s1.value = 'USD';
    if(rates['TRY']) s2.value = 'TRY';
}

function calculate() {
    const amt = document.getElementById('amt').value;
    const f = document.getElementById('from').value;
    const t = document.getElementById('to').value;
    
    if(rates[f] && rates[t]) {
        const res = (amt / rates[f]) * rates[t];
        document.getElementById('res-val').innerText = res.toLocaleString(undefined,{maximumFractionDigits:4});
    }
}

// Event Listeners
document.getElementById('amt').addEventListener('input', calculate);
document.getElementById('from').addEventListener('change', calculate);
document.getElementById('to').addEventListener('change', calculate);
window.onclick = (e) => { if(e.target == document.getElementById('chartModal')) closeModal(); }

// Sistemi Başlat
init();
// Her 60 saniyede bir güncelle
setInterval(init, 60000);