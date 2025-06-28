<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const locationStoreInstance = locationStore();
const mockData = computed(()=>{
  return locationStoreInstance.response_location_list || [];
})
const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.record_stat === "O" ? "C" : "O";
    const statusText = newStatus === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະສະຖານທີ່ນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await locationStoreInstance.UpdateLocationStatus(item.location_id);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
const handleSubmitof = async (item: any) => {
  try {
    const newStatus = item.record_stat === "O" ? "C" : "O";
    const statusText = newStatus === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການປິດສະຖານະສະຖານທີ່ນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await locationStoreInstance.UpdateLocationStatusof(item.location_id);
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
const selectedLocationType = ref("all");

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

const title = "ຈັດການສະຖານທີ່";

const locationTypes = [
  { title: "ທັງໝົດ", value: "all" },
  { title: "ອາຄານ", value: "ອາຄານ" },
  { title: "ຊັ້ນ", value: "ຊັ້ນ" },
  { title: "ຫ້ອງ", value: "ຫ້ອງ" },
  { title: "ລານຫຼືສວນ", value: "ສານຫຼືສວນ" },
  { title: "ໂກດັງ", value: "ສາງເກັບເຄື່ອງ" },
];

const headers = computed(() => [
  {
    title: "ລະຫັດສະຖານທີ່",
    value: "location_code",
    align: "start",
    sortable: true,
    filterable: true,
    width: "140px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ຊື່ສະຖານທີ່ (ລາວ)",
    value: "location_name_la",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-h6",
  },
  {
    title: "ຊື່ສະຖານທີ່ (ອັງກິດ)",
    value: "location_name_en",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
  },
  {
    title: "ປະເພດ",
    value: "location_type",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ສະຖານທີ່ແມ່",
    value: "parent_location",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ຜູ້ຮັບຜິດຊອບ",
    value: "responsible_person",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ເບີໂທ",
    value: "phone",
    align: "center",
    sortable: true,
    filterable: true,
    width: "130px",
    class: "text-center",
  },
  ...(canRecordStatus.value
    ? [
        {
          title: "ສະຖານະ",
          value: "Record_Status",
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
onMounted(()=>{
  locationStoreInstance.GetLocationList();
})


const filteredData = computed(() => {
  let data = mockData.value;

  if (selectedLocationType.value !== "all") {
    data = data.filter(
      (item) => item.location_type === selectedLocationType.value
    );
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.location_code.toLowerCase().includes(search.value.toLowerCase()) ||
        item.location_name_la.toLowerCase().includes(search.value.toLowerCase()) ||
        item.location_name_en.toLowerCase().includes(search.value.toLowerCase()) ||
        item.responsible_person?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.remarks?.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  return data;
});

const getLocationTypeColor = (type: string) => {
  const colors = {
    ອາຄານ: "primary",
    ຊັ້ນ: "info",
    ຫ້ອງ: "success",
    ລານຫຼືສວນ: "warning",
    ສາງເກັບເຄື່ອງ: "error",
  };
  return colors[type as keyof typeof colors] || "grey";
};

const getLocationTypeText = (type: string) => {
  const types = {
    ອາຄານ: "ອາຄານ",
    ຊັ້ນ: "ຊັ້ນ",
    ຫ້ອງ: "ຫ້ອງ",
    ລານຫຼືສວນ: "ລານຫຼືສວນ",
    ສາງເກັບເຄື່ອງ: "ໂກດັງ",
  };
  return types[type as keyof typeof types] || type;
};

const getLocationTypeIcon = (type: string) => {
  const icons = {
    BUILDING: "mdi-office-building",
    FLOOR: "mdi-layers",
    ROOM: "mdi-door",
    AREA: "mdi-map-marker-radius",
    WAREHOUSE: "mdi-warehouse",
  };
  return icons[type as keyof typeof icons] || "mdi-map-marker";
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບສະຖານທີ່ "${item.location_name_la}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      await locationStoreInstance.DeleteLocation(item.location_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedLocationType.value = "all";
  search.value = "";
};


const statistics = computed(() => {
  const data = filteredData.value;
  return {
    total: data.length,
    building: data.filter(item => item.location_type === 'ອາຄານ').length,
    floor: data.filter(item => item.location_type === 'ຊັ້ນ').length,
    room: data.filter(item => item.location_type === 'ຫ້ອງ').length,
    area: data.filter(item => item.location_type === 'ລານຫຼືສວນ').length,
    warehouse: data.filter(item => item.location_type === 'ສາງເກັບເຄື່ອງ').length,
    mainLocations: data.filter(item => !item.location_id).length,
    subLocations: data.filter(item => item.parent_location_id).length,
    
  };
});

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
    
    <!-- <v-row class="mb-4">
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="primary" class="mb-2">mdi-map-marker</v-icon>
            <div class="text-h4 text-primary">{{ statistics.total }}</div>
            <div class="text-caption">ທັງໝົດ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="primary" class="mb-2">mdi-office-building</v-icon>
            <div class="text-h4 text-primary">{{ statistics.building }}</div>
            <div class="text-caption">ອາຄານ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="info" class="mb-2">mdi-layers</v-icon>
            <div class="text-h4 text-info">{{ statistics.floor }}</div>
            <div class="text-caption">ຊັ້ນ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="success" class="mb-2">mdi-door</v-icon>
            <div class="text-h4 text-success">{{ statistics.room }}</div>
            <div class="text-caption">ຫ້ອງ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="warning" class="mb-2">mdi-map-marker-radius</v-icon>
            <div class="text-h4 text-warning">{{ statistics.area }}</div>
            <div class="text-caption">ພື້ນທີ່</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card variant="outlined">
          <v-card-text class="text-center">
            <v-icon size="32" color="error" class="mb-2">mdi-warehouse</v-icon>
            <div class="text-h4 text-error">{{ statistics.warehouse }}</div>
            <div class="text-caption">ໂກດັງ</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row> -->

   
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex">
          <v-btn
            color="primary"
            @click="goPath(`/property/locations/create`)"
            v-if="canAdd"
          >
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມສະຖານທີ່ໃໝ່
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-select
          v-model="selectedLocationType"
          :items="locationTypes"
          item-title="title"
          item-value="value"
          label="ປະເພດສະຖານທີ່"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກປະເພດສະຖານທີ່"
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
          placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່, ຜູ້ຮັບຜິດຊອບ..."
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

    <!-- Summary Information -->
    <v-row class="mb-4">
      <!-- <v-col cols="12">
        <v-card variant="outlined" color="info">
          <v-card-text>
            <div class="d-flex flex-wrap justify-space-between align-center">
              <div class="text-subtitle-1">
                <v-icon class="mr-2">mdi-information</v-icon>
                ສະຫຼຸບຂໍ້ມູນ: ມີທັງໝົດ {{ statistics.total }} ສະຖານທີ່
              </div>
              <div class="d-flex flex-wrap gap-4">
                <div class="text-center">
                  <div class="text-caption">ສະຖານທີ່ຫຼັກ</div>
                  <div class="text-h6 text-primary">{{ statistics.mainLocations }}</div>
                </div>
                <div class="text-center">
                  <div class="text-caption">ສະຖານທີ່ຍ່ອຍ</div>
                  <div class="text-h6 text-info">{{ statistics.subLocations }}</div>
                </div>
                <div class="text-center">
                  <div class="text-caption">ເປີດໃຊ້ງານ</div>
                  <div class="text-h6 text-success">{{ statistics.active }}</div>
                </div>
                <div class="text-center">
                  <div class="text-caption">ປິດໃຊ້ງານ</div>
                  <div class="text-h6 text-error">{{ statistics.inactive }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col> -->
    </v-row>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredData || []"
      class="text-no-wrap"
      :loading="loading"
    >
      <template v-slot:header.location_code="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.location_name_la="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.location_name_en="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.location_type="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.parent_location="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.responsible_person="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.phone="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.Record_Status="{ column }">
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

      <template v-slot:item.location_code="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.location_code }}
        </v-chip>
      </template>

      <template v-slot:item.location_name_la="{ item }">
        <div class="d-flex align-center">
          <div v-if="item.parent_location_id" class="mr-2">
            <v-icon size="small" color="grey">mdi-subdirectory-arrow-right</v-icon>
          </div>
          <div>
            <div :class="{ 'font-weight-bold': !item.parent_location_id }">
              {{ item.location_name_la }}
            </div>
            <div class="text-caption text-grey">
              {{ item.location_name_en }}
            </div>
          </div>
        </div>
      </template>

      <template v-slot:item.location_name_en="{ item }">
        <span class="text-grey-darken-1">{{ item.location_name_en }}</span>
      </template>

      <template v-slot:item.location_type="{ item }">
        <div class="text-center">
          <v-chip
            :color="getLocationTypeColor(item.location_type)"
            variant="flat"
            size="small"
          >
            <v-icon start size="small">{{ getLocationTypeIcon(item.location_type) }}</v-icon>
            {{ getLocationTypeText(item.location_type) }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.parent_location="{ item }">
        <div class="text-center">
          <div v-if="item.parent_location">
            <v-chip size="small" color="secondary" variant="outlined" class="mb-1">
              {{ item.parent_location.location_code }}
            </v-chip>
            <div class="text-caption">{{ item.parent_location.location_name_la }}</div>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.responsible_person="{ item }">
        <div class="text-center">
          <div v-if="item.responsible_person">
            <v-icon size="small" class="mr-1" color="primary">mdi-account</v-icon>
            {{ item.responsible_person }}
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.phone="{ item }">
        <div class="text-center">
          <div v-if="item.phone">
            <v-icon size="small" class="mr-1" color="info">mdi-phone</v-icon>
            {{ item.phone }}
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </template>

      <template v-slot:item.Record_Status="{ item }">
        <div>
          <v-btn
            v-if="item.Record_Status === 'O'"
            flat
            @click="handleSubmitof(item)"
          >
            <v-icon color="success">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.Record_Status === 'C'"
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
          @click="goPath(`/property/locations/detail?location=${item.location_id}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/locations/edit?locaton=${item.location_id}`)"
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

      <template v-slot:item.address="{ item }">
        <div class="text-truncate" style="max-width: 200px">
          {{ item.address || "-" }}
          <v-tooltip activator="parent" location="top" v-if="item.address">
            {{ item.address }}
          </v-tooltip>
        </div>
      </template>

      <template v-slot:item.remarks="{ item }">
        <div class="text-truncate" style="max-width: 150px">
          {{ item.remarks || "-" }}
          <v-tooltip activator="parent" location="top" v-if="item.remarks">
            {{ item.remarks }}
          </v-tooltip>
        </div>
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

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gap-4 > * {
  margin-right: 16px;
}

.gap-4 > *:last-child {
  margin-right: 0;
}

@media (max-width: 768px) {
  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .d-flex.flex-wrap.gap-4 > div {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>