<script setup lang="ts">
const assetListStore = faAssetStore();
const mainTypeStore = assetStore();

const mainType = computed(() => {
  const data = mainTypeStore.response_asset_types;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});


const filterStatus = ref("all"); 
const filterAssetType = ref("all"); 

const res = computed(() => {
  const data = assetListStore.response_fa_asset_list;
  let processedData : unknown[] = [];

  if (Array.isArray(data)) {
    processedData = data;
  } else if (data && typeof data === "object") {
    processedData = [data];
  } else {
    processedData = [];
  }


  return processedData.map((item:any) => {
    const totalMonths = (item.asset_useful_life || 0) * 12;
    const usedMonths = parseInt(item.C_dpac || 0);

    let status = "";
    if (usedMonths >= totalMonths) {
      status = "ຫັກສຳເລັດ";
    } else if (usedMonths > 0) {
      status = "ກຳລັງຫັກ";
    } else {
      status = "ຍັງບໍ່ທັນໄດ້ຫັກ";
    }

    return {
      ...item,
      depreciated_months: usedMonths,
      depreciation_status: status,
    };
  });
});


const filteredRes = computed(() => {
  let filtered = res.value;

 
  if (filterStatus.value !== "all") {
    filtered = filtered.filter((item) => {
      switch (filterStatus.value) {
        case "active":
          return item.depreciation_status === "ກຳລັງຫັກ";
        case "completed":
          return item.depreciation_status === "ຫັກສຳເລັດ";
        case "pending":
          return item.depreciation_status === "ຍັງບໍ່ທັນໄດ້ຫັກ";
        default:
          return true;
      }
    });
  }


  if (filterAssetType.value !== "all") {
    filtered = filtered.filter((item) => {
      return item.asset_id_detail?.asset_code?.startsWith(
        filterAssetType.value
      );
    });
  }

  return filtered;
});


const assetTypeOptions = computed(() => {
  const types = mainType.value.map((type) => ({
    value: type.asset_type_detail.type_code,
    title: `${type.asset_type_detail.type_code} - ${type.asset_type_detail.type_name_la}`,
  }));

  return [{ value: "all", title: "ທຸກປະເພດ" }, ...types];
});
const statistics = computed(() => {
  const total = res.value.length;
  const active = res.value.filter(
    (item) => item.depreciation_status === "ກຳລັງຫັກ"
  ).length;
  const completed = res.value.filter(
    (item) => item.depreciation_status === "ຫັກສຳເລັດ"
  ).length;
  const pending = res.value.filter(
    (item) => item.depreciation_status === "ຍັງບໍ່ທັນໄດ້ຫັກ"
  ).length;

  return { total, active, completed, pending };
});

onMounted(() => {
  assetListStore.GetFaAssetList();
  mainTypeStore.GetAssetTypes();
});

const header = [
  { title: "ລະຫັດ", value: "asset_list_id" },
  // { title: "ປະເພດ", value: "asset_type" },
  { title: "ຊື່ຊັບສິນ", value: "asset_spec" },
  { title: "ມູນຄ່າທັງໝົດ", value: "asset_value" },
  {
    title: "ມູນຄ່າທັງໝົດທີ່ຕອ້ງຫັກຄ່າຫຼູຍຫຽ້ນ",
    value: "accu_dpca_value_total",
  },
  { title: "ມຸນຄ່າສະສົມ", value: "asset_accu_dpca_value" },
  { title: "ມຸນຄ່າຄົງເຫຼືອ", value: "asset_value_remain" },
  { title: "ວັນທີ່ຫັກຄັ້ງສຸດທ້າຍ", value: "dpca_end_date" },
  { title: "ຫັກແລ້ວ (ເດືອນ)", value: "depreciated_months" },
  { title: "ສະຖານະການຫັກ", value: "depreciation_status" },
  { title: "ລາຍລະອຽດ", value: "detail" },
];

const getStatusColor = (status:any) => {
  switch (status) {
    case "ກຳລັງຫັກ":
      return "warning";
    case "ຫັກສຳເລັດ":
      return "success";
    case "ຍັງບໍ່ທັນໄດ້ຫັກ":
      return "info";
    default:
      return "default";
  }
};
</script>

