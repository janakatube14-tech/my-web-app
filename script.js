// Price List Data
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

// Global variables
let orders = [];
let expenses = [];
let frameSizeChart, paymentChart, districtChart, frameTypeChart, cityChart;

// Wait for Firebase to be ready
window.addEventListener('load', function() {
    setTimeout(initializeApp, 500);
});

function initializeApp() {
    // Load data from Firebase
    loadOrdersFromFirebase();
    loadExpensesFromFirebase();
    
    // Initialize UI
    initializeUI();
}

// Load orders from Firebase with real-time listener
function loadOrdersFromFirebase() {
    const ordersRef = window.firebaseRef(window.database, 'orders');
    window.firebaseOnValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            orders = Object.keys(data).map(key => ({
                firebaseId: key,
                ...data[key]
            }));
        } else {
            orders = [];
        }
        updateDashboard();
        updateAllOrderDisplays();
    });
}

// Load expenses from Firebase with real-time listener
function loadExpensesFromFirebase() {
    const expensesRef = window.firebaseRef(window.database, 'expenses');
    window.firebaseOnValue(expensesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            expenses = Object.keys(data).map(key => ({
                firebaseId: key,
                ...data[key]
            }));
        } else {
            expenses = [];
        }
        displayExpenses();
    });
}

// Save order to Firebase
function saveOrderToFirebase(order) {
    const ordersRef = window.firebaseRef(window.database, 'orders');
    const newOrderRef = window.firebasePush(ordersRef);
    window.firebaseSet(newOrderRef, order);
}

// Update order in Firebase
function updateOrderInFirebase(firebaseId, updates) {
    const orderRef = window.firebaseRef(window.database, `orders/${firebaseId}`);
    window.firebaseUpdate(orderRef, updates);
}

// Delete order from Firebase
function deleteOrderFromFirebase(firebaseId) {
    const orderRef = window.firebaseRef(window.database, `orders/${firebaseId}`);
    window.firebaseRemove(orderRef);
}

// Save expense to Firebase
function saveExpenseToFirebase(expense) {
    const expensesRef = window.firebaseRef(window.database, 'expenses');
    const newExpenseRef = window.firebasePush(expensesRef);
    window.firebaseSet(newExpenseRef, expense);
}

// Delete expense from Firebase
function deleteExpenseFromFirebase(firebaseId) {
    const expenseRef = window.firebaseRef(window.database, `expenses/${firebaseId}`);
    window.firebaseRemove(expenseRef);
}

// Initialize UI elements
function initializeUI() {
    // Hamburger Menu
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

    // Theme Toggle
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

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                window.firebaseSignOut(window.auth).then(() => {
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error('Logout error:', error);
                });
            }
        });
    }

    // Order form event listeners
    document.getElementById('customPrice').addEventListener('input', updatePrice);
    document.getElementById('customCost').addEventListener('input', updatePrice);
    
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
            id: Date.now(),
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
            originalTotalCost: unitCost * quantity,
            date: document.getElementById('orderDate').value,
            status: document.getElementById('orderStatus').value,
            paymentMethod: document.getElementById('paymentMethod').value
        };

        saveOrderToFirebase(order);
        alert('✅ Order added successfully!');
        document.getElementById('orderForm').reset();
        document.getElementById('quantity').value = 1;
        updatePrice();
    });

    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const expense = {
            id: Date.now(),
            description: document.getElementById('expenseDesc').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value
        };

        saveExpenseToFirebase(expense);
        document.getElementById('expenseForm').reset();
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });

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

function updateAllOrderDisplays() {
    displayOrders('Need to Deliver', 'needDeliverList');
    displayOrders('Dispatched', 'dispatchedList');
    displayOrders('Delivered', 'deliveredList');
    displayOrders('Refund', 'refundList');
}

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

