<script setup lang="ts">
const title = "ບົດລາຍງານຫັກຄ່າຫຼຸຍຫຽ້ນ";
const AssetListStore = faAssetStore();
const reportStore = useReportDeprecationStore();


const selecteAssetType = ref(null);
const selectStatus = ref(null);
const selectStartDate = ref("");
const selectEndDate = ref("");


const searchQuery = ref("");
const isLoading = ref(false);


const assetTypeList = computed(() => {
  const data = AssetListStore.response_fa_asset_list;
  let list = [];
  
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    list = [data];
  }
  
  
  if (searchQuery.value) {
    return list.filter(item => 
      item.asset_spec && 
      item.asset_spec.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return list;
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
      console.log("Asset type updated:", newValue);
    } else {
      reportStore.form_filter_report_deprecaton.asset_type_id = null;
      reportStore.response_data_report_deprecation = [];
    }
  } catch (error) {
    console.error("Error updating asset type:", error);
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ",
    });
  } finally {
    isLoading.value = false;
  }
});


watch([selectStartDate, selectEndDate], async ([startDate, endDate]) => {
  if (startDate && endDate && selecteAssetType.value) {
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

// ຟັງຊັນລ້າງການເລືອກ
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

// ຟັງຊັນສ່ງອອກຂໍ້ມູນ
const exportReport = () => {
  if (reportResponse.value.length === 0) {
    CallSwal({
      icon: "warning",
      title: "ບໍ່ມີຂໍ້ມູນ",
      text: "ບໍ່ມີຂໍ້ມູນສຳລັບສ່ງອອກ",
    });
    return;
  }
  
  // ໃສ່ໂຄດສ່ງອອກຢູ່ທີ່ນີ້
  console.log("Exporting report...", reportResponse.value);
};

onMounted(async () => {
  try {
    await Promise.all([
      reportStore.getReportDeprecation(),
      AssetListStore.GetFaAssetList()
    ]);
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    
    <!-- ແຖບຄົ້ນຫາ ແລະ ກອງຂໍ້ມູນ -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-filter-variant</v-icon>
        ກອງຂໍ້ມູນ
      </v-card-title>
      <v-card-text>
        <v-row>
          <!-- ເລືອກປະເພດຊັບສິນ -->
          <v-col cols="12" md="4">
            <v-autocomplete
              :items="assetTypeList"
              item-title="asset_spec"
              item-value="asset_type_id"
              v-model="selecteAssetType"
              label="ເລືອກປະເພດຊັບສິນ"
              clearable
              :loading="isLoading"
              prepend-inner-icon="mdi-database-search"
              :search-input.sync="searchQuery"
              no-data-text="ບໍ່ພົບຂໍ້ມູນ"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.asset_spec"
                  :subtitle="`ID: ${item.raw.asset_type_id}`"
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

          <!-- ເລືອກສະຖານະ -->
          <v-col cols="12" md="4">
            <v-select
              v-model="selectStatus"
              :items="[
                { text: 'ທັງໝົດ', value: null },
                { text: 'ໃຊ້ງານ', value: 'active' },
                { text: 'ບໍ່ໃຊ້ງານ', value: 'inactive' },
                { text: 'ຫັກຄ່າຫຼຸຍຫຽ້ນແລ້ວ', value: 'deprecated' }
              ]"
              item-title="text"
              item-value="value"
              label="ເລືອກສະຖານະ"
              clearable
              prepend-inner-icon="mdi-check-circle"
            ></v-select>
          </v-col>

          <!-- ວັນທີເລີ່ມຕົ້ນ -->
          <v-col cols="12" md="2">
            <v-text-field
              v-model="selectStartDate"
              type="date"
              label="ວັນທີເລີ່ມຕົ້ນ"
              prepend-inner-icon="mdi-calendar-start"
            ></v-text-field>
          </v-col>

          <!-- ວັນທີສິ້ນສຸດ -->
          <v-col cols="12" md="2">
            <v-text-field
              v-model="selectEndDate"
              type="date"
              label="ວັນທີສິ້ນສຸດ"
              prepend-inner-icon="mdi-calendar-end"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- ປຸ່ມຄວບຄຸມ -->
        <v-row class="mt-2">
          <v-col>
            <v-btn
              color="error"
              variant="outlined"
              @click="clearFilters"
              prepend-icon="mdi-filter-remove"
            >
              ລ້າງການກອງ
            </v-btn>
            
            <v-btn
              color="success"
              class="ml-2"
              @click="exportReport"
              :disabled="reportResponse.length === 0"
              prepend-icon="mdi-download"
            >
              ສ່ງອອກບົດລາຍງານ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ສະແດງຜົນບົດລາຍງານ -->
    <v-card>
      <v-card-title>
        <v-icon left>mdi-chart-line</v-icon>
        ຜົນລາຍງານຫັກຄ່າຫຼຸຍຫຽ້ນ
        <v-spacer></v-spacer>
        <v-chip 
          :color="reportResponse.length > 0 ? 'success' : 'warning'"
          size="small"
        >
          {{ reportResponse.length }} ລາຍການ
        </v-chip>
      </v-card-title>
      
      <v-card-text>
        <div v-if="isLoading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
        
        <div v-else-if="reportResponse.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey lighten-2">mdi-database-off</v-icon>
          <p class="text-h6 mt-4 grey--text">ບໍ່ມີຂໍ້ມູນສະແດງ</p>
          <p class="grey--text">ກະລຸນາເລືອກປະເພດຊັບສິນເພື່ອເບິ່ງບົດລາຍງານ</p>
        </div>
        
        <pre v-else class="overflow-auto">{{ reportResponse }}</pre>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.v-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 400px;
}
</style>