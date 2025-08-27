<script setup lang="ts">
const title = "ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນ";
const devisionStore = UseCategoryStore();
const reporStore = useReportDeprecationStore();
const AssetListStore = assetStore();
const masterStore = useMasterStore();
const selecteAssetType = ref(null);
const selectStatus = ref(null);
const selectStartDate = ref("");
const selectEndDate = ref("");
const selectedAssetList = ref(null);
const selectedDevision = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);

// Computed properties
const devisiondata = computed(() => {
  const data = devisionStore.categories;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const assetType = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const status = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const reportData = computed(() => {
  const data = reporStore.response_group_data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

// Helper functions
const formatCurrency = (amount:any) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('lo-LA').format(amount);
};

const formatDate = (dateString:any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); 
};

// Watchers
watch(selecteAssetType, async (newValue) => {
  reporStore.isLoading = true;
  try {
    reporStore.from_filter_group.asset_type_id = newValue;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ",
    });
  } finally {
    reporStore.isLoading = false;
  }
});

watch(selectedDevision, async (newValue) => {
  reporStore.isLoading = true;
  try {
    reporStore.from_filter_group.devision = newValue;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຫ້ອງການ",
    });
  } finally {
    reporStore.isLoading = false;
  }
});

watch(selectStatus, async (newValue) => {
  reporStore.isLoading = true;
  try {
    reporStore.from_filter_group.asset_status = newValue;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
    });
  } finally {
    reporStore.isLoading = false;
  }
});

watch([selectStartDate, selectEndDate], async ([startDate, endDate]) => {
  if (!startDate || !endDate) return;
  
  if (new Date(startDate) > new Date(endDate)) {
    CallSwal({
      icon: "warning",
      title: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ",
      text: "ວັນທີເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າວັນທີສິ້ນສຸດ",
    });
    return;
  }

  try {
    isLoading.value = true;
    reporStore.from_filter_group.start_date = startDate;
    reporStore.from_filter_group.end_date = endDate;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຊ່ວງວັນທີ",
    });
  } finally {
    isLoading.value = false;
  }
});

