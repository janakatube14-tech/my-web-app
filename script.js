// Price List Data (වෙනසක් නෑ)
const priceList = [
    { type: "Ply Mount", size: "4x6", price: 950, cost: 275 },
    { type: "Ply Mount", size: "6x8", price: 1350, cost: 435 },
    { type: "Ply Mount", size: "8x10", price: 1850, cost: 620 },
    { type: "Ply Mount", size: "8x12", price: 1950, cost: 700 },
    { type: "Ply Mount", size: "10x12", price: 2350, cost: 860 },
    { type: "Ply Mount", size: "10x15", price: 2550, cost: 1000 },
    { type: "Ply Mount", size: "12x15", price: 2850, cost: 1140 },
    { type: "Ply Mount", size: "12x18", price: 2950, cost: 1270 },
    { type: "Ply Mount", size: "16x24", price: 5750, cost: 2850 },
    { type: "Ply Mount", size: "20x30", price: 8550, cost: 4300 },
    { type: "Glass Frame", size: "4x6", price: 2250, cost: 275 },
    { type: "Glass Frame", size: "6x8", price: 2450, cost: 435 },
    { type: "Glass Frame", size: "8x10", price: 2750, cost: 620 },
    { type: "Glass Frame", size: "8x12", price: 2950, cost: 700 },
    { type: "Glass Frame", size: "10x12", price: 3250, cost: 860 },
    { type: "Glass Frame", size: "10x15", price: 3450, cost: 1000 },
    { type: "Glass Frame", size: "12x15", price: 3950, cost: 1140 },
    { type: "Glass Frame", size: "12x18", price: 3950, cost: 1270 },
    { type: "Glass Frame", size: "16x24", price: 6750, cost: 2850 },
    { type: "Glass Frame", size: "20x30", price: 9150, cost: 4300 }
];

// --- Firebase Data Holders ---
// මේවායේ තමයි Firebase එකෙන් ගත්තු data තියාගන්නේ
let orders = [];
let expenses = [];
// -----------------------------

let frameSizeChart, paymentChart, districtChart, frameTypeChart, cityChart;

// ===== DOM and UI Functions (වෙනසක් නෑ) =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
});
sidebarOverlay.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 767) {
            menuToggle.classList.remove('active');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Theme Toggle (වෙනසක් නෑ)
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    updateChartTheme();
});


// ===== Firebase Data Loading Function =====
// මේක තමයි හැම වෙලාවෙම Online data අරන් එන function එක
async function loadAllData() {
    console.log("Loading data from Firebase...");
    try {
        // 1. Orders Load කිරීම
        const ordersSnapshot = await db.collection("orders").orderBy("date", "desc").get();
        // `doc.id` එක තමයි Firebase ID එක. ඒක order එකටම `id` විදිහට දාගන්නවා.
        orders = ordersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // 2. Expenses Load කිරීම
        const expensesSnapshot = await db.collection("expenses").orderBy("date", "desc").get();
        expenses = expensesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        console.log("Data loaded:", orders.length, "orders,", expenses.length, "expenses.");
        
        // Data ගත්තට පස්සේ Dashboard එක update කරනවා
        updateDashboard();
        // මුලින්ම 'dashboard' section එක පෙන්නනවා
        showSection('dashboard');
        
    } catch (e) {
        console.error("Error loading data: ", e);
        alert("❌ Data load වුනේ නෑ. Internet connection එකයි Firebase setup එකයි බලන්න.");
    }
}


// ===== Section Switching Function (වෙනසක් නෑ) =====
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('.nav-link[href="#' + sectionId + '"]').forEach(link => {
        link.classList.add('active');
    });
    
    // Data load වුනාට පස්සේ අදාල display function එක call කරනවා
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'analytics') {
        updateAnalytics();
    } else if (sectionId === 'need-deliver') {
        displayOrders('Need to Deliver', 'needDeliverList');
    } else if (sectionId === 'dispatched') {
        displayOrders('Dispatched', 'dispatchedList');
    } else if (sectionId === 'delivered') {
        displayOrders('Delivered', 'deliveredList');
    } else if (sectionId === 'refund') {
        displayOrders('Refund', 'refundList');
    } else if (sectionId === 'expenses') {
        displayExpenses();
    }
}

