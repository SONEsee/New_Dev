<script setup lang="ts">
import dayjs from "dayjs";
const mainStore = useFassetLidtDescription();
const assetStores = faAssetStore();
const selectedItems = ref([]);
const assetdata = computed(()=>{
  const data =  assetStores.response_fa_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
})

const res = computed(() => {
  const data = mainStore.response_data_get_overdue?.data.overdue_items;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

// ສ້າງ computed ສຳລັບແມັບຂໍ້ມູນ
const mappedData = computed(() => {
  return res.value.map(overdueItem => {
    // ຫາ asset ທີ່ກົງກັນໂດຍໃຊ້ asset_id
    const matchedAsset = assetdata.value.find(asset => 
      asset.asset_list_id === overdueItem.asset_id
    );
    
    if (matchedAsset) {
      // ຄິດໄລ່ຄ່າທີ່ຕ້ອງການ: (asset_value_remainMonth / 30) * days_overdue
      const dailyDepreciation = parseFloat(matchedAsset.asset_value_remainMonth) / 30;
      const calculatedAmount = dailyDepreciation * overdueItem.days_overdue;
      
      return {
        ...overdueItem,
        // ເພີ່ມຂໍ້ມູນຈາກ asset
        matched_asset: matchedAsset,
        daily_depreciation: dailyDepreciation,
        calculated_overdue_amount: calculatedAmount,
        asset_value_remainMonth: matchedAsset.asset_value_remainMonth,
        // ເພີ່ມຂໍ້ມູນອື່ນໆ ທີ່ອາດຈະໃຊ້
        asset_full_name: matchedAsset.asset_id_detail?.asset_name_la || overdueItem.asset_name,
        location_name: matchedAsset.location_detail?.location_name_la,
        supplier_name: matchedAsset.supplier_detail?.supplier_name
      };
    }
    
    // ຖ້າບໍ່ພົບ asset ທີ່ກົງກັນ
    return {
      ...overdueItem,
      matched_asset: null,
      daily_depreciation: 0,
      calculated_overdue_amount: 0,
      asset_value_remainMonth: 0
    };
  });
});

const headers = [
  { title: "ລະຫັດຊັບສິນ", key: "asset_id" },
  { title: "ຊື່ຊັບສິນ", key: "asset_name" },
  // { title: "ມູນຄ່າເຫຼືອ/ເດືອນ", key: "asset_value_remainMonth" },
  // { title: "ຄ່າເສື່ອມ/ມື້", key: "daily_depreciation" },
  { title: "ຄ້າງ (ມື້)", key: "overdue_months" },
  { title: "ຈຳນວນເງິນທີ່ຈະຫັກ", key: "calculated_overdue_amount" },
  { title: "ຄືບໜ້າ", key: "completion_percentage" },
  { title: "ງວດທີ່ຈະຫັກ", key: "due_end_date" },
  // { title: "ປະຫວັດ", key: "action" },
];

const formatNumber = (num: any) => {
  return new Intl.NumberFormat("en-US").format(num);
};

const processBulkItems = async () => {
  mainStore.total_caculate.mapping_ids = selectedItems.value;

  mainStore.total_caculate.target_date = dayjs()
    .tz("Asia/Bangkok")
    .format("YYYY-MM-DD");

  console.log("Bulk process data:", mainStore.total_caculate);

  await mainStore.postArreat();

  selectedItems.value = [];
};

const title = "ຫັກຄ່າຫຼູຍຫ້ຽນຍອ້ນຫຼັງ";

onMounted(() => {
  assetStores.GetFaAssetList();
  mainStore.getArrears();
});
</script>

<template>
  <!-- Debug ຂໍ້ມູນ -->
  <!-- <div class="mb-4">
    <h4>Debug Info:</h4>
    <p>Asset Data Count: {{ assetdata.length }}</p>
    <p>Overdue Data Count: {{ res.length }}</p>
    <p>Mapped Data Count: {{ mappedData.length }}</p>
  </div> -->

  <div
    v-if="selectedItems.length > 0"
    class="mb-4 pa-3"
    style="background-color: #e3f2fd; border-radius: 8px"
  >
    <div class="d-flex align-center justify-space-between">
      <span>
        📋 ເລືອກແລ້ວ: <strong>{{ selectedItems.length }}</strong> ລາຍການ
      </span>
      <div>
        <v-btn
          color="error"
          size="small"
          class="mr-2"
          @click="processBulkItems"
        >
          ຢືນຢັນການຫັກຄ່າຫຼູຍຫ້ຽນ ({{ selectedItems.length }})
        </v-btn>
        <v-btn
          color="secondary"
          size="small"
          variant="outlined"
          @click="selectedItems = []"
        >
          ຍົກເລີກ
        </v-btn>
      </div>
    </div>
  </div>

  <div v-if="selectedItems.length > 0" class="mb-2">
    <GlobalTextTitleLine :title="title" />
    <small style="color: #666">
      Selected mapping_ids: {{ selectedItems }}
    </small>
  </div>

  <v-row>
    <v-col cols="12" md="3">
      <v-card class="text-center ustify-center align-center" style="height: 15vh;"> 
        <v-card-title style="background-color: #64b5f6">
          ລາຍການທັງໝົດ
        </v-card-title>
        <div class="">
          <h2 class="">{{ mappedData.length }}</h2>
          <p>ລາຍການ</p>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="3">
      <v-card class="text-center ustify-center align-center" style="height: 15vh;"> 
        <v-card-title style="background-color: #4caf50">
          ຈຳນວນເງິນລວມ
        </v-card-title>
        <div class="">
          <h2 class="">{{ formatNumber(mappedData.reduce((sum, item) => sum + (item.calculated_overdue_amount || 0), 0)) }}</h2>
          <p>ກີບ</p>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="3">
      <v-card class="text-center ustify-center align-center" style="height: 15vh;"> 
        <v-card-title style="background-color: #64b5f6">
          ລາຍການທີ່ຈະຫັກທັງໝົດ
        </v-card-title>
        <div class="">
          <h2 class="">{{ selectedItems.length }}</h2>
          <p>ລາຍການ</p>
        </div>
      </v-card>
    </v-col>
   <v-col cols="12" md="3">
  <v-card class="text-center ustify-center align-center" style="height: 15vh;"> 
    <v-card-title style="background-color: #4caf50">
      ຈຳນວນເງິນທີ່ຈະຫັກ
    </v-card-title>
    <div class="">
      <h2 class="">{{ formatNumber(mappedData.filter(item => selectedItems.includes(item.mapping_id )).reduce((sum, item) => sum + (item.calculated_overdue_amount || 0), 0)) }}</h2>
      <p>ກີບ</p>
    </div>
  </v-card>
</v-col>
    
  </v-row>
<!-- <pre>{{ mappedData }}</pre> -->
  <v-data-table
    v-model="selectedItems"
    :items="mappedData"
    :headers="headers"
    show-select
    item-value="mapping_id"
    :loading="mainStore.isLoading"
  >
    <template v-slot:header.asset_id="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.asset_name="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.asset_value_remainMonth="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.daily_depreciation="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.overdue_months="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.calculated_overdue_amount="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.completion_percentage="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.due_end_date="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.action="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>

   
    <template v-slot:item.asset_value_remainMonth="{ item }">
      <span style="color: #2196f3; font-weight: 500">
        {{ formatNumber(item.asset_value_remainMonth || 0) }} ກີບ/ເດືອນ
      </span>
    </template>

   
    <template v-slot:item.daily_depreciation="{ item }">
      <span style="color: #ff9800; font-weight: 500">
        {{ formatNumber(Math.round(item.daily_depreciation || 0)) }} ກີບ/ມື້
      </span>
    </template>

    
    <template v-slot:item.calculated_overdue_amount="{ item }">
      <strong style="color: #f44336; font-size: 16px">
        {{ formatNumber(Math.round(item.calculated_overdue_amount || 0)) }} ກີບ
      </strong>
    </template>

    <template v-slot:item.action="{ item }">
      <v-btn
        @click="
          goPath(
            `/property/faassetdetription/history?id_assetlist=${item.asset_id}`
          )
        "
        color="primary"
        >ປະຫວັດ</v-btn
      >
    </template>

    <template v-slot:item.completion_percentage="{ item }">
      {{ (item.current_month)-1 }}/{{ item.total_months }} ({{
        Math.round(item.completion_percentage)
      }}%)
    </template>
  <template v-slot:item.due_end_date="{ item }">
  <span v-if="item.due_end_date">
    {{ dayjs(item.due_end_date.split('/').reverse().join('-')).format('MM/YYYY') }}
    <span style="color: #666;"> ຫາ </span>
    {{ dayjs().format('MM/YYYY') }}
  </span>
  <span v-else>-</span>
</template>

    <template v-slot:item.overdue_months="{ item }">
  <v-chip
    :color="item.urgency_level === 'critical' ? 'error' : 'warning'"
    size="small"
  >
    {{ Math.floor(item.overdue_months) }} ເດືອນ
  </v-chip>
</template>
  </v-data-table>

 
  <!-- <v-expansion-panels class="mt-4" v-if="mappedData.length > 0">
    <v-expansion-panel>
      <v-expansion-panel-title>
        📊 ລາຍລະອຽດການຄິດໄລ່
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-for="item in mappedData.slice(0, 3)" :key="item.mapping_id" class="mb-3 pa-3" style="background-color: #f5f5f5; border-radius: 8px">
          <h4>{{ item.asset_name }}</h4>
          <p><strong>ມູນຄ່າເຫຼືອຕໍ່ເດືອນ:</strong> {{ formatNumber(item.asset_value_remainMonth) }} ກີບ</p>
          <p><strong>ມູນຄ່າເຫຼືອຕໍ່ມື້:</strong> {{ formatNumber(Math.round(item.daily_depreciation)) }} ກີບ ({{ formatNumber(item.asset_value_remainMonth) }} ÷ 30)</p>
          <p><strong>ຄ້າງ:</strong> {{ item.days_overdue }} ມື້</p>
          <p><strong>ການຄິດໄລ່:</strong> {{ formatNumber(Math.round(item.daily_depreciation)) }} × {{ item.days_overdue }} = <strong style="color: #f44336">{{ formatNumber(Math.round(item.calculated_overdue_amount)) }} ກີບ</strong></p>
        </div>
        <p v-if="mappedData.length > 3" class="text-center">... ແລະອີກ {{ mappedData.length - 3 }} ລາຍການ</p>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels> -->
</template>