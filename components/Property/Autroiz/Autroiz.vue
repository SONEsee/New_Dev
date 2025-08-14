<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/helpers/axios";
import Swal from "sweetalert2";
import { debounce } from "lodash";
import { useRolePermissions } from "@/composables/useRolePermissions";
const mainStore = useFassetLidtDescription();
const derpicationStore = useFassetLidtDescription();
const cerrency = useCerrencyStore();
const masterStore = useMasterStore();
const jurnalStore = useJournalStor();

const datadevcription = computed(() => {
  const data = derpicationStore.respons_data_driscription_main;
  let processedData = [];

  if (Array.isArray(data)) {
    processedData = data;
  } else if (data && typeof data === "object") {
    processedData = [data];
  }

  return processedData.filter(
    (item) => item.Auth_Status === "U" || item.Auth_Status === "P"
  );
});

const datajurnal = computed(() => {
  const data = jurnalStore.response_journal_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const status = computed(() => {
  const data = masterStore.respone_data_master.MasterCodes || [];
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const responscerrency = computed(() => {
  const data = cerrency.respons_cerrency_data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const route = useRoute();
const router = useRouter();

const submenu_id = route.query.sub_menu_id || "GL_NOTE_CAP";
console.log("Submenu ID:", submenu_id);

const {
  initializeRole,
  canView,
  canEdit,
  canDelete,
  canAuthorize,
  canAdd,
  permissions,
} = useRolePermissions();

const performanceTracker = {
  start() {
    this.startTime = performance.now();
  },
  end(operation) {
    const duration = performance.now() - this.startTime;
    console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
    if (duration > 500) {
      console.warn(`🐌 Slow operation: ${operation} - ${duration}ms`);
    }
  },
};

const loading = ref(false);
const loadingReferences = ref(false);
const items = ref([]);
const modules = ref([]);
const currencies = ref([]);
const authStatusOptions = ref([]);

// ປ່ຽນເປັນ aldm_id ແທນ JRNLLog_id
const selectedItems = ref([]);
const selectAll = ref(false);

const referenceDataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const currentUser = computed(() => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
});

const today = new Date().toISOString().slice(0, 10);
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const pagination = reactive({
  currentPage: 1,
  pageSize: 25,
  totalPages: 0,
  totalItems: 0,
});

const dateFilterTypes = ref([
  { value: "all", text: "ທັງໝົດ", icon: "mdi-calendar-multiple" },
  { value: "date", text: "ວັນທີສະເພາະ", icon: "mdi-calendar" },
  { value: "range", text: "ໄລຍະວັນທີ", icon: "mdi-calendar-range" },
  { value: "month", text: "ເດືອນ", icon: "mdi-calendar-month" },
  { value: "year", text: "ປີ", icon: "mdi-calendar-year" },
]);

const months = ref([
  { value: 1, text: "ມັງກອນ" },
  { value: 2, text: "ກຸມພາ" },
  { value: 3, text: "ມີນາ" },
  { value: 4, text: "ເມສາ" },
  { value: 5, text: "ພຶດສະພາ" },
  { value: 6, text: "ມິຖຸນາ" },
  { value: 7, text: "ກໍລະກົດ" },
  { value: 8, text: "ສິງຫາ" },
  { value: 9, text: "ກັນຍາ" },
  { value: 10, text: "ຕຸລາ" },
  { value: 11, text: "ພະຈິກ" },
  { value: 12, text: "ທັນວາ" },
]);

const years = ref(
  Array.from({ length: 8 }, (_, i) => currentYear - 5 + i).map((year) => ({
    value: year,
    text: year.toString(),
  }))
);

const filters = reactive({
  search: "",
  module_id: null,
  Ccy_cd: null,
  Auth_Status: "U",
  dateFilterType: "all",
  specificDate: "",
  dateFrom: "",
  dateTo: "",
  selectedMonth: currentMonth,
  selectedYear: currentYear,
});

const summary = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  correction: 0,
});

// ແມັບຂໍ້ມູນເພື່ອຫາ aldm_id ທີ່ກ່ຽວຂ້ອງ
const getMatchedAldmId = (item) => {
  if (!item.jrnl_log_ac?.Ac_relatives || !item.Maker_DT_Stamp) {
    return null;
  }

  // ຈັດຟໍແມັດວັນທີຈາກ item
  const itemDate = item.Maker_DT_Stamp.split('T')[0]; // "2025-08-13"
  
  // ຫາ datadevcription ທີ່ແມັບກັບ item
  const matched = datadevcription.value.find(dep => {
    if (!dep.Maker_DT_Stamp) return false;
    
    const depDate = dep.Maker_DT_Stamp.split('T')[0];
    return dep.asset_list_id === item.jrnl_log_ac.Ac_relatives &&
           depDate === itemDate &&
           dep.Auth_Status === "U" &&
           item.Auth_Status === "U";
  });
  
  return matched ? matched.aldm_id : null;
};

// ຫາ items ທີ່ສາມາດເລືອກໄດ້ (ມີ aldm_id ທີ່ແມັບກັນ)
const selectableItems = computed(() => {
  return items.value.filter((item) => {
    return item.Auth_Status !== "A" && getMatchedAldmId(item) !== null;
  });
});

// ເຊັກວ່າ item ນີ້ຖືກເລືອກຢູ່ບໍ່
const isItemSelected = (item) => {
  const aldmId = getMatchedAldmId(item);
  return aldmId ? selectedItems.value.includes(aldmId) : false;
};

// ເຊັກວ່າ item ນີ້ສາມາດເລືອກໄດ້ບໍ່
const isItemSelectable = (item) => {
  return item.Auth_Status !== "A" && getMatchedAldmId(item) !== null;
};

// ສະລັບການເລືອກ item
const toggleItemSelection = (item) => {
  if (!isItemSelectable(item)) return;

  const aldmId = getMatchedAldmId(item);
  if (!aldmId) return;

  const index = selectedItems.value.indexOf(aldmId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(aldmId);
  }
  updateSelectAllState();
};

// ເລືອກທັງໝົດ
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = selectableItems.value
      .map(item => getMatchedAldmId(item))
      .filter(aldmId => aldmId !== null);
  } else {
    selectedItems.value = [];
  }
};

// ອັບເດດສະຖານະເລືອກທັງໝົດ
const updateSelectAllState = () => {
  const selectableAldmIds = selectableItems.value
    .map(item => getMatchedAldmId(item))
    .filter(aldmId => aldmId !== null);
    
  if (selectableAldmIds.length === 0) {
    selectAll.value = false;
  } else {
    selectAll.value = selectableAldmIds.every(aldmId =>
      selectedItems.value.includes(aldmId)
    );
  }
};

// ລ້າງການເລືອກ
const clearSelection = () => {
  selectedItems.value = [];
  selectAll.value = false;
};

watch(
  [items, selectedItems],
  () => {
    updateSelectAllState();
  },
  { deep: true }
);

const hasActiveFilters = computed(() => {
  return (
    filters.search ||
    filters.module_id ||
    filters.Ccy_cd ||
    filters.Auth_Status ||
    filters.dateFilterType !== "all"
  );
});

const activeFilterChips = computed(() => {
  const chips = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `ຄົ້ນຫາ: ${filters.search}`,
      icon: "mdi-magnify",
    });
  }

  if (filters.module_id) {
    const module = modules.value.find((m) => m.module_Id === filters.module_id);
    chips.push({
      key: "module_id",
      label: `ໂມດູນ: ${module?.module_name_la || filters.module_id}`,
      icon: "mdi-view-module",
    });
  }

  if (filters.Ccy_cd) {
    chips.push({
      key: "Ccy_cd",
      label: `ສະກຸນເງິນ: ${filters.Ccy_cd}`,
      icon: "mdi-currency-usd",
    });
  }

  if (filters.Auth_Status) {
    const status = authStatusOptions.value.find(
      (s) => s.value === filters.Auth_Status
    );
    chips.push({
      key: "Auth_Status",
      label: `ສະຖານະ: ${status?.text || filters.Auth_Status}`,
      icon: "mdi-check-circle",
    });
  }

  if (filters.dateFilterType !== "all") {
    const dateType = dateFilterTypes.value.find(
      (d) => d.value === filters.dateFilterType
    );
    let dateLabel = dateType?.text || "";

    if (filters.dateFilterType === "date" && filters.specificDate) {
      dateLabel += `: ${formatDate(filters.specificDate)}`;
    } else if (
      filters.dateFilterType === "range" &&
      (filters.dateFrom || filters.dateTo)
    ) {
      const from = filters.dateFrom ? formatDate(filters.dateFrom) : "...";
      const to = filters.dateTo ? formatDate(filters.dateTo) : "...";
      dateLabel += `: ${from} - ${to}`;
    } else if (
      filters.dateFilterType === "month" &&
      filters.selectedMonth &&
      filters.selectedYear
    ) {
      const month = months.value.find((m) => m.value === filters.selectedMonth);
      dateLabel += `: ${month?.text} ${filters.selectedYear}`;
    } else if (filters.dateFilterType === "year" && filters.selectedYear) {
      dateLabel += `: ${filters.selectedYear}`;
    }

    chips.push({
      key: "dateFilter",
      label: dateLabel,
      icon: "mdi-calendar",
    });
  }

  return chips;
});