// ===== Add Order Form Logic (වෙනසක් නෑ) =====
function incrementQty() {
    const qtyInput = document.getElementById('quantity');
    qtyInput.value = parseInt(qtyInput.value) + 1;
    calculateTotal();
}
function decrementQty() {
    const qtyInput = document.getElementById('quantity');
    if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        calculateTotal();
    }
}
function calculateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const unitCost = parseFloat(document.getElementById('unitCost').value) || 0;
    
    document.getElementById('totalPrice').value = (unitPrice * quantity).toFixed(2);
    document.getElementById('totalCost').value = (unitCost * quantity).toFixed(2);
}
function toggleCustomPrice() {
    const orderType = document.getElementById('orderType').value;
    const standardSection = document.getElementById('standardFrameSection');
    const customSection = document.getElementById('customPriceSection');
    
    if (orderType === 'custom') {
        standardSection.style.display = 'none';
        customSection.style.display = 'block';
        document.getElementById('frameType').value = '';
        document.getElementById('frameSize').value = '';
    } else {
        standardSection.style.display = 'block';
        customSection.style.display = 'none';
        document.getElementById('customPrice').value = '';
        document.getElementById('customCost').value = '';
        document.getElementById('customFrameDesc').value = '';
    }
    updatePrice();
}
function updatePrice() {
    const orderType = document.getElementById('orderType').value;
    
    if (orderType === 'standard') {
        const frameType = document.getElementById('frameType').value;
        const frameSize = document.getElementById('frameSize').value;
        
        if (frameType && frameSize) {
            const item = priceList.find(p => p.type === frameType && p.size === frameSize);
            if (item) {
                document.getElementById('unitPrice').value = item.price;
                document.getElementById('unitCost').value = item.cost;
                calculateTotal();
            }
        } else {
            document.getElementById('unitPrice').value = '';
            document.getElementById('unitCost').value = '';
            document.getElementById('totalPrice').value = '';
            document.getElementById('totalCost').value = '';
        }
    } else {
        const customPrice = document.getElementById('customPrice').value;
        const customCost = document.getElementById('customCost').value;
        document.getElementById('unitPrice').value = customPrice;
        document.getElementById('unitCost').value = customCost;
        calculateTotal();
    }
}
document.getElementById('customPrice').addEventListener('input', updatePrice);
document.getElementById('customCost').addEventListener('input', updatePrice);


// ===== Order Form Submit (Firebase Save) =====
document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const unitCost = parseFloat(document.getElementById('unitCost').value);
    const orderType = document.getElementById('orderType').value;
    
    let frameType, frameSize;
    if (orderType === 'custom') {
        frameType = 'Custom';
        frameSize = document.getElementById('customFrameDesc').value || 'Custom Frame';
    } else {
        frameType = document.getElementById('frameType').value;
        frameSize = document.getElementById('frameSize').value;
    }
    
    const order = {
        orderNumber: document.getElementById('orderNumber').value,
        customerName: document.getElementById('customerName').value,
        phone: document.getElementById('phone').value,
        addressLine: document.getElementById('addressLine').value,
        city: document.getElementById('city').value,
        district: document.getElementById('district').value,
        orderNotes: document.getElementById('orderNotes').value,
        orderType: orderType,
        frameType: frameType,
        frameSize: frameSize,
        quantity: quantity,
        unitPrice: unitPrice,
        unitCost: unitCost,
        totalPrice: unitPrice * quantity,
        totalCost: unitCost * quantity,
        originalTotalCost: unitCost * quantity, // Refund ගණනයට
        date: document.getElementById('orderDate').value,
        status: document.getElementById('orderStatus').value,
        paymentMethod: document.getElementById('paymentMethod').value
    };
    
    // --- localStorage වෙනුවට Firebase ---
    db.collection("orders").add(order)
        .then((docRef) => {
            console.log("Order added with ID: ", docRef.id);
            alert('✅ Order එක Online පොතට (Firebase) දැම්මා!');
            // Page එක reload කරලා අලුත් data load කරනවා
            location.reload(); 
        })
        .catch((error) => {
            console.error("Error adding order: ", error);
            alert("❌ Order එක add කරන්න බැරි වුනා! (Console එක බලන්න)");
        });
    // ------------------------------------
});


