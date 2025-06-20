<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";

const assetStoreInstance = assetStore();
const mockData =  computed(()=>{
    return assetStoreInstance.response_asset_list;
})

const handleSubmit = async (item: any) => {
  try {
    const newStatus = item.RECORD_STAT === "O" ? "C" : "O";
    const statusText = newStatus === "O" ? "ເປີດ" : "ປິດ";

    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການ${statusText}ສະຖານະຊັບສິນນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await assetStoreInstance.UpdateAssetStatus(
        item.asset_id,
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
const selectedAssetType = ref("all");

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

const title = "ຈັດການຊັບສິນ";

const assetTypes = [
  { title: "ທັງໝົດ", value: "all" },
  { title: "ເຄື່ອງຈັກ", value: "1" },
  { title: "ພາຫານະ", value: "2" },
  { title: "ອຸປະກອນ IT", value: "3" },
  { title: "ເຟີນິເຈີ", value: "4" },
  { title: "ອາຄານ", value: "5" },
];

const headers = computed(() => [
  {
    title: "ລະຫັດຊັບສິນ",
    value: "asset_code",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ຊື່ຊັບສິນ (ລາວ)",
    value: "asset_name_la",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-h6",
  },
  {
    title: "ຊື່ຊັບສິນ (ອັງກິດ)",
    value: "asset_name_en",
    align: "start",
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-subtitle-1",
  },
  {
    title: "ປະເພດຊັບສິນ",
    value: "asset_type",
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  // {
  //   title: "ມູນຄ່າ",
  //   value: "value",
  //   align: "end",
  //   sortable: true,
  //   filterable: false,
  //   width: "120px",
  //   class: "text-end",
  // },
  // {
  //   title: "ສະຖານທີ່",
  //   value: "location",
  //   align: "center",
  //   sortable: true,
  //   filterable: true,
  //   width: "150px",
  //   class: "text-center",
  // },
  {
    title: "ເວລາເພີ່ມ",
    value: "Maker_DT_Stamp",
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
]);

// const mockData = ref([
//   {
//     asset_id: 1,
//     asset_code: "AST001001",
//     asset_name_la: "ເຄື່ອງພິມ HP LaserJet",
//     asset_name_en: "HP LaserJet Printer",
//     asset_type_id: "3",
//     asset_type: { type_name_la: "ອຸປະກອນ IT", type_name_en: "IT Equipment" },
//     value: 1200000,
//     location: "ຫ້ອງການ A",
//     description: "ເຄື່ອງພິມເລເຊີສຳລັບຫ້ອງການ",
//     RECORD_STAT: "O",
//     created_at: new Date("2025-06-16T13:13:00+07:00"),
//     updated_at: new Date("2025-06-16T13:13:00+07:00"),
//   },
//   {
//     asset_id: 2,
//     asset_code: "AST002001",
//     asset_name_la: "ລົດກະບະ Toyota",
//     asset_name_en: "Toyota Pickup Truck",
//     asset_type_id: "2",
//     asset_type: { type_name_la: "ພາຫານະ", type_name_en: "Vehicle" },
//     value: 250000000,
//     location: "ລານຈອດລົດ",
//     description: "ລົດກະບະສຳລັບການຂົນສົ່ງ",
//     RECORD_STAT: "O",
//     created_at: new Date("2025-06-15T09:00:00+07:00"),
//     updated_at: new Date("2025-06-16T10:30:00+07:00"),
//   },
//   {
//     asset_id: 3,
//     asset_code: "AST001002",
//     asset_name_la: "ຄອມພິວເຕີ Dell",
//     asset_name_en: "Dell Desktop Computer",
//     asset_type_id: "3",
//     asset_type: { type_name_la: "ອຸປະກອນ IT", type_name_en: "IT Equipment" },
//     value: 8500000,
//     location: "ຫ້ອງການ B",
//     description: "ຄອມພິວເຕີສຳນັກງານ",
//     RECORD_STAT: "O",
//     created_at: new Date("2025-06-14T14:45:00+07:00"),
//     updated_at: new Date("2025-06-15T16:20:00+07:00"),
//   },
//   {
//     asset_id: 4,
//     asset_code: "AST004001",
//     asset_name_la: "ໂຕະເຮັດວຽກ",
//     asset_name_en: "Office Desk",
//     asset_type_id: "4",
//     asset_type: { type_name_la: "ເຟີນິເຈີ", type_name_en: "Furniture" },
//     value: 1500000,
//     location: "ຫ້ອງການ A",
//     description: "ໂຕະເຮັດວຽກສຳລັບພະນັກງານ",
//     RECORD_STAT: "C",
//     created_at: new Date("2025-06-13T11:10:00+07:00"),
//     updated_at: new Date("2025-06-14T12:00:00+07:00"),
//   },
//   {
//     asset_id: 5,
//     asset_code: "AST001003",
//     asset_name_la: "ເຄື່ອງຈັກຕັດໄມ້",
//     asset_name_en: "Wood Cutting Machine",
//     asset_type_id: "1",
//     asset_type: { type_name_la: "ເຄື່ອງຈັກ", type_name_en: "Machinery" },
//     value: 45000000,
//     location: "ໂຮງງານ 1",
//     description: "ເຄື່ອງຈັກຕັດໄມ້ອັດຕະໂນມັດ",
//     RECORD_STAT: "O",
//     created_at: new Date("2025-06-12T08:30:00+07:00"),
//     updated_at: new Date("2025-06-13T09:15:00+07:00"),
//   },
// ]);

const filteredData = computed(() => {
  let data = mockData.value;

  if (selectedAssetType.value !== "all") {
    data = data.filter(
      (item) => item.asset_type_id === selectedAssetType.value
    );
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.asset_name_la.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_name_en.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_code.toLowerCase().includes(search.value.toLowerCase()) ||
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

const formatCurrency = (value: number) => {
  if (!value) return "-";
  return new Intl.NumberFormat("lo-LA").format(value) + " ກີບ";
};

const getAssetTypeColor = (typeId: string) => {
  const colors = {
    "1": "success", // ເຄື່ອງຈັກ
    "2": "error",   // ພາຫານະ
    "3": "primary", // ອຸປະກອນ IT
    "4": "info",    // ເຟີນິເຈີ
    "5": "warning", // ອາຄານ
  };
  return colors[typeId as keyof typeof colors] || "grey";
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບຊັບສິນ "${item.asset_name_la}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      await assetStoreInstance.DeleteAsset(item.coa_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedAssetType.value = "all";
  search.value = "";
};

onMounted(async () => {
    assetStoreInstance.GetAssetList()
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
            @click="goPath(`/property/asset/create`)"
            v-if="canAdd"
          >
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຊັບສິນໃໝ່
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-select
          v-model="selectedAssetType"
          :items="assetTypes"
          item-title="title"
          item-value="value"
          label="ປະເພດຊັບສິນ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກປະເພດຊັບສິນ"
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
          placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່ລາວ, ຊື່ອັງກິດ..."
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
      <template v-slot:header.asset_code="{ column }">
        <v-icon start>mdi-barcode</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_name_la="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_name_en="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_type="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.location="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.Maker_DT_Stamp="{ column }">
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

      <template v-slot:item.asset_code="{ item }">
        <v-chip color="primary" variant="outlined" size="small">
          {{ item.asset_code }}
        </v-chip>
      </template>

      <template v-slot:item.asset_name_la="{ item }">
        <div>
          <div class="font-weight-bold">{{ item.asset_name_la }}</div>
          <div class="text-caption text-grey">{{ item.asset_name_en }}</div>
        </div>
      </template>

      <template v-slot:item.asset_name_en="{ item }">
        <span class="text-grey-darken-1">{{ item.asset_name_en }}</span>
      </template>

      <template v-slot:item.asset_type="{ item }">
        <div class="text-center">
          <v-chip
            :color="getAssetTypeColor(item.asset_type_id)"
            variant="flat"
            size="small"
          >
            {{ item.asset_type?.type_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.value="{ item }">
        <div class="text-end font-weight-bold text-success">
          {{ formatCurrency(item.value) }}
        </div>
      </template>

      <template v-slot:item.location="{ item }">
        <div class="text-center">
          <v-chip size="small" variant="outlined">
            {{ item.location || "-" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.Maker_DT_Stamp="{ item }">
        {{ formatDate(item.Maker_DT_Stamp) }}
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
          @click="goPath(`/property/asset/detail?asset_code=${item.asset_code}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/property/asset/edit?asset_code=${item.asset_code}&asset_id=${item.coa_id}`)"
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