<template>

  <div class="text-end w-full" style="width: 100%;">
   <p class="d-flex pa-1">ຂໍ້ມູນເງິນກູ້</p>
    <VueApexCharts
      id="chart"
      :options="chartOptions"
      :series="series"
      type="area"
      height=""
    />
    <v-btn
      flat
      color=""
      class="pa-2 text-primary mb-5"
      @click="goToDetails"
      >ລາຍລະອຽດ</v-btn
    >
  </div>
</template>

<script lang="ts" >
import { defineComponent } from "vue";
import VueApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";

export default defineComponent({
  name: "AreaChart",
  components: {
    VueApexCharts,
  },
  setup() {
    const series = [
      {
        name: "ເງິນກູ້ທັງໝົດ",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "ເງິນກູ້ປົກກະຕິ",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
      {
        name: "ເງິນກູ້ທີ່ມີຄວາມສຽ່ງ",
        data: [1, 3, 2, 6, 3, 12, 1],
      },
    ];

    const chartOptions: ApexOptions = {
      chart: {
        height: 350,
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    };

    return {
      series,
      chartOptions,
    };
  },
  methods: {
  goToDetails() {
   
    this.$router.push('/dashbord/detail')
    
  }
}
});
</script>
