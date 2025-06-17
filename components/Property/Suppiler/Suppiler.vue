<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const supplierStoreInstance = supplierStore();

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.RECORD_STAT === 'O' ? 'C' : 'O';
    const statusText = newStatus === 'O' ? 'ເປີດ' : 'ປິດ';
    
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະຜູ້ສະໜອງນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await supplierStoreInstance.UpdateSupplierStatus(item.supplier_id, newStatus);
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

const title = "ຈັດການຜູ້ສະໜອງ";

const headers = computed(() => [
  { title: "ລະຫັດຜູ້ສະໜອງ", value: "supplier_code", width: "150px" },
  { title: "ຊື່ຜູ້ສະໜອງ", value: "supplier_name", width: "200px" },
  { title: "ຜູ້ຕິດຕໍ່", value: "contact_person", width: "150px" },
  { title: "ເບີໂທ", value: "phone", width: "120px" },
  { title: "ອີເມວ", value: "email", width: "180px" },
  { title: "ທີ່ຢູ່", value: "address", width: "250px" },
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
    supplier_id: 1,
    supplier_code: "SUP001",
    supplier_name: "ບໍລິສັດ ABC ຈຳກັດ",
    contact_person: "ທ້າວ ສົມຊາຍ",
    phone: "020-12345678",
    email: "contact@abc.com.la",
    address: "ບ້ານ ດົງໂດກ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງ ວຽງຈັນ",
    RECORD_STAT: "O", 
    created_at: new Date("2025-06-16T13:13:00+07:00"),
    updated_at: new Date("2025-06-16T13:13:00+07:00"),
  },
  {
    supplier_id: 2,
    supplier_code: "SUP002",
    supplier_name: "ບໍລິສັດ XYZ ຈຳກັດ",
    contact_person: "ນາງ ສົມຫຍິງ",
    phone: "020-87654321",
    email: "info@xyz.com.la",
    address: "ບ້ານ ນາດອກໄມ້, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງ ວຽງຈັນ",
    RECORD_STAT: "C", 
    created_at: new Date("2025-06-15T09:00:00+07:00"),
    updated_at: new Date("2025-06-16T10:30:00+07:00"),
  },
  {
    supplier_id: 3,
    supplier_code: "SUP003",
    supplier_name: "ຫ້າງຮ້ານ 123 ຈຳກັດ",
    contact_person: "ທ້າວ ບຸນມີ",
    phone: "020-11223344",
    email: "sales@shop123.la",
    address: "ບ້ານ ຫາດຊາຍໃຕ້, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງ ວຽງຈັນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-14T14:45:00+07:00"),
    updated_at: new Date("2025-06-15T16:20:00+07:00"),
  },
  {
    supplier_id: 4,
    supplier_code: "SUP004",
    supplier_name: "ບໍລິສັດ ໂລຈິສຕິກ ພ້ອມ ຈຳກັດ",
    contact_person: "ນາງ ອຸໄລ",
    phone: "020-99887766",
    email: "logistics@prom.la",
    address: "ບ້ານ ດົງປາເລົາ, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງ ວຽງຈັນ",
    RECORD_STAT: "O",
    created_at: new Date("2025-06-13T11:10:00+07:00"),
    updated_at: new Date("2025-06-14T12:00:00+07:00"),
  },
  {
    supplier_id: 5,
    supplier_code: "SUP005",
    supplier_name: "ຮ້ານຄ້າ ທົ່ວໄປ ດີ",
    contact_person: "ທ້າວ ວັນໄຊ",
    phone: "020-55443322",
    email: "general@dee.la",
    address: "ບ້ານ ພອນຊານ, ເມືອງ ຫາດຊາຍຟອງ, ນະຄອນຫຼວງ ວຽງຈັນ",
    RECORD_STAT: "C",
    created_at: new Date("2025-06-12T08:30:00+07:00"),
    updated_at: new Date("2025-06-13T09:15:00+07:00"),
  },
]);

const filteredData = computed(() => {
  if (!search.value) return mockData.value;
  
  return mockData.value.filter(item =>
    item.supplier_name.toLowerCase().includes(search.value.toLowerCase()) ||
    item.supplier_code.toLowerCase().includes(search.value.toLowerCase()) ||
    item.contact_person?.toLowerCase().includes(search.value.toLowerCase()) ||
    item.phone?.includes(search.value) ||
    item.email?.toLowerCase().includes(search.value.toLowerCase())
  );
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

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບຜູ້ສະໜອງ "${item.supplier_name}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });
    
    if (notification.isConfirmed) {
      await supplierStoreInstance.DeleteSupplier(item.supplier_id);
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
        <v-col cols="12" md="6">
          <v-btn
            v-if="canAdd"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            class="text-none font-weight-medium"
            @click="goPath(`/property/supplier/create`)"
          >
            ເພີ່ມຜູ້ສະໜອງ
          </v-btn>
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
            placeholder="ຄົ້ນຫາຕາມຊື່, ລະຫັດ, ຜູ້ຕິດຕໍ່..."
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
       
        <template v-slot:header.supplier_code="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.supplier_name="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.contact_person="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.phone="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.email="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.address="{ column }">
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

       
        <template #item.contact_person="{ item }">
          <span>{{ item.contact_person || '-' }}</span>
        </template>

        <template #item.phone="{ item }">
          <span>{{ item.phone || '-' }}</span>
        </template>

        <template #item.email="{ item }">
          <span>{{ item.email || '-' }}</span>
        </template>

        <template #item.address="{ item }">
          <div class="text-truncate" style="max-width: 250px;">
            {{ item.address || '-' }}
            <v-tooltip activator="parent" location="top" v-if="item.address">
              {{ item.address }}
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

        <template #item.edit="{ item }">
          <v-btn
            color="primary"
            variant="text"
            size="small"
            icon="mdi-pencil"
            @click="goPath(`/property/supplier/edit/?supplier_id=${item.supplier_id}`)"
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
            @click="goPath(`/property/supplier/detail/?supplier_id=${item.supplier_id}`)"
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
              ບໍ່ມີຂໍ້ມູນຜູ້ສະໜອງ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ເລີ່ມຕົ້ນໂດຍການເພີ່ມຜູ້ສະໜອງໃໝ່
            </p>
          </div>
        </template>
      </v-data-table>
    </div>

   
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
</style>