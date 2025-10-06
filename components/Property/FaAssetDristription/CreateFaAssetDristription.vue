<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";

const deprecationUpdate = useDrepecitoinUpdat();
const accountStore = accountMethodStore();
const depreciationStore = useFassetLidtDescription();
const journalStore = usejournalStore();
const eodStore = useDateStore();

const eodData = computed(() => {
  const data = eodStore.response_data_eod;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});


const selectedIds = ref<any[]>([]);


const selectedItems = computed(() => {
  return dataUpdate.value.filter(item => 
    selectedIds.value.includes(item.mapping_id)
  );
});

const journalData = computed(() => {
  const data = journalStore.response_data_list_journal;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const journalAssetIds = computed(() => {
  return new Set(journalData.value.map((item) => item.Ac_relatives));
});

const dataUpdate = computed(() => {
  const data = deprecationUpdate.response_data_drepecation_lis?.due_items;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const selectableItems = computed(() => {
  return dataUpdate.value.filter((item) => !hasJournal(item.asset_id));
});

const respontest = computed(() => {
  return depreciationStore.response_data_get_overdue;
});

const res = computed(() => {
  return accountStore.response_account_method_list;
});

const overdueItems = computed(() => {
  return respontest.value?.data?.overdue_items || [];
});

const dueItems = computed(() => {
  return respontest.value?.data?.due_items || [];
});

const upToDateItems = computed(() => {
  return respontest.value?.data?.up_to_date_items || [];
});

const headers = [
  { title: "ລະຫັດ", key: "category", sortable: true },
  { title: "ຊື່ຊັບສິນ", key: "asset_name", sortable: true },
  { title: "ໄລຍະເວລາຫັກຄ່າຫຼູ້ຍຫຽ້ນ", key: "due_date", sortable: true },
  {
    title: "ຄ່າຫຼູຍຫ້ຽນພາຍໃນເດືອນ",
    key: "expected_depreciation",
    sortable: true,
  },
  { title: "ເດືອນທີ່", key: "current_month", sortable: false },
  { title: "ຄວາມຄືບໜ້າ (%)", key: "completion_percentage", sortable: true },
  { title: "ຂໍ້ຄວາມ", key: "status_message", sortable: false },
];

const summary = computed(() => {
  return respontest.value?.data?.summary;
});

const targetPeriod = computed(() => {
  return respontest.value?.data?.target_period;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA").format(value);
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "ຍັງບໍ່ໄດ້ຫັກ":
      return "blue";
    case "ຕ້ອງຫັກ":
      return "orange";
    case "ອັບເດດແລ້ວ":
      return "green";
    default:
      return "grey";
  }
};

const hasJournal = (assetId: string) => {
  return journalAssetIds.value.has(assetId);
};


const toggleItem = (mappingId: string) => {
  const index = selectedIds.value.indexOf(mappingId);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(mappingId);
  }
};


const selectAllSelectable = () => {
  selectedIds.value = [...selectableItems.value.map(item => item.mapping_id)];
};


const clearSelection = () => {
  selectedIds.value = [];
};

const handelSubmit = async () => {
  if (selectedIds.value.length === 0) {
    await CallSwal({
      icon: "warning",
      title: "ແຈ້ງເຕືອນ",
      text: "ກະລຸນາເລືອກລາຍການກ່ອນ",
      confirmButtonText: "ຕົກລົງ",
    });
    return;
  }

  const notification = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: `ທ່ານຕ້ອງການຫັກຄ່າຫຼູຍຫ້ຽນ ${selectedIds.value.length} ລາຍການນີ້ບໍ...?`,
    showConfirmButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (notification.isConfirmed) {
    try {
     
      depreciationStore.postdata.mapping_ids = selectedIds.value;
      
     
      const result = await depreciationStore.Caculater();
      
     
      selectedIds.value = [];
      
      
      await deprecationUpdate.getDataDrepecation();
      await journalStore.getData();
      
    
      if (result?.success  !== false) {
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຫັກຄ່າຫຼູຍຫ້ຽນສຳເລັດແລ້ວ",
          confirmButtonText: "ຕົກລົງ",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await CallSwal({
        icon: "error",
        title: "ເກີດຂໍ້ຜິດພາດ",
        text: "ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
        confirmButtonText: "ຕົກລົງ",
      });
    }
  }
};

onMounted(() => {
  deprecationUpdate.getDataDrepecation();
  accountStore.GetAccountMethodList();
  depreciationStore.getdataCalculated();
  depreciationStore.getArrears();
  journalStore.getData();
  eodStore.GetEOD();
});
</script>

<template>
  <v-container fluid>
    <div>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="mb-2">
            ລາຍການຫັກຄ່າຫຼູ້ຍຫ້ຽນປະຈຳເດືອນ:
            <b>{{ dayjs(eodData[0]?.start_date).format("MM-YYYY") }}</b>
          </h2>
          <div v-if="targetPeriod">
            <h3 class="text-primary">
              {{ targetPeriod.month_name_la }} {{ targetPeriod.year }}
            </h3>
            <p class="text-subtitle-1 text-grey">{{ targetPeriod.period }}</p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card class="pa-2">
            <v-row>
              <v-col cols="12" md="6">
                <v-card-title>
                  <v-icon left>mdi-table</v-icon>
                  ລາຍລະອຽດທຸກລາຍການ
                  <v-chip
                    class="ml-2"
                    size="small"
                    color="info"
                    variant="outlined"
                  >
                    ສາມາດເລືອກໄດ້: {{ selectableItems.length }}/{{
                      dataUpdate.length
                    }}
                  </v-chip>
                </v-card-title>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex mb-2 justify-end align-center ga-2">
                  <v-chip v-if="selectedIds.length > 0" color="primary">
                    ເລືອກ: {{ selectedIds.length }}
                  </v-chip>
                  
                  <v-btn
                    v-if="selectableItems.length > 0"
                    variant="outlined"
                    color="primary"
                    size="small"
                    @click="selectAllSelectable"
                    :disabled="selectedIds.length === selectableItems.length"
                  >
                    <v-icon left size="small">mdi-checkbox-multiple-marked</v-icon>
                    ເລືອກທັງໝົດ
                  </v-btn>
                  
                  <v-btn
                    v-if="selectedIds.length > 0"
                    variant="outlined"
                    color="grey"
                    size="small"
                    @click="clearSelection"
                  >
                    <v-icon left size="small">mdi-close</v-icon>
                    ຍົກເລີກ
                  </v-btn>
                  
                  <v-btn
                    color="error"
                    @click="handelSubmit"
                    :disabled="selectedIds.length === 0"
                  >
                    <v-icon left>mdi-check-circle</v-icon>
                    ຢືນຢັນການຫັກຄ່າຫຼູຍຫ້ຽນ
                  </v-btn>
                </div>
              </v-col>
            </v-row>

            <v-data-table
              v-model="selectedIds"
              :items="dataUpdate"
              :headers="headers"
              :loading="depreciationStore.isLoading"
              show-select
              item-value="mapping_id"
              :item-selectable="(item) => !hasJournal(item.asset_id)"
            >
              <template
                v-slot:item.data-table-select="{ item }"
              >
                <v-tooltip v-if="hasJournal(item.asset_id)" location="top">
                  <template v-slot:activator="{ props }">
                    <div
                      v-bind="props"
                      class="d-flex align-center justify-center"
                    >
                      <v-icon color="warning" size="small"> mdi-lock </v-icon>
                    </div>
                  </template>
                  <span>
                    ລໍຖ້າອະນຸມັດ ລາຍການຊັບສິນນີ້
                    {{ item.asset_id }} ຖືກຫັກຄ່າຫຼູຍຫ້ຽນແລ້ວສຳຫຼັບເດືອນ
                    {{ dayjs(eodData[0]?.start_date).format("MM/YYYY") }}
                  </span>
                </v-tooltip>

                <v-checkbox-btn
                  v-else
                  :model-value="selectedIds.includes(item.mapping_id)"
                  @click="toggleItem(item.mapping_id)"
                  color="primary"
                  hide-details
                  density="compact"
                />
              </template>

              <template v-slot:item.category="{ item }">
                <v-chip
                  :color="getCategoryColor(item.last_depreciation_date)"
                  variant="flat"
                  size="small"
                >
                  {{ item.asset_id }}
                </v-chip>
              </template>

              <template v-slot:item.expected_depreciation="{ item }">
                <span class="font-weight-bold">
                  {{ formatCurrency(item.expected_depreciation) }}
                </span>
              </template>

              <template v-slot:item.current_month="{ item }">
                <v-chip variant="outlined" size="small">
                  {{ item.current_month }}/{{ item.total_months }}
                </v-chip>
              </template>

              <template v-slot:item.due_date="{ item }">
                <v-chip variant="outlined" size="small">
                  {{
                    dayjs(
                      item.due_end_date.split("/").reverse().join("-")
                    ).format("MM/YYYY")
                  }}
                </v-chip>
              </template>

              <template v-slot:item.completion_percentage="{ item }">
                <v-progress-linear
                  :model-value="item.completion_percentage"
                  :color="
                    item.completion_percentage >= 100 ? 'green' : 'primary'
                  "
                  height="20"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <small class="text-white">{{ Math.ceil(value) }}%</small>
                  </template>
                </v-progress-linear>
              </template>

              <template v-slot:item.status_message="{ item }">
                <small>{{ item.status_message }}</small>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.text-h3 {
  font-weight: bold;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}

.font-weight-bold {
  font-weight: 600;
}
</style>