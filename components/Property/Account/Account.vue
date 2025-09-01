<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const accountStoreInstance = accountStore();

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.RECORD_STAT === "O" ? "C" : "O";
    const statusText = newStatus === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະບັນຊີນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await accountStoreInstance.UpdateAccountStatus(
        item.account_id,
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
const selectedAccountType = ref("all");

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

const title = "ຈັດການແຜນຜັງບັນຊີ";

const accountTypes = [
  { title: "ທັງໝົດ", value: "all" },
  { title: "ຊັບສິນ", value: "Asset" },
  { title: "ໜີ້ສິນ", value: "Liability" },
  { title: "ທຶນ", value: "Equity" },
  { title: "ລາຍຮັບ", value: "Revenue" },
  { title: "ຄ່າໃຊ້ຈ່າຍ", value: "Expense" },
];

const headers = computed(() => [
  {
    title: "ລະຫັດບັນຊີ",
    value: "account_code",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ຊື່ບັນຊີ",
    value: "account_name",
    align: "start",
    sortable: true,
    filterable: true,
    width: "250px",
    class: "text-h6",
  },
  {
    title: "ປະເພດບັນຊີ",
    value: "account_type",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ບັນຊີແມ່",
    value: "parent_account",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ຄຳອະທິບາຍ",
    value: "description",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
  },
  {
    title: "ເວລາເພີ່ມ",
    value: "created_at",
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
  
 ] as any);

const mockData = ref([
  {
    account_id: 1,
    account_code: "1000000",
    account_name: "ຊັບສິນ",
    account_type: "Asset",
    parent_account_id: null,
    parent_account: null,
    description: "ບັນຊີຫຼັກຊັບສິນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-16T13:13:00+07:00"),
    updated_at: new Date("2025-06-16T13:13:00+07:00"),
  },
  {
    account_id: 2,
    account_code: "1100000",
    account_name: "ຊັບສິນຫມູນວຽນ",
    account_type: "Asset",
    parent_account_id: 1,
    parent_account: { account_code: "1000000", account_name: "ຊັບສິນ" },
    description: "ບັນຊີຍ່ອຍຊັບສິນຫມູນວຽນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-16T13:15:00+07:00"),
    updated_at: new Date("2025-06-16T13:15:00+07:00"),
  },
  {
    account_id: 3,
    account_code: "1101100",
    account_name: "ເງິນສົດໃນມື",
    account_type: "Asset",
    parent_account_id: 2,
    parent_account: { account_code: "1100000", account_name: "ຊັບສິນຫມູນວຽນ" },
    description: "ເງິນສົດທີ່ມີໃນມື",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-16T13:20:00+07:00"),
    updated_at: new Date("2025-06-16T13:20:00+07:00"),
  },
  {
    account_id: 4,
    account_code: "1441001",
    account_name: "ຊັບສົມບັດຄົງທີ່ - ເຄື່ອງຈັກ A",
    account_type: "Asset",
    parent_account_id: null,
    parent_account: null,
    description: "ເຄື່ອງຈັກແລະອຸປະກອນການຜະລິດ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-15T09:00:00+07:00"),
    updated_at: new Date("2025-06-16T10:30:00+07:00"),
  },
  {
    account_id: 5,
    account_code: "2000000",
    account_name: "ໜີ້ສິນ",
    account_type: "Liability",
    parent_account_id: null,
    parent_account: null,
    description: "ບັນຊີຫຼັກໜີ້ສິນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-14T14:45:00+07:00"),
    updated_at: new Date("2025-06-15T16:20:00+07:00"),
  },
  {
    account_id: 6,
    account_code: "3000000",
    account_name: "ທຶນ",
    account_type: "Equity",
    parent_account_id: null,
    parent_account: null,
    description: "ບັນຊີຫຼັກທຶນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-13T11:10:00+07:00"),
    updated_at: new Date("2025-06-14T12:00:00+07:00"),
  },
  {
    account_id: 7,
    account_code: "4000000",
    account_name: "ລາຍຮັບ",
    account_type: "Revenue",
    parent_account_id: null,
    parent_account: null,
    description: "ບັນຊີຫຼັກລາຍຮັບ",
    RECORD_STAT: "C",
    created_at: new Date("2025-06-12T08:30:00+07:00"),
    updated_at: new Date("2025-06-13T09:15:00+07:00"),
  },
  {
    account_id: 8,
    account_code: "5000000",
    account_name: "ຄ່າໃຊ້ຈ່າຍ",
    account_type: "Expense",
    parent_account_id: null,
    parent_account: null,
    description: "ບັນຊີຫຼັກຄ່າໃຊ້ຈ່າຍ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-11T10:15:00+07:00"),
    updated_at: new Date("2025-06-12T11:20:00+07:00"),
  },
]);

