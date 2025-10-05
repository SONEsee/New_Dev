<script setup lang="ts">
const title = "ຈັດການຊຳລະສະສາງ";
const dispalsoStore = useDispoalStore();
const masterType = useMasterStore();
const faasetStore = faAssetStore();
const seleMaster = ref("");
const selecGross = ref("");
const selectAssetList = ref("");
const dpsData = computed(()=>{
  const data = masterType.respons_data_status_dps;
  if(Array.isArray(data)){
    return data
  }if(data && typeof data ==="object"){
    return [data]
  }
  return []
})
const assetList = computed(() => {
  const data = faasetStore.response_fa_asset_list;
  let asset: any[] = [];
  
 
  if (Array.isArray(data)) {
    asset = data;
  } else if (data && typeof data === "object") {
    asset = [data];
  } else {
    asset = [];
  }
  
 
  return asset.filter((item) => item.asset_status === "DS");
});
watch(selectAssetList, async (newValue) => {
  dispalsoStore.isLoading = true;
  try {
    dispalsoStore.fiter_data_disposal.query.asset_list_id = newValue;
    await dispalsoStore.getDispalso();
  } catch (error) {
    // CallSwal({
    //   icon: "error",
    //   title: "ຂໍ້ຜິດພາດ",
    //   text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    // });
  } finally {
    dispalsoStore.isLoading = false;
  }
})
watch(selecGross, async (newValue) => {
  dispalsoStore.isLoading = true;
  try {
    dispalsoStore.fiter_data_disposal.query.gain_loss = newValue;
    await dispalsoStore.getDispalso();
  } catch (error) {
    // CallSwal({
    //   icon: "error",
    //   title: "ຂໍ້ຜິດພາດ",
    //   text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    // });
  } finally {
    dispalsoStore.isLoading = false;
  }
});
watch(seleMaster, async (newValue) => {
  dispalsoStore.isLoading = true;
  try {
    dispalsoStore.fiter_data_disposal.query.disposal_type = newValue;
    await dispalsoStore.getDispalso();
  } catch (error) {
    // CallSwal({
    //   icon: "error",
    //   title: "ຂໍ້ຜິດພາດ",
    //   text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    // });
  } finally {
    dispalsoStore.isLoading = false;
  }
});
const materData = computed(() => {
  const data = masterType.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const getDisposalTypeName = (disposalTypeCode: string) => {
  if (!disposalTypeCode || !Array.isArray(materData.value)) return "-";

  const foundItem = materData.value.find(
    (item) => item.MC_code === disposalTypeCode
  );
  return foundItem ? foundItem.MC_name_la : disposalTypeCode;
};

const dataDispalso = computed(() => {
  const data = dispalsoStore.respons_data_dispalso;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const headers = [
  {
    title: "ລະຫັດຊັບສມບັດ",
    align: "start",
    key: "asset_list_id",
  },
  { title: "ປະເພດການຖອນ", key: "disposal_type" },
  { title: "ຈຸດປະສົງການຖອນ", key: "disposal_purpose" },
  { title: "ຜົນໄດ້ຮັບ", key: "gain_loss" },
  // { title: "ຄ່າໃຊ້ຈ່າຍໃນການຖອນ", key: "disposal_cost" },
  { title: "ລາຍຮັບຈາກການຂາຍ", key: "disposal_proceeds" },
  { title: "ເຫດຜົນການຖອນ", key: "disposal_reason" },
] as any;
const formatNumber = (num: any) => {
  return new Intl.NumberFormat("en-US").format(num);
};
const nameGross = (dataName:string)=>{
  if(!dataName || !Array.isArray(dpsData.value))return "-";
  const dataItem = dpsData.value.find((item)=>item.MC_code === dataName);
  return dataItem ? dataItem.MC_name_la : "-";
}
const gainLoss = [
  { title: "ກຳໄລ", value: "ROIP" },
  { title: "ຂາດທຶນ", value: "ROIN" },
];
onMounted(() => {
  dispalsoStore.getDispalso();
  masterType.getDT();
  masterType.getDPS();
  faasetStore.GetFaAssetList();
});
</script>

<template>
  <div class="pa-4">
    <!-- <pre>{{ dpsData }}</pre> -->
    <global-text-title-line :title="title" />
    <v-row>
      <v-col cols="12" md="3">
        <v-autocomplete
          :items="assetList"
          item-title="asset_spec"
          item-value="asset_list_id"
          v-model="selectAssetList"
          variant="outlined"
          density="compact"
          label="ເລືອກຕາມລາຍກນຊັບສົມບັດ"
          prepend-inner-icon="mdi-format-list-bulleted-type"
          clearable
          :loading="faasetStore.isLoading"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.asset_spec}(${item.raw.asset_list_id})`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-format-list-bulleted-type</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-autocomplete
          :items="materData"
          item-title="MC_name_la"
          item-value="MC_code"
          v-model="seleMaster"
          variant="outlined"
          density="compact"
          label="ເລືອກຕາມປະເພດການຖອນ"
          prepend-inner-icon="mdi-format-list-bulleted-type"
          clearable
          :loading="faasetStore.isLoading"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.MC_name_la}(${item.raw.MC_code})`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-format-list-bulleted-type</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="3">
        <v-autocomplete
          :items="dpsData"
          item-title="MC_name_la"
          item-value="MC_code"
          v-model="selecGross"
          variant="outlined"
          density="compact"
          label="ເລືອກຕາມຜົນໄດ້ຮັບ"
          prepend-inner-icon="mdi-cash-multiple"
          clearable
          :loading="faasetStore.isLoading"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.MC_name_la}(${item.raw.MC_code})`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-cash-multiple</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="2" class="text-end
      ">
        <!-- <v-btn color="primary" @click="goPath('/property/dispalso/create')">
          ສະສາງຊັບສົມບັດ
        </v-btn> -->
      </v-col>
    </v-row>
    <!-- <v-row>
      <v-col cols="6">
        <h3>Master Data:</h3>
        <pre>{{ materData }}</pre>
      </v-col>
      <v-col cols="6">
        <h3>Disposal Data:</h3>
        <pre>{{ dataDispalso }}</pre>
      </v-col>
    </v-row> -->

    <v-data-table :items="dataDispalso" :headers="headers" class="text-no-wrap">
      <!-- Header templates -->
      <template v-slot:header.disposal_type="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_list_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.disposal_purpose="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.gain_loss="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.disposal_cost="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.disposal_proceeds="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.disposal_reason="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:item.asset_list_id="{ item }">
        <v-chip flat variant="outlined" size="small" >{{ item.asset_list_id }}</v-chip>
      </template>

      <template v-slot:item.disposal_type="{ item }">
        {{ getDisposalTypeName(item.disposal_type) }}
      </template>

      <template v-slot:item.disposal_purpose="{ item }">
        {{ item.disposal_purpose || "-" }}
      </template>

      <template v-slot:item.gain_loss="{ item }">
        
        <v-chip flat color="success" variant="outlined" size="small">{{ nameGross(item.gain_loss) || "-" }}</v-chip>
        <!-- <div v-if="item.gain_loss === 'ROIP'" style="color: green">
          <v-chip flat>ກຳໄລ</v-chip>
        </div>
        <div v-if="item.gain_loss === 'ROIN'" style="color: red">
          <v-chip flat>ຂາດທຶນ</v-chip>
        </div> -->
      </template>

      <template v-slot:item.disposal_cost="{ item }">
        {{ formatNumber(item.disposal_cost) || "-" }}
      </template>

      <template v-slot:item.disposal_proceeds="{ item }">
        {{ formatNumber(item.disposal_proceeds) || "-" }}
      </template>

      <template v-slot:item.disposal_reason="{ item }">
        {{ item.disposal_reason || "-" }}
      </template>
    </v-data-table>
  </div>
</template>
