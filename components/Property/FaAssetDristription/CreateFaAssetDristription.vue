<script setup lang="ts">
const accoutStore = accountMethodStore();
const dreptriptionStore = useFassetLidtDescription();

const respontest = computed(() => {
  return dreptriptionStore.respons_data_calculated;
});

const res = computed(() => {
  return accoutStore.response_account_method_list;
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

const allItems = computed(() => {
  const overdue = respontest.value?.data?.overdue_items || [];
  const due = respontest.value?.data?.due_items || [];
  const upToDate = respontest.value?.data?.up_to_date_items || [];

  return [
    ...overdue.map((item) => ({
      ...item,
      category: "ຄ້າງຫັກ",
      categoryColor: "red",
    })),
    ...due.map((item) => ({
      ...item,
      category: "ຕ້ອງຫັກ",
      categoryColor: "orange",
    })),
    ...upToDate.map((item) => ({
      ...item,
      category: "ອັບເດດແລ້ວ",
      categoryColor: "green",
    })),
  ];
});

const headers = [
  { title: "ລະຫັດ", key: "category", sortable: true  },
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
    case "ຄ້າງຫັກ":
      return "red";
    case "ຕ້ອງຫັກ":
      return "orange";
    case "ອັບເດດແລ້ວ":
      return "green";
    default:
      return "grey";
  }
};
const handelSubmit = async ()=>{
    await dreptriptionStore.Caculater()
}
onMounted(() => {
  accoutStore.GetAccountMethodList();
  dreptriptionStore.getdataCalculated();
});
</script>

<template>
  <v-container fluid>
    <!-- Debug ຂໍ້ມູນ (ລຶບອອກເມື່ອໃຊ້ງານຈິງ) -->
    <!-- <details>
      <summary>Debug Data</summary>
      <pre>{{ respontest }}</pre>
    </details> -->

    <v-row v-if="dreptriptionStore.isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </v-col>
    </v-row>

    <div v-else-if="respontest?.success">
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 mb-2">ລາຍການຫັກຄ່າຫຼູ້ຍຫຽ້ນປະຈຳເດືອນ</h2>
          <div v-if="targetPeriod">
            <h3 class="text-h5 text-primary">
              {{ targetPeriod.month_name_la }} {{ targetPeriod.year }}
            </h3>
            <p class="text-subtitle-1 text-grey">{{ targetPeriod.period }}</p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
             <v-btn color="primary" @click="handelSubmit">
                ຫັກຄ່າຫຼູຍຫຽ້ນທັງໝົດ
             </v-btn>
            <v-card-title>
              <v-icon left>mdi-table</v-icon>
              ລາຍລະອຽດທຸກລາຍການ
            </v-card-title>

            <v-data-table
              :headers="headers"
              :items="allItems"
              :items-per-page="10"
              class="elevation-1"
              :loading="dreptriptionStore.isLoading"
              loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
              no-data-text="ບໍ່ມີຂໍ້ມູນ"
            >
              <template v-slot:item.category="{ item }">
                <v-chip
                  :color="getCategoryColor(item.category)"
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
                   {{ item.due_end_date }} - {{ item.due_end_date }}
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

      <v-row class="mt-6" v-if="false">
        <v-col cols="12" v-if="overdueItems.length > 0">
          <v-card>
            <v-card-title class="bg-red-lighten-5">
              <v-icon color="red" left>mdi-alert-circle</v-icon>
              ລາຍການຄ້າງຫັກ ({{ overdueItems.length }})
            </v-card-title>
            <v-data-table
              :headers="headers.filter((h) => h.key !== 'category')"
              :items="overdueItems"
              :items-per-page="5"
              hide-default-footer
            >
              <template v-slot:item.expected_depreciation="{ item }">
                {{ formatCurrency(item.expected_depreciation) }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>

     
        <v-col cols="12" v-if="dueItems.length > 0" class="mt-4">
          <v-card>
            <v-card-title class="bg-orange-lighten-5">
              <v-icon color="orange" left>mdi-calendar-clock</v-icon>
              ລາຍການຕ້ອງຫັກ ({{ dueItems.length }})
            </v-card-title>
            <v-data-table
              :headers="headers.filter((h) => h.key !== 'category')"
              :items="dueItems"
              :items-per-page="5"
              hide-default-footer
            >
              <template v-slot:item.expected_depreciation="{ item }">
                {{ formatCurrency(item.expected_depreciation) }}
              </template>
              <template v-slot:item.due_date="{ item }">
                {{ item.due_end_date }} - {{ item.due_end_date }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon color="error" size="64">mdi-alert-circle</v-icon>
        <h3 class="text-h5 mt-4">ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້</h3>
        <v-btn
          color="primary"
          class="mt-4"
          @click="dreptriptionStore.getdataCalculated()"
        >
          ລອງໃໝ່
        </v-btn>
      </v-col>
    </v-row>
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