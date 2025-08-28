<script setup lang="ts">
const reportStore = useReportDeprecationStore();
const AssetListStore = assetStore();
const masterStore = useMasterStore();
const devisionStore = UseCategoryStore();
const route = useRoute();

const assetype = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
});
const masterdata = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const type = computed(() => {
  const typeValue = route.query.type;
  if (!typeValue || typeValue === "null" || typeValue === "undefined")
    return NaN;
  const parsed = Number(typeValue);
  return isNaN(parsed) ? NaN : parsed;
});
const branch = computed(() => {
  const branchValue = route.query.branch;
  return branchValue && branchValue !== "null" && branchValue !== "undefined"
    ? branchValue
    : NaN;
});
const status = computed(() => {
  const statusValue = route.query.status;
  return statusValue && statusValue !== "null" && statusValue !== "undefined"
    ? statusValue
    : NaN;
});

const start = route.query.start;
const end = route.query.end;

const getCleanType = (value: any) => {
  if (!value || value === "null" || value === "undefined") return null;
  const parsed = Number(value);
  return isNaN(parsed) ? null : parsed;
};

const getCleanString = (value: any) => {
  return value && value !== "null" && value !== "undefined"
    ? String(value)
    : null;
};

const formatNumber = (value: string | number) => {
  if (!value || value === "0.00") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US").format(num);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB");
};