onMounted(() => {
  reporStore.getGroupData();
  AssetListStore.GetAssetList();
  masterStore.getPuamsue1();
  devisionStore.GetListData();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    
    <!-- Filter Section -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="bg-primary text-white">
        <v-icon class="mr-2">mdi-filter</v-icon>
        ການກັ່ນຕອງຂໍ້ມູນ
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="2">
            <v-autocomplete
              v-model="selecteAssetType"
              :items="assetType"
              item-title="asset_name_la"
              item-value="coa_id"
              label="ເລືອກປະເພດຊັບສິນ"
              clearable
              :loading="AssetListStore.isLoading"
              prepend-inner-icon="mdi-package-variant"
              variant="outlined"
              density="compact"
              no-data-text="ບໍ່ພົບຂໍ້ມູນ"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.asset_name_la"
                  :subtitle="item.raw.coa_id"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="primary">
                      <v-icon size="small">mdi-package-variant</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="2">
            <v-autocomplete
              v-model="selectStatus"
              label="ສະຖານະຊັບສິນ"
              :items="status"
              clearable
              :loading="isLoading"
              prepend-inner-icon="mdi-list-status"
              item-title="MC_name_la"
              item-value="MC_code"
              variant="outlined"
              density="compact"
              no-data-text="ບໍ່ພົບຂໍ້ມູນ"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.MC_name_la"
                  :subtitle="item.raw.MC_code"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="success">
                      <v-icon size="small">mdi-list-status</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="2">
            <v-autocomplete
              v-model="selectedDevision"
              prepend-inner-icon="mdi-source-branch"
              variant="outlined"
              density="compact"
              label="ພະແນກ"
              :items="devisiondata"
              item-value="div_id"
              item-title="division_name_la"
              clearable
              no-data-text="ບໍ່ພົບຂໍ້ມູນ"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.division_name_la"
                  :subtitle="item.raw.div_id"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="info">
                      <v-icon size="small">mdi-source-branch-check</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="selectStartDate"
              type="date"
              label="ວັນທີເລີ່ມຕົ້ນ"
              prepend-inner-icon="mdi-calendar-start"
              variant="outlined"
              density="compact"
              :max="selectEndDate || undefined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="selectEndDate"
              type="date"
              label="ວັນທີສິ້ນສຸດ"
              prepend-inner-icon="mdi-calendar-end"
              variant="outlined"
              density="compact"
              :min="selectStartDate || undefined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="isLoading || reporStore.isLoading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div class="mt-4 text-h6">ກຳລັງໂຫລດຂໍ້ມູນ...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reportData.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey">mdi-database-off</v-icon>
      <div class="mt-4 text-h6 text-grey">ບໍ່ມີຂໍ້ມູນລາຍງານ</div>
      <div class="text-body-2 text-grey">ກະລຸນາເລືອກເງື່ອນໄຂການຄົ້ນຫາ</div>
    </div>

    <!-- Report Table -->
    <v-card v-else elevation="2">
      <v-card-title class="bg-grey-lighten-4 text-center">
        <v-icon class="mr-2">mdi-table</v-icon>
        ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນຊັບສິນ
      </v-card-title>

      <div class="table-container">
        <table class="report-table">
          <thead>
            <tr class="header-row">
              <th rowspan="2" class="border-cell text-center">ເລກບັນຊີ</th>
              <th rowspan="2" class="border-cell text-center">ເລກທີ່ຜູ້ລົງບັນຊີ</th>
              <th rowspan="2" class="border-cell text-center">ລາຍລະອຽດຊັບສິນ</th>
              <th rowspan="2" class="border-cell text-center">ວັນທີຊື້</th>
              <th rowspan="2" class="border-cell text-center">ລາຄາຊື້</th>
              <th rowspan="2" class="border-cell text-center">ອາຍຸການໃຊ້ງານ</th>
              <th colspan="2" class="border-cell text-center bg-blue-lighten-4">ລາຍການຫັກຄ່າຫຼຸຍຫ້ຽນປັດຈຸບັນ</th>
              <th rowspan="2" class="border-cell text-center">ເຫຼືອຍອດຫັກຄ່າຫຼຸຍຫ້ຽນ</th>
            </tr>
            <tr class="subheader-row">
              <th class="border-cell text-center bg-blue-lighten-4">ວັນທີ</th>
              <th class="border-cell text-center bg-blue-lighten-4">ຈຳນວນເງິນ</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in reportData" :key="index">
              <!-- Asset Main Row -->
              <tr class="asset-main-row">
                <td class="border-cell text-center font-weight-bold">{{ item.asset_list_code }}</td>
                <td class="border-cell text-center">{{ item.asset_serial_no }}</td>
                <td class="border-cell">{{ item.asset_spec || 'ຊັບສິນ' }}</td>
                <td class="border-cell text-center">{{ formatDate(item.dpca_start_date) }}</td>
                <td class="border-cell text-end">{{ formatCurrency(item.asset_value) }}</td>
                <td class="border-cell text-center">{{ item.asset_useful_life }}</td>
                <td class="border-cell"></td>
                <td class="border-cell"></td>
                <td class="border-cell text-end font-weight-bold text-success">
                  {{ formatCurrency(item.asset_salvage_value) }}
                </td>
              </tr>

              <!-- Depreciation Detail Header -->
              <tr class="depreciation-header">
                <td colspan="6" class="border-cell"></td>
                <td colspan="2" class="border-cell text-center bg-blue-lighten-5 font-weight-bold">
                  ລາຍການຫັກຄ່າຫຼຸຍຫ້ຽນປະຈຳເດືອນ
                </td>
                <td class="border-cell text-center bg-blue-lighten-5 font-weight-bold">ຍອດຄົງເຫຼືອ</td>
              </tr>

              <!-- Depreciation Schedule Rows -->
              <tr
                v-for="(schedule, scheduleIndex) in item.depreciation_schedule"
                :key="scheduleIndex"
                class="depreciation-row"
              >
                <td colspan="6" class="border-cell"></td>
                <td class="border-cell text-center">{{ formatDate(schedule.dpca_date) }}</td>
                <td class="border-cell text-end">
                  <span v-if="schedule.dpca_value > 0" class="text-error font-weight-bold">
                    {{ formatCurrency(schedule.dpca_value) }}
                  </span>
                  <span v-else class="text-grey">{{ formatCurrency(schedule.dpca_value) }}</span>
                </td>
                <td class="border-cell text-end font-weight-bold">
                  {{ formatCurrency(schedule.remaining_value) }}
                </td>
              </tr>

              <!-- Separator Row -->
              <tr v-if="index < reportData.length - 1" class="separator-row">
                <td colspan="9" class="border-cell separator-cell"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
  padding: 16px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.border-cell {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  vertical-align: middle;
}

.header-row th {
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 12px 8px;
  font-size: 12px;
}

.subheader-row th {
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 8px;
  font-size: 12px;
}

.asset-main-row {
  background-color: #fafafa;
}

.asset-main-row td {
  font-weight: 500;
}

.depreciation-header {
  background-color: #e3f2fd;
}

.depreciation-row {
  background-color: #ffffff;
}

.depreciation-row:hover {
  background-color: #f8f9fa;
}

.separator-row {
  height: 8px;
}

.separator-cell {
  background-color: #f0f0f0;
  border: none;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.font-weight-bold {
  font-weight: 600;
}

.text-error {
  color: #d32f2f;
}

.text-success {
  color: #2e7d32;
}

.text-grey {
  color: #757575;
}

.bg-blue-lighten-4 {
  background-color: #e1f5fe;
}

.bg-blue-lighten-5 {
  background-color: #f0f9ff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .report-table {
    font-size: 11px;
  }
  
  .border-cell {
    padding: 6px 8px;
  }
  
  .header-row th,
  .subheader-row th {
    padding: 8px 6px;
    font-size: 11px;
  }
}

/* Print styles */
@media print {
  .v-card-title {
    background-color: #f5f5f5 !important;
    color: black !important;
  }
  
  .report-table {
    font-size: 10px;
  }
  
  .border-cell {
    padding: 4px 6px;
  }
}
</style>