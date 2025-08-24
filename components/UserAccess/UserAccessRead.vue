<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ລະບົບຕິດຕາມການເຂົ້າໃຊ້ງານ</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 10px;
        }

        .header p {
            color: #7f8c8d;
            font-size: 1.1rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border-left: 5px solid;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .stat-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.active-users { border-left-color: #28a745; }
        .stat-card.total-sessions { border-left-color: #007bff; }
        .stat-card.unique-users { border-left-color: #6f42c1; }
        .stat-card.avg-session { border-left-color: #fd7e14; }

        .stat-number {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stat-label {
            color: #6c757d;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
        }

        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0,0,0,0.05);
        }

        .chart-title {
            font-size: 1.4rem;
            color: #2c3e50;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
        }

        .chart-wrapper {
            position: relative;
            height: 350px;
        }

        .table-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .table-title {
            font-size: 1.4rem;
            color: #2c3e50;
            margin-bottom: 25px;
            font-weight: 600;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .data-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            border: none;
        }

        .data-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: middle;
        }

        .data-table tr:hover {
            background-color: #f8f9fa;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-success {
            background: #d4edda;
            color: #155724;
        }

        .status-warning {
            background: #fff3cd;
            color: #856404;
        }

        .status-danger {
            background: #f8d7da;
            color: #721c24;
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 1.2rem;
            color: #7f8c8d;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-right: 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(231, 76, 60, 0.3);
        }

        .auth-form {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            margin: 100px auto;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }

        .form-input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e9ecef;
        }

        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .dashboard-container {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- Authentication Form -->
        <div v-if="!isAuthenticated" class="auth-form">
            <h2 style="text-align: center; margin-bottom: 30px; color: #2c3e50;">ເຂົ້າສູ່ລະບົບ</h2>
            <form @submit.prevent="authenticate">
                <div class="form-group">
                    <label class="form-label">Bearer Token:</label>
                    <input 
                        type="text" 
                        class="form-input" 
                        v-model="bearerToken" 
                        placeholder="ໃສ່ Bearer Token ຂອງທ່ານ"
                        required
                    >
                </div>
                <button type="submit" class="btn" :disabled="loading">
                    {{ loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ' }}
                </button>
            </form>
        </div>

        <!-- Main Dashboard -->
        <div v-else class="dashboard-container">
            <div class="header">
                <h1>ລະບົບຕິດຕາມການເຂົ້າໃຊ້ງານ</h1>
                <p>ການວິເຄາະແລະຕິດຕາມການເຂົ້າໃຊ້ງານຂອງຜູ້ໃຊ້ລະບົບ</p>
                <button @click="logout" style="position: absolute; top: 20px; right: 20px;" class="btn">ອອກຈາກລະບົບ</button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                ກຳລັງໂຫຼດຂໍ້ມູນ...
            </div>

            <!-- Error State -->
            <div v-if="error" class="error">
                <h3>ເກີດຂໍ້ຜິດພາດ</h3>
                <p>{{ error }}</p>
                <button @click="fetchData" class="btn" style="margin-top: 15px; width: auto;">ລອງໃໝ່</button>
            </div>

            <!-- Dashboard Content -->
            <div v-if="!loading && !error">
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card active-users">
                        <div class="stat-number">{{ stats.activeUsers }}</div>
                        <div class="stat-label">ຜູ້ໃຊ້ທີ່ກຳລັງເຂົ້າໃຊ້ງານ</div>
                    </div>
                    <div class="stat-card total-sessions">
                        <div class="stat-number">{{ stats.totalSessions }}</div>
                        <div class="stat-label">ການເຂົ້າໃຊ້ງານທັງໝົດ</div>
                    </div>
                    <div class="stat-card unique-users">
                        <div class="stat-number">{{ stats.uniqueUsers }}</div>
                        <div class="stat-label">ຜູ້ໃຊ້ທີ່ແຕກຕ່າງ</div>
                    </div>
                    <div class="stat-card avg-session">
                        <div class="stat-number">{{ stats.avgSessionTime }}</div>
                        <div class="stat-label">ເວລາເຂົ້າໃຊ້ງານສະເລ່ຍ (ຊົ່ວໂມງ)</div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-title">ການແຈກຢາຍຕາມພະແນກ</div>
                        <div class="chart-wrapper">
                            <canvas ref="divisionChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">ການແຈກຢາຍຕາມບົດບາດ</div>
                        <div class="chart-wrapper">
                            <canvas ref="roleChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="chart-container" style="margin-bottom: 40px;">
                    <div class="chart-title">ການເຂົ້າໃຊ້ງານຕາມເວລາ (24 ຊົ່ວໂມງທີ່ຜ່ານມາ)</div>
                    <div class="chart-wrapper">
                        <canvas ref="timeChart"></canvas>
                    </div>
                </div>

                <!-- Recent Activity Table -->
                <div class="table-container">
                    <div class="table-title">ກິດຈະກຳລ້າສຸດ</div>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ຮູບໂປຣໄຟລ໌</th>
                                    <th>ຊື່ຜູ້ໃຊ້</th>
                                    <th>ພະແນກ</th>
                                    <th>ບົດບາດ</th>
                                    <th>ເວລາເຂົ້າສູ່ລະບົບ</th>
                                    <th>IP Address</th>
                                    <th>ສະຖານະ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="log in recentLogs" :key="log.log_id">
                                    <td>
                                        <img :src="log.user.profile_picture" :alt="log.user.user_name" class="user-avatar">
                                    </td>
                                    <td>
                                        <strong>{{ log.user.user_name }}</strong><br>
                                        <small>{{ log.user.user_email }}</small>
                                    </td>
                                    <td>{{ log.user.division.division_name_la }}</td>
                                    <td>{{ log.user.role.role_name_la }}</td>
                                    <td>{{ formatDateTime(log.login_datetime) }}</td>
                                    <td>{{ log.ip_address }}</td>
                                    <td>
                                        <span :class="getStatusClass(log.login_status)">
                                            {{ getStatusText(log.login_status) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const { createApp, ref, onMounted, nextTick } = Vue;

        createApp({
            setup() {
                const isAuthenticated = ref(false);
                const bearerToken = ref('');
                const loading = ref(false);
                const error = ref('');
                const accessLogs = ref([]);
                const stats = ref({
                    activeUsers: 0,
                    totalSessions: 0,
                    uniqueUsers: 0,
                    avgSessionTime: 0
                });
                const recentLogs = ref([]);

                // Chart references
                const divisionChart = ref(null);
                const roleChart = ref(null);
                const timeChart = ref(null);

                // Chart instances
                let divisionChartInstance = null;
                let roleChartInstance = null;
                let timeChartInstance = null;

                const colors = [
                    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
                    '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63'
                ];

                const authenticate = async () => {
                    if (!bearerToken.value.trim()) {
                        error.value = 'ກະລຸນາໃສ່ Bearer Token';
                        return;
                    }
                    
                    loading.value = true;
                    error.value = '';
                    
                    try {
                        const response = await fetch('http://127.0.0.1:8000/api/user-access-logs/', {
                            headers: {
                                'Authorization': `Bearer ${bearerToken.value}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        isAuthenticated.value = true;
                        await fetchData();
                    } catch (err) {
                        error.value = `ການເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ: ${err.message}`;
                    } finally {
                        loading.value = false;
                    }
                };

                const logout = () => {
                    isAuthenticated.value = false;
                    bearerToken.value = '';
                    accessLogs.value = [];
                    error.value = '';
                    
                    // Destroy chart instances
                    if (divisionChartInstance) divisionChartInstance.destroy();
                    if (roleChartInstance) roleChartInstance.destroy();
                    if (timeChartInstance) timeChartInstance.destroy();
                };

                const fetchData = async () => {
                    loading.value = true;
                    error.value = '';
                    
                    try {
                        const response = await fetch('http://127.0.0.1:8000/api/user-access-logs/', {
                            headers: {
                                'Authorization': `Bearer ${bearerToken.value}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        const data = await response.json();
                        accessLogs.value = data;
                        processData(data);
                        
                        await nextTick();
                        createCharts();
                    } catch (err) {
                        error.value = `ການໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: ${err.message}`;
                    } finally {
                        loading.value = false;
                    }
                };

                const processData = (logs) => {
                    // Calculate statistics
                    const activeUsers = logs.filter(log => !log.logout_datetime).length;
                    const totalSessions = logs.length;
                    const uniqueUsers = new Set(logs.map(log => log.user_id)).size;
                    
                    // Calculate average session time
                    const completedSessions = logs.filter(log => log.logout_datetime);
                    let totalSessionTime = 0;
                    completedSessions.forEach(log => {
                        const loginTime = new Date(log.login_datetime);
                        const logoutTime = new Date(log.logout_datetime);
                        totalSessionTime += (logoutTime - loginTime) / (1000 * 60 * 60); // hours
                    });
                    const avgSessionTime = completedSessions.length > 0 ? 
                        (totalSessionTime / completedSessions.length).toFixed(1) : 0;

                    stats.value = {
                        activeUsers,
                        totalSessions,
                        uniqueUsers,
                        avgSessionTime
                    };

                    // Get recent logs (latest 10)
                    recentLogs.value = logs
                        .sort((a, b) => new Date(b.login_datetime) - new Date(a.login_datetime))
                        .slice(0, 10);
                };

                const createCharts = () => {
                    createDivisionChart();
                    createRoleChart();
                    createTimeChart();
                };

                const createDivisionChart = () => {
                    if (divisionChartInstance) divisionChartInstance.destroy();
                    
                    const divisionData = {};
                    accessLogs.value.forEach(log => {
                        const division = log.user.division.division_name_la;
                        divisionData[division] = (divisionData[division] || 0) + 1;
                    });

                    const ctx = divisionChart.value.getContext('2d');
                    divisionChartInstance = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(divisionData),
                            datasets: [{
                                data: Object.values(divisionData),
                                backgroundColor: colors.slice(0, Object.keys(divisionData).length),
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true
                                    }
                                }
                            }
                        }
                    });
                };

                const createRoleChart = () => {
                    if (roleChartInstance) roleChartInstance.destroy();
                    
                    const roleData = {};
                    accessLogs.value.forEach(log => {
                        const role = log.user.role.role_name_la;
                        roleData[role] = (roleData[role] || 0) + 1;
                    });

                    const ctx = roleChart.value.getContext('2d');
                    roleChartInstance = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: Object.keys(roleData),
                            datasets: [{
                                data: Object.values(roleData),
                                backgroundColor: colors.slice(0, Object.keys(roleData).length),
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true
                                    }
                                }
                            }
                        }
                    });
                };

                const createTimeChart = () => {
                    if (timeChartInstance) timeChartInstance.destroy();
                    
                    // Create hourly data for last 24 hours
                    const hourlyData = Array(24).fill(0);
                    const now = new Date();
                    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                    accessLogs.value.forEach(log => {
                        const loginTime = new Date(log.login_datetime);
                        if (loginTime >= last24Hours) {
                            const hour = loginTime.getHours();
                            hourlyData[hour]++;
                        }
                    });

                    const labels = Array.from({length: 24}, (_, i) => `${i}:00`);

                    const ctx = timeChart.value.getContext('2d');
                    timeChartInstance = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'ການເຂົ້າໃຊ້ງານ',
                                data: hourlyData,
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                };

                const formatDateTime = (dateString) => {
                    const date = new Date(dateString);
                    return date.toLocaleString('la-LA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                };

                const getStatusClass = (status) => {
                    const baseClass = 'status-badge ';
                    switch (status) {
                        case 'S': return baseClass + 'status-success';
                        case 'F': return baseClass + 'status-danger';
                        default: return baseClass + 'status-warning';
                    }
                };

                const getStatusText = (status) => {
                    switch (status) {
                        case 'S': return 'ສຳເລັດ';
                        case 'F': return 'ບໍ່ສຳເລັດ';
                        default: return 'ບໍ່ຮູ້';
                    }
                };

                onMounted(() => {
                    // Auto-fill token for demo (remove in production)
                    // bearerToken.value = 'your-bearer-token-here';
                });

                return {
                    isAuthenticated,
                    bearerToken,
                    loading,
                    error,
                    stats,
                    recentLogs,
                    divisionChart,
                    roleChart,
                    timeChart,
                    authenticate,
                    logout,
                    fetchData,
                    formatDateTime,
                    getStatusClass,
                    getStatusText
                };
            }
        }).mount('#app');
    </script>
</body>
</html>