function displayOrders(status, containerId) {
    const container = document.getElementById(containerId);
    const filteredOrders = orders.filter(order => order.status === status);
    
    container.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<div class="no-data"><p>📦</p><p>No orders found</p></div>';
        document.getElementById(containerId.replace('List', 'Cost')).textContent = '0.00';
        document.getElementById(containerId.replace('List', 'Profit')).textContent = '0.00';
        return;
    }

    let totalCost = 0;
    let totalProfit = 0;

    filteredOrders.forEach(order => {
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
        
        orderCard.innerHTML = `
            <div class="order-header">
                <h3>#${order.orderNumber}</h3>
                <span class="order-date">${order.date}</span>
            </div>
            <div class="order-details">
                <p><strong>👤 Customer:</strong> ${order.customerName}</p>
                <p><strong>📞 Phone:</strong> ${order.phone}</p>
                <p><strong>📍 Address:</strong> ${order.addressLine}, ${order.city}, ${order.district}</p>
                ${order.orderNotes ? `<p><strong>📝 Notes:</strong> ${order.orderNotes}</p>` : ''}
                <p><strong>🖼️ Frame:</strong> ${order.frameType} - ${order.frameSize}</p>
                <p><strong>📦 Quantity:</strong> ${order.quantity}</p>
                <p><strong>💰 Total Price:</strong> Rs. ${order.totalPrice.toFixed(2)}</p>
                <p><strong>💵 Payment:</strong> ${order.paymentMethod}</p>
                ${status === 'Refund' ? `<p class="refund-loss"><strong>⚠️ Loss:</strong> Rs. ${Math.abs(profit).toFixed(2)}</p>` : `<p><strong>📈 Profit:</strong> Rs. ${profit.toFixed(2)}</p>`}
            </div>
            <div class="order-actions">
                ${status !== 'Delivered' && status !== 'Refund' ? `
                    <button class="btn-action" onclick="changeOrderStatus('${order.firebaseId}', '${getNextStatus(status)}')">
                        ${getNextStatus(status)}
                    </button>
                ` : ''}
                ${status !== 'Refund' ? `
                    <button class="btn-refund" onclick="refundOrder('${order.firebaseId}')">Refund</button>
                ` : ''}
                <button class="btn-delete" onclick="deleteOrder('${order.firebaseId}')">Delete</button>
            </div>
        `;
        
        container.appendChild(orderCard);
    });

    document.getElementById(containerId.replace('List', 'Cost')).textContent = totalCost.toFixed(2);
    document.getElementById(containerId.replace('List', 'Profit')).textContent = totalProfit.toFixed(2);
}

function getNextStatus(currentStatus) {
    if (currentStatus === 'Need to Deliver') return 'Dispatched';
    if (currentStatus === 'Dispatched') return 'Delivered';
    return currentStatus;
}

function changeOrderStatus(firebaseId, newStatus) {
    updateOrderInFirebase(firebaseId, { status: newStatus });
}

function refundOrder(firebaseId) {
    if (confirm('Are you sure you want to refund this order?')) {
        updateOrderInFirebase(firebaseId, { status: 'Refund' });
    }
}

function deleteOrder(firebaseId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        deleteOrderFromFirebase(firebaseId);
    }
}

