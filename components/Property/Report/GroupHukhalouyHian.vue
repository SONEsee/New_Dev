<script setup lang="ts">
const title = "ບົດລາຍງານຫັກຄ່າຫຼຸຍຫ້ຽນ";
const devisionStore = UseCategoryStore();
const reporStore = useReportDeprecationStore();
const AssetListStore = assetStore();
const masterStore = useMasterStore();
const selecteAssetType = ref(null);
const selectStatus = ref(null);
const selectStartDate = ref("");
const selectEndDate = ref("");
const selectedAssetList = ref(null);
const selectedDevision = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);
const devisiondata = computed(() => {
  const data = devisionStore.categories;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const assetType = computed(() => {
  const data = AssetListStore.response_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const status = computed(() => {
  const data = masterStore.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const reportData = computed(() => {
  const data = reporStore.response_group_data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
watch(selecteAssetType, async (newValue) => {
  reporStore.isLoading = true;
  try {
    reporStore.from_filter_group.asset_type_id = newValue;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ",
    });
  } finally {
    reporStore.isLoading = false;
  }
});
watch (selectedDevision, async (newValue)=>{
    reporStore.isLoading= true;
    try {
        reporStore.from_filter_group.devision = newValue ;
        await reporStore.getGroupData();
    } catch (error) {
        CallSwal({
            icon: "error",
            title: "ເກີດຂໍ້ຜິດພາດ",
            text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດຊັບສິນ",
        })
    }finally{
        reporStore.isLoading = false
    }
})
watch(selectStatus, async (newValue) => {
  masterStore.isloading = true;
  try {
    reporStore.from_filter_group.asset_status = newValue;
    await reporStore.getGroupData();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
    });
  } finally {
    masterStore.isloading = false;
  }
});
onMounted(() => {
  reporStore.getGroupData();
  AssetListStore.GetAssetList();
  masterStore.getPuamsue1();
  devisionStore.GetListData();
});
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <v-row>
      <v-col cols="12" md="2">
        <!-- <v-autocomplete
          v-model="selecteAssetType"
          label="ປະເພດຊັບສົມບັດ"
          :items="assetType"
          item-title="asset_name_la"
          item-value="coa_id"
          variant="outlined"
          density="compact"
        ></v-autocomplete> -->
        <v-autocomplete
          :items="assetType"
          item-title="asset_name_la"
          item-value="coa_id"
          v-model="selecteAssetType"
          label="ເລືອກປະເພດຊັບສິນ"
          clearable
          :loading="AssetListStore.isLoading"
          prepend-inner-icon="mdi-database-search"
          :search-input.sync="searchQuery"
          no-data-text="ບໍ່ພົບຂໍ້ມູນ"
          variant="outlined"
          density="compact"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.asset_name_la}/${item.raw.coa_id}`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-package-variant</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="2">
        <v-autocomplete
          v-model="selectStatus"
          label="ປະເພດຊັບສົມບັດ"
          :items="status"
          clearable
          :loading="isLoading"
          prepend-inner-icon="mdi-database-search"
          :search-input.sync="searchQuery"
          item-title="MC_name_la"
          item-value="MC_code"
          variant="outlined"
          density="compact"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.MC_name_la}/${item.raw.MC_code}`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-list-status</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="2">
        <v-autocomplete
        prepend-inner-icon="mdi-source-branch"
        variant="outlined"
        density="compact"
        label="ພະແນກ"
          :items="devisiondata"
          item-value="div_id"
          item-title="division_name_la"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.division_name_la}/${item.raw.div_id}`"
            >
            <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-source-branch-check</v-icon>
                </v-avatar>
            </template>
        </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </div>

  <pre>{{ devisiondata }}</pre>
  <pre>
        {{ reportData.length }}
    </pre
  >
</template>
