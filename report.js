import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBuRWYV5GsOJI_aGq3kZq8LsjmCjY_6avg",
    authDomain: "quocvi-finance-app.firebaseapp.com",
    projectId: "quocvi-finance-app",
    storageBucket: "quocvi-finance-app.firebasestorage.app",
    messagingSenderId: "898695592172",
    appId: "1:898695592172:web:b95889a44f8fdfe7fc0dc9",
    measurementId: "G-45WRKSR5CP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
lucide.createIcons();

const loadingScreen = document.getElementById("loading-screen");
const appSection = document.getElementById("app-section");

let allTransactions = [];
let myChart = null;

// =====================================
// BẢO VỆ TRANG BÁO CÁO (AUTH GUARD)
// =====================================
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        loadingScreen.style.display = "none";
        appSection.style.display = "block";
        document.getElementById("userEmail").innerText = `User: ${user.email}`;
        loadAllDataForReport(user.uid);
    } else {
        window.location.href = "index.html"; 
    }
});

// Fix lỗi Logout đẩy thẳng về trang chủ
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
});

// =====================================
// TẢI DỮ LIỆU VÀ LỌC
// =====================================
function loadAllDataForReport(uid) {
    const q = query(collection(db, "transactions"), where("userId", "==", uid));
    onSnapshot(q, (snapshot) => {
        allTransactions = [];
        snapshot.forEach((doc) => {
            allTransactions.push({ id: doc.id, ...doc.data() });
        });
        applyQuickFilter(); 
    });
}

document.getElementById("timeFilter").addEventListener("change", applyQuickFilter);

function applyQuickFilter() {
    const timeframe = document.getElementById("timeFilter").value;
    const now = new Date();
    
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    const filteredTrans = allTransactions.filter(t => {
        if (!t.timestamp) return false;
        const tDate = t.timestamp.toDate();
        
        if (timeframe === 'month') {
            return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        } else if (timeframe === 'year') {
            return tDate.getFullYear() === now.getFullYear();
        } else if (timeframe === 'week') {
            const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
            firstDayOfWeek.setHours(0,0,0,0);
            return tDate >= firstDayOfWeek;
        }
        return true; 
    });

    calculateAndRender(filteredTrans);
}

document.getElementById("customFilterBtn").onclick = () => {
    const startVal = document.getElementById("startDate").value;
    const endVal = document.getElementById("endDate").value;

    if (!startVal || !endVal) {
        alert("[WARNING] Yêu cầu nhập đầy đủ Từ Ngày và Đến Ngày!");
        return;
    }

    document.getElementById("timeFilter").value = "all";

    const startDate = new Date(startVal);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endVal);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert("[ERROR] Lỗi Logic: 'Từ ngày' không thể lớn hơn 'Đến ngày'!");
        return;
    }

    const filteredTrans = allTransactions.filter(t => {
        if (!t.timestamp) return false;
        const tDate = t.timestamp.toDate();
        return tDate >= startDate && tDate <= endDate;
    });

    calculateAndRender(filteredTrans);
};

// =====================================
// TÍNH TOÁN & VẼ BIỂU ĐỒ
// =====================================
function calculateAndRender(filteredTrans) {
    let fIncome = 0;
    let fExpense = 0;
    let expenseCategories = {}; 

    filteredTrans.forEach(t => {
        if (t.type === 'income') fIncome += t.amount;
        else if (t.type === 'expense') {
            fExpense += t.amount;
            if(expenseCategories[t.category]) expenseCategories[t.category] += t.amount;
            else expenseCategories[t.category] = t.amount;
        }
    });

    document.getElementById("repIncome").innerText = fIncome.toLocaleString('vi-VN') + " ₫";
    document.getElementById("repExpense").innerText = fExpense.toLocaleString('vi-VN') + " ₫";

    updateChart(expenseCategories);
}

function updateChart(expenseData) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const labels = Object.keys(expenseData);
    const dataValues = Object.values(expenseData);

    if (myChart) myChart.destroy();
    if (labels.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#00ffcc', '#ff003c', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'],
                borderColor: '#0c1627', borderWidth: 2, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#e2e8f0', font: { family: 'Consolas' } } } },
            cutout: '70%'
        }
    });
}