<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { CallSwal } from "#build/imports";
const masterStore = useMasterStore();
const assetStores = assetStore();
const faAssetStoreInstance = faAssetStore();
const typeAssetStore = propertyStore();
const masterdata = computed(() => {
  const response = masterStore.resposne_status_puamsuepuamkrsang;
  return response?.MasterCodes ?? [];
});
const response = computed(() => {
  return assetStores.response_asset_list || [];
});
// const mockData = computed(() => {
//   return faAssetStoreInstance.response_fa_asset_list || [];
// });
// const mockData = computed(() => {
//   const data = faAssetStoreInstance.response_fa_asset_list || [];
//   return data.filter(item => 
//     item.asset_status === "AC" && 
//     item.Auth_Status_ARC === "A"
//   );
// });
const mockData = computed(() => {
  const data = faAssetStoreInstance.response_fa_asset_list || [];
  return data.filter(item => 
    !(item.asset_status === "AC" && item.Auth_Status_ARC !== "A")
  );
});
const STORAGE_KEY = "asset_filters";

const loadFiltersFromStorage = () => {
  try {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      selectedStatus.value = filters.selectedStatus || "all";
      selectedassetCode.value = filters.selectedassetCode || "all";
      search.value = filters.search || "";
    }
  } catch (error) {
    console.error("Error loading filters from localStorage:", error);
  }
};

const saveFiltersToStorage = () => {
  try {
    const filters = {
      selectedStatus: selectedStatus.value,
      selectedassetCode: selectedassetCode.value,
      search: search.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Error saving filters to localStorage:", error);
  }
};

const search = ref("");
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedStatus = ref("all");
const selectedassetCode = ref("all");

watch(
  [selectedStatus, selectedassetCode, search],
  () => {
    saveFiltersToStorage();
  },
  { deep: true }
);

onMounted(() => {
  assetStores.GetAssetList();
  typeAssetStore.GetPropertyCategoryById();
  faAssetStoreInstance.GetFaAssetList();
});

const handleStatusChange = async (item: any, newStatus: string) => {
  try {
    const statusTexts = {
      ACTIVE: "ເປີດໃຊ້ງານ",
      INACTIVE: "ປິດໃຊ້ງານ",
      MAINTENANCE: "ບຳລຸງຮັກສາ",
      DISPOSED: "ຖອນຈຳໜ່າຍ",
    };

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການປ່ຽນສະຖານະເປັນ "${
        statusTexts[newStatus as keyof typeof statusTexts]
      }" ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await faAssetStoreInstance.UpdateAssetStatus(item.id, newStatus as any);
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

const calculateDepreciation = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການຄິດເສື່ອມລາຄາສຳລັບຊັບສົມບັດນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await faAssetStoreInstance.CalculateDepreciation(item.id);
    }
  } catch (error) {
    console.error("Error calculating depreciation:", error);
  }
};

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

const title = "ຈັດການຊັບສົມບັດພວມຊື້ພວມກໍ່ສ້າງ";



const currencies = [
  { title: "ກີບ (LAK)", value: "LAK" },
  { title: "ໂດລາ (USD)", value: "USD" },
  { title: "ບາດ (THB)", value: "THB" },
];

const headers = computed(() => [
  {
    title: "ລະຫັດ",
    value: "asset_list_id",
    align: "start",
    sortable: true,
    filterable: true,
    width: "80px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ປະເພດຊັບສົມບັດ",
    value: "asset_type_id",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
  },

  {
    title: "ລາຍລະອຽດສົມບັດ",
    value: "asset_spec",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-h6",
  },

  {
    title: "ມູນຄ່າເລີ່ມຕົ້ນ",
    value: "asset_value",
    align: "end",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-end",
  },
  {
    title: "ມູນຄ່າຍັງເຫຼືອ",
    value: "asset_value_remain",
    align: "end",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-end",
  },
  // {
  //   title: "ມູນຄ່າສະສົມ",
  //   value: "asset_accu_dpca_value",
  //   align: "center",
  //   sortable: true,
  //   filterable: true,
  //   width: "100px",
  //   class: "text-center",
  // },
  {
    title: "ມູນຄ່າຕໍ່ເດືອນ",
    value: "asset_value_remainMonth",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ປະເພດການຈ່າຍ",
    value: "type_of_pay",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ວັນທີ່ໄດ້ຮັບ",
    value: "asset_date",
    align: "center",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-center",
  },

  {
    title: "ຂັ້ນຕອນດຳເນີນການ",
    value: "asset_status",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ສະຖານະ",
    value: "Auth_Status",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },

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
  // {
  //   title: "ຄິດເສື່ອມ",
  //   value: "depreciation",
  //   align: "center",
  //   sortable: false,
  //   filterable: false,
  //   width: "80px",
  //   class: "text-center",
  // },
]);

