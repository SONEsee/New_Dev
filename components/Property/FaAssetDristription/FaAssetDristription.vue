<script setup lang="ts">
// ປັບຊື່ store ໃຫ້ຖືກຕ້ອງ
const accountStore = accountMethodStore();
const depreciationStore = useFassetLidtDescription();

// ປັບຊື່ computed property ໃຫ້ຖືກຕ້ອງ
const responseData = computed(() => {
  return depreciationStore.respons_data_calculated;
});

const isLoading = computed(() => {
  return !responseData.value || !responseData.value.data;
});

// ເພີ່ມ function ສຳລັບຄຳນວນລວມ
const total = (items: any[]) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.expected_depreciation || 0), 0).toLocaleString();
};

// ສຳລັບຟໍແມດຕົວເລບ
const formatNumber = (num: number) => {
  return num.toLocaleString('en-US');
};

const headers = [
  { title: "ຂໍ້ມູນປະຈຳເດືອນ", key: "month_name", sortable: true },
];

onMounted(() => {
  accountStore.GetAccountMethodList();
  depreciationStore.getdataCalculated();
});
</script>

<template>
  <v-container fluid>
    <div color="#E3F2FD" class="rounded-lg pa-4" style="border: 1px solid blue">
   
      <v-row v-if="isLoading">
        <v-col cols="12" class="text-center">
          <v-progress-circular 
            indeterminate 
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        </v-col>
      </v-row>

     
       <v-row v-else-if="responseData && responseData.data">
        <v-col cols="12">
          <v-card class="elevation-2">
            <v-card-title class="text-h6 font-weight-bold bg-primary text-white">
              ຂໍ້ມູນທີ່ຕອ້ງຫັກຄ່າຫຼູ້ຍຫຽ້ນພາຍໃນເດືອນ - {{ responseData.data.target_period.month_name_la }} {{ responseData.data.target_period.year }}
            </v-card-title>
            <v-card-text class="pa-0">
              <v-table class="text-center">
                <thead>
                  <tr class="bg-grey-lighten-3">
                    <th class="text-center font-weight-bold">ຫັກປະຈຳເດືອນ</th>
                    <th class="text-center font-weight-bold">ຈຳນວນລາຍການທີ່ຫັກ</th>
                    <th class="text-center font-weight-bold">ຈຳນວນເງິນທີ່ຕ້ອງຫັກ</th>
                    <th class="text-center font-weight-bold">ຫັກຄ່າຫຼູ້ຍຫຽ້ນ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="pa-4">
                      <div class="text-h5 text-primary font-weight-bold">
                        {{ responseData.data.target_period.month }}/{{ responseData.data.target_period.year }}
                      </div>
                      <div class="text-body-2 text-grey-600">
                        {{ responseData.data.target_period.month_name_la }}
                      </div>
                    </td>
                    <td class="pa-4">
                      <div class="text-h5 text-info font-weight-bold">
                        {{ formatNumber(responseData.data.summary.total_due) }}
                      </div>
                      <div class="text-body-2 text-grey-600">ລາຍການທັງໝົດ</div>
                    </td>
                    <td class="pa-4">
                      <div class="text-h5 text-error font-weight-bold">
                        {{ total(responseData.data.due_items) }} ₭
                      </div>
                      <div class="text-body-2 text-grey-600">ລາຍການທີ່ຕ້ອງຫັກ</div>
                    </td>
                    <td class="pa-4">
                      <v-btn color="primary" @click="goPath(`/property/faassetdetription/create`)">ຫັກຄ່າຫຼູ້ຍຫຽ້ນ</v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    
    
    </div>
  </v-container>
</template>

<style scoped>
.text-h3 {
  font-weight: bold;
}

.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.font-weight-bold {
  font-weight: 600;
}

.elevation-2 {
  box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
}

.text-primary {
  color: #1976d2 !important;
}

.text-info {
  color: #2196f3 !important;
}

.text-error {
  color: #f44336 !important;
}

.text-success {
  color: #4caf50 !important;
}

.text-warning {
  color: #ff9800 !important;
}

.text-grey-600 {
  color: #757575 !important;
}

.rounded-lg {
  border-radius: 12px;
}
</style>