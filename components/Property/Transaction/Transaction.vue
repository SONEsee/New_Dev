<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const transactionTypeStoreInstance = transactionTypeStore();

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.record_stat === 'O' ? 'C' : 'O';
    const statusText = newStatus === 'O' ? 'ເປີດ' : 'ປິດ';
    
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະປະເພດທຸລະກຳນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await transactionTypeStoreInstance.UpdateTransactionTypeStatus(item.tranID, newStatus);
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

const title = "ຈັດການປະເພດທຸລະກຳ";

const headers = computed(() => [
  {
    title: "ລະຫັດ",
    value: "tranID",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ຊື່ປະເພດທຸລະກຳ (ລາວ)",
    value: "tranNameL",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-h6",
  },
  {
    title: "ຊື່ປະເພດທຸລະກຳ (ອັງກິດ)",
    value: "tranNameE",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-subtitle-1",
  },
  {
    title: "ຄຳອະທິບາຍ",
    value: "description",
    align: "start",
    sortable: true,
    filterable: true,
    width: "250px",
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
          value: "record_stat",
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

const mockData = ref([
  {
    tranID: 1,
    tranNameL: "ຮັບເງິນ",
    tranNameE: "Receipt",
    description: "ທຸລະກຳການຮັບເງິນຈາກລູກຄ້າ",
    record_stat: "O",
    created_at: new Date("2025-06-16T13:13:00+07:00"),
    updated_at: new Date("2025-06-16T13:13:00+07:00"),
  },
  {
    tranID: 2,
    tranNameL: "ຈ່າຍເງິນ",
    tranNameE: "Payment",
    description: "ທຸລະກຳການຈ່າຍເງິນໃຫ້ຜູ້ສະໜອງ",
    record_stat: "O",
    created_at: new Date("2025-06-15T09:00:00+07:00"),
    updated_at: new Date("2025-06-16T10:30:00+07:00"),
  },
  {
    tranID: 3,
    tranNameL: "ໂອນເງິນ",
    tranNameE: "Transfer",
    description: "ທຸລະກຳການໂອນເງິນລະຫວ່າງບັນຊີ",
    record_stat: "O",
    created_at: new Date("2025-06-14T14:45:00+07:00"),
    updated_at: new Date("2025-06-15T16:20:00+07:00"),
  },
  {
    tranID: 4,
    tranNameL: "ປັບຍອດ",
    tranNameE: "Adjustment",
    description: "ທຸລະກຳການປັບປຸງຍອດບັນຊີ",
    record_stat: "C",
    created_at: new Date("2025-06-13T11:10:00+07:00"),
    updated_at: new Date("2025-06-14T12:00:00+07:00"),
  },
  {
    tranID: 5,
    tranNameL: "ຖອນເງິນ",
    tranNameE: "Withdrawal",
    description: "ທຸລະກຳການຖອນເງິນຈາກບັນຊີ",
    record_stat: "O",
    created_at: new Date("2025-06-12T08:30:00+07:00"),
    updated_at: new Date("2025-06-13T09:15:00+07:00"),
  },
]);

const filteredData = computed(() => {
  if (!search.value) return mockData.value;
  
  return mockData.value.filter(item =>
    item.tranNameL.toLowerCase().includes(search.value.toLowerCase()) ||
    item.tranNameE.toLowerCase().includes(search.value.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.value.toLowerCase())
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
      text: `ທ່ານຕ້ອງການລຶບປະເພດທຸລະກຳ "${item.tranNameL}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });
    
    if (notification.isConfirmed) {
      await transactionTypeStoreInstance.DeleteTransactionType(item.tranID);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
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
          <v-btn color="primary" @click="goPath(`/property/transection/create`)" v-if="canAdd">
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດທຸລະກຳ
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="ຄົ້ນຫາ"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ຄົ້ນຫາຕາມຊື່, ຄຳອະທິບາຍ..."
        />
      </v-col>

      <v-col cols="12" md="3">
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
    
      <template v-slot:header.tranID="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.tranNameL="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.tranNameE="{ column }">
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

      <template v-slot:header.record_stat="{ column }">
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

      
      <template v-slot:item.tranID="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.tranID }}
        </v-chip>
      </template>

      <template v-slot:item.tranNameL="{ item }">
        <span class="font-weight-bold">{{ item.tranNameL }}</span>
      </template>

      <template v-slot:item.tranNameE="{ item }">
        <span class="text-grey-darken-1">{{ item.tranNameE }}</span>
      </template>

      <template v-slot:item.description="{ item }">
        <div class="text-truncate" style="max-width: 250px;">
          {{ item.description || '-' }}
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

      <template v-slot:item.record_stat="{ item }">
        <div>
          <v-btn
            v-if="item.record_stat === 'O'"
            flat
            @click="handleSubmit(item)"
          >
            <v-icon color="info">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.record_stat === 'C'"
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
          @click="goPath(`/property/transection/detail?tarn_id=${item.tranID}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/transection/edit?tarn_id=${item.tranID}`)"
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