const filteredData = computed(() => {
  let data = mockData.value;

  if (selectedAccountType.value !== "all") {
    data = data.filter(
      (item) => item.account_type === selectedAccountType.value
    );
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.account_name.toLowerCase().includes(search.value.toLowerCase()) ||
        item.account_code.toLowerCase().includes(search.value.toLowerCase()) ||
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

const getAccountTypeColor = (type: string) => {
  const colors = {
    Asset: "success",
    Liability: "error",
    Equity: "primary",
    Revenue: "info",
    Expense: "warning",
  };
  return colors[type as keyof typeof colors] || "grey";
};

const getAccountTypeText = (type: string) => {
  const types = {
    Asset: "ຊັບສິນ",
    Liability: "ໜີ້ສິນ",
    Equity: "ທຶນ",
    Revenue: "ລາຍຮັບ",
    Expense: "ຄ່າໃຊ້ຈ່າຍ",
  };
  return types[type as keyof typeof types] || type;
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບບັນຊີ "${item.account_name}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      await accountStoreInstance.DeleteAccount(item.account_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const authorizeAccount = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການອະນຸມັດ",
      text: `ທ່ານຕ້ອງການອະນຸມັດບັນຊີ "${item.account_name}" ໃຊ່ບໍ່?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ອະນຸມັດ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#28a745",
    });

    if (notification.isConfirmed) {
      CallSwal({
        title: "ສຳເລັດ",
        text: "ສຳເລັດການອະນຸມັດບັນຊີ",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error authorizing account:", error);
  }
};

const clearFilters = async () => {
  selectedAccountType.value = "all";
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
            @click="goPath(`/property/account/create`)"
            v-if="canAdd"
          >
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມບັນຊີໃໝ່
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-select
          v-model="selectedAccountType"
          :items="accountTypes"
          item-title="title"
          item-value="value"
          label="ປະເພດບັນຊີ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກປະເພດບັນຊີ"
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
          placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່, ຄຳອະທິບາຍ..."
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
      <template v-slot:header.account_code="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.account_name="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.account_type="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.parent_account="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.description="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.created_at="{ column }">
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

      <template v-slot:header.authorize="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:item.account_code="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.account_code }}
        </v-chip>
      </template>

      <template v-slot:item.account_name="{ item }">
        <div class="d-flex align-center">
          <div v-if="item.parent_account_id" class="mr-2">
            <v-icon size="small" color="grey"
              >mdi-subdirectory-arrow-right</v-icon
            >
          </div>
          <span :class="{ 'font-weight-bold': !item.parent_account_id }">
            {{ item.account_name }}
          </span>
        </div>
      </template>

      <template v-slot:item.account_type="{ item }">
        <div class="text-center">
          <v-chip
            :color="getAccountTypeColor(item.account_type)"
            variant="flat"
            size="small"
          >
            {{ getAccountTypeText(item.account_type) }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.parent_account="{ item }">
        <div class="text-center">
          <div v-if="item.parent_account">
            <p>{{ item.parent_account.account_name || "No Data" }}</p>
            <p>{{ item.parent_account.account_code || "ບໍ່ມີຂໍ້ມູນ" }}</p>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.description="{ item }">
        <div class="text-truncate" style="max-width: 200px">
          {{ item.description || "-" }}
          <v-tooltip activator="parent" location="top" v-if="item.description">
            {{ item.description }}
          </v-tooltip>
        </div>
      </template>

      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
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
          @click="goPath(`/property/account/detail=${item.account_id}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/account/edit=${item.account_id}`)"
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