const approveSelected = async ()=>{
  try {
    const aldmIds = selectedItems.value;
    mainStore.confirm_form_mark.aldm_ids = aldmIds
    await mainStore.postConfirm();
    selectedItems.value = [];
  } catch (error) {
    
  }
}
const rejectSelected = async ()=>{
  try {
    const aldmIds = selectedItems.value;
    mainStore.reject_form_mark.aldm_ids = aldmIds
    await mainStore.postReject();
    selectedItems.value = [];
  } catch (error) {
    
  }
}
const headers = [
  {
    title: "",
    key: "checkbox",
    sortable: false,
    width: "50px",
    align: "center",
  },
  { title: "ໂມດູນ", key: "module_id", sortable: false },
  { title: "ລະຫັດ", key: "Txn_code", sortable: false },
  { title: "ເລກອ້າງອີງ", key: "Reference_No", sortable: false },
  { title: "ເນື້ອໃນ", key: "Addl_text", sortable: false },
  { title: "ຈຳນວນເງິນ", key: "Fcy_Amount", align: "end", sortable: false },
  { title: "ຜູ້ສ້າງ", key: "maker_name", sortable: false },
  { title: "ວັນທີ", key: "Value_date", sortable: false },
  { title: "ສະຖານະ", key: "Auth_Status", sortable: false },
  { title: "ການກະທຳ", key: "actions", sortable: false, align: "center" },
];

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getCachedData = (key) => {
  const cached = referenceDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  referenceDataCache.set(key, { data, timestamp: Date.now() });
};

