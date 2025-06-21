<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

// ⭐ ເພີ່ມ router
const router = useRouter();

const assetStoreInstance = assetStore();
const mockData =  computed(()=>{
    return assetStoreInstance.response_asset_list;
})
const proppertyStore = propertyStore();
const mockData1 =  computed(()=>{
  return proppertyStore.respons_data_property_category || []
})

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.RECORD_STAT === "O" ? "C" : "O";
    const statusText = newStatus === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະຊັບສິນນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await assetStoreInstance.UpdateAssetStatus(
        item.asset_id,
        newStatus
      );
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const search = ref("");
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAssetType = ref("all");

// ⭐ ເພີ່ມ localStorage key
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
  // {
  //   title: "ມູນຄ່າ",
  //   value: "value",
  //   align: "end",
  //   sortable: true,
  //   filterable: false,
  //   width: "120px",
  //   class: "text-end",
  // },
  // {
  //   title: "ສະຖານທີ່",
  //   value: "location",
  //   align: "center",
  //   sortable: true,
  //   filterable: true,
  //   width: "150px",
  //   class: "text-center",
  // },
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
  let data = mockData.value || [];

  if (selectedAssetType.value !== "all") {
    data = data.filter(
      (item) => item.asset_type_detail?.type_code === selectedAssetType.value // ⭐ ປ່ຽນເປັນ type_code
    );
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.asset_name_la?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_name_en?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_code?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.value.toLowerCase())
    );
  }

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
    "1": "success", // ເຄື່ອງຈັກ
    "2": "error",   // ພາຫານະ
    "3": "primary", // ອຸປະກອນ IT
    "4": "info",    // ເຟີນິເຈີ
    "5": "warning", // ອາຄານ
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
      await assetStoreInstance.DeleteAsset(item.coa_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedAssetType.value = "all";
  search.value = "";
  
  localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);
};


const loadSavedAssetTypeSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_ASSET_TYPE_KEY);
    if (saved) {
      selectedAssetType.value = saved;
    }
  } catch (error) {
    console.error("Failed to load saved asset type selection:", error);
  }
};


const saveAssetTypeSelection = (assetType: string) => {
  try {
    if (assetType && assetType !== "all") {
      localStorage.setItem(SELECTED_ASSET_TYPE_KEY, assetType);
    } else {
      localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);
    }
  } catch (error) {
    console.error("Failed to save asset type selection:", error);
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
        asset_type_id: selectedAssetType.value,
        asset_type_name: selectedType ? selectedType.type_id : "",
      },
    });
  } else {

    goPath(`/property/asset/create`);
  }
};


watch(
  selectedAssetType,
  (newValue) => {
    saveAssetTypeSelection(newValue);
  }
);

onMounted(async () => {
   proppertyStore.GetPropertyCategoryById();
    assetStoreInstance.GetAssetList()
  loading.value = true;
  try {
    initializeRole();
    roleStore.GetRoleDetail();
    
    
    loadSavedAssetTypeSelection();
    
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <GlobalTextTitleLine :title="title" />
{{ mockData1 }}
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex">
     
          <v-btn
            color="primary"
            @click="goToCreateAssetWithType()"
            v-if="canAdd"
          >
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຊັບສິນໃໝ່
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-select
          v-model="selectedAssetType"
          :items="[{ type_id: 'all', type_name_la: 'ທັງໝົດ' }, ...(mockData1 || [])]"
          item-title="type_name_la"
          item-value="type_code"
          label="ປະເພດຊັບສິນ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກປະເພດຊັບສິນ"
          :loading="loading"
        ></v-select>
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
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredData || []"
      class="text-no-wrap"
    >
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

      <template v-slot:header.value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.location="{ column }">
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
            :color="getAssetTypeColor(item.asset_type_detail.type_name_la)"
            variant="flat"
            size="small"
          >
            {{ item.asset_type_detail?.type_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.value="{ item }">
        <div class="text-end font-weight-bold text-success">
          {{ formatCurrency(item.value) }}
        </div>
      </template>

      <template v-slot:item.location="{ item }">
        <div class="text-center">
          <v-chip size="small" variant="outlined">
            {{ item.location || "-" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.Maker_DT_Stamp="{ item }">
        {{ formatDate(item.Maker_DT_Stamp) }}
      </template>

      <template v-slot:item.updated_at="{ item }">
        {{ formatDate(item.updated_at) }}
      </template>

      <template v-slot:item.RECORD_STAT="{ item }">
        <div>
          <v-btn
            v-if="item.RECORD_STAT === 'O'"
            flat
            @click="handleSubmit(item)"
          >
            <v-icon color="info">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.RECORD_STAT === 'C'"
            flat
            @click="handleSubmit(item)"
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
          @click="goPath(`/property/asset/detail?asset_code=${item.asset_code}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/asset/edit?asset_code=${item.asset_code}&asset_id=${item.coa_id}`)"
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