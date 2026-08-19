import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

let allTransactions = []; 

// =====================================
// CHUYỂN ĐỔI GIAO DIỆN LOGIN / REGISTER
// =====================================
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");

document.getElementById("showRegister").onclick = () => {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
    registerBox.style.display = "none";
    loginBox.style.display = "block";
};

// =====================================
// ĐĂNG KÝ
// =====================================
const regMsg = document.getElementById("regMsg");
document.getElementById("registerBtn").onclick = async () => {
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;
    
    if (pass !== passConfirm) {
        regMsg.className = "msg text-red";
        regMsg.innerText = "[ERROR] Mật khẩu xác nhận không khớp!";
        return;
    }

    regMsg.className = "msg text-muted";
    regMsg.innerText = "PROCESSING...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Đăng xuất để ép check mail

        regMsg.className = "msg text-cyan";
        regMsg.innerText = "[OK] Thành công! Vui lòng kiểm tra Email để kích hoạt.";
        
        document.getElementById("regEmail").value = "";
        document.getElementById("regPass").value = "";
        document.getElementById("regPassConfirm").value = "";
    } catch (error) { 
        regMsg.className = "msg text-red";
        regMsg.innerText = "[ERROR] " + error.message; 
    }
};

// =====================================
// ĐĂNG NHẬP
// =====================================
const loginMsg = document.getElementById("loginMsg");
document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;
    
    loginMsg.className = "msg text-muted";
    loginMsg.innerText = "AUTHENTICATING...";

    try { 
        const userCredential = await signInWithEmailAndPassword(auth, email, pass); 
        
        if (!userCredential.user.emailVerified) {
            loginMsg.className = "msg text-red";
            loginMsg.innerText = "[DENIED] Tài khoản chưa xác minh Email!";
            await signOut(auth); 
            return;
        }
        loginMsg.innerText = "";
    } 
    catch (error) { 
        loginMsg.className = "msg text-red";
        loginMsg.innerText = "[DENIED] Sai Email hoặc Password!"; 
    }
};

// =====================================
// FIX LỖI LOGOUT
// =====================================
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.reload(); 
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
});

// =====================================
// KIỂM SOÁT PHIÊN LÀM VIỆC
// =====================================
let unsubTransactions = null;
onAuthStateChanged(auth, (user) => {
    loadingScreen.style.display = "none"; 
    
    if (user && user.emailVerified) {
        authSection.style.display = "none";
        appSection.style.display = "block";
        document.getElementById("userEmail").innerText = `User: ${user.email}`;
        loadTransactions(user.uid); 
    } else {
        authSection.style.display = "block";
        appSection.style.display = "none";
        if(unsubTransactions) unsubTransactions(); 
    }
});

// =====================================
// LƯU GIAO DỊCH 
// =====================================
document.getElementById("addTransBtn").onclick = async () => {
    if (!auth.currentUser) return;
    const type = document.getElementById("transType").value;
    const amount = Number(document.getElementById("transAmount").value);
    const category = document.getElementById("transCategory").value.toUpperCase();
    const note = document.getElementById("transNote").value;

    if (!amount || !category) return alert("[WARNING] Thiếu số liệu hoặc danh mục!");

    document.getElementById("addTransBtn").innerText = "PROCESSING...";
    try {
        await addDoc(collection(db, "transactions"), {
            userId: auth.currentUser.uid, 
            type: type, amount: amount, category: category, note: note,
            timestamp: serverTimestamp() 
        });
        document.getElementById("transAmount").value = "";
        document.getElementById("transCategory").value = "";
        document.getElementById("transNote").value = "";
    } catch (error) { console.error("Save error:", error); }
    
    document.getElementById("addTransBtn").innerHTML = `<i data-lucide="database"></i> SAVE_RECORD`;
    lucide.createIcons();
};

// =====================================
// FORMAT THỜI GIAN & ĐỒNG BỘ DỮ LIỆU
// =====================================
function formatDateTime(timestamp) {
    if (!timestamp) return "Đang đồng bộ...";
    const d = timestamp.toDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes} | ${day}/${month}/${year}`;
}

function loadTransactions(uid) {
    const q = query(collection(db, "transactions"), where("userId", "==", uid));
    unsubTransactions = onSnapshot(q, (snapshot) => {
        allTransactions = []; 
        let totalIncome = 0;
        let totalExpense = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            allTransactions.push({ id: doc.id, ...data });
            if (data.type === 'income') totalIncome += data.amount;
            else if (data.type === 'expense') totalExpense += data.amount;
        });

        allTransactions.sort((a, b) => {
            const tA = a.timestamp?.toMillis() || 0;
            const tB = b.timestamp?.toMillis() || 0;
            return tB - tA;
        });

        document.getElementById("totalIncome").innerText = totalIncome.toLocaleString('vi-VN') + " ₫";
        document.getElementById("totalExpense").innerText = totalExpense.toLocaleString('vi-VN') + " ₫";
        document.getElementById("totalBalance").innerText = (totalIncome - totalExpense).toLocaleString('vi-VN') + " ₫";
        renderHomeList();
    });
}

function renderHomeList() {
    const listEl = document.getElementById("transactionList");
    if (allTransactions.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color: var(--text-muted);">[ NO_RECORDS_FOUND ]</p>`;
        return;
    }
    let html = "";
    allTransactions.forEach(t => {
        const isIncome = t.type === 'income';
        const sign = isIncome ? "+" : "-";
        const colorClass = isIncome ? "text-cyan" : "text-red";
        const timeStr = formatDateTime(t.timestamp);
        
        html += `
        <div class="trans-item">
            <div class="trans-info">
                <strong>[${t.category}]</strong>
                <span>> ${t.note || 'No description'}</span>
                <div class="time-badge"><i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-bottom:2px;"></i> ${timeStr}</div>
            </div>
            <div class="amount ${colorClass}">
                ${sign} ${t.amount.toLocaleString('vi-VN')} ₫
            </div>
        </div>`;
    });
    listEl.innerHTML = html;
    lucide.createIcons({ root: listEl });
}