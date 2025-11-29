<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import FaAssetDrestriptionArrea from "./FaAssetDrestriptionArrea.vue";

const accountStore = accountMethodStore();
const depreciationStore = useFassetLidtDescription();
const deprecationUPda = useDrepecitoinUpdat();

const dataShow = computed(() => {
  const data = deprecationUPda.response_data_drepecation_lis?.summary;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const dataDate = computed(() => {
  const data = deprecationUPda.response_data_drepecation_lis?.target_period;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const history = computed(() => {
  const data = depreciationStore.response_history_data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [];
  }
});

const header = [
  { title: "ລະຫັດ", value: "aldim_id", width: "80px" },
  { title: "ງວດທີ່ຫັກ", value: "dpca_month", width: "120px" },
  { title: "ມູນຄ່າທີ່ຫັກ", value: "dpca_value", width: "150px" },
  { title: "ຈຳນວນລາຍການ", value: "C_dpca", align: "center", width: "120px" },
  { title: "ມື້ຫັກ", value: "Maker_DT_Stamp", width: "120px" },
  { title: "ສະຖານະ", value: "dpca_status", width: "120px" },
  { title: "ການດຳເນີນການ", value: "actions", width: "150px" },
] as any;

const header1 = [
  { title: "ລຳດັບ", value: "index", width: "80px" },
  {
    title: "ມູນຄ່າທີ່ຕ້ອງຫັກ",
    value: "total_depreciation_amount",
    width: "180px",
  },
  {
    title: "ຈຳນວນລາຍການ",
    value: "total_items_need_depreciation",
    width: "150px",
  },
  { title: "ງວດທີ່ຫັກ", value: "dates", width: "120px" },
  { title: "ການດຳເນີນການ", value: "action", width: "150px" },
] as any;

const responseData = computed(() => {
  return depreciationStore.respons_data_calculated;
});

const isLoading = computed(() => {
  return !responseData.value || !responseData.value.data;
});

const total = (items: any[]) => {
  if (!items || !Array.isArray(items)) return 0;
  return items
    .reduce((sum, item) => sum + (item.expected_depreciation || 0), 0)
    .toLocaleString();
};

const formatNumber = (num: number) => {
  return num.toLocaleString("en-US");
};

const formatCurrency = (num: number) => {
  return (
    new Intl.NumberFormat("lo-LA", {
      style: "currency",
      currency: "LAK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(num)
      .replace("LAK", "") + " ₭"
  );
};

const tab = ref("one");

const totaldata = computed(() => {
  const data = depreciationStore.respons_data_driscription_main;
  if (Array.isArray(data)) {
    return data.filter((item) => item?.Auth_Status === "R");
  }
  if (data && typeof data === "object") {
    return data.Auth_Status === "R" ? [data] : [];
  }
  return [];
});

const notificationCount = ref(0);

watch(
  totaldata,
  (newData) => {
    notificationCount.value = newData.length;
  },
  { immediate: true }
);

const updateNotificationCount = () => {
  notificationCount.value = totaldata.value.length;
};

onMounted(() => {
  accountStore.GetAccountMethodList();
  depreciationStore.getdataCalculated();
  depreciationStore.getDataHistory();
  depreciationStore.getDataTotal();
  deprecationUPda.getDataDrepecation();
});

const handleNotificationClick = () => {
  goPath(`/property/autoriz/reject`);
};
</script>

<template>
  <v-container fluid class="modern-container">
    <div class="">
  
    </div>

    
    <v-row v-if="isLoading" justify="center" class="loading-section">
      <v-col cols="12" class="text-center">
        <div class="loading-card">
          <v-progress-circular
            indeterminate
            color="primary"
            size="80"
            width="6"
          />
          <h3 class="mt-6 loading-text">ກຳລັງໂຫຼດຂໍ້ມູນ...</h3>
          <p class="loading-subtitle">ກະລຸນາລໍຖ້າສັກຄູ່</p>
        </div>
      </v-col>
    </v-row>

   
    <div v-else-if="responseData && responseData.data" class="main-content">
    
       
      <v-card class="modern-card tabs-card mb-6" elevation="0">
        <v-tabs
          v-model="tab"
          align-tabs="center"
          color="primary"
          bg-color="transparent"
          class="modern-tabs"
        >
          <v-tab value="one" class="modern-tab">
            <v-icon class="mr-2">mdi-calendar-month</v-icon>
            ຫັກຄ່າຫຼູ້ຍຫຽ້ນປະຈຳເດືອນ
            <v-chip class="ml-2" size="small" color="info">
              {{ responseData.data.target_period.month_name_la }}
              {{ responseData.data.target_period.year }}
            </v-chip>
          </v-tab>
          <v-tab value="two" class="modern-tab">
            <v-icon class="mr-2">mdi-history</v-icon>
            ຫັກຄ່າຫຼູ້ຍຫຽ້ນຍ້ອນຫຼັງ
          </v-tab>
        </v-tabs>

        <v-divider class="my-0" />

        <v-tabs-window v-model="tab" class="tabs-content">
          
          <v-tabs-window-item value="one" class="pa-0">
            <div class="monthly-section">
              
              <v-card class="modern-card table-card" elevation="0">
                <v-card-title class="table-title">
                  <v-icon class="mr-2">mdi-table</v-icon>
                  ລາຍລະອຽດການຫັກຄ່າຫຼູ້ຍຫ້ຽນປະຈຳເດືອນ:  <v-chip class="ml-2" size="small" color="success">
              {{ responseData.data.target_period.month_name_la }}
              {{ responseData.data.target_period.year }}
            </v-chip>
                </v-card-title>
                <v-divider />
                <v-data-table
                  :items="dataShow"
                  :headers="header1"
                  class="modern-table"
                  :items-per-page="10"
                  
                >
                  <template v-slot:item.index="{ index }">
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ index + 1 }}
                    </v-chip>
                  </template>

                  <template v-slot:item.dates="{ item }">
                    <v-chip color="success" variant="elevated" size="small">
                      <v-icon start>mdi-calendar</v-icon>
                      {{ dataDate[0]?.month }}/{{ dataDate[0]?.year }}
                    </v-chip>
                  </template>

                  <template
                    v-slot:item.total_items_need_depreciation="{ item }"
                  >
                    <v-chip color="info" variant="tonal" size="small">
                      <v-icon start>mdi-counter</v-icon>
                      {{ item.total_items_need_depreciation }}
                    </v-chip>
                  </template>

                  <template v-slot:item.total_depreciation_amount="{ item }">
                    <div class="amount-cell">
                      <v-chip color="warning" variant="elevated" size="small">
                        {{ formatCurrency(item.total_depreciation_amount) }}
                      </v-chip>
                    </div>
                  </template>
                  <template v-slot:item.action>
                    <v-btn
                      color="primary"
                      variant="elevated"
                      size="small"
                      @click="goPath('/property/faassetdetription/create')"
                      prepend-icon="mdi-eye-outline"
                    >
                      ລາຍລະອຽດ
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="two" class="pa-0">
            <FaAssetDrestriptionArrea />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>


      <v-card class="history-card" elevation="0" outlined>
  <v-card-title class="history-title pa-6">
    <div class="d-flex align-center flex-wrap ga-4 w-100">
      <div class="d-flex align-center flex-grow-1">
        <div class="icon-wrapper mr-4">
          <v-icon size="28" color="primary">mdi-history</v-icon>
        </div>
        <div>
          <h3 style="color: black;">ປະຫວັດການຫັກຄ່າຫຼູ້ຍຫ້ຽນ</h3>
          <p class="history-subtitle mb-0">
            ຕິດຕາມການດຳເນີນງານທັງໝົດ
          </p>
        </div>
      </div>
      
      <div class="total-badge">
        <v-icon size="18" class="mr-2" color="primary">mdi-database</v-icon>
        <span class="text-body-2">ທັງໝົດ: <strong>{{ history?.length || 0 }}</strong> ລາຍການ</span>
      </div>
    </div>
  </v-card-title>

  <v-divider />

  <v-data-table
    :items="history"
    :headers="header"
    class="clean-table"
    :items-per-page="15"
    hover
  >
    <template v-slot:header="{ columns }">
      <tr class="table-header">
        <th
          v-for="column in columns"
          :key="column.key"
          class="clean-th text-body-2"
        >
          {{ column.title }}
        </th>
      </tr>
    </template>

    <template v-slot:item.aldim_id="{ item }">
      <div class="id-badge">
        #{{ item.aldim_id }}
      </div>
    </template>

    <template v-slot:item.dpca_month="{ item }">
      <div class="month-badge">
        <v-icon size="16" class="mr-1">mdi-calendar-month</v-icon>
        {{ item.dpca_month }}
      </div>
    </template>

    <template v-slot:item.Maker_DT_Stamp="{ item }">
      <div class="date-cell">
        <v-icon size="16" class="mr-1">mdi-calendar-clock</v-icon>
        {{ dayjs(item.Maker_DT_Stamp).format("DD/MM/YYYY HH:mm") }}
      </div>
    </template>

    <template v-slot:item.C_dpca="{ item }">
      <div class="count-badge">
        {{ item.C_dpca }}
      </div>
    </template>

    <template v-slot:item.dpca_status="{ item }">
      <div 
        class="status-badge"
        :class="item.dpca_status === 'SUCCESS' ? 'status-success' : 'status-error'"
      >
        <v-icon size="16" class="mr-1">
          {{ item.dpca_status === 'SUCCESS' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ item.dpca_status === "SUCCESS" ? "ສຳເລັດ" : "ບໍ່ສຳເລັດ" }}
      </div>
    </template>

    <template v-slot:item.dpca_value="{ item }">
      <div class="amount-cell">
        {{ formatCurrency(Number(item.dpca_value)) }}
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn
        variant="text"
        color="primary"
        size="small"
        class="text-none action-btn"
        @click="
          goPath(
            `/property/faassetdetription/list?deptription_id=${item.aldim_id}`
          )
        "
      >
        <v-icon size="18" class="mr-1">mdi-eye</v-icon>
        ລາຍລະອຽດ
      </v-btn>
    </template>

    <template v-slot:no-data>
      <div class="text-center py-12">
        <v-icon size="48" color="grey-lighten-1" class="mb-3">
          mdi-inbox
        </v-icon>
        <p class="text-body-1 text-grey">ບໍ່ມີຂໍ້ມູນ</p>
      </div>
    </template>
  </v-data-table>
</v-card>
    </div>
  </v-container>
</template>

<style scoped>
.modern-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 2rem 1rem;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #05075e 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.notification-wrapper {
  position: relative;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.loading-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.loading-text {
  color: #333;
  font-weight: 600;
}

.loading-subtitle {
  color: #666;
  margin-top: 0.5rem;
}

.modern-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
}

.tabs-card {
  border: none !important;
}

.modern-tabs {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px 20px 0 0;
}

.modern-tab {
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  padding: 1rem 2rem !important;
  transition: all 0.3s ease;
}

.tabs-content {
  background: transparent;
}

.monthly-section {
  padding: 2rem;
}

.summary-cards {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 16px !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15) !important;
}

.summary-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.blue-card {
  background: linear-gradient(135deg, #667eea 0%, #140870 100%) !important;
  color: white;
}

.green-card {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%) !important;
  color: white;
}

.orange-card {
  background: linear-gradient(135deg, #ff8a80 0%, #ff5722 100%) !important;
  color: white;
}

.summary-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.summary-value-large {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.summary-subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
}

.table-card {
  overflow: hidden;
}

.table-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-weight: 600;
  padding: 1.5rem 2rem;
  color: #333;
}

.modern-table {
  background: transparent !important;
}

.modern-table :deep(.v-data-table__wrapper) {
  background: transparent;
}

.modern-table :deep(table) {
  background: transparent !important;
}

.modern-table :deep(thead tr) {
  background: linear-gradient(135deg, #f1f3f4 0%, #e8eaf6 100%) !important;
}

.modern-table :deep(thead th) {
  background: transparent !important;
  font-weight: 600 !important;
  color: #333 !important;
  border-bottom: 2px solid #e0e0e0 !important;
  padding: 1rem !important;
}

.modern-table :deep(tbody tr) {
  transition: background-color 0.2s ease;
}

.modern-table :deep(tbody tr:hover) {
  background: rgba(103, 126, 234, 0.05) !important;
}

.modern-table :deep(tbody td) {
  padding: 1rem !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

.amount-cell {
  font-weight: 600;
  color: #2e7d32;
}

.date-cell {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
}

.history-card {
  margin-top: 2rem;
}

.history-title {
  background: linear-gradient(135deg, #667eea 0%, #121479 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.history-table :deep(tbody tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
    flex-direction: column;
    text-align: center;
  }

  .monthly-section {
    padding: 1rem;
  }

  .summary-value {
    font-size: 1.5rem;
  }

  .summary-value-large {
    font-size: 1.3rem;
  }

  .header-section {
    padding: 1.5rem;
  }
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card {
  animation: fadeInUp 0.6s ease forwards;
}

.summary-card:nth-child(1) {
  animation-delay: 0.1s;
}
.summary-card:nth-child(2) {
  animation-delay: 0.2s;
}
.summary-card:nth-child(3) {
  animation-delay: 0.3s;
}
.summary-card:nth-child(4) {
  animation-delay: 0.4s;
}


@media (max-width: 600px) {
  .modern-container {
    padding: 1rem 0.5rem;
  }

  .modern-card {
    border-radius: 12px !important;
  }

  .header-section {
    border-radius: 12px;
  }
}

/* Card Styling */
.history-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
}

.history-title {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.history-subtitle {
  font-size: 0.875rem;
  color: #5f6368;
  font-weight: 400;
}

/* Icon Wrapper */
.icon-wrapper {
  width: 40px;
  height: 40px;
  background: #e8f0fe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Total Badge */
.total-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  color: #3c4043;
}

/* Table Styling */
.clean-table {
  background: transparent !important;
}

.table-header {
  background: #fafafa !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

.clean-th {
  color: #5f6368 !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.25px !important;
  padding: 12px 16px !important;
}

.clean-table :deep(.v-data-table__td) {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  color: #3c4043;
}

.clean-table tbody tr {
  transition: background-color 0.15s ease;
}

.clean-table tbody tr:hover {
  background-color: #f8f9fa !important;
}

/* Badge Styles */
.id-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e8f0fe;
  border: 1px solid #d2e3fc;
  border-radius: 12px;
  color: #1967d2;
  font-size: 0.813rem;
  font-weight: 500;
}

.month-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e6f4ea;
  border: 1px solid #c6e1c6;
  border-radius: 12px;
  color: #137333;
  font-size: 0.813rem;
  font-weight: 500;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  background: #f3e8fd;
  border: 1px solid #e9d2fd;
  border-radius: 12px;
  color: #7627bb;
  font-size: 0.813rem;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.813rem;
  font-weight: 500;
}

.status-success {
  background: #e6f4ea;
  border: 1px solid #c6e1c6;
  color: #137333;
}

.status-error {
  background: #fce8e6;
  border: 1px solid #f9c8c3;
  color: #c5221f;
}

/* Date Cell */
.date-cell {
  display: flex;
  align-items: center;
  color: #5f6368;
  font-size: 0.875rem;
}

/* Amount Cell */
.amount-cell {
  text-align: right;
  font-weight: 500;
  color: #1967d2;
  font-size: 0.938rem;
  font-variant-numeric: tabular-nums;
}

/* Action Button */
.action-btn {
  border: 1px solid #dadce0 !important;
  border-radius: 4px !important;
  padding: 0 12px !important;
  height: 32px !important;
  text-transform: none !important;
  letter-spacing: 0.25px !important;
}

.action-btn:hover {
  background: #f8f9fa !important;
  border-color: #1967d2 !important;
}
</style>