// ===== Display Orders (Firebase Data) =====
function displayOrders(status, containerId) {
    const container = document.getElementById(containerId);
    // global `orders` array එකෙන් filter කරනවා
    const filteredOrders = orders.filter(order => order.status === status);
    
    container.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No orders found</p>';
        document.getElementById(containerId.replace('List', 'Cost')).textContent = '0.00';
        document.getElementById(containerId.replace('List', 'Profit')).textContent = '0.00';
        return;
    }
    
    let totalCost = 0;
    let totalProfit = 0;
    
    filteredOrders.forEach(order => {
        // Refund වලට Loss ගණනය කරනවා
        let profit;
        if (status === 'Refund') {
            profit = -(order.originalTotalCost);
            totalCost += order.originalTotalCost;
            totalProfit += profit;
        } else {
            profit = order.totalPrice - order.totalCost;
            totalCost += order.totalCost;
            totalProfit += profit;
        }
        
        const orderCard = document.createElement('div');
        orderCard.className = status === 'Refund' ? 'order-card refund-card' : 'order-card';
        
        // order.id යනු Firebase ID එකයි
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-number">#${order.orderNumber}</span>
                <span class="detail-value">${order.date}</span>
            </div>
            <div class="order-details">
                <div class="detail-item"><span class="detail-label">Customer:</span> <span class="detail-value">${order.customerName}</span></div>
                <div class="detail-item"><span class="detail-label">Phone:</span> <span class="detail-value">${order.phone}</span></div>
                <div class="detail-item"><span class="detail-label">Address:</span> <span class="detail-value">${order.addressLine}</span></div>
                <div class="detail-item"><span class="detail-label">City:</span> <span class="detail-value">${order.city}</span></div>
                <div class="detail-item"><span class="detail-label">District:</span> <span class="detail-value">${order.district}</span></div>
                <div class="detail-item"><span class="detail-label">Frame:</span> <span class="detail-value">${order.frameType} - ${order.frameSize}</span></div>
                <div class="detail-item"><span class="detail-label">Quantity:</span> <span class="detail-value">${order.quantity}</span></div>
                <div class="detail-item"><span class="detail-label">Total Price:</span> <span class="detail-value">Rs. ${order.totalPrice.toFixed(2)}</span></div>
                <div class="detail-item"><span class="detail-label">Total Cost:</span> <span class="detail-value">Rs. ${order.totalCost.toFixed(2)}</span></div>
                <div class="detail-item"><span class="detail-label">${status === 'Refund' ? 'Loss:' : 'Profit:'}</span> <span class="detail-value ${status === 'Refund' ? 'loss-indicator' : ''}">Rs. ${profit.toFixed(2)}</span></div>
                <div class="detail-item"><span class="detail-label">Payment:</span> <span class="detail-value">${order.paymentMethod}</span></div>
            </div>
            ${order.orderNotes ? `<p style="margin-top: 10px;"><strong>Notes:</strong> ${order.orderNotes}</p>` : ''}
            <div class="order-actions">
                ${status === 'Need to Deliver' ? `
                    <button class="btn-small btn-warning" onclick="changeStatus('${order.id}', 'Dispatched')">Mark as Dispatched</button>
                    <button class="btn-small btn-success" onclick="changeStatus('${order.id}', 'Delivered')">Mark as Delivered</button>
                    <button class="btn-small btn-danger" onclick="changeStatus('${order.id}', 'Refund')">Refund</button>
                ` : ''}
                ${status === 'Dispatched' ? `
                    <button class="btn-small btn-success" onclick="changeStatus('${order.id}', 'Delivered')">Mark as Delivered</button>
                    <button class="btn-small btn-danger" onclick="changeStatus('${order.id}', 'Refund')">Refund</button>
                ` : ''}
                <button class="btn-small btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
        `;
        container.appendChild(orderCard);
    });
    
    document.getElementById(containerId.replace('List', 'Cost')).textContent = totalCost.toFixed(2);
    // Refund section එකට Loss එක පෙන්නන්න (ධන අගයක් ලෙස)
    document.getElementById(containerId.replace('List', 'Profit')).textContent = status === 'Refund' ? Math.abs(totalProfit).toFixed(2) : totalProfit.toFixed(2);
}


// ===== Order Status Change (Firebase Update) =====
function changeStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        if (newStatus === 'Refund') {
            const confirmRefund = confirm(`⚠️ ඔබ මේ order එක Refund කරන්න sure ද? මෙයින් Rs. ${order.originalTotalCost.toFixed(2)} ක Loss එකක් සිදුවේ.`);
            if (!confirmRefund) {
                return;
            }
            // Refund එකකදී cost එක 0 කළ යුතුය, නමුත් අපි originalTotalCost එක වෙනම තියාගන්නවා
        }
        
        console.log(`Updating order ${orderId} to status ${newStatus}`);
        
        // --- Firebase Update ---
        db.collection("orders").doc(orderId).update({
            status: newStatus
        })
        .then(() => {
            console.log("Status updated!");
            location.reload(); // Page එක reload කරලා අලුත් data ගන්නවා
        })
        .catch((error) => {
            console.error("Error updating status: ", error);
            alert("❌ Status update කරන්න බැරි වුනා! (Console එක බලන්න)");
        });
        // -----------------------
    }
}


// ===== Delete Order (Firebase Delete) =====
function deleteOrder(orderId) {
    if (confirm('⚠️ මේ order එක delete කරන්න sure ද? මෙය ආපසු ගත නොහැක!')) {
        console.log(`Deleting order ${orderId}`);
        
        // --- Firebase Delete ---
        db.collection("orders").doc(orderId).delete()
        .then(() => {
            console.log("Order deleted!");
            location.reload(); // Page එක reload කරලා අලුත් data ගන්නවා
        })
        .catch((error) => {
            console.error("Error deleting order: ", error);
            alert("❌ Order එක delete කරන්න බැරි වුනා! (Console එක බලන්න)");
        });
        // -----------------------
    }
}


// ===== Expense Form Submit (Firebase Save) =====
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const expense = {
        name: document.getElementById('expenseName').value,
        cost: parseFloat(document.getElementById('expenseCost').value),
        date: document.getElementById('expenseDate').value
    };
    
    // --- Firebase Save ---
    db.collection("expenses").add(expense)
        .then((docRef) => {
            console.log("Expense added with ID: ", docRef.id);
            alert('✅ Expense එක Online පොතට (Firebase) දැම්මා!');
            location.reload(); 
        })
        .catch((error) => {
            console.error("Error adding expense: ", error);
            alert("❌ Expense එක add කරන්න බැරි වුනා! (Console එක බලන්න)");
        });
    // ---------------------
});


// ===== Display Expenses (Firebase Data) =====
function displayExpenses() {
    const container = document.getElementById('expenseList');
    container.innerHTML = '';
    
    if (expenses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No expenses recorded</p>';
        return;
    }
    
    expenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        // expense.id යනු Firebase ID එකයි
        expenseItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-name">${expense.name}</div>
                <div class="expense-date">${expense.date}</div>
            </div>
            <div class="expense-cost">Rs. ${expense.cost.toFixed(2)}</div>
            <button class="btn-small btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
        `;
        container.appendChild(expenseItem);
    });
}