const getDateFilterLabel = () => {
  const type = dateFilterTypes.value.find(
    (d) => d.value === filters.dateFilterType
  );
  return type?.text || "ເລືອກວັນທີ";
};

const onDateFilterTypeChange = () => {
  clearDateFilterValues();
  handleFilterChange();
};

const clearDateFilterValues = () => {
  filters.specificDate = "";
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.selectedMonth = currentMonth;
  filters.selectedYear = currentYear;
};

const clearDateFilter = () => {
  filters.dateFilterType = "all";
  clearDateFilterValues();
  handleFilterChange();
};

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case "search":
      filters.search = "";
      break;
    case "module_id":
      filters.module_id = null;
      break;
    case "Ccy_cd":
      filters.Ccy_cd = null;
      break;
    case "Auth_Status":
      filters.Auth_Status = null;
      break;
    case "dateFilter":
      clearDateFilter();
      return;
  }
  handleFilterChange();
};

const clearAllFilters = () => {
  filters.search = "";
  filters.module_id = null;
  filters.Ccy_cd = null;
  filters.Auth_Status = null;
  clearDateFilter();
};

const viewDetails = (item) => {
  const detailUrl = `/glcapture/detail?Reference_No=${item.Reference_No}&sub_menu_id=${submenu_id}`;
  router.push(detailUrl);
};

const buildDateParams = () => {
  const params = {};

  switch (filters.dateFilterType) {
    case "date":
      if (filters.specificDate) {
        params.Value_date = filters.specificDate;
      }
      break;

    case "range":
      if (filters.dateFrom) {
        params.Value_date__gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.Value_date__lte = filters.dateTo;
      }
      break;

    case "month":
      if (filters.selectedMonth && filters.selectedYear) {
        const firstDay = new Date(
          filters.selectedYear,
          filters.selectedMonth - 1,
          1
        );
        const lastDay = new Date(
          filters.selectedYear,
          filters.selectedMonth,
          0
        );

        params.Value_date__gte = firstDay.toISOString().slice(0, 10);
        params.Value_date__lte = lastDay.toISOString().slice(0, 10);
      }
      break;

    case "year":
      if (filters.selectedYear) {
        params.Value_date__gte = `${filters.selectedYear}-01-01`;
        params.Value_date__lte = `${filters.selectedYear}-12-31`;
      }
      break;

    case "all":
    default:
      break;
  }

  return params;
};

const loadData = async (resetPage = true) => {
  try {
    performanceTracker.start();
    loading.value = true;

    if (resetPage) {
      pagination.currentPage = 1;
      clearSelection();
    }

    const params = {
      show_all: canAuthorize.value ? "true" : "false",
      page: pagination.currentPage,
      page_size: pagination.pageSize,
    };

    if (filters.search) params.search = filters.search;
    if (filters.module_id) params.module_id = filters.module_id;
    if (filters.Ccy_cd) params.Ccy_cd = filters.Ccy_cd;
    if (filters.Auth_Status) params.Auth_Status = filters.Auth_Status;

    const dateParams = buildDateParams();
    Object.assign(params, dateParams);

    params.delete_stat__ne = "D";
    params.ordering = "-Maker_DT_Stamp";

    const response = await axios.get("/api/journal-log-ard/init-data/", {
      params,
      ...getAuthHeaders(),
    });

    const data = response.data;

    items.value = response.data.results;
    Object.assign(summary, response.data.summary);
    pagination.totalItems = response.data.count;
    pagination.totalPages = response.data.page_info.total_pages;

    items.value = data.results || [];

    pagination.totalItems = data.count || 0;
    pagination.totalPages = data.page_info?.total_pages || 1;

    if (data.summary) {
      Object.assign(summary, data.summary);
    }

    if (data.reference_data) {
      modules.value = data.reference_data.modules || [];
      currencies.value = data.reference_data.currencies || [];
      authStatusOptions.value = data.reference_data.auth_status_options || [];

      setCachedData("reference_data", data.reference_data);
    }

    console.log(
      `✅ Loaded ${items.value.length} items (Page ${pagination.currentPage}/${pagination.totalPages})`
    );

    // ເພີ່ມການ debug ເພື່ອເຊັກການແມັບ
    console.log("🔍 Mapping check:");
    items.value.forEach(item => {
      const aldmId = getMatchedAldmId(item);
      if (aldmId) {
        console.log(`✅ Mapped: JRNLLog_id ${item.JRNLLog_id} → aldm_id ${aldmId}`);
      } else {
        console.log(`❌ No match: JRNLLog_id ${item.JRNLLog_id}`);
      }
    });

    performanceTracker.end("Data Loading");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    Swal.fire({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້",
      confirmButtonText: "ຕົກລົງ",
    });
  } finally {
    loading.value = false;
  }
};

const loadReferenceData = async () => {
  const cached = getCachedData("reference_data");
  if (cached) {
    modules.value = cached.modules || [];
    currencies.value = cached.currencies || [];
    authStatusOptions.value = cached.auth_status_options || [];
    console.log("📦 Using cached reference data");
    return;
  }

  console.log("🔄 Reference data will be loaded with main data");
};

