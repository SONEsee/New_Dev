<script setup lang="ts">
const title = "ບົດລາຍງານຫັກຄ່າຫຼຸຍຫຽ້ນ";
const AssetListStore = assetStore();
const reportStore = useReportDeprecationStore();
const masterStore = useMasterStore();
const selecteAssetType = ref(null);
const selectStatus = ref(null);
const selectStartDate = ref("");
const selectEndDate = ref("");

const searchQuery = ref("");
const isLoading = ref(false);
const assetTypeList = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const status = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const reportResponse = computed(() => {
  const data = reportStore.response_data_report_deprecation;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

watch(selecteAssetType, async (newValue) => {
  try {
    isLoading.value = true;
    if (newValue) {
      reportStore.form_filter_report_deprecaton.asset_type_id = newValue;
      await reportStore.getReportDeprecation();
    } else {
      reportStore.form_filter_report_deprecaton.asset_type_id = null;
    }
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ",
    });
  } finally {
    isLoading.value = false;
  }
});
watch(selectStatus, async (newValue) => {
  try {
    isLoading.value = true;
    if (newValue && typeof newValue === "string") {
      reportStore.form_filter_report_deprecaton.asset_status = (
        newValue as string
      ).toLowerCase();
      await reportStore.getReportDeprecation();
    } else {
      reportStore.form_filter_report_deprecaton.asset_status = null;
    }
  } catch (error) {
    console.error("Error updating status:", error);
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
    });
  } finally {
    isLoading.value = false;
  }
});
watch([selectStartDate, selectEndDate], async ([startDate, endDate]) => {
  if (startDate && endDate && selecteAssetType.value && selectStatus.value) {
    try {
      isLoading.value = true;
      reportStore.form_filter_report_deprecaton.start_date = startDate;
      reportStore.form_filter_report_deprecaton.end_date = endDate;
      await reportStore.getReportDeprecation();
    } catch (error) {
      console.error("Error updating date range:", error);
      CallSwal({
        icon: "error",
        title: "ເກີດຂໍ້ຜິດພາດ",
        text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຊ່ວງວັນທີ",
      });
    } finally {
      isLoading.value = false;
    }
  }
});

const clearFilters = () => {
  selecteAssetType.value = null;
  selectStatus.value = null;
  selectStartDate.value = "";
  selectEndDate.value = "";
  searchQuery.value = "";
  reportStore.form_filter_report_deprecaton = {
    asset_type_id: null,
    asset_status: null,
    start_date: "",
    end_date: "",
  };
};

const exportReport = () => {
  if (reportResponse.value.length === 0) {
    CallSwal({
      icon: "warning",
      title: "ບໍ່ມີຂໍ້ມູນ",
      text: "ບໍ່ມີຂໍ້ມູນສຳລັບສ່ງອອກ",
    });
    return;
  }

  console.log("Exporting report...", reportResponse.value);
};