// ===== Delete Expense (Firebase Delete) =====
function deleteExpense(expenseId) {
    if (confirm('⚠️ මේ වියදම delete කරන්න sure ද?')) {
        console.log(`Deleting expense ${expenseId}`);
        
        // --- Firebase Delete ---
        db.collection("expenses").doc(expenseId).delete()
        .then(() => {
            console.log("Expense deleted!");
            location.reload(); 
        })
        .catch((error) => {
            console.error("Error deleting expense: ", error);
            alert("❌ Expense එක delete කරන්න බැරි වුනා! (Console එක බලන්න)");
        });
        // -----------------------
    }
}

// ===== Dashboard Functions (Firebase Data වලින් වැඩ) =====
function updateDashboard() {
    const totalOrders = orders.length;
    const totalRevenue = orders.filter(o => o.status !== 'Refund').reduce((sum, order) => sum + order.totalPrice, 0);
    const totalFrameCost = orders.reduce((sum, order) => sum + order.originalTotalCost, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.cost, 0);
    
    let calculatedProfit = 0;
    orders.forEach(order => {
        if (order.status === 'Refund') {
            calculatedProfit -= order.originalTotalCost;
        } else {
            calculatedProfit += (order.totalPrice - order.totalCost);
        }
    });
    
    const netProfit = calculatedProfit - totalExpenses;
    const pendingOrders = orders.filter(o => o.status === 'Need to Deliver').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toFixed(2)}`;
    document.getElementById('totalFrameCost').textContent = `Rs. ${totalFrameCost.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `Rs. ${totalExpenses.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `Rs. ${netProfit.toFixed(2)}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

function clearMonthFilter() {
    document.getElementById('monthFilter').value = '';
    updateDashboard(); 
}

function filterByMonth() {
    const selectedMonth = document.getElementById('monthFilter').value;
    if (!selectedMonth) {
        updateDashboard();
        return;
    }
    
    const filteredOrders = orders.filter(order => order.date.startsWith(selectedMonth));
    const filteredExpenses = expenses.filter(expense => expense.date.startsWith(selectedMonth));
    
    // ... (Dashboard update logic for filtered data - වෙනසක් නෑ)
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.filter(o => o.status !== 'Refund').reduce((sum, order) => sum + order.totalPrice, 0);
    const totalFrameCost = filteredOrders.reduce((sum, order) => sum + order.originalTotalCost, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.cost, 0);
    let calculatedProfit = 0;
    filteredOrders.forEach(order => {
        if (order.status === 'Refund') {
            calculatedProfit -= order.originalTotalCost;
        } else {
            calculatedProfit += (order.totalPrice - order.totalCost);
        }
    });
    const netProfit = calculatedProfit - totalExpenses;
    const pendingOrders = filteredOrders.filter(o => o.status === 'Need to Deliver').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toFixed(2)}`;
    document.getElementById('totalFrameCost').textContent = `Rs. ${totalFrameCost.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `Rs. ${totalExpenses.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `Rs. ${netProfit.toFixed(2)}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

// ===== Analytics Functions (වෙනසක් නෑ) =====
function updateAnalytics() {
    updateAnalyticsSummary();
    createFrameSizeChart();
    createPaymentChart();
    createDistrictChart();
    createFrameTypeChart();
    createCityChart();
}

function updateAnalyticsSummary() {
    const sizeStats = {};
    orders.forEach(order => {
        const size = order.frameSize;
        if (!sizeStats[size]) {
            sizeStats[size] = 0;
        }
        sizeStats[size] += order.quantity;
    });
    const sortedSizes = Object.entries(sizeStats).sort((a, b) => b[1] - a[1]);
    
    if (sortedSizes.length > 0) {
        document.getElementById('topSize').textContent = sortedSizes[0][0];
        document.getElementById('topSizeQty').textContent = `${sortedSizes[0][1]} orders`;
        document.getElementById('leastSize').textContent = sortedSizes[sortedSizes.length - 1][0];
        document.getElementById('leastSizeQty').textContent = `${sortedSizes[sortedSizes.length - 1][1]} orders`;
    } else {
        document.getElementById('topSize').textContent = 'N/A';
        document.getElementById('leastSize').textContent = 'N/A';
    }
    
    const districtStats = {};
    orders.forEach(order => {
        const district = order.district;
        if (!districtStats[district]) {
            districtStats[district] = 0;
        }
        districtStats[district]++;
    });
    const sortedDistricts = Object.entries(districtStats).sort((a, b) => b[1] - a[1]);
    if (sortedDistricts.length > 0) {
        document.getElementById('topDistrict').textContent = sortedDistricts[0][0];
        document.getElementById('topDistrictQty').textContent = `${sortedDistricts[0][1]} orders`;
    } else {
        document.getElementById('topDistrict').textContent = 'N/A';
    }
    
    const codOrders = orders.filter(o => o.paymentMethod === 'COD').length;
    const totalOrders = orders.length;
    const codPercentage = totalOrders > 0 ? ((codOrders / totalOrders) * 100).toFixed(1) : 0;
    document.getElementById('codPercentage').textContent = `${codPercentage}%`;
    document.getElementById('codCount').textContent = `${codOrders} orders`;
}

function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        textColor: isDark ? '#e2e8f0' : '#2d3748',
        gridColor: isDark ? '#4a5568' : '#e2e8f0',
        backgroundColor: [
            'rgba(52, 152, 219, 0.8)', 'rgba(46, 204, 113, 0.8)', 'rgba(155, 89, 182, 0.8)',
            'rgba(241, 196, 15, 0.8)', 'rgba(230, 126, 34, 0.8)', 'rgba(231, 76, 60, 0.8)',
            'rgba(149, 165, 166, 0.8)', 'rgba(52, 73, 94, 0.8)', 'rgba(26, 188, 156, 0.8)',
            'rgba(243, 156, 18, 0.8)'
        ],
        borderColor: [
            'rgba(52, 152, 219, 1)', 'rgba(46, 204, 113, 1)', 'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)', 'rgba(230, 126, 34, 1)', 'rgba(231, 76, 60, 1)',
            'rgba(149, 165, 166, 1)', 'rgba(52, 73, 94, 1)', 'rgba(26, 188, 156, 1)',
            'rgba(243, 156, 18, 1)'
        ]
    };
}
function createFrameSizeChart() {
    const ctx = document.getElementById('frameSizeChart').getContext('2d');
    if (frameSizeChart) frameSizeChart.destroy();
    const sizeStats = {};
    orders.forEach(order => {
        const size = order.frameSize;
        if (!sizeStats[size]) {
            sizeStats[size] = { quantity: 0, revenue: 0 };
        }
        sizeStats[size].quantity += order.quantity;
        sizeStats[size].revenue += order.totalPrice;
    });
    const labels = Object.keys(sizeStats).sort();
    const quantities = labels.map(label => sizeStats[label].quantity);
    const revenues = labels.map(label => sizeStats[label].revenue);
    const colors = getChartColors();
    frameSizeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Quantity Sold',
                    data: quantities,
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: colors.textColor },
                    grid: { color: colors.gridColor }
                },
                x: {
                    ticks: { color: colors.textColor },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: colors.textColor } }
            }
        }
    });
}
function createPaymentChart() {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    if (paymentChart) paymentChart.destroy();
    const paymentStats = { 'COD': 0, 'Bank Deposit': 0 };
    orders.forEach(order => { paymentStats[order.paymentMethod]++; });
    const labels = Object.keys(paymentStats);
    const data = Object.values(paymentStats);
    const colors = getChartColors();
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.backgroundColor.slice(0, 2),
                borderColor: colors.borderColor.slice(0, 2),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { color: colors.textColor } }
            }
        }
    });
}
function createDistrictChart() {
    const ctx = document.getElementById('districtChart').getContext('2d');
    if (districtChart) districtChart.destroy();
    const districtStats = {};
    orders.forEach(order => {
        const district = order.district;
        if (!districtStats[district]) districtStats[district] = 0;
        districtStats[district]++;
    });
    const sortedDistricts = Object.entries(districtStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sortedDistricts.map(d => d[0]);
    const data = sortedDistricts.map(d => d[1]);
    const colors = getChartColors();
    districtChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.backgroundColor.slice(2, 7),
                borderColor: colors.borderColor.slice(2, 7),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right', labels: { color: colors.textColor } }
            },
            scales: {
                r: {
                    ticks: { color: colors.textColor, backdropColor: 'transparent' },
                    grid: { color: colors.gridColor }
                }
            }
        }
    });
}
function createFrameTypeChart() {
    const ctx = document.getElementById('frameTypeChart').getContext('2d');
    if (frameTypeChart) frameTypeChart.destroy();
    const typeStats = {};
    orders.forEach(order => {
        const type = order.frameType;
        if (!typeStats[type]) typeStats[type] = 0;
        typeStats[type] += order.quantity;
    });
    const labels = Object.keys(typeStats);
    const data = Object.values(typeStats);
    const colors = getChartColors();
    frameTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.backgroundColor.slice(0, labels.length),
                borderColor: colors.borderColor.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right', labels: { color: colors.textColor } }
            }
        }
    });
}
function createCityChart() {
    const ctx = document.getElementById('cityChart').getContext('2d');
    if (cityChart) cityChart.destroy();
    const cityStats = {};
    orders.forEach(order => {
        const city = order.city;
        if (!cityStats[city]) cityStats[city] = 0;
        cityStats[city]++;
    });
    const sortedCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sortedCities.map(c => c[0]);
    const data = sortedCities.map(c => c[1]);
    const colors = getChartColors();
    cityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Order Count',
                    data: data,
                    backgroundColor: colors.backgroundColor.slice(5, 10),
                    borderColor: colors.borderColor.slice(5, 10),
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
                x: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }
            },
            plugins: {
                legend: { labels: { color: colors.textColor } }
            }
        }
    });
}
function updateChartTheme() {
    if (document.getElementById('analytics').classList.contains('active')) {
        updateAnalytics();
    }
}

