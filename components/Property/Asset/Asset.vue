<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

const router = useRouter();

const assetStoreInstance = assetStore();
const count = computed(()=>{
  return assetStoreInstance.response_asset_list;
})
const mockData = computed(() => {
  return assetStoreInstance.response_asset_list;
});

const proppertyStore = propertyStore();
const mockData1 = computed(() => {
  return proppertyStore.respons_data_property_category || [];
});

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.Record_Status === "O" ? "C" : "O";
    const statusText = item.Record_Status === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະຊັບສິນນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });

    if (notification.isConfirmed) {
      loading.value = true;
      await assetStoreInstance.UpdateAssetStatus(item.asset_id, newStatus);
      await refreshData();
      successMessage.value = `ປ່ຽນສະຖານະຊັບສິນສຳເລັດແລ້ວ`;
      showSuccess.value = true;
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

const search = ref("");
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAssetType = ref("all");

const SELECTED_ASSET_TYPE_KEY = "selected_asset_type_filter";

const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();

const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});

const title = "ຈັດການຊັບສິນ";

const headers = computed(() => [
  {
    title: "ລະຫັດຊັບສິນ",
    value: "asset_code",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ຊື່ຊັບສິນ (ລາວ)",
    value: "asset_name_la",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-h6",
  },
  {
    title: "ຊື່ຊັບສິນ (ອັງກິດ)",
    value: "asset_name_en",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-subtitle-1",
  },
  {
    title: "ປະເພດຊັບສິນ",
    value: "asset_type_detail",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ເວລາເພີ່ມ",
    value: "Maker_DT_Stamp",
    align: "center",
    sortable: true,
    filterable: false,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ເວລາແກ້ໄຂ",
    value: "updated_at",
    align: "center",
    sortable: true,
    filterable: false,
    width: "150px",
    class: "text-center",
  },
  ...(canRecordStatus.value
    ? [
        {
          title: "ສະຖານະ",
          value: "RECORD_STAT",
          align: "center",
          sortable: true,
          filterable: true,
          width: "120px",
          class: "text-center",
        },
      ]
    : []),
  ...(canView.value
    ? [
        {
          title: "ເບິ່ງ",
          value: "view",
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
  ...(canEdit.value
    ? [
        {
          title: "ແກ້ໄຂ",
          value: "edit",
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
  ...(canDelete.value
    ? [
        {
          title: "ລົບ",
          value: "delete",
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
]);

const filteredData = computed(() => {
  console.log("🔍 Computing filtered data...");

  let data = mockData.value || [];
  console.log("📊 Initial data length:", data.length);

  // Filter by asset type
  if (selectedAssetType.value && selectedAssetType.value !== "all") {
    const beforeFilter = data.length;
    data = data.filter((item) => {
      const assetTypeCode = item.asset_type_detail?.type_code;
      return assetTypeCode === selectedAssetType.value;
    });
    console.log(
      `🏷️ After asset type filter: ${beforeFilter} -> ${data.length}`
    );
  }

  // Filter by search term
  if (search.value && search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim();
    const beforeFilter = data.length;
    data = data.filter(
      (item) =>
        item.asset_name_la?.toLowerCase().includes(searchTerm) ||
        item.asset_name_en?.toLowerCase().includes(searchTerm) ||
        item.asset_code?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
    );
    console.log(`🔍 After search filter: ${beforeFilter} -> ${data.length}`);
  }

  console.log("✅ Final filtered data length:", data.length);
  return data;
});

const formatDate = (date: Date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (value: number) => {
  if (!value) return "-";
  return new Intl.NumberFormat("lo-LA").format(value) + " ກີບ";
};

const getAssetTypeColor = (typeId: string) => {
  const colors = {
    "1": "success",
    "2": "error",
    "3": "primary",
    "4": "info",
    "5": "warning",
  };
  return colors[typeId as keyof typeof colors] || "grey";
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບຊັບສິນ "${item.asset_name_la}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      loading.value = true;
      await assetStoreInstance.DeleteAsset(item.coa_id);
      await refreshData();
      successMessage.value = `ລຶບຊັບສິນ "${item.asset_name_la}" ສຳເລັດແລ້ວ`;
      showSuccess.value = true;
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຊັບສິນ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

const clearFilters = async () => {
  try {
    loading.value = true;
    console.log("🧹 Clearing all filters...");

    selectedAssetType.value = "all";
    search.value = "";
    localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);

    await refreshData();

    console.log("✅ Filters cleared and data reloaded");
    successMessage.value = "ເຄລຍການກັ່ນຕອງສຳເລັດແລ້ວ";
    showSuccess.value = true;
  } catch (error) {
    console.error("❌ Error clearing filters:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການເຄລຍການກັ່ນຕອງ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// ✅ ເພີ່ມ refreshData function
const refreshData = async () => {
  try {
    console.log("🔄 Refreshing data...");
    await Promise.all([
      assetStoreInstance.GetAssetList(),
      proppertyStore.GetPropertyCategoryById(),
    ]);
    console.log("✅ Data refreshed successfully");
  } catch (error) {
    console.error("❌ Error refreshing data:", error);
    throw error;
  }
};

const debugData = () => {
  console.log("🐛 === DEBUG INFO ===");
  console.log("📊 mockData (assets):", mockData.value);
  console.log("🏷️ mockData1 (property types):", mockData1.value);
  console.log("🔍 selectedAssetType:", selectedAssetType.value);
  console.log("🔍 search:", search.value);
  console.log("📋 filteredData:", filteredData.value);
  console.log("📏 filteredData length:", filteredData.value?.length);
  console.log("🛠️ canAdd:", canAdd.value);
  console.log("🛠️ canEdit:", canEdit.value);
  console.log("🛠️ canDelete:", canDelete.value);
  console.log("🛠️ canView:", canView.value);
  console.log("🛠️ canRecordStatus:", canRecordStatus.value);
  console.log("🐛 ==================");
};

const loadSavedAssetTypeSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_ASSET_TYPE_KEY);
    if (saved) {
      selectedAssetType.value = saved;
      console.log("💾 Loaded saved asset type:", saved);
    }
  } catch (error) {
    console.error("❌ Failed to load saved asset type selection:", error);
  }
};

const saveAssetTypeSelection = (assetType: string) => {
  try {
    if (assetType && assetType !== "all") {
      localStorage.setItem(SELECTED_ASSET_TYPE_KEY, assetType);
      console.log("💾 Saved asset type selection:", assetType);
    } else {
      localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);
      console.log("💾 Removed saved asset type selection");
    }
  } catch (error) {
    console.error("❌ Failed to save asset type selection:", error);
  }
};

const goToCreateAssetWithType = () => {
  if (selectedAssetType.value && selectedAssetType.value !== "all") {
    const assetTypes = mockData1.value || [];
    const selectedType = assetTypes.find(
      (type) => type.type_code === selectedAssetType.value
    );

    router.push({
      path: "/property/asset/create",
      query: {
        asset_type_name: selectedAssetType.value,
        asset_type_id: selectedType ? selectedType.type_id : "",
      },
    });
  } else {
    goPath(`/property/asset/create`);
  }
};

watch(selectedAssetType, (newValue) => {
  console.log("👁️ Asset type changed to:", newValue);
  saveAssetTypeSelection(newValue);
});

watch(search, (newValue) => {
  console.log("🔍 Search changed to:", newValue);
});

onMounted(async () => {
  console.log("🚀 Component mounted, initializing...");
  loading.value = true;

  try {
    initializeRole();

    await Promise.all([
      proppertyStore.GetPropertyCategoryById(),
      assetStoreInstance.GetAssetList(),
      roleStore.GetRoleDetail(),
    ]);

    loadSavedAssetTypeSelection();

    console.log("✅ All data loaded successfully");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <GlobalTextTitleLine :title="title" />

  <!-- Debug Info - ສາມາດເອົາອອກໄດ້ -->
  <!-- 
  <v-card class="mb-4 pa-4" color="grey-lighten-4">
    <v-card-title class="text-h6">🐛 Debug Info</v-card-title>
    <v-card-text>
      <div class="d-flex flex-wrap ga-2">
        <v-chip size="small" color="primary">
          Assets: {{ mockData?.length || 0 }}
        </v-chip>
        <v-chip size="small" color="secondary">
          Types: {{ mockData1?.length || 0 }}
        </v-chip>
        <v-chip size="small" color="success">
          Filtered: {{ filteredData?.length || 0 }}
        </v-chip>
        <v-chip size="small" color="warning">
          Selected Type: {{ selectedAssetType }}
        </v-chip>
      </div>
      <v-btn size="small" color="info" @click="debugData" class="mt-2">
        Show Debug Log
      </v-btn>
    </v-card-text>
  </v-card>
  -->

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="2">
        <div class="d-flex">
          <v-btn
            color="primary"
            @click="goToCreateAssetWithType()"
            v-if="canAdd"
            :loading="loading"
          >
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຊັບສິນໃໝ່
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="4" class="text-no-wrap">
        <v-select
          v-model="selectedAssetType"
          :items="[
            { type_id: 'all', type_name_la: 'ທັງໝົດ', type_code: 'all' },
            ...(mockData1 || []),
          ]"
          item-title="type_name_la"
          item-value="type_code"
          label="ປະເພດຊັບສິນ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກປະເພດຊັບສິນ"
          :loading="loading"
        >
          <!-- <template v-slot:selection="{ item }">
            <v-chip size="small" :color="item.raw.type_code === 'all' ? 'primary' : 'secondary'">
              {{ item.raw.type_name_la }}
            </v-chip>
          </template> -->
          <template v-slot:selection="{ item }">
            {{ item.raw.type_name_la }}({{ item.raw.type_code }})
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.type_name_la}(${item.raw.type_code})`"
            />
          </template>
        </v-select>
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່ລາວ, ຊື່ອັງກິດ..."
        />
      </v-col>

      <v-col cols="12" md="2">
        <div class="d-flex flex-column ga-2">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearFilters"
            :loading="loading"
            block
          >
            <v-icon class="mr-2">mdi-filter-remove</v-icon>
            ເຄລຍການກັ່ນຕອງ
          </v-btn>

          <!-- <v-btn
            color="primary"
            variant="outlined"
            @click="refreshData"
            :loading="loading"
            block
          >
            <v-icon class="mr-2">mdi-refresh</v-icon>
            ໂຫຼດໃໝ່
          </v-btn> -->
        </div>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredData || []"
      :loading="loading"
      class="text-no-wrap"
      :items-per-page="10"
      :search="search"
    >
      <!-- Headers -->
      <template v-slot:header.asset_code="{ column }">
        <v-icon start>mdi-barcode</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_name_la="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_name_en="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_type_detail="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.Maker_DT_Stamp="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.updated_at="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.RECORD_STAT="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.view="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.edit="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.delete="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <!-- Table Items -->
      <template v-slot:item.asset_code="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.asset_code }}
        </v-chip>
      </template>

      <template v-slot:item.asset_name_la="{ item }">
        <div>
          <div class="font-weight-bold">{{ item.asset_name_la }}</div>
          <div class="text-caption text-grey">{{ item.asset_name_en }}</div>
        </div>
      </template>

      <template v-slot:item.asset_name_en="{ item }">
        <span class="text-grey-darken-1">{{ item.asset_name_en }}</span>
      </template>

      <template v-slot:item.asset_type_detail="{ item }">
        <div class="text-center">
          <v-chip
            :color="getAssetTypeColor(item.asset_type_detail?.type_name_la)"
            variant="flat"
            size="small"
          >
            {{ item.asset_type_detail?.type_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.Maker_DT_Stamp="{ item }">
        <div class="text-center">
          <v-chip size="small" variant="outlined" color="success">
            {{ formatDate(item.Maker_DT_Stamp) }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div class="text-center">
          <v-chip size="small" variant="outlined" color="info">
            {{ formatDate(item.updated_at) }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.RECORD_STAT="{ item }">
        <div class="text-center">
          <v-btn
            v-if="item.RECORD_STAT === 'O'"
            flat
            @click="handleSubmit(item)"
            :loading="loading"
          >
            <v-icon color="success">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.RECORD_STAT === 'C'"
            flat
            @click="handleSubmit(item)"
            :loading="loading"
          >
            <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.view="{ item }">
        <v-btn
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="
            goPath(`/property/asset/detail?asset_code=${item.asset_code}`)
          "
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="
            goPath(
              `/property/asset/edit?asset_code=${item.asset_code}&asset_id=${item.coa_id}`
            )
          "
        />
      </template>

      <template v-slot:item.delete="{ item }">
        <v-btn
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="confirmDelete(item)"
        />
      </template>

      <template v-slot:no-data>
        <div class="text-center pa-4">
          <v-icon size="64" color="grey">mdi-database-off-outline</v-icon>
          <p class="text-h6 text-grey mt-2">ບໍ່ມີຂໍ້ມູນ</p>
          <p class="text-body-2 text-grey">
            ກະລຸນາລອງໂຫຼດໃໝ່ ຫຼືເຄລຍການກັ່ນຕອງ
          </p>
          <v-btn color="primary" @click="refreshData" :loading="loading">
            <v-icon class="mr-2">mdi-refresh</v-icon>
            ໂຫຼດໃໝ່
          </v-btn>
        </div>
      </template>

      <!-- Loading slot -->
      <template v-slot:loading>
        <div class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-body-1 mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </template>
    </v-data-table>
  </v-col>

  <v-snackbar
    v-model="showSuccess"
    color="success"
    timeout="3000"
    location="top"
  >
    <v-icon class="mr-2">mdi-check-circle</v-icon>
    {{ successMessage }}
  </v-snackbar>

  <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
    <v-icon class="mr-2">mdi-alert-circle</v-icon>
    {{ errorMessage }}
  </v-snackbar>
</template>