const reportData = computed(() => {
  const data = reportStore.response_data_report_deprecation;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const totalAssetValue = computed(() => {
  return reportData.value.reduce(
    (sum, item) => sum + parseFloat(item.asset_value || "0"),
    0
  );
});

const totalDepreciationValue = computed(() => {
  return reportData.value.reduce(
    (sum, item) => sum + parseFloat(item.asset_accu_dpca_value || "0"),
    0
  );
});

const totalRemainingValue = computed(() => {
  return reportData.value.reduce(
    (sum, item) => sum + parseFloat(item.asset_value_remain || "0"),
    0
  );
});

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
      <title>ບົດລາຍງານການຫຼຸດມູນຄ່າຊັບສິນ</title>
      <meta charset="UTF-8">
      <style>
        @page { 
          size: A4; 
          margin: 15mm;
        }
        body { 
          font-family: 'Noto Sans Lao', Arial, sans-serif; 
          font-size: 11px; 
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
        .filter-info h3 {
          margin: 0 0 5px 0;
          font-size: 12px;
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
        .report-table thead {
          display: table-row-group;
        }
        .report-table tbody tr {
          page-break-inside: avoid;
        }
        .report-table tfoot {
          display: table-row-group;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .total-row { 
          background-color: #e0e0e0 !important; 
          font-weight: bold;
          page-break-inside: avoid;
        }
        .report-footer {
          margin-top: 20px;
          page-break-inside: avoid;
          page-break-before: avoid;
        }
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
        .empty-state, .loading-state {
          text-align: center;
          padding: 30px;
          font-size: 14px;
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
    ["ບົດລາຍງານການຫຼຸດມູນຄ່າຊັບສິນ"],
    ["ວັນທີ່ລາຍງານ:", new Date().toLocaleDateString("lo-LA")],
    ["ຈຳນວນຊັບສິນທັງໝົດ:", reportData.value.length + " ລາຍການ"],
    [""],
    [
      "ລຳດັບ",
      "ລະຫັດຊັບສິນ",
      "ລາຍລະອຽດຊັບສິນ",
      "ວັນທີ່ຊື້",
      "ມູນຄ່າຊັບສິນ (LAK)",
      "ອາຍຸການໃຊ້ງານ",
      "ຄ່າເສື່ອມລາຄາຕໍ່ເດືອນ (LAK)",
      "ຄ່າເສື່ອມລາຄາສະສົມ (LAK)",
      "ມູນຄ່າຄົງເຫຼືອ (LAK)",
    ],
  ];

  reportData.value.forEach((item, index) => {
    excelData.push([
      index + 1,
      item.asset_list_id,
      item.asset_spec,
      formatDate(item.asset_date),
      parseFloat(item.asset_value || "0"),
      item.asset_useful_life + " ປີ",
      parseFloat(item.asset_value_remainMonth || "0"),
      parseFloat(item.asset_accu_dpca_value || "0"),
      parseFloat(item.asset_value_remain || "0"),
    ]);
  });

  excelData.push([
    "",
    "",
    "",
    "ລວມທັງໝົດ:",
    totalAssetValue.value,
    "",
    "",
    totalDepreciationValue.value,
    totalRemainingValue.value,
  ]);

  const csvContent = excelData
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ບົດລາຍງານການຫຼຸດມູນຄ່າຊັບສິນ_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const debouncedFetch = useDebounceFn(() => {
  console.log(
    "Fetching with filters:",
    reportStore.form_filter_report_deprecaton
  );
  reportStore.getReportDeprecation();
}, 300);

watch(
  () => route.query,
  (newQuery) => {
    console.log("Route query changed:", newQuery);

    const cleanType = getCleanType(newQuery.type);
    const cleanStatus = getCleanString(newQuery.status);
    const cleanStart = getCleanString(newQuery.start);
    const cleanEnd = getCleanString(newQuery.end);
    const cleaBranch = getCleanString(newQuery.branch);

    reportStore.form_filter_report_deprecaton.asset_type_id = cleanType;
    reportStore.form_filter_report_deprecaton.asset_status = cleanStatus;
    reportStore.form_filter_report_deprecaton.division_id = cleaBranch;
    reportStore.form_filter_report_deprecaton.start_date = cleanStart ?? "";
    reportStore.form_filter_report_deprecaton.end_date = cleanEnd ?? "";

    console.log("Updated filter:", reportStore.form_filter_report_deprecaton);

    debouncedFetch();
  },
  { immediate: true, deep: true }
);
const statusInfo = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (!data || !Array.isArray(data) || !status.value) return null;

  return data.find((item) => item.MC_code === status.value);
});
const statusName = computed(() => {
  return statusInfo.value ? statusInfo.value.MC_name_la : status.value;
});
const branchInfo = computed(() => {
  const data = devisionStore.categories;
  if (!data || !Array.isArray(data) || !branch.value) return null;
  return data.find((item) => item.div_id === branch.value);
});
const branchName = computed(() => {
  return branchInfo.value ? branchInfo.value.division_name_la : branch.value;
});
const typeinfo = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (!data || !Array.isArray(data) || !type.value) return null;
  return data.find((item) => item.coa_id === type.value);
});
const typeName = computed(() => {
  return typeinfo.value ? typeinfo.value.asset_name_la : type.value;
});
onMounted(() => {
  masterStore.getPuamsue1();
  AssetListStore.GetAssetList();
  devisionStore.GetListData();
});
</script>

<template>
  <div class="report-container">
    <div class="export-actions">
      <button @click="printReport" class="export-btn print-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
          />
        </svg>
        ພິມ A4
      </button>

      <button @click="exportToPDF" class="export-btn pdf-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v1h-1.5V7h3v1.5zM9 9.5h1v-1H9v1z"
          />
        </svg>
        ສົ່ງອອກ PDF
      </button>

      <button @click="exportToExcel" class="export-btn excel-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
          />
        </svg>
        ສົ່ງອອກ Excel
      </button>
    </div>
    <div class="text-center">
      <p><b>ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</b></p>

      <p><b>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</b></p>
    </div>
    <div>
      <v-row>
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
            <p></p>
          </div>
        </v-col>
      </v-row>
    </div>
    <div class="report-header">
      <h1 class="report-title">ບົດລາຍງານຊັບສິນຄົງທີ່</h1>
    </div>

    <div
      class="filter-info"
      v-if="type !== null || status !== null || start || end"
    >
      <div class="filter-grid">
        <div v-if="!isNaN(type)">
          <strong>ປະເພດຊັບສິນ:</strong> {{ typeName }}
        </div>
        <div v-if="status && status !== 'NaN'">
          <strong>ສະຖານະ:</strong> {{ statusName }}
        </div>
        <div v-if="status && status !== 'NaN'">
          <strong>ພະແນກ:</strong> {{ branchName }}
        </div>
        <div v-if="start"><strong>ວັນທີ່ເລີ່ມຕົ້ນ:</strong> {{ start }}</div>
        <div v-if="end"><strong>ວັນທີ່ສິ້ນສຸດ:</strong> {{ end }}</div>
      </div>
    </div>

    <div v-if="reportStore.isLoading" class="loading-state">
      <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <div v-else-if="reportData.length > 0" class="table-container">
      <p><strong>ຈຳນວນຊັບສິນທັງໝົດ:</strong> {{ reportData.length }} ລາຍການ</p>
      <table class="report-table">
        <thead>
          <tr>
            <th>ລຳດັບ</th>
            <th>ລະຫັດຊັບສິນ</th>
            <th>ລາຍລະອຽດຊັບສິນ</th>
            <th>ວັນທີ່ຊື້</th>
            <th>ມູນຄ່າຊັບສິນ (LAK)</th>
            <th>ອາຍຸການໃຊ້ງານ</th>
            <th>ຄ່າເສື່ອມລາຄາຕໍ່ເດືອນ (LAK)</th>
            <th>ຄ່າເສື່ອມລາຄາສະສົມ (LAK)</th>
            <th>ມູນຄ່າຄົງເຫຼືອ (LAK)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in reportData"
            :key="item.asset_list_id"
            class="data-row"
          >
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ item.asset_list_id }}</td>
            <td>{{ item.asset_spec }}</td>
            <td class="text-center">{{ formatDate(item.asset_date) }}</td>
            <td class="text-right">{{ formatNumber(item.asset_value) }}</td>
            <td class="text-center">{{ item.asset_useful_life }} ປີ</td>
            <td class="text-right">
              {{ formatNumber(item.asset_value_remainMonth) }}
            </td>
            <td class="text-right">
              {{ formatNumber(item.asset_accu_dpca_value) }}
            </td>
            <td class="text-right">
              {{ formatNumber(item.asset_value_remain) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" class="text-right font-bold">ລວມທັງໝົດ:</td>
            <td class="text-right font-bold">
              {{ formatNumber(totalAssetValue) }}
            </td>
            <td></td>
            <td></td>
            <td class="text-right font-bold">
              {{ formatNumber(totalDepreciationValue) }}
            </td>
            <td class="text-right font-bold">
              {{ formatNumber(totalRemainingValue) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-else class="empty-state">
      <p>ບໍ່ພົບຂໍ້ມູນຊັບສິນ</p>
      <p class="text-sm">ກະລຸນາປັບປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ</p>
    </div>
    <v-row>
      <v-col cols="6" class="text-start">
        <div class="signature-box">
          <p><strong>ຜູ້ຈັດຕຳລາຍງານ</strong></p>
          <div class="signature-line"></div>
          <p>ວັນທີ່: ________________</p>
        </div>
      </v-col>
      <v-col cols="6" class="text-center">
        <div class="signature-box">
          <p><strong>ຜູ້ອະນຸມັດ</strong></p>
          <div class="signature-line"></div>
          <p>ວັນທີ່: ________________</p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.report-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Noto Sans Lao", Arial, sans-serif;
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

.report-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
}

.export-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.print-btn {
  background-color: #6c757d;
}

.print-btn:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.pdf-btn {
  background-color: #dc3545;
}

.pdf-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.excel-btn {
  background-color: #28a745;
}

.excel-btn:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.export-btn:active {
  transform: translateY(0);
}

.filter-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.filter-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 12px;
}

.report-table th {
  background-color: #343a40;
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #dee2e6;
}

.report-table td {
  padding: 10px 8px;
  border: 1px solid #dee2e6;
  vertical-align: middle;
}

.data-row:nth-child(even) {
  background-color: #f8f9fa;
}

.data-row:hover {
  background-color: #e9ecef;
}

.total-row {
  background-color: #007bff !important;
  color: white;
  font-weight: bold;
}

.total-row td {
  border-color: #0056b3;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state .text-sm {
  font-size: 14px;
  color: #999;
}

.report-footer {
  margin-top: 40px;
  border-top: 1px solid #dee2e6;
  padding-top: 30px;
}

.signature-section {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
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

@media print {
  .export-actions {
    display: none !important;
  }

  .report-container {
    margin: 0;
    padding: 10px;
  }

  .report-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #333;
    page-break-after: avoid;
  }

  .report-title {
    font-size: 16px;
    margin-bottom: 5px;
  }

  .report-info {
    font-size: 11px;
  }

  .filter-info {
    margin-bottom: 10px;
    padding: 8px;
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  .table-container {
    margin-bottom: 15px;
  }

  .report-table {
    font-size: 8px;
    page-break-inside: auto;
  }

  .report-table th,
  .report-table td {
    padding: 2px 1px;
  }

  .report-table thead {
    display: table-row-group;
  }

  .report-table tbody tr {
    page-break-inside: avoid;
  }

  .report-table tfoot {
    display: table-row-group;
  }

  .data-row:hover {
    background-color: transparent;
  }

  .report-footer {
    margin-top: 20px;
    page-break-inside: avoid;
    page-break-before: avoid;
  }

  .signature-section {
    margin-top: 15px;
  }

  .signature-box {
    min-width: 120px;
    font-size: 11px;
  }

  .signature-line {
    width: 100px;
    margin: 15px auto 5px;
  }
}

@media (max-width: 768px) {
  .export-actions {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .report-info {
      flex-direction: column;
      gap: 5px;
    }

    .signature-section {
      flex-direction: column;
      gap: 40px;
    }

    .report-table {
      font-size: 10px;
    }

    .report-table th,
    .report-table td {
      padding: 6px 4px;
    }
  }
}
</style>
