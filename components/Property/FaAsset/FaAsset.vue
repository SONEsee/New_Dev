<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const faAssetStoreInstance = faAssetStore();
const mockData = computed(() => {
  return faAssetStoreInstance.response_fa_asset_list;
});
onMounted(() => {
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

const title = "ຈັດການຊັບສົມບັດພວມຊື້ພວມກໍ່ສ້າງ";

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
    value: "asset_list_id",
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

  // Filter by status
  if (selectedStatus.value !== "all") {
    data = data.filter((item) => item.asset_status === selectedStatus.value);
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.asset_tag.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_serial_no
          ?.toLowerCase()
          .includes(search.value.toLowerCase()) ||
        item.asset_chart?.asset_name
          ?.toLowerCase()
          .includes(search.value.toLowerCase()) ||
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
  return `${symbols[currency as keyof typeof symbols] || ""} ${formatter.format(
    value
  )}`;
};

const getStatusColor = (status: string) => {
  const colors = {
    ACTIVE: "success",
    INACTIVE: "warning",
    MAINTENANCE: "info",
    DISPOSED: "error",
    UNDER_CONSTRUCTION: "primary",
    DAMAGED: "secondary",
  };
  return colors[status as keyof typeof colors] || "grey";
};

const getStatusText = (status: string) => {
  const texts = {
    ACTIVE: "ເປີດໃຊ້ງານ",
    INACTIVE: "ປິດໃຊ້ງານ",
    MAINTENANCE: "ບຳລຸງຮັກສາ",
    DISPOSED: "ຖອນຈຳໜ່າຍ",
    UNDER_CONSTRUCTION: "ພວມຊື້ພວມກໍ່ສ້າງ",
    DAMAGED: "ເສຍຫາຍ",
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
          <v-btn
            color="primary"
            @click="goPath(`/property/faasset/create`)"
            v-if="canAdd"
          >
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

    <v-data-table
      :headers="headers"
      :items="filteredData || []"
      class="text-no-wrap"
    >
      <template v-slot:header.asset_list_id="{ column }">
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

      <template v-slot:item.asset_list_id="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.asset_list_id }}
        </v-chip>
      </template>

      <template v-slot:item.asset_tag="{ item }">
        <span class="font-weight-bold">{{ item.asset_tag }}</span>
      </template>

      <template v-slot:item.asset_serial_no="{ item }">
        <span>{{ item.asset_serial_no || "-" }}</span>
      </template>

      <template v-slot:item.asset_id="{ item }">
        <div class="text-center">
          <div v-if="item.asset_chart">
            <p class="text-body-2 font-weight-medium">
              {{ item.asset_chart.asset_name }}
            </p>
            <p class="text-caption text-grey">
              {{ item.asset_chart.asset_code }}
            </p>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.asset_location_id="{ item }">
        <div class="text-center">
          <div v-if="item.location">
            <p class="text-body-2">{{ item.location.location_name }}</p>
            <p class="text-caption text-grey">
              {{ item.location.location_code }}
            </p>
          </div>
          <span v-else class="text-grey">-</span>
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
            goPath(`/property/faasset/detail?id_faasset=${item.asset_list_id}`)
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
            goPath(`/property/faasset/edit?id_faasset=${item.asset_list_id}`)
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

      <template v-slot:item.depreciation="{ item }">
        <v-btn
          v-if="item.has_depreciation === 'Y' && item.asset_status === 'ACTIVE'"
          small
          flat
          icon="mdi-calculator"
          @click="calculateDepreciation(item)"
        >
          <v-icon icon="mdi-calculator"></v-icon>
          <v-tooltip activator="parent" location="top">ຄິດເສື່ອມລາຄາ</v-tooltip>
        </v-btn>
        <v-chip v-else color="primary"
          ><p class="text-primary">ຍັງບໍ່ມີຄ່າເສືອມ</p></v-chip
        >
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

  <!-- Error notification -->
  <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
    <v-icon class="mr-2">mdi-alert-circle</v-icon>
    {{ errorMessage }}
  </v-snackbar>
</template>
