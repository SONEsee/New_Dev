<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const faAssetStoreInstance = faAssetStore();

const handleStatusChange = async (item: any, newStatus: string) => {
  try {
    const statusTexts = {
      ACTIVE: 'ເປີດໃຊ້ງານ',
      INACTIVE: 'ປິດໃຊ້ງານ',
      MAINTENANCE: 'ບຳລຸງຮັກສາ',
      DISPOSED: 'ຖອນຈຳໜ່າຍ'
    };
    
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການປ່ຽນສະຖານະເປັນ "${statusTexts[newStatus as keyof typeof statusTexts]}" ໃຊ່ບໍ່?`,
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

const search = ref("");
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedStatus = ref("all");

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

const title = "ຈັດການຊັບສົມບັດຄົງທີ່";

const assetStatuses = [
  { title: "ທັງໝົດ", value: "all" },
  { title: "ເປີດໃຊ້ງານ", value: "ACTIVE" },
  { title: "ປິດໃຊ້ງານ", value: "INACTIVE" },
  { title: "ບຳລຸງຮັກສາ", value: "MAINTENANCE" },
  { title: "ຖອນຈຳໜ່າຍ", value: "DISPOSED" },
];

const currencies = [
  { title: "ກີບ (LAK)", value: "LAK" },
  { title: "ໂດລາ (USD)", value: "USD" },
  { title: "ບາດ (THB)", value: "THB" },
];

const headers = computed(() => [
  {
    title: "ລະຫັດ",
    value: "id",
    align: "start",
    sortable: true,
    filterable: true,
    width: "80px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ປ້າຍຊັບສິນ",
    value: "asset_tag",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-h6",
  },
  {
    title: "Serial Number",
    value: "asset_serial_no",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
  },
  {
    title: "ແຜນຜັງຊັບສົມບັດ",
    value: "asset_id",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ສະຖານທີ່",
    value: "asset_location_id",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
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
    title: "ມູນຄ່າ",
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
  {
    title: "ສະຖານະ",
    value: "asset_status",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ເສື່ອມລາຄາ",
    value: "has_depreciation",
    align: "center",
    sortable: true,
    filterable: true,
    width: "100px",
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
  {
    title: "ຄິດເສື່ອມ",
    value: "depreciation",
    align: "center",
    sortable: false,
    filterable: false,
    width: "80px",
    class: "text-center",
  },
]);

const mockData = ref([
  {
    id: 1,
    asset_id: 1,
    asset_chart: { id: 1, asset_name: "ເຄື່ອງຈັກຜະລິດ", asset_code: "MACH001" },
    asset_serial_no: "SN001234567",
    asset_tag: "FA-001",
    asset_location_id: 1,
    location: { id: 1, location_name: "ຫ້ອງຜະລິດ A", location_code: "PROD-A" },
    asset_spec: "ເຄື່ອງຈັກຜະລິດອາຫານ ກຳລັງ 500HP",
    asset_date: new Date("2024-01-15"),
    asset_currency: "LAK",
    asset_value: 500000000,
    asset_status: "ACTIVE",
    warranty_end_date: new Date("2027-01-15"),
    supplier_id: 1,
    supplier: { id: 1, supplier_name: "ບໍລິສັດ ABC ຈຳກັດ" },
    has_depreciation: "Y",
    dpca_type: "Straight-line",
    dpca_percentage: 10,
    asset_useful_life: 10,
    asset_salvage_value: 50000000,
    dpca_start_date: new Date("2024-02-01"),
    dpca_end_date: new Date("2034-02-01"),
    asset_accu_dpca_value: 45000000,
    asset_value_remain: 455000000,
    asset_latest_date_dpca: new Date("2025-06-01"),
    asset_disposal_date: null,
    asset_ac_date: new Date("2024-01-20"),
    asset_ac_datetime: new Date("2024-01-20T10:30:00"),
    asset_ac_by: 1001,
    created_at: new Date("2024-01-15T09:00:00"),
    updated_at: new Date("2025-06-01T15:30:00"),
  },
  {
    id: 2,
    asset_id: 2,
    asset_chart: { id: 2, asset_name: "ລົດຂົນສົ່ງ", asset_code: "VEHI001" },
    asset_serial_no: "VH2024001",
    asset_tag: "FA-002",
    asset_location_id: 2,
    location: { id: 2, location_name: "ລານຈອດລົດ", location_code: "PARK-A" },
    asset_spec: "ລົດບັນທຸກ 10 ໂຕນ, ເຄື່ອງຍົນດີເຊນ",
    asset_date: new Date("2024-03-10"),
    asset_currency: "USD",
    asset_value: 45000,
    asset_status: "ACTIVE",
    warranty_end_date: new Date("2027-03-10"),
    supplier_id: 2,
    supplier: { id: 2, supplier_name: "ບໍລິສັດ XYZ ຈຳກັດ" },
    has_depreciation: "Y",
    dpca_type: "Declining",
    dpca_percentage: 20,
    asset_useful_life: 8,
    asset_salvage_value: 5000,
    dpca_start_date: new Date("2024-04-01"),
    dpca_end_date: new Date("2032-04-01"),
    asset_accu_dpca_value: 12000,
    asset_value_remain: 33000,
    asset_latest_date_dpca: new Date("2025-06-01"),
    asset_disposal_date: null,
    asset_ac_date: new Date("2024-03-15"),
    asset_ac_datetime: new Date("2024-03-15T14:20:00"),
    asset_ac_by: 1002,
    created_at: new Date("2024-03-10T10:15:00"),
    updated_at: new Date("2025-06-01T16:45:00"),
  },
  {
    id: 3,
    asset_id: 3,
    asset_chart: { id: 3, asset_name: "ຄອມພິວເຕີຫ້ອງການ", asset_code: "COMP001" },
    asset_serial_no: "DELL2024XPS",
    asset_tag: "FA-003",
    asset_location_id: 3,
    location: { id: 3, location_name: "ຫ້ອງການບໍລິຫານ", location_code: "ADMIN" },
    asset_spec: "Dell XPS 15, Intel i7, 32GB RAM, 1TB SSD",
    asset_date: new Date("2024-05-20"),
    asset_currency: "USD",
    asset_value: 2500,
    asset_status: "ACTIVE",
    warranty_end_date: new Date("2027-05-20"),
    supplier_id: 3,
    supplier: { id: 3, supplier_name: "ຮ້ານຄອມພິວເຕີ IT Pro" },
    has_depreciation: "Y",
    dpca_type: "Straight-line",
    dpca_percentage: 33.33,
    asset_useful_life: 3,
    asset_salvage_value: 500,
    dpca_start_date: new Date("2024-06-01"),
    dpca_end_date: new Date("2027-06-01"),
    asset_accu_dpca_value: 666,
    asset_value_remain: 1834,
    asset_latest_date_dpca: new Date("2025-06-01"),
    asset_disposal_date: null,
    asset_ac_date: new Date("2024-05-25"),
    asset_ac_datetime: new Date("2024-05-25T11:15:00"),
    asset_ac_by: 1001,
    created_at: new Date("2024-05-20T08:30:00"),
    updated_at: new Date("2025-06-01T12:00:00"),
  },
  {
    id: 4,
    asset_id: 4,
    asset_chart: { id: 4, asset_name: "ເຄື່ອງປະກອບ", asset_code: "EQUI001" },
    asset_serial_no: null,
    asset_tag: "FA-004",
    asset_location_id: 1,
    location: { id: 1, location_name: "ຫ້ອງຜະລິດ A", location_code: "PROD-A" },
    asset_spec: "ເຄື່ອງປະກອບອິເລັກໂຕຣນິກ ຂະໜາດກາງ",
    asset_date: new Date("2023-12-01"),
    asset_currency: "THB",
    asset_value: 180000,
    asset_status: "MAINTENANCE",
    warranty_end_date: new Date("2025-12-01"),
    supplier_id: 4,
    supplier: { id: 4, supplier_name: "ບໍລິສັດໄທ Equipment" },
    has_depreciation: "Y",
    dpca_type: "ProductionUnit",
    dpca_percentage: null,
    asset_useful_life: 5,
    asset_salvage_value: 20000,
    dpca_start_date: new Date("2024-01-01"),
    dpca_end_date: new Date("2029-01-01"),
    asset_accu_dpca_value: 48000,
    asset_value_remain: 132000,
    asset_latest_date_dpca: new Date("2025-05-01"),
    asset_disposal_date: null,
    asset_ac_date: new Date("2023-12-05"),
    asset_ac_datetime: new Date("2023-12-05T16:45:00"),
    asset_ac_by: 1003,
    created_at: new Date("2023-12-01T14:20:00"),
    updated_at: new Date("2025-05-15T09:30:00"),
  },
  {
    id: 5,
    asset_id: 5,
    asset_chart: { id: 5, asset_name: "ເຄື່ອງຈັກເກົ່າ", asset_code: "OLD001" },
    asset_serial_no: "OLD12345",
    asset_tag: "FA-005",
    asset_location_id: null,
    location: null,
    asset_spec: "ເຄື່ອງຈັກຜະລິດເກົ່າ ໝົດອາຍຸການໃຊ້ງານ",
    asset_date: new Date("2020-01-01"),
    asset_currency: "LAK",
    asset_value: 100000000,
    asset_status: "DISPOSED",
    warranty_end_date: null,
    supplier_id: 1,
    supplier: { id: 1, supplier_name: "ບໍລິສັດ ABC ຈຳກັດ" },
    has_depreciation: "Y",
    dpca_type: "Straight-line",
    dpca_percentage: 20,
    asset_useful_life: 5,
    asset_salvage_value: 10000000,
    dpca_start_date: new Date("2020-02-01"),
    dpca_end_date: new Date("2025-02-01"),
    asset_accu_dpca_value: 90000000,
    asset_value_remain: 10000000,
    asset_latest_date_dpca: new Date("2025-02-01"),
    asset_disposal_date: new Date("2025-06-01"),
    asset_ac_date: new Date("2020-01-10"),
    asset_ac_datetime: new Date("2020-01-10T13:00:00"),
    asset_ac_by: 1002,
    created_at: new Date("2020-01-01T10:00:00"),
    updated_at: new Date("2025-06-01T14:30:00"),
  },
]);

const filteredData = computed(() => {
  let data = mockData.value;
  
  // Filter by status
  if (selectedStatus.value !== "all") {
    data = data.filter(item => item.asset_status === selectedStatus.value);
  }
  
  
  if (search.value) {
    data = data.filter(item =>
      item.asset_tag.toLowerCase().includes(search.value.toLowerCase()) ||
      item.asset_serial_no?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.asset_chart?.asset_name?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.asset_spec?.toLowerCase().includes(search.value.toLowerCase())
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
  return `${symbols[currency as keyof typeof symbols] || ""} ${formatter.format(value)}`;
};

const getStatusColor = (status: string) => {
  const colors = {
    ACTIVE: "success",
    INACTIVE: "warning",
    MAINTENANCE: "info",
    DISPOSED: "error",
  };
  return colors[status as keyof typeof colors] || "grey";
};

const getStatusText = (status: string) => {
  const texts = {
    ACTIVE: "ເປີດໃຊ້ງານ",
    INACTIVE: "ປິດໃຊ້ງານ",
    MAINTENANCE: "ບຳລຸງຮັກສາ",
    DISPOSED: "ຖອນຈຳໜ່າຍ",
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
      await faAssetStoreInstance.DeleteFaAsset(item.id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedStatus.value = "all";
  search.value = "";
};

onMounted(async () => {
  loading.value = true;
  try {
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
  <GlobalTextTitleLine :title="title" />

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex">
          <v-btn color="primary" @click="goPath(`/property/faasset/create`)" v-if="canAdd">
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຊັບສົມບັດ
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-select
          v-model="selectedStatus"
          :items="assetStatuses"
          item-title="title"
          item-value="value"
          label="ສະຖານະຊັບສົມບັດ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກສະຖານະ"
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

    <v-data-table :headers="headers" :items="filteredData || []" class="text-no-wrap">
      <!-- Header styling -->
      <template v-slot:header.id="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_tag="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_serial_no="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_location_id="{ column }">
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

      <!-- Data items -->
      <template v-slot:item.id="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.id }}
        </v-chip>
      </template>

      <template v-slot:item.asset_tag="{ item }">
        <span class="font-weight-bold">{{ item.asset_tag }}</span>
      </template>

      <template v-slot:item.asset_serial_no="{ item }">
        <span>{{ item.asset_serial_no || '-' }}</span>
      </template>

      <template v-slot:item.asset_id="{ item }">
        <div class="text-center">
          <div v-if="item.asset_chart">
            <p class="text-body-2 font-weight-medium">{{ item.asset_chart.asset_name }}</p>
            <p class="text-caption text-grey">{{ item.asset_chart.asset_code }}</p>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.asset_location_id="{ item }">
        <div class="text-center">
          <div v-if="item.location">
            <p class="text-body-2">{{ item.location.location_name }}</p>
            <p class="text-caption text-grey">{{ item.location.location_code }}</p>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.asset_date="{ item }">
        {{ formatDate(item.asset_date) }}
      </template>

      <template v-slot:item.asset_value="{ item }">
        <div class="text-end">
          <span class="font-weight-bold">{{ formatCurrency(item.asset_value, item.asset_currency) }}</span>
        </div>
      </template>

      <template v-slot:item.asset_value_remain="{ item }">
        <div class="text-end">
          <span class="font-weight-bold text-success">{{ formatCurrency(item.asset_value_remain, item.asset_currency) }}</span>
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
            <v-list>
              <v-list-item @click="handleStatusChange(item, 'ACTIVE')">
                <v-list-item-title>ເປີດໃຊ້ງານ</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleStatusChange(item, 'INACTIVE')">
                <v-list-item-title>ປິດໃຊ້ງານ</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleStatusChange(item, 'MAINTENANCE')">
                <v-list-item-title>ບຳລຸງຮັກສາ</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleStatusChange(item, 'DISPOSED')">
                <v-list-item-title>ຖອນຈຳໜ່າຍ</v-list-item-title>
              </v-list-item>
            </v-list>
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
            {{ item.has_depreciation === 'Y' ? 'ມີ' : 'ບໍ່ມີ' }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.view="{ item }">
        <v-btn
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="goPath(`/property/faasset/detail?id_faasset=${item.id}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/faasset/edit?id_faasset=${item.id}`)"
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

      <template v-slot:item.depreciation="{ item }">
        <v-btn
          v-if="item.has_depreciation === 'Y' && item.asset_status === 'ACTIVE'"
          small
          flat
          class="text-warning"
          icon="mdi-calculator"
          @click="calculateDepreciation(item)"
        >
          <v-tooltip activator="parent" location="top">ຄິດເສື່ອມລາຄາ</v-tooltip>
        </v-btn>
      </template>
    </v-data-table>
  </v-col>

  <!-- Success notification -->
  <v-snackbar
    v-model="showSuccess"
    color="success"
    timeout="3000"
    location="top"
  >
    <v-icon class="mr-2">mdi-check-circle</v-icon>
    {{ successMessage }}
  </v-snackbar>

  <!-- Error notification -->
  <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
    <v-icon class="mr-2">mdi-alert-circle</v-icon>
    {{ errorMessage }}
  </v-snackbar>
</template>