onMounted(async () => {
  try {
    await Promise.all([
      masterStore.getPuamsue1(),
      reportStore.getReportDeprecation(),
      AssetListStore.GetAssetList(),
    ]);
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
});
const formatNumber = (value: any) => {
  if (!value && value !== 0) return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  if (num % 1 === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
};
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-filter-variant</v-icon>
        ກອງຂໍ້ມູນ
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-autocomplete
              :items="assetTypeList"
              item-title="asset_name_la"
              item-value="coa_id"
              v-model="selecteAssetType"
              label="ເລືອກປະເພດຊັບສິນ"
              clearable
              :loading="isLoading"
              prepend-inner-icon="mdi-database-search"
              :search-input.sync="searchQuery"
              no-data-text="ບໍ່ພົບຂໍ້ມູນ"
              variant="outlined"
              density="compact"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.asset_name_la"
                  :subtitle="`ID: ${item.raw.coa_id}`"
                >
                  <template v-slot:prepend>
                    <v-avatar size="small" color="primary">
                      <v-icon>mdi-package-variant</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              variant="outlined"
              density="compact"
              v-model="selectStatus"
              :items="status"
              item-title="MC_name_la"
              item-value="MC_code"
              label="ເລືອກສະຖານະ"
              clearable
              prepend-inner-icon="mdi-check-circle"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="selectStartDate"
              type="date"
              label="ວັນທີເລີ່ມຕົ້ນ"
              prepend-inner-icon="mdi-calendar-start"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="selectEndDate"
              type="date"
              label="ວັນທີສິ້ນສຸດ"
              prepend-inner-icon="mdi-calendar-end"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="error"
              variant="outlined"
              @click="clearFilters"
              prepend-icon="mdi-filter-remove"
            >
              ລ້າງການກອງ
            </v-btn>
          </v-col>
        </v-row>

        <v-row class="mt-2"> </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="12" md="6">
            <v-icon left>mdi-chart-line</v-icon>
            ຜົນລາຍງານຊັບສິນຄົງທີ່
            <v-spacer></v-spacer>
            <v-chip
              :color="reportResponse.length > 0 ? 'success' : 'warning'"
              size="small"
            >
              {{ reportResponse.length }} ລາຍການ
            </v-chip>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end">
            <v-btn
              color="primary"
              @click="
                goPath(
                  `/property/report/prin_report_deprecation?status=${selectStatus}&type=${selecteAssetType}&start=${selectStartDate}&end=${selectEndDate}`
                )
              "
            >
              ພິມບົດລາບງານ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <div v-if="isLoading" class="text-center py-4">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <p class="mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
        <div v-else-if="reportResponse.length !== 0">
          <v-table
            style="border: 1px solid"
            class="rounded-lg"
            fixed-header
            height="600px"
          >
            <thead style="border: 1px solid">
              <tr style="border: 1px solid">
                <th>ລຳດັບ</th>
                <th>ເລກທີຊັບສົມລບັດ</th>
                <!-- <th>ເລກທີຜູ້ໃຊ້</th> -->
                <th>ລາຍລະອຽດຊັບສົມບັດ</th>
                <th>ວັນທີຊື້</th>
                <th>ລາຄາ</th>
                <th>ອາຍຸການນຳໃຊ້</th>
                <th>ຫັກຄ່າຫຼູຍຫຽ້ນໃນເດືອນ</th>
                <th>ລວມຫັກຄ່າຫຼູຍຫຽ້ນໃນປີ</th>
                <!-- <th>ລວມຫກຄ່າຫຼູ້ຍຫຽ້ນທັງໝົດ</th> -->
                <th>ຍອດເຫຼືອມູນຄ່າຊັບສິນ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in reportResponse">
                <td>{{ index + 1 }}</td>
                <td>{{ item.asset_list_id }}</td>
                <!-- <td>-</td> -->
                <td>{{ item.asset_spec }}</td>
                <td>{{ item.asset_date }}</td>
                <td>{{ formatNumber(item.asset_value) }}</td>
                <td>{{ item.asset_useful_life }} ປີ</td>
                <td>{{ formatNumber(item.asset_value_remainMonth) }}</td>
                <td>{{ formatNumber(item.asset_accu_dpca_value) }}</td>
                <td>{{ formatNumber(item.asset_value_remain) }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-else-if="reportResponse.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey lighten-2">mdi-database-off</v-icon>
          <p class="text-h6 mt-4 grey--text">ບໍ່ມີຂໍ້ມູນສະແດງ</p>
          <p class="grey--text">ກະລຸນາເລືອກປະເພດຊັບສິນເພື່ອເບິ່ງບົດລາຍງານ</p>
        </div>

        <!-- <v-data-table :items="reportResponse" class="overflow-auto"></v-data-table> -->
        <!-- <pre v-else class="overflow-auto">{{ reportResponse }}</pre> -->
      </v-card-text>
    </v-card>
    <!--  -->
  </div>
</template>

<style scoped>
.v-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 400px;
}
</style>
