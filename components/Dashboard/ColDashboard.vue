
<template>
    <p class="pa-2">ຂໍ້ມູນຫຼັກຊັບ</p>
    <apexchart
    style="font-family:Saysettha OT;"
      width="100%"
      type="pie"
      :options="chartOptions"
      :series="series"
    />
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import ApexChart from 'vue3-apexcharts'
  
  const series = ref([44, 55, 13, 43, 22])
  
  const chartOptions = ref({
    labels: ['ລົດ', 'ດິນ', 'ຄຳ', 'ໂຄງການ', 'ເອກະສານມີຄ່າ'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  })
  </script>
  