function displayExpenses() {
    const container = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="no-data"><p>💰</p><p>No expenses recorded</p></div>';
        return;
    }

    container.innerHTML = '';
    expenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <div>
                <strong>${expense.description}</strong>
                <p>${expense.date}</p>
            </div>
            <div>
                <strong>Rs. ${expense.amount.toFixed(2)}</strong>
                <button class="btn-delete" onclick="deleteExpense('${expense.firebaseId}')">Delete</button>
            </div>
        `;
        container.appendChild(expenseItem);
    });
}

function deleteExpense(firebaseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        deleteExpenseFromFirebase(firebaseId);
    }
}

function updateDashboard() {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
        return order.status !== 'Refund' ? sum + order.totalPrice : sum;
    }, 0);
    
    const totalFrameCost = orders.reduce((sum, order) => {
        return order.status !== 'Refund' ? sum + order.totalCost : sum;
    }, 0);
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const refundLoss = orders.reduce((sum, order) => {
        return order.status === 'Refund' ? sum + order.originalTotalCost : sum;
    }, 0);
    
    const netProfit = totalRevenue - totalFrameCost - totalExpenses - refundLoss;
    
    const pendingOrders = orders.filter(order => 
        order.status === 'Need to Deliver' || order.status === 'Dispatched'
    ).length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    document.getElementById('totalFrameCost').textContent = totalFrameCost.toFixed(2);
    document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('netProfit').textContent = netProfit.toFixed(2);
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

function updateAnalytics() {
    updateFrameSizeChart();
    updatePaymentChart();
    updateDistrictChart();
    updateFrameTypeChart();
    updateCityChart();
    updateTopSellingStats();
}

function updateFrameSizeChart() {
    const frameSizes = {};
    orders.forEach(order => {
        if (order.status !== 'Refund') {
            frameSizes[order.frameSize] = (frameSizes[order.frameSize] || 0) + 1;
        }
    });

    const ctx = document.getElementById('frameSizeChart');
    if (!ctx) return;

    if (frameSizeChart) {
        frameSizeChart.destroy();
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    frameSizeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(frameSizes),
            datasets: [{
                label: 'Orders by Frame Size',
                data: Object.values(frameSizes),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333',
                        stepSize: 1
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

function updatePaymentChart() {
    const paymentMethods = {};
    orders.forEach(order => {
        if (order.status !== 'Refund') {
            paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
        }
    });

    const ctx = document.getElementById('paymentChart');
    if (!ctx) return;

    if (paymentChart) {
        paymentChart.destroy();
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                data: Object.values(paymentMethods),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

function updateDistrictChart() {
    const districts = {};
    orders.forEach(order => {
        if (order.status !== 'Refund') {
            districts[order.district] = (districts[order.district] || 0) + 1;
        }
    });

    const ctx = document.getElementById('districtChart');
    if (!ctx) return;

    if (districtChart) {
        districtChart.destroy();
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    districtChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(districts),
            datasets: [{
                label: 'Orders by District',
                data: Object.values(districts),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333',
                        stepSize: 1
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

function updateFrameTypeChart() {
    const frameTypes = {};
    orders.forEach(order => {
        if (order.status !== 'Refund') {
            frameTypes[order.frameType] = (frameTypes[order.frameType] || 0) + 1;
        }
    });

    const ctx = document.getElementById('frameTypeChart');
    if (!ctx) return;

    if (frameTypeChart) {
        frameTypeChart.destroy();
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    frameTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(frameTypes),
            datasets: [{
                data: Object.values(frameTypes),
                backgroundColor: [
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 99, 132, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

function updateCityChart() {
    const cities = {};
    orders.forEach(order => {
        if (order.status !== 'Refund') {
            cities[order.city] = (cities[order.city] || 0) + 1;
        }
    });

    const ctx = document.getElementById('cityChart');
    if (!ctx) return;

    if (cityChart) {
        cityChart.destroy();
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    cityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(cities),
            datasets: [{
                label: 'Orders by City',
                data: Object.values(cities),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333',
                        stepSize: 1
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333'
                    }
                }
            }
        }
    });
}

function updateTopSellingStats() {
    const frameSizes = {};
    const districts = {};
    let codCount = 0;
    let totalCount = 0;

    orders.forEach(order => {
        if (order.status !== 'Refund') {
            frameSizes[order.frameSize] = (frameSizes[order.frameSize] || 0) + 1;
            districts[order.district] = (districts[order.district] || 0) + 1;
            if (order.paymentMethod === 'COD') codCount++;
            totalCount++;
        }
    });

    const sortedSizes = Object.entries(frameSizes).sort((a, b) => b[1] - a[1]);
    const sortedDistricts = Object.entries(districts).sort((a, b) => b[1] - a[1]);
    
    const topSize = sortedSizes[0] || ['-', 0];
    const leastSize = sortedSizes[sortedSizes.length - 1] || ['-', 0];
    const topDistrict = sortedDistricts[0] || ['-', 0];
    const codPercentage = totalCount > 0 ? ((codCount / totalCount) * 100).toFixed(1) : 0;

    document.getElementById('topSize').textContent = topSize[0];
    document.getElementById('topSizeCount').textContent = `${topSize[1]} orders`;
    document.getElementById('leastSize').textContent = leastSize[0];
    document.getElementById('leastSizeCount').textContent = `${leastSize[1]} orders`;
    document.getElementById('topDistrict').textContent = topDistrict[0];
    document.getElementById('topDistrictCount').textContent = `${topDistrict[1]} orders`;
    document.getElementById('codPercentage').textContent = `${codPercentage}%`;
    document.getElementById('codCount').textContent = `${codCount} orders`;
}

function updateChartTheme() {
    updateAnalytics();
}

function exportToExcel() {
    alert('Export feature will be implemented soon!');
}
