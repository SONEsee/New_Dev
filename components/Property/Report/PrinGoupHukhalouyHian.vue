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

// Get filter names for display
const statusInfo = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (!data || !Array.isArray(data) || !selectStatus.value) return null;
  return data.find((item) => item.MC_code === selectStatus.value);
});

const statusName = computed(() => {
  return statusInfo.value ? statusInfo.value.MC_name_la : selectStatus.value;
});

const branchInfo = computed(() => {
  const data = devisionStore.categories;
  if (!data || !Array.isArray(data) || !selectedDevision.value) return null;
  return data.find((item) => item.div_id === selectedDevision.value);
});

const branchName = computed(() => {
  return branchInfo.value ? branchInfo.value.division_name_la : selectedDevision.value;
});

const typeinfo = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (!data || !Array.isArray(data) || !selecteAssetType.value) return null;
  return data.find((item) => item.coa_id === selecteAssetType.value);
});

const typeName = computed(() => {
  return typeinfo.value ? typeinfo.value.asset_name_la : selecteAssetType.value;
});

const formatCurrency = (amount: any) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('lo-LA').format(amount);
};

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

// Print and Export Functions
const printReport = () => {
  window.print();
};

const exportToPDF = () => {
  const printWindow = window.open("", "_blank");
  const reportHtml = document.querySelector(".report-container")?.innerHTML;

  printWindow?.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນ</title>
      <meta charset="UTF-8">
      <style>
        @page { 
          size: A4 landscape; 
          margin: 15mm;
        }
        body { 
          font-family: 'Noto Sans Lao', Arial, sans-serif; 
          font-size: 10px; 
          margin: 0; 
          line-height: 1.3;
        }
        .report-container { max-width: none; margin: 0; padding: 0; }
        .export-actions { display: none !important; }
        .report-header { 
          margin-bottom: 15px; 
          padding-bottom: 10px; 
          border-bottom: 2px solid #333;
          text-align: center;
          page-break-after: avoid;
        }
        .report-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 8px;
        }
        .report-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-top: 10px;
        }
        .filter-info {
          background-color: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          border-left: 3px solid #007bff;
          page-break-inside: avoid;
          page-break-after: avoid;
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 5px;
          font-size: 10px;
        }
        .table-container {
          overflow: visible;
          margin-bottom: 15px;
        }
        .report-table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 8px;
          page-break-inside: auto;
        }
        .report-table th, .report-table td { 
          border: 1px solid #333; 
          padding: 2px 1px;
          text-align: center;
          vertical-align: middle;
        }
        .report-table th { 
          background-color: #f0f0f0; 
          font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        .font-weight-bold { font-weight: bold; }
        .signature-section { 
          display: flex; 
          justify-content: space-around; 
          margin-top: 20px;
        }
        .signature-box { 
          text-align: center; 
          min-width: 120px;
        }
        .signature-line { 
          width: 100px; 
          height: 1px; 
          border-bottom: 1px solid #333; 
          margin: 20px auto 8px;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        ${reportHtml}
      </div>
    </body>
    </html>
  `);

  printWindow?.document.close();
  setTimeout(() => {
    printWindow?.print();
    printWindow?.close();
  }, 250);
};

const exportToExcel = () => {
  const excelData = [
    ["ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນຊັບສິນ"],
    ["ວັນທີ່ລາຍງານ:", new Date().toLocaleDateString("lo-LA")],
    ["ຈຳນວນຊັບສິນທັງໝົດ:", reportData.value.length + " ລາຍການ"],
    [""],
    [
      "ເລກບັນຊີ",
      "ເລກທີ່ຜູ້ລົງບັນຊີ", 
      "ລາຍລະອຽດຊັບສິນ",
      "ວັນທີຊື້",
      "ລາຄາຊື້ (LAK)",
      "ອາຍຸການໃຊ້ງານ",
      "ວັນທີຫັກຄ່າຫຼຸຍຫ້ຽນ",
      "ຈຳນວນເງິນຫັກຄ່າຫຼຸຍຫ້ຽນ (LAK)",
      "ເຫຼືອຍອດຫັກຄ່າຫຼຸຍຫ້ຽນ (LAK)"
    ],
  ];

  reportData.value.forEach((item) => {
    // Add main asset row
    excelData.push([
      item.asset_list_code,
      item.asset_serial_no,
      item.asset_spec,
      formatDate(item.dpca_start_date),
      parseFloat(item.asset_value || "0"),
      item.asset_useful_life + " ປີ",
      "",
      "",
      parseFloat(item.asset_salvage_value || "0")
    ]);

    
    if (item.depreciation_schedule && Array.isArray(item.depreciation_schedule)) {
      item.depreciation_schedule.forEach((schedule:any) => {
        excelData.push([
          "",
          "",
          "",
          "",
          "",
          "",
          formatDate(schedule.dpca_date),
          parseFloat(schedule.dpca_value || 0) as any,
          parseFloat(schedule.remaining_value || "0")
        ]);
      });
    }
  });

  const csvContent = excelData
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນ_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
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
    reporStore.from_filter_group.division_id = newValue;
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
  <div class="pa-4 report-container">
    <GlobalTextTitleLine :title="title" />
    
    <!-- Export Actions -->
    <div class="export-actions mb-4">
      <v-btn
        @click="printReport"
        color="grey-darken-2"
        variant="elevated"
        prepend-icon="mdi-printer"
        class="mr-2"
      >
        ພິມ A4
      </v-btn>

      <v-btn
        @click="exportToPDF"
        color="red-darken-2"
        variant="elevated"
        prepend-icon="mdi-file-pdf-box"
        class="mr-2"
      >
        ສົ່ງອອກ PDF
      </v-btn>

      <v-btn
        @click="exportToExcel"
        color="green-darken-2"
        variant="elevated"
        prepend-icon="mdi-microsoft-excel"
      >
        ສົ່ງອອກ Excel
      </v-btn>
    </div>
   
    <!-- Filter Card -->
    <!-- <v-card class="mb-4" elevation="2">
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
                  :title="`${item.raw.asset_name_la}-${item.raw.asset_code}`"
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
                  :title="`${item.raw.MC_name_la}-${item.raw.MC_code}`"
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
                  :title="`${item.raw.division_name_la}-${item.raw.div_id}`"
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
    </v-card> -->

    <!-- Header Section for Print -->
    <div class="print-header">
      <div class="text-center">
        <p><b>ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</b></p>
        <p><b>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</b></p>
      </div>
      
      <v-row class="mb-4">
        <v-col cols="6" md="6" class="d-flex text-start">
          <div class="text-center">
            <img src="../../../assets/img/logo.png" alt="" width="100" />
            <h4>ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ້ດຽວ</h4>
          </div>
        </v-col>
        <v-col cols="6" md="6" class="align-end">
          <div class="text-end align-end">
            <p>
              <strong>ວັນທີ່ລາຍງານ:</strong>
              {{ new Date().toLocaleDateString("lo-LA") }}
            </p>
            <p>ເລກທີເອກະສານ:...............</p>
          </div>
        </v-col>
      </v-row>

      <div class="report-header">
        <h1 class="report-title">ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນຊັບສິນ</h1>
      </div>

      <!-- Filter Info -->
      <div
        class="filter-info"
        v-if="selecteAssetType !== null || selectStatus !== null || selectStartDate || selectEndDate"
      >
        <div class="filter-grid">
          <div v-if="selecteAssetType"><strong>ປະເພດຊັບສິນ:</strong> {{ typeName }}</div>
          <div v-if="selectStatus">
            <strong>ສະຖານະ:</strong> {{ statusName }}
          </div>
          <div v-if="selectedDevision">
            <strong>ພະແນກ:</strong> {{ branchName }}
          </div>
          <div v-if="selectStartDate"><strong>ວັນທີ່ເລີ່ມຕົ້ນ:</strong> {{ selectStartDate }}</div>
          <div v-if="selectEndDate"><strong>ວັນທີ່ສິ້ນສຸດ:</strong> {{ selectEndDate }}</div>
        </div>
      </div>
    </div>

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
    <div v-else>
      <p class="mb-3"><strong>ຈຳນວນຊັບສິນທັງໝົດ:</strong> {{ reportData.length }} ລາຍການ</p>
      
      <v-card elevation="2">
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

    <!-- Signature Section -->
    <v-row class="mt-8 signature-section">
      <v-col cols="6" class="text-start">
        <div class="signature-box">
          <p><strong>ຜູ້ຈັດຕຳລາຍງານ</strong></p>
          <div class="signature-line"></div>
          <p>ວັນທີ່: ________________</p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.report-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Noto Sans Lao", Arial, sans-serif;
}

.export-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.print-header {
  display: none;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
}

.report-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.filter-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

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
  background-color: #343a40;
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #dee2e6;
}

.subheader-row th {
  background-color: #343a40;
  color: white;
  font-weight: bold;
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

.signature-section {
  margin-top: 40px;
  page-break-inside: avoid;
}

.signature-box {
  text-align: center;
  min-width: 200px;
}

.signature-line {
  width: 150px;
  height: 1px;
  border-bottom: 1px solid #333;
  margin: 40px auto 10px;
}

/* Print styles */
@media print {
  .export-actions {
    display: none !important;
  }

  .pa-4 {
    padding: 0 !important;
  }

  .v-card {
    box-shadow: none !important;
    border: none !important;
  }

  .v-card-title {
    display: none !important;
  }

  .v-card-text {
    padding: 0 !important;
  }

  .print-header {
    display: block !important;
    margin-bottom: 20px;
    page-break-after: avoid;
  }

  .report-container {
    margin: 0;
    padding: 10px;
    max-width: none;
  }

  .report-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #333;
    page-break-after: avoid;
  }

  .report-title {
    font-size: 18px;
    margin-bottom: 5px;
  }

  .filter-info {
    margin-bottom: 10px;
    padding: 8px;
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  .filter-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 5px;
    font-size: 11px;
  }

  .table-container {
    margin-bottom: 15px;
    padding: 0;
    overflow: visible;
  }

  .report-table {
    font-size: 9px;
    page-break-inside: auto;
  }

  .report-table th,
  .report-table td {
    padding: 3px 2px;
    border: 1px solid #333;
  }

  .header-row th,
  .subheader-row th {
    background-color: #f0f0f0 !important;
    color: black !important;
  }

  .report-table thead {
    display: table-row-group;
  }

  .report-table tbody tr {
    page-break-inside: avoid;
  }

  .asset-main-row,
  .depreciation-header,
  .depreciation-row {
    background-color: transparent !important;
  }

  .depreciation-row:hover {
    background-color: transparent !important;
  }

  .signature-section {
    margin-top: 20px;
    page-break-inside: avoid;
    page-break-before: avoid;
  }

  .signature-box {
    min-width: 120px;
    font-size: 12px;
  }

  .signature-line {
    width: 100px;
    margin: 15px auto 5px;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .export-actions {
    flex-direction: column;
  }

  .export-actions .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }

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

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .signature-section .v-col {
    text-align: center !important;
  }
}

@media (max-width: 480px) {
  .report-table {
    font-size: 9px;
  }

  .border-cell {
    padding: 4px 6px;
  }

  .signature-box {
    min-width: auto;
  }
}
</style>