<script setup lang="ts">
const reporStore = useReportDeprecationStore();
const AssetListStore = assetStore();
const masterStore = useMasterStore();

const selectedAssetType = ref(null);
const selectedAssetList = ref(null);
const selectedStatus = ref(null);
const searchQuery = ref("");
const selectStartDate = ref("");
const selectEndDate = ref("");

const isLoading = ref(false);

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

const assetype = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const title = "ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນ";

const reportData = computed(() => {
  const data = reporStore.respons_data_hukhalouyhian;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const handleError = (error: any, message: string) => {
  console.error(error);
  CallSwal({
    icon: "error",
    title: "ເກີດຂໍ້ຜິດພາດ",
    text: message,
  });
};

const fetchReportData = async () => {
  isLoading.value = true;
  try {
    await reporStore.getHukhalouyhian();
  } catch (error) {
    handleError(error, "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ");
  } finally {
    isLoading.value = false;
  }
};

watch(selectedAssetType, async (newValue) => {
  if (newValue) {
    isLoading.value = true;
    try {
      reporStore.from_filter_hukhalouyhian.asset_type_id = newValue;
      await reporStore.getHukhalouyhian();
    } catch (error) {
      handleError(error, "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ");
    } finally {
      isLoading.value = false;
    }
  }
});

watch(selectedStatus, async (newValue) => {
  if (newValue) {
    isLoading.value = true;
    try {
      reporStore.from_filter_hukhalouyhian.asset_status = newValue;
      await reporStore.getHukhalouyhian();
    } catch (error) {
      handleError(error, "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ");
    } finally {
      isLoading.value = false;
    }
  }
});

watch(selectedAssetList, async (newValue) => {
  if (newValue) {
    isLoading.value = true;
    try {
      reporStore.from_filter_hukhalouyhian.asset_list_id_id = newValue;
      await reporStore.getHukhalouyhian();
    } catch (error) {
      handleError(error, "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດລາຍການຊັບສິນ");
    } finally {
      isLoading.value = false;
    }
  }
});

watch([selectStartDate, selectEndDate], async ([startDate, endDate]) => {
  console.log("Date changed:", { startDate, endDate });

  if (!startDate || !endDate) {
    console.log("Missing dates, not filtering");
    return;
  }

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
    console.log("Setting date filter...");

    reporStore.from_filter_hukhalouyhian.start_date = startDate;
    reporStore.from_filter_hukhalouyhian.end_date = endDate;

    console.log("Filter data:", reporStore.from_filter_hukhalouyhian);

    await reporStore.getHukhalouyhian();

    console.log("API call successful");
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
});

const clearFilters = () => {
  selectedAssetType.value = null;
  selectedAssetList.value = null;
  selectedStatus.value = null;
  selectStartDate.value = "";
  selectEndDate.value = "";
  searchQuery.value = "";

 
  reporStore.from_filter_hukhalouyhian = {
    asset_type_id: null,
    asset_status: null,
    asset_list_id_id: null,
    start_date: "",
    end_date: "",
  };

 
  fetchReportData();
};


const hasActiveFilters = computed(() => {
  return (
    selectedAssetType.value ||
    selectedStatus.value ||
    selectedAssetList.value ||
    selectStartDate.value ||
    selectEndDate.value
  );
});

onMounted(async () => {
  try {
    await Promise.all([
      reporStore.getHukhalouyhian(),
      AssetListStore.GetAssetList(),
      masterStore.getPuamsue1(),
    ]);
  } catch (error) {
    handleError(error, "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນເບື້ອງຕົ້ນ");
  }
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-filter-variant</v-icon>
        ກອງຂໍ້ມູນ
        <v-spacer></v-spacer>
        
        <v-chip
          v-if="hasActiveFilters"
          color="primary"
          size="small"
          prepend-icon="mdi-filter"
        >
          ມີການກອງ
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-autocomplete
              :items="assetype"
              item-title="asset_name_la"
              item-value="coa_id"
              v-model="selectedAssetType"
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
              v-model="selectedStatus"
              :items="status"
              item-title="MC_name_la"
              item-value="MC_code"
              label="ເລືອກສະຖານະ"
              clearable
              prepend-inner-icon="mdi-check-circle"
              :loading="isLoading"
            />
          </v-col>

          <v-col cols="12" md="2">
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

          <v-col cols="12" md="2">
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

          <v-col cols="12" md="2">
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-filter-remove"
              :disabled="!hasActiveFilters"
              @click="clearFilters"
              block
            >
              ລ້າງການກອງ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    
    <v-card v-if="reportData.length > 0">
      <v-card-title>
        <v-icon left>mdi-chart-line</v-icon>
        ຜົນລາຍງານ
      </v-card-title>
      <v-card-text>
        <pre>{{ reportData }}</pre>
      </v-card-text>
    </v-card>

    
    <v-card v-else-if="!isLoading">
      <v-card-text class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-database-search</v-icon>
        <div class="text-h6 mt-4 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
        <div class="text-body-2 text-grey">
          ກະລຸນາເລືອກເງື່ອນໄຂການກອງເພື່ອສະແດງຜົນລາຍງານ
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