const getStatusColor = (status) => {
  switch (status) {
    case "A":
      return "success";
    case "R":
      return "error";
    case "U":
      return "warning";
    case "P":
      return "info";
    default:
      return "grey";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "A":
      return "mdi-check-circle";
    case "R":
      return "mdi-close-circle";
    case "U":
      return "mdi-clock-outline";
    case "P":
      return "mdi-pencil-circle";
    default:
      return "mdi-help-circle";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "A":
      return "ອະນຸມັດແລ້ວ";
    case "R":
      return "ປະຕິເສດ";
    case "U":
      return "ລໍຖ້າອະນຸມັດ";
    case "P":
      return "ຖ້າເແກ້ໄຂ";
    default:
      return "ບໍ່ຮູ້";
  }
};

const formatNumber = (num, decimals = 2) => {
  if (!num) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("lo-LA");
};

const setAuthStatusFilter = (status) => {
  filters.Auth_Status = status;
  loadData();
};

const handleFilterChange = () => {
  loadData();
};

const onPageChange = (page) => {
  pagination.currentPage = page;
  loadData(false);
};

const onPageSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  pagination.currentPage = 1;
  loadData(false);
};

const deleteItem = async (item) => {
  const canDeleteItem =
    canDelete.value &&
    (canAuthorize.value || item.Maker_Id === currentUser.value?.user_id);

  if (!canDeleteItem) {
    Swal.fire({
      icon: "warning",
      title: "ບໍ່ມີສິດ",
      text: "ທ່ານບໍ່ມີສິດລຶບລາຍການນີ້",
      confirmButtonText: "ຕົກລົງ",
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "ຢືນຢັນການລຶບ",
    text: `ທ່ານຕ້ອງການລຶບລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: "ລຶບ",
    cancelButtonText: "ຍົກເລີກ",
    confirmButtonColor: "#f44336",
    cancelButtonColor: "#9e9e9e",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(
        `/api/journal-log-master/${item.JRNLLog_id}/`,
        getAuthHeaders()
      );

      Swal.fire({
        icon: "success",
        title: "ສຳເລັດ",
        text: "ລຶບລາຍການສຳເລັດແລ້ວ",
        timer: 2000,
        showConfirmButton: false,
      });

      loadData(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        icon: "error",
        title: "ຂໍ້ຜິດພາດ",
        text: "ບໍ່ສາມາດລຶບລາຍການໄດ້",
        confirmButtonText: "ຕົກລົງ",
      });
    }
  }
};

const exportData = () => {
  Swal.fire({
    icon: "info",
    title: "ກຳລັງພັດທະນາ",
    text: "ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ",
    confirmButtonText: "ຕົກລົງ",
  });
};

const searchDebounced = debounce(() => {
  handleFilterChange();
}, 500);

onMounted(async () => {
  jurnalStore.getJurnallist();
  cerrency.getDataCerrency();
  masterStore.getStatus();
  derpicationStore.getDataTotal();

  await initializeRole();

  await loadReferenceData();

  if (canView.value) {
    loadData();
  }
});
</script>
<template>
  <div class="gl-approved-master">
    <div class="page-header-compact">
      <div class="d-flex justify-space-between align-center">
        <h1 class="page-title-compact">
          <v-icon color="primary" size="20" class="mr-2">mdi-book-check</v-icon>
          ອະນຸມັດບັນທຶກບັນຊີຊັບສິນ
        </h1>
        <!-- <pre>{{ datadevcription }}</pre> -->
        <div class="permission-indicators" v-if="permissions">
          <v-tooltip text="ສິດເຂົ້າເຖິງຂອງທ່ານ" location="bottom">
            <template #activator="{ props }">
              <div v-bind="props" class="d-flex gap-1">
                <v-chip
                  v-if="canView"
                  color="info"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-eye</v-icon>
                  ເບິ່ງ
                </v-chip>
                <v-chip
                  v-if="canEdit"
                  color="warning"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-pencil</v-icon>
                  ແກ້
                </v-chip>
                <v-chip
                  v-if="canDelete"
                  color="error"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-delete</v-icon>
                  ລຶບ
                </v-chip>
                <v-chip
                  v-if="canAuthorize"
                  color="success"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-check-circle</v-icon>
                  ອະນຸມັດ
                </v-chip>
              </div>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>

    <div v-if="!canView" class="permission-denied-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-shield-lock</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ມີສິດເຂົ້າເຖິງ</div>
        <div class="text-body-1 mb-4 text-grey">
          ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້
        </div>
        <div class="text-caption text-grey mb-6 px-4">
          <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
          ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບເພື່ອຂໍສິດເຂົ້າເຖິງ
        </div>
        <v-btn
          variant="outlined"
          @click="$router.go(-1)"
          prepend-icon="mdi-arrow-left"
          size="large"
        >
          ກັບໄປໜ້າກ່ອນ
        </v-btn>
      </v-card>
    </div>

    <div v-else>
      <v-alert
        v-if="canAuthorize"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <template #prepend>
          <v-icon>mdi-check-circle</v-icon>
        </template>
        <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທັງໝົດໄດ້
      </v-alert>

      <v-alert
        v-else
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທີ່ທ່ານສ້າງເທົ່ານັ້ນ
      </v-alert>

      <v-card class="filter-card-thin mb-2" elevation="1">
        <v-card-text class="pa-2">
          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.search"
                label="ຄົ້ນຫາ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                placeholder="ເລກອ້າງອີງ, ຂໍ້ຄວາມ..."
                @update:model-value="searchDebounced"
                hide-details
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="filters.Ccy_cd"
                :items="responscerrency"
                item-title="ccy_code"
                item-value="ccy_code"
                label="ສະກຸນເງິນ"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="handleFilterChange"
                hide-details
                :loading="loadingReferences"
              ></v-select>
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="filters.Auth_Status"
                :items="status"
                item-title="MC_name_la"
                item-value="MC_code"
                label="ສະຖານະອະນຸມັດ"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="setAuthStatusFilter"
                hide-details
                :loading="loadingReferences"
              ></v-select>
            </v-col>

          
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.dateFilterType"
                :items="dateFilterTypes"
                item-title="text"
                item-value="value"
                label="ປະເພດກັ່ນຕອງວັນທີ"
                variant="outlined"
                density="compact"
                @update:model-value="onDateFilterTypeChange"
                hide-details
              >
                <template #selection="{ item }">
                  <v-icon size="14" class="mr-1">{{ item.raw.icon }}</v-icon>
                  {{ item.raw.text }}
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon size="16">{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="1">
              <v-btn
                color="primary"
                variant="flat"
                @click="loadData"
                :loading="loading"
                block
                size="small"
              >
                <v-icon size="16">mdi-filter</v-icon>
                ຄົ້ນຫາ
              </v-btn>
            </v-col>
          </v-row>

          
          <v-row dense class="mt-2" v-if="selectedItems.length > 0">
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-0"
              >
                <div class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <v-icon size="16" class="mr-2">mdi-check-circle-outline</v-icon>
                    <span>ເລືອກແລ້ວ {{ selectedItems.length }} ລາຍການ</span>
                  </div>
                  
                 
                  <div class="d-flex align-center gap-2">
                    
                    <v-btn
                      v-if="canAuthorize"
                      color="success"
                      variant="flat"
                      size="small"
                      @click="approveSelected"
                      :disabled="selectedItems.length === 0"
                    >
                      <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                      ອະນຸມັດ ({{ selectedItems.length }})
                    </v-btn>

                    
                    <v-btn
                      v-if="canAuthorize"
                      color="error"
                      variant="flat"
                      size="small"
                      @click="rejectSelected"
                      :disabled="selectedItems.length === 0"
                    >
                      <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
                      ປະຕິເສດ ({{ selectedItems.length }})
                    </v-btn>

                   
                    <v-btn
                      variant="text"
                      size="small"
                      color="grey"
                      @click="clearSelection"
                    >
                      <v-icon size="16" class="mr-1">mdi-close</v-icon>
                      ລ້າງ
                    </v-btn>
                  </div>
                </div>
              </v-alert>
            </v-col>
          </v-row>

          <v-row dense class="mt-2" v-if="filters.dateFilterType !== 'all'">
            <v-col cols="12">
              <div class="date-filter-section">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                <span class="date-filter-label"
                  >{{ getDateFilterLabel() }}:</span
                >

                <template v-if="filters.dateFilterType === 'date'">
                  <v-text-field
                    v-model="filters.specificDate"
                    type="date"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFilterChange"
                    hide-details
                    class="date-input"
                    placeholder="ເລືອກວັນທີ"
                  ></v-text-field>
                </template>

                <template v-if="filters.dateFilterType === 'range'">
                  <div class="date-range-inputs">
                    <v-text-field
                      v-model="filters.dateFrom"
                      type="date"
                      variant="outlined"
                      density="compact"
                      @update:model-value="handleFilterChange"
                      hide-details
                      class="date-input"
                      placeholder="ຈາກວັນທີ"
                    ></v-text-field>
                    <span class="date-separator">ຫາ</span>
                    <v-text-field
                      v-model="filters.dateTo"
                      type="date"
                      variant="outlined"
                      density="compact"
                      @update:model-value="handleFilterChange"
                      hide-details
                      class="date-input"
                      placeholder="ເຖິງວັນທີ"
                    ></v-text-field>
                  </div>
                </template>

                <template v-if="filters.dateFilterType === 'month'">
                  <div class="month-year-inputs">
                    <v-select
                      v-model="filters.selectedMonth"
                      :items="months"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      @update:model-value="handleFilterChange"
                      hide-details
                      class="month-input"
                      placeholder="ເລືອກເດືອນ"
                    ></v-select>
                    <v-select
                      v-model="filters.selectedYear"
                      :items="years"
                      variant="outlined"
                      density="compact"
                      item-title="text"
                      item-value="value"
                      @update:model-value="handleFilterChange"
                      hide-details
                      class="year-input"
                      placeholder="ເລືອກປີ"
                    ></v-select>
                  </div>
                </template>

                <template v-if="filters.dateFilterType === 'year'">
                  <v-select
                    v-model="filters.selectedYear"
                    :items="years"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFilterChange"
                    hide-details
                    class="year-input"
                    placeholder="ເລືອກປີ"
                  ></v-select>
                </template>

                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="grey"
                  @click="clearDateFilter"
                  class="ml-2"
                >
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <v-row dense class="mt-1" v-if="hasActiveFilters">
            <v-col cols="12">
              <div class="active-filters">
                <span class="active-filters-label">
                  <v-icon size="14" class="mr-1">mdi-filter</v-icon>
                  ກັ່ນຕອງທີ່ເລືອກ:
                </span>
                <v-chip
                  v-for="filter in activeFilterChips"
                  :key="filter.key"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  closable
                  @click:close="removeFilter(filter.key)"
                  class="ma-1"
                >
                  <v-icon size="12" class="mr-1">{{ filter.icon }}</v-icon>
                  {{ filter.label }}
                </v-chip>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="clearAllFilters"
                  class="ml-2"
                >
                  <v-icon size="12">mdi-filter-remove</v-icon>
                  ລ້າງທັງໝົດ
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row dense class="mb-3">
        <v-col cols="6" sm="3" md="2">
          <v-card
            class="summary-card-thin"
            :class="{ 'active-filter': filters.Auth_Status === null }"
            elevation="1"
            @click="setAuthStatusFilter(null)"
            style="cursor: pointer"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="primary" class="mr-2"
                  >mdi-file-document-multiple</v-icon
                >
                <div>
                  <div class="summary-value-thin">
                    <v-skeleton-loader
                      v-if="loading"
                      type="text"
                      width="40"
                    ></v-skeleton-loader>

                    <span v-else>{{
                      datajurnal.filter((item) => item).length / 2
                    }}</span>
                  </div>
                  <div class="summary-label-thin">ລາຍການທັງໝົດ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <v-card
            class="summary-card-thin"
            :class="{ 'active-filter': filters.Auth_Status === 'U' }"
            elevation="1"
            @click="setAuthStatusFilter('U')"
            style="cursor: pointer"
          >
            <v-card-text class="pa-2">
              <div class="dashboard-summary">
                <div class="d-flex align-center">
                  <v-icon size="20" color="warning" class="mr-2"
                    >mdi-clock-outline</v-icon
                  >
                  <div>
                    <div class="summary-value-thin">
                      <v-skeleton-loader
                        v-if="loading"
                        type="text"
                        width="40"
                      ></v-skeleton-loader>
                      <span v-else>{{
                        datajurnal.filter(
                          (item) => item.Auth_Status.toString().trim() === "U"
                        ).length / 2
                      }}</span>
                    </div>
                    <div class="summary-label-thin">ລໍຖ້າອະນຸມັດ</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card
            class="summary-card-thin"
            :class="{ 'active-filter': filters.Auth_Status === 'A' }"
            elevation="1"
            @click="setAuthStatusFilter('A')"
            style="cursor: pointer"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="success" class="mr-2"
                  >mdi-check-circle</v-icon
                >
                <div>
                  <div class="summary-value-thin">
                    <v-skeleton-loader
                      v-if="loading"
                      type="text"
                      width="40"
                    ></v-skeleton-loader>
                    <span v-else>{{
                      datajurnal.filter(
                        (item) => item.Auth_Status.toString().trim() === "A"
                      ).length / 2
                    }}</span>
                  </div>
                  <div class="summary-label-thin">ອະນຸມັດແລ້ວ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card
            class="summary-card-thin"
            :class="{ 'active-filter': filters.Auth_Status === 'R' }"
            elevation="1"
            @click="setAuthStatusFilter('R')"
            style="cursor: pointer"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="error" class="mr-2"
                  >mdi-close-circle</v-icon
                >
                <div>
                  <div class="summary-value-thin">
                    <v-skeleton-loader
                      v-if="loading"
                      type="text"
                      width="40"
                    ></v-skeleton-loader>
                    <span v-else>{{
                      datajurnal.filter(
                        (item) => item.Auth_Status.toString().trim() === "R"
                      ).length / 2
                    }}</span>
                  </div>
                  <div class="summary-label-thin">ປະຕິເສດ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card
            class="summary-card-thin"
            :class="{ 'active-filter': filters.Auth_Status === 'P' }"
            elevation="1"
            @click="setAuthStatusFilter('P')"
            style="cursor: pointer"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="info" class="mr-2"
                  >mdi-pencil-circle</v-icon
                >
                <div>
                  <div class="summary-value-thin">
                    <v-skeleton-loader
                      v-if="loading"
                      type="text"
                      width="40"
                    ></v-skeleton-loader>
                    <span v-else>{{
                      datajurnal.filter(
                        (item) => item.Auth_Status.toString().trim() === "P"
                      ).length / 2
                    }}</span>
                  </div>
                  <div class="summary-label-thin">ຖ້າເແກ້ໄຂ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card elevation="1" class="data-table-card-thin">
        <v-card-title class="d-flex justify-space-between align-center pa-3">
          <span class="text-h6">
            ລາຍການບັນທຶກບັນຊີ
            <v-chip
              size="small"
              color="primary"
              variant="outlined"
              class="ml-2"
            >
              {{ canAuthorize ? "ທັງໝົດ" : "ຂອງຂ້ອຍ" }}
            </v-chip>

            <v-chip
              v-if="filters.Auth_Status"
              size="small"
              :color="getStatusColor(filters.Auth_Status)"
              variant="flat"
              class="ml-2"
            >
              <v-icon left size="12">{{
                getStatusIcon(filters.Auth_Status)
              }}</v-icon>
              {{ getStatusText(filters.Auth_Status) }}
            </v-chip>
            <v-chip
              v-else
              size="small"
              color="grey"
              variant="flat"
              class="ml-2"
            >
              <v-icon left size="12">mdi-filter-off</v-icon>
              ທັງໝົດ
            </v-chip>

        
            <v-chip
              v-if="pagination.totalItems > 0"
              size="small"
              color="info"
              variant="outlined"
              class="ml-2"
            >
              {{ pagination.currentPage }} / {{ pagination.totalPages }} ໜ້າ ({{
                pagination.totalItems
              }}
              ລາຍການ)
            </v-chip>
          </span>
          <div>
            <v-btn
              color="success"
              variant="text"
              @click="exportData"
              :disabled="items.length === 0"
              class="mr-2"
              size="small"
            >
              <v-icon left size="16">mdi-download</v-icon>
              ສົ່ງອອກ
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="loadData"
              size="small"
              :loading="loading"
            >
              <v-icon left size="16">mdi-refresh</v-icon>
              ໂຫຼດໃໝ່
            </v-btn>
          </div>
        </v-card-title>
        <!-- <pre>{{ selectedItems }}</pre> -->
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
          :search="filters.search"
          :items-per-page="-1"
          density="compact"
          class="elevation-0 full-width-table-thin"
          item-value="JRNLLog_id"
          hide-default-footer
        >
          <template v-slot:loading>
            <v-skeleton-loader
              v-for="n in pagination.pageSize"
              :key="n"
              type="table-row"
              class="mx-auto"
            ></v-skeleton-loader>
          </template>

          <template v-slot:header.checkbox="{ column }">
            <v-checkbox
              v-model="selectAll"
              @update:model-value="toggleSelectAll"
              :indeterminate="
                selectedItems.length > 0 &&
                selectedItems.length < selectableItems.length
              "
              :disabled="selectableItems.length === 0"
              density="compact"
              hide-details
              color="primary"
            ></v-checkbox>
          </template>

          <template v-slot:item.checkbox="{ item }">
            <v-checkbox
              v-if="isItemSelectable(item)"
              :model-value="isItemSelected(item)"
              @update:model-value="toggleItemSelection(item)"
              density="compact"
              hide-details
              color="primary"
            ></v-checkbox>
            <div v-else class="text-center">
              <v-icon
                size="16"
                color="grey"
                title="ອະນຸມັດແລ້ວ - ບໍ່ສາມາດເລືອກໄດ້"
              >
                mdi-lock
              </v-icon>
            </div>
          </template>

          <template v-slot:item.Reference_No="{ item }">
            <v-chip
              v-if="canView"
              size="x-small"
              color="primary"
              variant="outlined"
              @click="viewDetails(item)"
              class="cursor-pointer"
            >
              {{ item.Reference_No }}
            </v-chip>
          </template>

          <template v-slot:item.module_id="{ item }">
            <span v-if="item.module_name_la" class="text-compact">
              {{ item.module_name_la }}
            </span>
            <span v-else class="text-grey">-</span>
          </template>

          <template v-slot:item.Fcy_Amount="{ item }">
            <div class="text-right text-compact">
              <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
              <span class="text-grey ml-1">{{
                item.ccy_code || item.Ccy_cd
              }}</span>
            </div>
          </template>

          <template v-slot:item.Lcy_Amount="{ item }">
            <div class="text-right text-compact">
              {{ formatNumber(item.Lcy_Amount) }} LAK
            </div>
          </template>

          <template v-slot:item.Txn_code="{ item }">
            <v-chip size="x-small" variant="flat" color="info">
              {{ item.Txn_code || "-" }}
            </v-chip>
          </template>

          <template v-slot:item.Addl_text="{ item }">
            <div class="text-truncate text-compact">
              <v-tooltip v-if="item.Addl_text" location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props">{{ item.Addl_text || "-" }}</span>
                </template>
                <span>{{ item.Addl_text }}</span>
              </v-tooltip>
              <span v-else>-</span>
            </div>
          </template>

          <template v-slot:item.Value_date="{ item }">
            <span class="text-compact text-grey">{{
              formatDate(item.Value_date)
            }}</span>
          </template>

          <template v-slot:item.Auth_Status="{ item }">
            <v-chip
              :color="getStatusColor(item.Auth_Status)"
              size="x-small"
              variant="flat"
            >
              <v-icon left size="x-small">{{
                getStatusIcon(item.Auth_Status)
              }}</v-icon>
              {{ getStatusText(item.Auth_Status) }}
            </v-chip>
          </template>

          <template v-slot:item.maker_name="{ item }">
            <div class="text-caption-thin">
              <div v-if="item.Maker_Id" class="text-compact">
                {{ item.maker_name || item.Maker_Id }}
              </div>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                v-if="canView"
                icon
                size="x-small"
                variant="text"
                color="info"
                @click="viewDetails(item)"
                title="ເບິ່ງລາຍລະອຽດ"
              >
                <v-icon size="14">mdi-eye</v-icon>
              </v-btn>

              <v-btn
                v-if="
                  canDelete &&
                  (canAuthorize || item.Maker_Id === currentUser?.user_id) &&
                  item.Auth_Status !== 'A' &&
                  item.Auth_Status !== 'R'
                "
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="deleteItem(item)"
                title="ລຶບ"
              >
                <v-icon size="14">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <!-- Custom Pagination -->
        <v-card-actions class="justify-space-between pa-3">
          <div class="d-flex align-center gap-2">
            <span class="text-caption"
              >ສະແດງ {{ pagination.pageSize }} ລາຍການຕໍ່ໜ້າ</span
            >
            <v-select
              v-model="pagination.pageSize"
              :items="[10, 25, 50, 100]"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="onPageSizeChange"
              style="width: 80px"
            ></v-select>
          </div>

          <v-pagination
            v-model="pagination.currentPage"
            :length="pagination.totalPages"
            :total-visible="7"
            @update:model-value="onPageChange"
            density="compact"
            size="small"
            :disabled="loading"
          ></v-pagination>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
/* All existing styles from the original component... */
.gl-approved-master {
  padding: 16px;
}

/* Permission indicators */
.permission-indicators {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.permission-indicators .v-chip {
  font-weight: 600;
  font-size: 0.7rem;
}

/* Permission denied state */
.permission-denied-state {
  max-width: 600px;
  margin: 40px auto;
}

/* Compact header */
.page-header-compact {
  padding: 8px 0;
  margin-bottom: 16px;
}

.page-title-compact {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1976d2;
  display: flex;
  align-items: center;
  margin: 0;
  line-height: 1.2;
}

/* Enhanced Filter Styles */
.filter-card-thin {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.date-filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.date-filter-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1976d2;
  min-width: fit-content;
}

.date-input {
  max-width: 200px;
  min-width: 140px;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  font-size: 0.85rem;
  color: #666;
  padding: 0 4px;
  min-width: fit-content;
}

.month-year-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-input {
  max-width: 120px;
  min-width: 100px;
}

.year-input {
  max-width: 100px;
  min-width: 80px;
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 4px 8px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.active-filters-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #4caf50;
  margin-right: 8px;
  display: flex;
  align-items: center;
  min-width: fit-content;
}

/* Thinner summary cards */
.summary-card-thin {
  height: auto;
  min-height: 60px;
  transition: transform 0.2s;
  border: 1px solid #e0e0e0;
}

.summary-card-thin:hover {
  transform: translateY(-1px);
}

/* Active filter state for summary cards */
.summary-card-thin.active-filter {
  border: 2px solid #1976d2 !important;
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.05) 0%,
    rgba(25, 118, 210, 0.1) 100%
  );
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2) !important;
}

.summary-card-thin.active-filter .summary-value-thin {
  color: #1976d2;
  font-weight: 700;
}

.summary-card-thin.active-filter .summary-label-thin {
  color: #1976d2;
  font-weight: 600;
}

.summary-value-thin {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.summary-label-thin {
  font-size: 0.7rem;
  color: #666;
  line-height: 1;
}

/* Thinner data table card */
.data-table-card-thin {
  border: 1px solid #e0e0e0;
}

/* Compact text */
.text-compact {
  font-size: 0.8rem;
  line-height: 1.1;
}

.text-caption-thin {
  font-size: 0.7rem;
  line-height: 1.1;
}

.text-xs {
  font-size: 0.65rem;
  line-height: 1;
}

/* Full width table - thinner */
.full-width-table-thin {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

/* Vuetify overrides for compact design */
:deep(.v-data-table) {
  font-size: 0.8rem;
  width: 100% !important;
}

:deep(.v-data-table th) {
  font-weight: 600;
  background-color: #f7f7f7;
  font-size: 0.75rem;
  padding: 8px 12px !important;
  height: 36px !important;
}

:deep(.v-data-table td) {
  padding: 6px 12px !important;
  height: 40px !important;
  font-size: 0.8rem;
}

:deep(.v-data-table-wrapper) {
  width: 100% !important;
  overflow-x: auto;
}

:deep(.v-table__wrapper) {
  width: 100% !important;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

:deep(.v-field__field) {
  height: 32px !important;
}

:deep(
    .v-input--density-compact
      .v-field--variant-outlined
      .v-field__outline__start
  ) {
  border-radius: 4px 0 0 4px;
}

:deep(
    .v-input--density-compact .v-field--variant-outlined .v-field__outline__end
  ) {
  border-radius: 0 4px 4px 0;
}

:deep(.v-btn--size-small) {
  min-height: 28px;
  padding: 0 12px;
  font-size: 0.75rem;
}

:deep(.v-btn--size-x-small) {
  min-height: 24px;
  padding: 0 8px;
  font-size: 0.7rem;
}

:deep(.v-chip--size-x-small) {
  height: 20px;
  font-size: 0.65rem;
  padding: 0 6px;
}

:deep(.v-card-title) {
  font-size: 1rem;
  font-weight: 500;
  padding: 12px 16px;
}

:deep(.v-card-text) {
  font-size: 0.8rem;
}

:deep(.v-card-actions) {
  min-height: 40px;
}

:deep(.v-dialog .v-card) {
  max-height: 90vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title-compact {
    font-size: 1.2rem;
  }

  .summary-value-thin {
    font-size: 1rem;
  }

  .summary-label-thin {
    font-size: 0.65rem;
  }

  .permission-indicators {
    margin-top: 8px;
  }

  .date-filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .date-range-inputs,
  .month-year-inputs {
    flex-direction: column;
    gap: 4px;
  }

  .date-input,
  .month-input,
  .year-input {
    max-width: 100%;
  }

  .active-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .active-filters-label {
    margin-bottom: 4px;
  }

  :deep(.v-data-table th) {
    padding: 4px 8px !important;
    font-size: 0.7rem;
  }

  :deep(.v-data-table td) {
    padding: 4px 8px !important;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .gl-approved-master {
    padding: 8px;
  }

  .text-compact {
    font-size: 0.75rem;
  }

  .date-separator {
    display: none;
  }
}
</style>
