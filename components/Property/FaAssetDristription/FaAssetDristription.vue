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
      <!-- <v-row align="center" class="mb-4">
        <v-col>
          <h1 class="main-title">
            <v-icon class="mr-3" color="primary" size="large"
              >mdi-calculator</v-icon
            >
            ລະບົບຫັກຄ່າຫຼູ້ຍຫຽ້ນ
          </h1>
          <p class="subtitle">ຈັດການແລະຕິດຕາມການຫັກຄ່າຫຼູ້ຍຫຽ້ນຂອງຊັບສົມບັດ</p>
        </v-col>
        <v-col cols="auto">
          <div class="notification-wrapper">
            <v-btn
              @click="handleNotificationClick"
              icon
              variant="elevated"
              class="notification-btn"
              color="warning"
            >
              <v-icon>mdi-bell</v-icon>
              <v-badge
                v-if="notificationCount > 0"
                :content="
                  notificationCount > 99 ? '99+' : notificationCount.toString()
                "
                color="error"
                floating
              />
            </v-btn>
          </div>
        </v-col>
      </v-row> -->
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
              <!-- Summary Cards -->
              <!-- <v-row class="summary-cards mb-6">
                <v-col cols="12" md="3">
                  <v-card class="summary-card blue-card" elevation="0">
                    <v-card-text class="pa-6">
                      <div class="summary-icon">
                        <v-icon size="40" color="white"
                          >mdi-calendar-clock</v-icon
                        >
                      </div>
                      <h3 class="summary-title">ງວດທີ່ຫັກ</h3>
                      <div class="summary-value">
                        {{ dataDate[0]?.month }}/{{ dataDate[0]?.year }}
                      </div>
                      <p class="summary-subtitle">
                        {{ responseData.data.target_period.month_name_la }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3">
                  <v-card class="summary-card green-card" elevation="0">
                    <v-card-text class="pa-6">
                      <div class="summary-icon">
                        <v-icon size="40" color="white"
                          >mdi-format-list-numbered</v-icon
                        >
                      </div>
                      <h3 class="summary-title">ລາຍການທັງໝົດ</h3>
                      <div class="summary-value">
                        {{
                          formatNumber(
                            dataShow[0]?.total_items_need_depreciation || 0
                          )
                        }}
                      </div>
                      <p class="summary-subtitle">ລາຍການ</p>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card class="summary-card orange-card" elevation="0">
                    <v-card-text class="pa-6">
                      <div class="summary-icon">
                        <v-icon size="40" color="white"
                          >mdi-cash-multiple</v-icon
                        >
                      </div>
                      <h3 class="summary-title">ມູນຄ່າທີ່ຕ້ອງຫັກ</h3>
                      <div class="summary-value-large">
                        {{
                          formatCurrency(
                            dataShow[0]?.total_depreciation_amount || 0
                          )
                        }}
                      </div>
                      <p class="summary-subtitle">ມູນຄ່າລວມທັງໝົດ</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row> -->
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


      <v-card class="modern-card history-card" elevation="0">
        <v-card-title class="history-title">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-history</v-icon>
            <div>
              <h3>ປະຫວັດການຫັກຄ່າຫຼູ້ຍຫຽ້ນ</h3>
              <p class="history-subtitle">ຕິດຕາມການດຳເນີນງານທັງໝົດ</p>
            </div>
          </div>
          <v-spacer />
          <v-chip
            color="primary"
            variant="elevated"
            prepend-icon="mdi-database"
          >
            ທັງໝົດ: {{ history?.length }} ລາຍການ
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-data-table
          :items="history"
          :headers="header"
          class="modern-table history-table"
          :items-per-page="15"
          
        >
          <template v-slot:header="{ props }">
            <tr class="table-header">
              <th
                v-for="header in props.headers"
                :key="header.key"
                class="modern-th"
              >
                <div class="header-content">
                  <span class="header-text">{{ header.title }}</span>
                </div>
              </th>
            </tr>
          </template>

          <template v-slot:item.aldim_id="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              #{{ item.aldim_id }}
            </v-chip>
          </template>

          <template v-slot:item.dpca_month="{ item }">
            <v-chip size="small" color="info" variant="outlined">
              {{ item.dpca_month }}
            </v-chip>
          </template>

          <template v-slot:item.Maker_DT_Stamp="{ item }">
            <div class="date-cell">
              <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
              {{ dayjs(item.Maker_DT_Stamp).format("DD/MM/YYYY") }}
            </div>
          </template>

          <template v-slot:item.C_dpca="{ item }">
            <div class="text-center">
              <v-chip color="purple" variant="tonal" size="small">
                {{ item.C_dpca }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.dpca_status="{ item }">
            <v-chip
              :color="item.dpca_status === 'SUCCESS' ? 'success' : 'error'"
              variant="elevated"
              size="small"
              :prepend-icon="
                item.dpca_status === 'SUCCESS'
                  ? 'mdi-check-circle'
                  : 'mdi-alert-circle'
              "
            >
              {{ item.dpca_status === "SUCCESS" ? "ສຳເລັດ" : "ບໍ່ສຳເລັດ" }}
            </v-chip>
          </template>

          <template v-slot:item.dpca_value="{ item }">
            <div class="amount-cell">
              <strong>{{ formatCurrency(Number(item.dpca_value)) }}</strong>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              variant="outlined"
              color="primary"
              size="small"
              prepend-icon="mdi-eye-outline"
              @click="
                goPath(
                  `/property/faassetdetription/list?deptription_id=${item.aldim_id}`
                )
              "
            >
              ລາຍລະອຽດ
            </v-btn>
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
</style>
