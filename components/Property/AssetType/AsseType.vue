<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const accountStoreInstance = accountStore();

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.RECORD_STAT === 'O' ? 'C' : 'O';
    const statusText = newStatus === 'O' ? 'ເປີດ' : 'ປິດ';
    
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະບັນຊີນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await accountStoreInstance.UpdateAccountStatus(item.account_id, newStatus);
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
  { title: "ລະຫັດບັນຊີ", value: "account_code", width: "120px" },
  { title: "ຊື່ບັນຊີ", value: "account_name", width: "250px" },
  { title: "ປະເພດບັນຊີ", value: "account_type", width: "120px" },
  { title: "ບັນຊີແມ່", value: "parent_account", width: "150px" },
  { title: "ຄຳອະທິບາຍ", value: "description", width: "200px" },
  { title: "ເວລາເພີ່ມ", value: "created_at", width: "150px" },
  { title: "ເວລາແກ້ໄຂ", value: "updated_at", width: "150px" },

  ...(canView.value
    ? [
        {
          title: "ເບິ່ງ",
          value: "view",
          sortable: false,
          align: "center",
          width: "5px",
        },
      ]
    : []),
  ...(canEdit.value
    ? [
        {
          title: "ແກ້ໄຂ",
          value: "edit",
          sortable: false,
          align: "center",
          width: "5px",
        },
      ]
    : []),
  ...(canDelete.value
    ? [
        {
          title: "ລົບ",
          value: "delete",
          sortable: false,
          align: "center",
          width: "5px",
        },
      ]
    : []),
  ...(canRecordStatus.value
    ? [{ title: "ສະຖານະ", value: "RECORD_STAT", align: "center", width: "5px" }]
    : []),
]);

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
  
  // Filter by account type
  if (selectedAccountType.value !== "all") {
    data = data.filter(item => item.account_type === selectedAccountType.value);
  }
  
  // Filter by search
  if (search.value) {
    data = data.filter(item =>
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

onMounted(async () => {
  loading.value = true;
  try {
    initializeRole();
    roleStore.GetRoleDetail();
    // await accountStoreInstance.GetAccountList(); // ເປີດເມື່ອເຊື່ອມຕໍ່ API
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
  <v-col cols="12">
    <div class="pa-3">
      <GlobalTextTitleLine :title="title" />

      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-btn
            v-if="canAdd"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            class="text-none font-weight-medium"
            @click="goPath(`/account/create`)"
          >
            ເພີ່ມບັນຊີໃໝ່
          </v-btn>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedAccountType"
            :items="accountTypes"
            item-title="title"
            item-value="value"
            label="ປະເພດບັນຊີ"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        
        <v-spacer />
        
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            label="ຄົ້ນຫາ"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່, ຄຳອະທິບາຍ..."
          />
        </v-col>
      </v-row>

      <v-data-table
        :items="filteredData"
        :headers="headers"
        :search="search"
        class="elevation-1 rounded-lg"
        :loading="loading"
        hover
        items-per-page="10"
      >
        <!-- Header styling -->
        <template v-slot:header.account_code="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.account_name="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.account_type="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.parent_account="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.description="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.created_at="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.updated_at="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.RECORD_STAT="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.edit="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.view="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.delete="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <!-- Data items -->
        <template #item.edit="{ item }">
          <v-btn
            color="primary"
            variant="text"
            size="small"
            icon="mdi-pencil"
            @click="goPath(`/account/edit/?account_id=${item.account_id}`)"
          >
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">ແກ້ໄຂ</v-tooltip>
          </v-btn>
        </template>

        <template #item.view="{ item }">
          <v-btn
            color="info"
            variant="text"
            size="small"
            icon="mdi-eye"
            @click="goPath(`/account/detail/?account_id=${item.account_id}`)"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">ເບິ່ງລາຍລະອຽດ</v-tooltip>
          </v-btn>
        </template>

        <template #item.delete="{ item }">
          <v-btn
            color="error"
            variant="text"
            size="small"
            icon="mdi-delete"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">ລົບ</v-tooltip>
          </v-btn>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-database-off
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ມີຂໍ້ມູນບັນຊີ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ເລີ່ມຕົ້ນໂດຍການເພີ່ມບັນຊີໃໝ່
            </p>
          </div>
        </template>
      </v-data-table>
    </div>

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
  </v-col>
</template>

<style scoped>
:deep(.v-data-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>item.account_code="{ item }">
          <v-chip color="primary" variant="outlined" size="small">
            {{ item.account_code }}
          </v-chip>
        </template>

        <template #item.account_name="{ item }">
          <div class="d-flex align-center">
            <div v-if="item.parent_account_id" class="mr-2">
              <v-icon size="small" color="grey">mdi-subdirectory-arrow-right</v-icon>
            </div>
            <span :class="{ 'font-weight-bold': !item.parent_account_id }">
              {{ item.account_name }}
            </span>
          </div>
        </template>

        <template #item.account_type="{ item }">
          <v-chip 
            :color="getAccountTypeColor(item.account_type)" 
            variant="flat" 
            size="small"
          >
            {{ getAccountTypeText(item.account_type) }}
          </v-chip>
        </template>

        <template #item.parent_account="{ item }">
          <div v-if="item.parent_account">
            <div class="text-caption text-grey">{{ item.parent_account.account_code }}</div>
            <div class="text-body-2">{{ item.parent_account.account_name }}</div>
          </div>
          <span v-else class="text-grey">-</span>
        </template>

        <template #item.description="{ item }">
          <div class="text-truncate" style="max-width: 200px;">
            {{ item.description || '-' }}
            <v-tooltip activator="parent" location="top" v-if="item.description">
              {{ item.description }}
            </v-tooltip>
          </div>
        </template>

        <template #item.RECORD_STAT="{ item }">
          <v-btn @click="handleSubmit(item)" flat>
            <v-icon
              :icon="item.RECORD_STAT === 'O' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
              :color="item.RECORD_STAT === 'O' ? 'primary' : 'error'"
              size="small"
            ></v-icon>
          </v-btn>
        </template>

        <template #item.created_at="{ item }">
          <span>{{ formatDate(item.created_at) }}</span>
        </template>

        <template #item.updated_at="{ item }">
          <span>{{ formatDate(item.updated_at) }}</span>
        </template>

        