const filteredData = computed(() => {
  let data = mockData.value;

  if (!Array.isArray(data)) {
    return [];
  }

  if (selectedStatus.value !== "all") {
    data = data.filter((item) => item.asset_status === selectedStatus.value);
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.asset_tag?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_serial_no
          ?.toLowerCase()
          .includes(search.value.toLowerCase()) ||
        item.asset_chart?.asset_name
          ?.toLowerCase()
          .includes(search.value.toLowerCase()) ||
        item.asset_spec?.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  if (selectedassetCode.value !== "all") {
    data = data.filter(
      (item) => item.asset_id_detail?.coa_id === selectedassetCode.value
    );
  }

  return data;
});

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (value: number, currency: string) => {
  const symbols = { LAK: "₭", USD: "$", THB: "฿" };
  const formatter = new Intl.NumberFormat("lo-LA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbols[currency as keyof typeof symbols] || ""} ${formatter.format(
    value
  )}`;
};

const getStatusColor = (status: string) => {
  const colors = {
    AC: "success",
    IA: "warning",
    MT: "info",
    DS: "error",
    UC: "primary",
    DM: "secondary",
  };
  return colors[status as keyof typeof colors] || "grey";
};

const getStatusText = (status: string) => {
  const texts = {
    AC: "ເປີດໃຊ້ງານ",
    IA: "ປິດໃຊ້ງານ",
    MT: "ບຳລຸງຮັກສາ",
    DS: "ຖອນຈຳໜ່າຍ",
    UC: "ພວມຊື້ພວມກໍ່ສ້າງ",
    DM: "ເສຍຫາຍ",
  };
  return texts[status as keyof typeof texts] || status;
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບຊັບສົມບັດ "${item.asset_tag}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      await faAssetStoreInstance.DeleteFaAsset(item.asset_list_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedStatus.value = "all";
  selectedassetCode.value = "all";
  search.value = "";

 
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing filters from localStorage:", error);
  }
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  if (num % 1 === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    loadFiltersFromStorage();

    assetStores.GetAssetList();
    typeAssetStore.GetPropertyCategoryById();
    faAssetStoreInstance.GetFaAssetList();
    masterStore.getPuamsue();

    initializeRole();
    roleStore.GetRoleDetail();

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
  <div class="pa-2">
    <GlobalTextTitleLine :title="title" />
    <pre>
  <!-- {{ masterdata }} -->
<!-- {{ response }} -->
</pre>
    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="2">
          <div class="d-flex">
            <v-btn
              color="primary"
              @click="
                goPath(
                  `/property/faasset/create${
                    selectedassetCode !== 'all'
                      ? '?asset_type_id=' + selectedassetCode
                      : ''
                  }`
                )
              "
              v-if="canAdd"
            >
              <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຊັບສົມບັດ
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="3" class="text-no-wrap">
          <v-autocomplete
            v-model="selectedassetCode"
            :items="response || []"
            item-title="asset_name_la"
            item-value="coa_id"
            label="ເລືອກຕາມປະເພດຊັບສົມບັດຍອ່ຍ"
            variant="outlined"
            density="compact"
            clearable
            placeholder="ເລືອກສະຖານະ"
            :loading="loading"
          ></v-autocomplete>
        </v-col>

        <v-col cols="12" md="3" class="text-no-wrap">
          <v-autocomplete
            v-model="selectedStatus"
            :items="masterdata"
            item-title="MC_name_la"
            item-value="MC_code"
            label="ສະຖານະຊັບສົມບັດ"
            variant="outlined"
            density="compact"
            clearable
            placeholder="ເລືອກສະຖານະ"
            :loading="loading"
          ></v-autocomplete>
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="search"
            label="ຄົ້ນຫາ"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            placeholder="ຄົ້ນຫາຕາມປ້າຍ, Serial, ຊື່ຊັບສົມບັດ..."
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
        <template v-slot:header.asset_list_id="{ column }">
          <v-icon start>mdi-identifier</v-icon>
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_spec="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>
        <template v-slot:header.asset_type_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_serial_no="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.type_of_pay="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_value_remainMonth="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_date="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_value="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_value_remain="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_status="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.has_depreciation="{ column }">
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

        <template v-slot:header.depreciation="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>
        <template v-slot:header.Auth_Status="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>
        <template v-slot:header.asset_accu_dpca_value="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:item.asset_list_id="{ item }">
          <v-chip color="primary" variant="outlined" size="small">
            {{ item.asset_list_id }}
          </v-chip>
        </template>

        <template v-slot:item.asset_spec="{ item }">
          <span class="font-weight-bold">{{ item.asset_spec }}</span>
        </template>

        <template v-slot:item.asset_serial_no="{ item }">
          <span>{{ item.asset_serial_no || "-" }}</span>
        </template>
        <template v-slot:item.asset_accu_dpca_value="{ item }">
          <v-chip color="primary">{{
            item.asset_accu_dpca_value || "-"
          }}</v-chip>
        </template>
        <template v-slot:item.asset_type_id="{ item }">
          <v-chip color="primary">{{
            item.asset_id_detail.asset_name_la || "-"
          }}</v-chip>
        </template>
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip color="">
            <div v-if="item.Auth_Status==='U'">
            <p class="text-primary">ລໍຖ້າອະນຸມັດ</p>  
            </div>
            <div v-if="item.Auth_Status==='A'">
            <p class="text-info">ອະນຸມັດແລ້ວ</p>  
            </div>
            <div v-if="item.Auth_Status==='R'">
            <p class="text-error">ຖືກ Reject</p>  
            </div>
            <div v-if="item.Auth_Status==='P'">
            <p class="text-warning">ກຳລັງດຳເນີນການ</p>  
            </div>
          </v-chip>
        </template>

        <template v-slot:item.type_of_pay="{ item }">
          <v-chip color="primary" v-if="item.type_of_pay === '1101100'"
            >
            {{ item.type_of_pay_detail.MC_name_la || "-" }}
          </v-chip>
        </template>

        <template v-slot:item.asset_value_remainMonth="{ item }">
          <div class="text-center">
            <v-chip
              :color="
                item.asset_value_remainMonth > 1000000 ? 'success' : 'primary'
              "
              variant="flat"
            >
              {{
                new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(item.asset_value_remainMonth || 0)
              }}
              ₭
            </v-chip>
          </div>
        </template>
        <template v-slot:item.asset_date="{ item }">
          {{ formatDate(item.asset_date) }}
        </template>

        <template v-slot:item.asset_value="{ item }">
          <div class="text-end">
            <span class="font-weight-bold">{{
              formatCurrency(item.asset_value, item.asset_currency)
            }}</span>
          </div>
        </template>

        <template v-slot:item.asset_value_remain="{ item }">
          <div class="text-end">
            <span class="font-weight-bold text-success">{{
              formatCurrency(item.asset_value_remain, item.asset_currency)
            }}</span>
          </div>
        </template>

        <template v-slot:item.asset_status="{ item }">
          <div class="text-center">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-chip
                  :color="getStatusColor(item.asset_status)"
                  variant="flat"
                  size="small"
                  v-bind="props"
                  class="cursor-pointer"
                >
                  {{ getStatusText(item.asset_status) }}
                </v-chip>
              </template>
            </v-menu>
          </div>
        </template>

        <template v-slot:item.has_depreciation="{ item }">
          <div class="text-center">
            <v-chip
              :color="item.has_depreciation === 'Y' ? 'success' : 'error'"
              variant="flat"
              size="small"
            >
              {{ item.has_depreciation === "Y" ? "ມີ" : "ບໍ່ມີ" }}
            </v-chip>
          </div>
        </template>

        <template v-slot:item.view="{ item }">
          <v-btn
            small
            flat
            class="text-primary"
            icon="mdi-eye-outline"
            @click="
              goPath(
                `/property/faasset/detail?id_faasset=${item.asset_list_id}`
              )
            "
          />
        </template>

        <template v-slot:item.edit="{ item }" >
          <v-btn
         v-if="item.Auth_Status !== 'A'"
            small
            flat
            class="text-info"
            icon="mdi-pen"
            @click="
              goPath(`/property/faasset/edit?id_faasset=${item.asset_list_id}`)
            "
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
           v-if="item.Auth_Status !== 'A'"
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
  </div>
</template>
