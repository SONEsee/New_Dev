<script setup lang="ts">
import axios from "@/helpers/axios";
import { ref, onMounted, computed } from "vue";
const proppertyStore = propertyStore();
const masterStore = useMasterStore();
const masterData = computed(() => {
  const data = masterStore.resposne_status_setting_update;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const seLectType = ref("");
watch( seLectType, async (newValue)=>{
  masterStore.isloading = true; 
  try {
    proppertyStore.filter_type.query.is_tangible = newValue;
    await proppertyStore.GetPropertyCategoryById();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    })
  }finally{
    masterStore.isloading = false;
  }
})
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


const openstatus = async (id:any)=>{

  try {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອັບເດດສະຖານະ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });if(notification.isConfirmed){
      const req = await axios.post(`api/asset_types/${id}/set_open/`,{
     headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
    });if(req.status ===200){
      CallSwal({
        icon: "success",
        title: "ສຳເລັດ",
        text: "ອັບເດດສະຖານະແລ້ວ",
        showConfirmButton: false,
        timer: 1500,
      });
      proppertyStore.GetPropertyCategoryById();
    }
    }
    
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອັບເດດໄດ້, ກະລຸນາໃສ່ຂໍ້ມູນ",
      showConfirmButton: false,
      timer: 1500,
    });
    
  }
}
const offstatus = async (id:any)=>{

  try {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອັບເດດສະຖານະ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });if(notification.isConfirmed){
      const req = await axios.post(`api/asset_types/${id}/set_close/`,{
     headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
    });if(req.status ===200){
      CallSwal({
        icon: "success",
        title: "ສຳເລັດ",
        text: "ອັບເດດສະຖານະແລ້ວ",
        showConfirmButton: false,
        timer: 1500,
      });
      proppertyStore.GetPropertyCategoryById();
    }
    }
    
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອັບເດດໄດ້, ກະລຸນາໃສ່ຂໍ້ມູນ",
      showConfirmButton: false,
      timer: 1500,
    });
    
  }
}

const rules = {
  required: (value: any) => !!value || "ກະລຸນາໃສ່ຂໍ້ມູນ",
};

const title = "ຈັດການປະເພດຊັບສິນ";

const headers = computed(() => [
  { title: "ລະຫັດ", value: "type_code"},
  { title: "ຊື່ພາສາລາວ", value: "type_name_la" },
  { title: "ຊື່ພາສາອັງກິດ", value: "type_name_en" },
  { title: "ປະເພດຊັບສົມບັດ", value: "mastercode_detail.MC_name_la" },
 

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
]) as any;


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
  masterStore.getSetASP();
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

      <v-row class="">
        <v-col cols="12" md="4">
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
        <!-- <v-spacer /> -->
        <v-col cols="12" md="3">
          <v-autocomplete
          v-model="seLectType"
            :loading="loading"
            :items="masterData"
            item-title="MC_name_la"
            item-value="MC_code"
            
            label="ເລືອກຕາມປະເພດຊັບສິນ"
            prepend-inner-icon="mdi-format-list-bulleted-type"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
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
<!-- <pre>{{ mockData1 }}</pre> -->
      <v-data-table
        :items="mockData1"
        :headers="headers"
        :search="search"
        
        :loading="loading"
        hover
      >
        <template v-slot:header.type_code="{ column }">
          <b class="text-primary">{{ column.title }}</b>
        </template>
        <template v-slot:header.mastercode_detail.MC_name_la="{ column }">
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

        

       

        <template #item.edit="{ item }">
          <v-btn
            class="text-primary"
           flat
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
          <div >
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
          <div >
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
          <div >
            <v-btn flat size="small" v-if="item.Record_Status === 'O'" @click="offstatus(item.type_id)">
              <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
            </v-btn>
            <v-btn flat size="small" v-if="item.Record_Status === 'C'" @click="openstatus(item.type_id)">
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
