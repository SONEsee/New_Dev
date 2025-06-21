<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
const proppertyStore = propertyStore();
const mockData1 =  computed(()=>{
  return proppertyStore.respons_data_property_category || []
})

onMounted(()=>{
  proppertyStore.GetPropertyCategoryById();
})
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




const rules = {
  required: (value: any) => !!value || "ກະລຸນາໃສ່ຂໍ້ມູນ",
};

const title = "ຈັດການປະເພດຊັບສິນ";

const headers = computed(() => [
  { title: "ລະຫັດ", value: "type_code", width: "120px" },
  { title: "ຊື່ພາສາລາວ", value: "type_name_la", width: "200px" },
  { title: "ຊື່ພາສາອັງກິດ", value: "type_name_en", width: "200px" },
 

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
  ...(canRecordStatus.value
    ? [{ title: "ສະຖານະ", value: "Record_Status", align: "center", width: "5px" }]
    : []),
]);


const filteredData = computed(() => {
  return mockData1.value;
});







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
        :items="mockData1"
        :headers="headers"
        :search="search"
        class="elevation-1 rounded-lg"
        :loading="loading"
        hover
      >
        <template v-slot:header.type_code="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.type_name_la="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.type_name_en="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.created_at="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.updated_at="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>

        <template v-slot:header.Record_Status="{ column }">
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

        

        <!-- <template #item.created_at="{ item }">
          <span>{{ formatDate(item.created_at) }}</span>
        </template>

        <template #item.updated_at="{ item }">
          <span>{{ formatDate(item.updated_at) }}</span>
        </template> -->

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

        <template v-slot:item.Record_Status="{ item }">
          <div class="text-center pa-8">
            <v-btn flat size="small" v-if="item.Record_Status === 'O'">
              <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
            </v-btn>
            <v-btn flat size="small" v-if="item.Record_Status === 'C'">
              <v-icon icon="mdi-toggle-switch-off-outline" color="error"></v-icon>
            </v-btn>
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