// ===== LOGOUT FUNCTIONALITY (වෙනසක් නෑ) =====
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}
const logoutHTML = `
    <div style="padding: 15px 12px; border-top: 2px solid rgba(255, 255, 255, 0.1); margin-top: 20px;">
        <button onclick="logout()" style="
            width: 100%; padding: 12px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white; border: none; border-radius: 10px; cursor: pointer;
            font-size: 14px; font-weight: 600; transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 12px rgba(231, 76, 60, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 8px rgba(231, 76, 60, 0.3)';">
            🚪 Logout
        </button>
    </div>
`;
document.querySelector('.sidebar nav').insertAdjacentHTML('afterend', logoutHTML);

// ===== Initialization (Page Load) =====
document.addEventListener('DOMContentLoaded', () => {
    // Login check එක index.html එකේ උඩ තියෙන script එකෙන් කරලා තියෙන්නේ.
    // ඒක නිසා මේක load වෙන්නේ login වුනාට පස්සේ.

    // Dashboard එකට Loading දානවා
    document.getElementById('totalOrders').textContent = 'Loading...';
    document.getElementById('totalRevenue').textContent = 'Loading...';
    document.getElementById('netProfit').textContent = 'Loading...';

    // Firebase එකෙන් data load කරන function එක call කරනවා
    loadAllData();
});
