<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
const proppertyStore = propertyStore();

const handlesubmit = async (mockData: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: "ທ່ານຕ້ອງການບັນທຶກຂໍ້ມູນນີ້ໃຫ້ແນ່?",
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    if (notification) {
      CallSwal({
        title: "ຍັງບໍ່ສົມບູນ",
        text: "ທ່ານຕອ້ງໄດ້ຕໍ່ api ກອ່ນ",
        icon: "warning",
      });
      setTimeout(() => {}, 1000);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
const search = ref("");
const dialog = ref(false);
const deleteDialog = ref(false);
const viewDialog = ref(false);
const editMode = ref(false);
const valid = ref(false);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
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
const formData = ref({
  type_id: null,
  type_code: "",
  type_name: "",
  description: "",
  is_active: true,
});

const itemToDelete = ref(null);
const selectedItem = ref(null);
const form = ref(null);

const rules = {
  required: (value: any) => !!value || "ກະລຸນາໃສ່ຂໍ້ມູນ",
};

const title = "ຈັດການປະເພດຊັບສິນ";

const headers = computed(() => [
  { title: "ລະຫັດ", value: "type_code", width: "120px" },
  { title: "ຊື່", value: "type_name", width: "200px" },
  { title: "ຄຳອະທິບາຍ", value: "description", width: "300px" },

  { title: "ເວລາເພີ່ມ", value: "created_at", width: "150px" },
  { title: "ເວລາແກ້ໄຂ", value: "updated_at", width: "150px" },

  ...(canView.value
    ? [
        {
          title: "ເບິ່ງ",
          value: "weiw",
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
  ...(canAdd.value
    ? [{ title: "ສະຖານະ", value: "is_active", align: "center", width: "5px" }]
    : []),
]);

const mockData = ref([
  {
    type_id: 1,
    type_code: "T001",
    type_name: "ປະເພດທີ່ 1",
    description: "ນີ້ແມ່ນຄຳອະທິບາຍສຳລັບປະເພດທີ່ 1 ໃນພາສາລາວ.",
    is_active: true,
    created_at: new Date("2025-06-16T13:13:00+07:00"),
    updated_at: new Date("2025-06-16T13:13:00+07:00"),
  },
  {
    type_id: 2,
    type_code: "T002",
    type_name: "ປະເພດທີ່ 2",
    description: "ຄຳອະທິບາຍສຳລັບປະເພດທີ່ 2, ລາຍລະອຽດເພີ່ມເຕີມ.",
    is_active: false,
    created_at: new Date("2025-06-15T09:00:00+07:00"),
    updated_at: new Date("2025-06-16T10:30:00+07:00"),
  },
  {
    type_id: 3,
    type_code: "T003",
    type_name: "ປະເພດທີ່ 3",
    description: "ລາຍລະອຽດຂອງປະເພດທີ່ 3 ສຳລັບການນໍາໃຊ້ທົ່ວໄປ.",
    is_active: true,
    created_at: new Date("2025-06-14T14:45:00+07:00"),
    updated_at: new Date("2025-06-15T16:20:00+07:00"),
  },
  {
    type_id: 4,
    type_code: "T004",
    type_name: "ປະເພດທີ່ 4",
    description: "ຄຳອະທິບາຍສຳລັບປະເພດທີ່ 4, ໃຊ້ໃນກໍລະນີພິເສດ.",
    is_active: true,
    created_at: new Date("2025-06-13T11:10:00+07:00"),
    updated_at: new Date("2025-06-14T12:00:00+07:00"),
  },
  {
    type_id: 5,
    type_code: "T005",
    type_name: "ປະເພດທີ່ 5",
    description: "ປະເພດທີ່ 5 ມີຄຳອະທິບາຍສຳລັບການທົດສອບ.",
    is_active: false,
    created_at: new Date("2025-06-12T08:30:00+07:00"),
    updated_at: new Date("2025-06-13T09:15:00+07:00"),
  },
]);

const filteredData = computed(() => {
  return mockData.value;
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

const editItem = (item: any) => {
  editMode.value = true;
  formData.value = { ...item };
  dialog.value = true;
};

const viewItem = (item: any) => {
  selectedItem.value = item;
  viewDialog.value = true;
};

const editFromView = () => {
  viewDialog.value = false;
  editItem(selectedItem.value);
};

const confirmDelete = async (item: any) => {
  try {
    await proppertyStore.DeletePropertyType(item.type_id);
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
            @click="goPath(`/property/propertytype/create`)"
          >
            ເພີ່ມປະເພດຊັບສິນ
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
      >
        <template v-slot:header.type_code="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.type_name="{ column }">
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

        <template v-slot:header.is_active="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.edit="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.weiw="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.delete="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template #item.is_active="{ item }">
          <v-btn @click="handlesubmit" flat v-if="item.is_active === true">
            <v-icon
              icon="mdi-toggle-switch"
              color="primary"
              size="small"
            ></v-icon>
          </v-btn>
          <v-btn @click="handlesubmit" flat v-if="item.is_active === false">
            <v-icon
              icon="mdi-toggle-switch-off-outline"
              color="error"
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
            @click="
              goPath(`/property/propertytype/edit/?type_id=${item.type_id}`)
            "
          >
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">ແກ້ໄຂ</v-tooltip>
          </v-btn>
        </template>
        <template #item.weiw="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              color="info"
              variant="text"
              size="small"
              icon="mdi-eye"
              @click="
                goPath(`/property/propertytype/detail/?type_id=${item.type_id}`)
              "
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top"
                >ເບິ່ງລາຍລະອຽດ</v-tooltip
              >
            </v-btn>
          </div>
        </template>
        <template #item.delete="{ item }">
          <div class="d-flex gap-2">
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
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-database-off
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ມີຂໍ້ມູນປະເພດຊັບສິນ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ເລີ່ມຕົ້ນໂດຍການເພີ່ມປະເພດຊັບສິນໃໝ່
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