<template>
  <div class="pa-4">

    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ statistics.total }}</div>
            <div class="text-subtitle-1">ຫັກທັງໝົດ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ statistics.active }}</div>
            <div class="text-subtitle-1">ກຳລັງຫັກ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">
              {{ statistics.completed }}
            </div>
            <div class="text-subtitle-1">ຫັກແລ້ວ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="info" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ statistics.pending }}</div>
            <div class="text-subtitle-1">ຍັງບໍ່ທັນຫັກ</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

 
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="filterStatus"
          :items="[
            { value: 'all', title: 'ທັງໝົດ' },
            { value: 'active', title: 'ກຳລັງຫັກ' },
            { value: 'completed', title: 'ຫັກສຳເລັດ' },
            { value: 'pending', title: 'ຍັງບໍ່ທັນໄດ້ຫັກ' },
          ]"
          label="ກັ່ນຕອງຕາມສະຖານະ"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filterAssetType"
          :items="assetTypeOptions"
          label="ກັ່ນຕອງຕາມປະເພດຊັບສິນ"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          color="primary"
          variant="outlined"
          @click="
            filterStatus = 'all';
            filterAssetType = 'all';
          "
          block
        >
          <v-icon start>mdi-refresh</v-icon>
          ຣີເຊັດການກັ່ນຕອງ
        </v-btn>
      </v-col>
    </v-row>


    <v-data-table
      :items="filteredRes"
      :headers="header"
      :items-per-page="10"
      class="elevation-1"
    >
    
      <template v-slot:header.asset_list_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_type="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_spec="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.accu_dpca_value_total="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_accu_dpca_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_value_remain="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_end_date="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.depreciated_months="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.depreciation_status="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <!-- ເນື້ອໃນຕາຕະລາງ -->
      <template v-slot:item.asset_list_id="{ item }">
        <div class="pa-2">
          <v-chip variant="outlined" size="small">
            {{ item.asset_list_id }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.asset_type="{ item }">
        <div class="text-center">
          <v-chip
            variant="flat"
            size="small"
            :color="
              item.asset_id_detail?.asset_code?.startsWith('FIX')
                ? 'purple'
                : item.asset_id_detail?.asset_code?.startsWith('OEQ')
                ? 'orange'
                : item.asset_id_detail?.asset_code?.startsWith('VEH')
                ? 'teal'
                : item.asset_id_detail?.asset_code?.startsWith('SFT')
                ? 'indigo'
                : item.asset_id_detail?.asset_code?.startsWith('OFF')
                ? 'brown'
                : 'grey'
            "
          >
            {{ item.asset_id_detail?.asset_code?.split("-")[0] || "N/A" }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.asset_value="{ item }">
        <div class="text-right font-weight-bold">
          {{ parseFloat(item.asset_value || 0).toLocaleString() }}
        </div>
      </template>

      <template v-slot:item.accu_dpca_value_total="{ item }">
        <div class="text-right">
          {{ parseFloat(item.accu_dpca_value_total || 0).toLocaleString() }}
        </div>
      </template>

      <template v-slot:item.asset_accu_dpca_value="{ item }">
        <div class="text-right">
          {{ parseFloat(item.asset_accu_dpca_value || 0).toLocaleString() }}
        </div>
      </template>

      <template v-slot:item.asset_value_remain="{ item }">
        <div class="text-right font-weight-bold text-green">
          {{ parseFloat(item.asset_value_remain || 0).toLocaleString() }}
        </div>
      </template>

      <template v-slot:item.depreciated_months="{ item }">
        <div class="text-center">
          <v-chip
            :color="
              item.depreciation_status === 'ຫັກສຳເລັດ'
                ? 'success'
                : item.depreciation_status === 'ກຳລັງຫັກ'
                ? 'warning'
                : 'info'
            "
            variant="flat"
            size="small"
          >
            {{ item.depreciated_months || 0 }} /
            {{ (item.asset_useful_life || 0) * 12 }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.depreciation_status="{ item }">
        <div class="text-center">
          <v-chip
            :color="getStatusColor(item.depreciation_status)"
            variant="flat"
            size="small"
          >
            {{ item.depreciation_status }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.dpca_end_date="{ item }">
        <div class="text-center">
          {{ item.dpca_end_date || "-" }}
        </div>
      </template>
      <template v-slot:item.detail="{ item }">
        <v-tooltip :text="`ເບິ່ງປະຫວັດການຫັກຄ່າຫຼູຍຫຽ້ນ: ${item.asset_spec}`">
          <template v-slot:activator="{ props }">
            <v-btn
              flat
              v-bind="props"
              @click="
                goPath(
                  `/property/faassetdetription/history?id_assetlist=${item.asset_list_id}`
                )
              "
            >
              <v-icon icon="mdi-history"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
  </div>
</template>
