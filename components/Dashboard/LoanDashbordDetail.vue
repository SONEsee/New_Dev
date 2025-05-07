<template>
    <div class="dashboard-container">
     
      <div class="header-section">
        <h1>ລະບົບຕິດຕາມເງິນກູ້</h1>
        <div class="filter-controls">
          <div class="period-selector">
            <label>ໄລຍະເວລາ:</label>
            <select v-model="selectedPeriod" @change="updatePeriod">
              <option value="day">ລາຍວັນ</option>
              <option value="month">ລາຍເດືອນ</option>
              <option value="year">ລາຍປີ</option>
            </select>
          </div>
          <date-range-picker
            v-model="dateRange"
            @update:modelValue="updateCharts"
          />
        </div>
      </div>
  
      
      <div class="summary-cards">
        <div class="summary-card">
          <h3>ຈຳນວນເງິນກູ້ທັງໝົດ</h3>
          <p class="card-number">{{ formatCurrency(summaryData.totalLoanAmount) }}</p>
          <p class="change-indicator" :class="summaryData.totalLoanChange >= 0 ? 'positive' : 'negative'">
            <span>{{ summaryData.totalLoanChange >= 0 ? '↑' : '↓' }}</span>
            {{ Math.abs(summaryData.totalLoanChange) }}%
          </p>
        </div>
        <div class="summary-card">
          <h3>ຈຳນວນສັນຍາເງິນກູ້</h3>
          <p class="card-number">{{ summaryData.totalLoanCount }}</p>
          <p class="change-indicator" :class="summaryData.loanCountChange >= 0 ? 'positive' : 'negative'">
            <span>{{ summaryData.loanCountChange >= 0 ? '↑' : '↓' }}</span>
            {{ Math.abs(summaryData.loanCountChange) }}%
          </p>
        </div>
        <div class="summary-card">
          <h3>ເງິນກູ້ເກີນກຳນົດ</h3>
          <p class="card-number">{{ formatCurrency(summaryData.overdueAmount) }}</p>
          <p class="change-indicator" :class="summaryData.overdueChange <= 0 ? 'positive' : 'negative'">
            <span>{{ summaryData.overdueChange <= 0 ? '↓' : '↑' }}</span>
            {{ Math.abs(summaryData.overdueChange) }}%
          </p>
        </div>
        <div class="summary-card">
          <h3>ອັດຕາດອກເບ້ຍສະເລ່ຍ</h3>
          <p class="card-number">{{ summaryData.averageInterestRate }}%</p>
          <p class="change-indicator" :class="summaryData.interestRateChange <= 0 ? 'positive' : 'negative'">
            <span>{{ summaryData.interestRateChange <= 0 ? '↓' : '↑' }}</span>
            {{ Math.abs(summaryData.interestRateChange) }}%
          </p>
        </div>
      </div>
  
      
      <div class="charts-section">
        
        <div class="chart-container">
          <h2>ມູນຄ່າເງິນກູ້ຕາມໄລຍະເວລາ</h2>
          <ClientOnly>
            <apexchart
              type="area"
              height="350"
              :options="timeSeriesChartOptions"
              :series="loanAmountSeries"
            ></apexchart>
          </ClientOnly>
        </div>
  
       
        <div class="chart-container">
          <h2>ການແຈກຢາຍເງິນກູ້ຕາມປະເພດ</h2>
          <ClientOnly>
            <apexchart
              type="pie"
              height="350"
              :options="loanTypeChartOptions"
              :series="loanTypeSeries"
            ></apexchart>
          </ClientOnly>
        </div>
  
        <div class="chart-container">
          <h2>ອັດຕາການຈ່າຍຄືນຕາມໄລຍະເວລາ</h2>
          <ClientOnly>
            <apexchart
              type="bar"
              height="350"
              :options="repaymentChartOptions"
              :series="repaymentSeries"
            ></apexchart>
          </ClientOnly>
        </div>
  
       
        <div class="recent-loans-container">
          <h2>ເງິນກູ້ລ່າສຸດ</h2>
          <table class="recent-loans-table">
            <thead>
              <tr>
                <th>ລະຫັດເງິນກູ້</th>
                <th>ລູກຄ້າ</th>
                <th>ມູນຄ່າ</th>
                <th>ປະເພດ</th>
                <th>ວັນທີປ່ອຍກູ້</th>
                <th>ສະຖານະ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in recentLoans" :key="loan.id">
                <td>{{ loan.id }}</td>
                <td>{{ loan.customerName }}</td>
                <td>{{ formatCurrency(loan.amount) }}</td>
                <td>{{ loan.type }}</td>
                <td>{{ formatDate(loan.date) }}</td>
                <td>
                  <span class="status-badge" :class="loan.status.toLowerCase()">
                    {{ loan.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useNuxtApp } from '#app'
  

  const selectedPeriod = ref('month')
  const dateRange = ref({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  })
  
 
  const summaryData = ref({
    totalLoanAmount: 12500000000,
    totalLoanChange: 8.3,
    totalLoanCount: 1240,
    loanCountChange: 12.7,
    overdueAmount: 450000000,
    overdueChange: -3.2,
    averageInterestRate: 6.7,
    interestRateChange: -0.5
  })
  
  
  const loanAmountSeries = ref([
    {
      name: 'ມູນຄ່າເງິນກູ້',
      data: [
        { x: '2024-01', y: 1800000000 },
        { x: '2024-02', y: 1950000000 },
        { x: '2024-03', y: 2100000000 },
        { x: '2024-04', y: 1950000000 },
        { x: '2024-05', y: 2250000000 },
        { x: '2024-06', y: 2450000000 }
      ]
    }
  ])
  
  
  const timeSeriesChartOptions = ref({
    chart: {
      id: 'loan-amount-time-series',
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    colors: ['#2E93fA'],
    xaxis: {
      type: 'category',
      title: {
        text: 'ໄລຍະເວລາ'
      }
    },
    yaxis: {
      title: {
        text: 'ມູນຄ່າເງິນກູ້ (LAK)'
      },
      labels: {
        formatter: function(value: number) {
          return formatShortNumber(value)
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(value: number) {
          return formatCurrency(value)
        }
      }
    }
  })
  
  
  const loanTypeSeries = ref([3200000000, 2800000000, 1700000000, 1500000000, 950000000])
  const loanTypeChartOptions = ref({
    chart: {
      id: 'loan-type-pie',
      type: 'pie'
    },
    labels: ['ທີ່ຢູ່ອາໄສ', 'ທຸລະກິດ', 'ລົດຍົນ', 'ການສຶກສາ', 'ສ່ວນບຸກຄົນ'],
    colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
    tooltip: {
      y: {
        formatter: function(value: number) {
          return formatCurrency(value)
        }
      }
    },
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  })
  
  
  const repaymentSeries = ref([
    {
      name: 'ອັດຕາການຈ່າຍຄືນ',
      data: [98.2, 97.8, 96.5, 97.3, 98.5, 99.1]
    },
    {
      name: 'ອັດຕາການຄ້າງຊຳລະ',
      data: [1.8, 2.2, 3.5, 2.7, 1.5, 0.9]
    }
  ])
  
  
  const repaymentChartOptions = ref({
    chart: {
      id: 'repayment-bar',
      type: 'bar',
      stacked: true,
      toolbar: {
        show: true
      }
    },
    colors: ['#00E396', '#FF4560'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ']
    },
    yaxis: {
      title: {
        text: 'ເປີເຊັນ (%)'
      },
      max: 100
    },
    legend: {
      position: 'top'
    },
    fill: {
      opacity: 1
    }
  })
  
 
  const recentLoans = ref([
    { id: 'L-24060078', customerName: 'ທ້າວ ສົມສັກ ພົມມະວົງ', amount: 150000000, type: 'ທີ່ຢູ່ອາໄສ', date: '2024-06-10', status: 'ປົກກະຕິ' },
    { id: 'L-24060071', customerName: 'ບໍລິສັດ ນ້ຳໃສ ຈຳກັດ', amount: 350000000, type: 'ທຸລະກິດ', date: '2024-06-08', status: 'ປົກກະຕິ' },
    { id: 'L-24060065', customerName: 'ນາງ ພອນສະຫວັນ ສີສຸພັນ', amount: 85000000, type: 'ລົດຍົນ', date: '2024-06-05', status: 'ປົກກະຕິ' },
    { id: 'L-24060052', customerName: 'ທ້າວ ວິໄລພອນ ສຸວັນນາ', amount: 120000000, type: 'ທຸລະກິດ', date: '2024-06-01', status: 'ຄ້າງຊຳລະ' },
    { id: 'L-24050148', customerName: 'ນາງ ສຸກສະຫວັນ ພົມມະຈັນ', amount: 65000000, type: 'ສ່ວນບຸກຄົນ', date: '2024-05-28', status: 'ປົກກະຕິ' }
  ])
  
 
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const formatShortNumber = (value: number): string => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + ' ຕື້'
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + ' ລ້ານ'
    }
    return value.toString()
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
 
  const updatePeriod = () => {
   
    if (selectedPeriod.value === 'day') {
      loanAmountSeries.value = [{
        name: 'ມູນຄ່າເງິນກູ້',
        data: [
          { x: '2024-06-01', y: 95000000 },
          { x: '2024-06-02', y: 65000000 },
          { x: '2024-06-03', y: 120000000 },
          { x: '2024-06-04', y: 85000000 },
          { x: '2024-06-05', y: 110000000 },
          { x: '2024-06-06', y: 75000000 },
          { x: '2024-06-07', y: 130000000 }
        ]
      }]
      timeSeriesChartOptions.value.xaxis.title.text = 'ວັນທີ'
    } else if (selectedPeriod.value === 'month') {
      loanAmountSeries.value = [{
        name: 'ມູນຄ່າເງິນກູ້',
        data: [
          { x: '2024-01', y: 1800000000 },
          { x: '2024-02', y: 1950000000 },
          { x: '2024-03', y: 2100000000 },
          { x: '2024-04', y: 1950000000 },
          { x: '2024-05', y: 2250000000 },
          { x: '2024-06', y: 2450000000 }
        ]
      }]
      timeSeriesChartOptions.value.xaxis.title.text = 'ເດືອນ'
    } else if (selectedPeriod.value === 'year') {
      loanAmountSeries.value = [{
        name: 'ມູນຄ່າເງິນກູ້',
        data: [
          { x: '2019', y: 8500000000 },
          { x: '2020', y: 7850000000 },
          { x: '2021', y: 9200000000 },
          { x: '2022', y: 10850000000 },
          { x: '2023', y: 11750000000 },
          { x: '2024', y: 12500000000 }
        ]
      }]
      timeSeriesChartOptions.value.xaxis.title.text = 'ປີ'
    }
    
    updateCharts()
  }
  
  const updateCharts = () => {
    
    console.log(`ອັບເດດຂໍ້ມູນສຳລັບ: ${selectedPeriod.value}`)
    console.log(`ຊ່ວງວັນທີ: ${dateRange.value.startDate} - ${dateRange.value.endDate}`)
    
   
  }
  
  onMounted(() => {
    
    updatePeriod()
  })
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Noto Sans Lao', sans-serif;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .header-section h1 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }
  
  .filter-controls {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  
  .period-selector {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .period-selector select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 14px;
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .summary-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .summary-card h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #666;
    font-weight: normal;
  }
  
  .card-number {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 5px 0;
    color: #333;
  }
  
  .change-indicator {
    font-size: 14px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .positive {
    color: #00C853;
  }
  
  .negative {
    color: #FF5252;
  }
  
  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 20px;
  }
  
  .chart-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .chart-container h2 {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #333;
  }
  
  .recent-loans-container {
    grid-column: 1 / -1;
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .recent-loans-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  
  .recent-loans-table th,
  .recent-loans-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .recent-loans-table th {
    font-weight: 600;
    color: #666;
    background-color: #f9f9f9;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge.ປົກກະຕິ {
    background-color: #E8F5E9;
    color: #2E7D32;
  }
  
  .status-badge.ຄ້າງຊຳລະ {
    background-color: #FFEBEE;
    color: #C62828;
  }
  
  @media (max-width: 768px) {
    .charts-section {
      grid-template-columns: 1fr;
    }
    
    .header-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    
    .filter-controls {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
  }
  </style>