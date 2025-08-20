<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import FaAssetDrestriptionArrea from "./FaAssetDrestriptionArrea.vue";

const accountStore = accountMethodStore();
const depreciationStore = useFassetLidtDescription();
const history = computed(() => {
  const data = depreciationStore.response_history_data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [];
  }
});
const header = [
  { title: "ລະຫັດ", value: "aldim_id" },
  { title: "ງວດທີ່ຫັກ", value: "dpca_month" },
  { title: "ຈຳນວນລາຍການທີ່ຫັກ", value: "C_dpca" },
  { title: "ມູນຄ່າທີ່ຫັກ", value: "dpca_value" },
  { title: "ສະຖານະ", value: "dpca_status" },
  { title: "ມື້ຫັກ", value: "Maker_DT_Stamp" },
  { title: "ລາຍລະອຽດ", value: "actions" },
];
const responseData = computed(() => {
  return depreciationStore.respons_data_calculated;
});

const isLoading = computed(() => {
  return !responseData.value || !responseData.value.data;
});

const total = (items: any[]) => {
  if (!items || !Array.isArray(items)) return 0;
  return items
    .reduce((sum, item) => sum + (item.expected_depreciation || 0), 0)
    .toLocaleString();
};

const formatNumber = (num: number) => {
  return num.toLocaleString("en-US");
};

const headers = [
  { title: "ຂໍ້ມູນປະຈຳເດືອນ", key: "month_name", sortable: true },
];
const tab = ref("monthly");

const totaldata = computed(() => {
  const data = depreciationStore.respons_data_driscription_main;
  if (Array.isArray(data)) {
    return data.filter((item) => item?.Auth_Status === "R"); 
  }
  if (data && typeof data === "object") {
    return data.Auth_Status === "R" ? [data] : [];
  }
  return [];
});

const notificationCount = ref(0);

watch(
  totaldata,
  (newData) => {
    notificationCount.value = newData.length;
  },
  { immediate: true }
);

const updateNotificationCount = () => {
  notificationCount.value = totaldata.value.length;
};
onMounted(() => {
  accountStore.GetAccountMethodList();
  depreciationStore.getdataCalculated();
  depreciationStore.getDataHistory();
  depreciationStore.getDataTotal();
});

const handleNotificationClick = () => {
  goPath(`/property/autoriz/reject`);
};
</script>

<template>
  <v-container fluid>
   
    <div color="#E3F2FD" class="rounded-lg pa-4" style="border: 1px solid blue">
      <v-row v-if="isLoading">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        </v-col>
      </v-row>

      <v-row v-else-if="responseData && responseData.data">
        <v-col cols="12">
          <v-card align-tabs="center">
     <v-tabs 
  align-tabs="center" 
  v-model="tab" 
  color="#0D47A1" 
  bg-color="#BBDEFB"
  selected-class="bg-primary text-white"
>
  <v-tab value="one">
    ຫັກຄ່າຫຼູ້ຍຫ້ຽນປະຈຳເດືອນ -
    {{ responseData.data.target_period.month_name_la }}
    {{ responseData.data.target_period.year }}
  </v-tab>
  <v-tab value="two"> <v-icon>mdi-history</v-icon>ຫັກຄ່າຫຼູ້ຍຫ້ຽນຍອ້ນຫຼັງ</v-tab>
</v-tabs>

            <v-card-text>
              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                  <v-card class="elevation-2">
                    <v-card-title
                      class="text-h6 font-weight-bold bg-blue-accent-1 text-white"
                    >
                      ຂໍ້ມູນທີ່ຕອ້ງຫັກຄ່າຫຼູ້ຍຫ້ຽນພາຍໃນເດືອນ -
                      {{ responseData.data.target_period.month_name_la }}
                      {{ responseData.data.target_period.year }}
                    </v-card-title>
                    <v-card-text class="pa-0">
                      <v-table class="text-center">
                        <thead>
                          <tr class="bg-grey-lighten-3">
                            <th
                              class="text-center font-weight-bold text-primary"
                            >
                              ຫັກປະຈຳເດືອນ
                            </th>
                            <th
                              class="text-center font-weight-bold text-primary"
                            >
                              ຈຳນວນລາຍການທີ່ຫັກ
                            </th>
                            <th
                              class="text-center font-weight-bold text-primary"
                            >
                              ຈຳນວນເງິນທີ່ຕ້ອງຫັກ
                            </th>
                            <th
                              class="text-center font-weight-bold text-primary"
                            >
                              ຫັກຄ່າຫຼູ້ຍຫ້ຽນ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="pa-4">
                              <div
                                class="text-h5 text-primary font-weight-bold"
                              >
                                {{ responseData.data.target_period.month }}/{{
                                  responseData.data.target_period.year
                                }}
                              </div>
                              <div class="text-body-2 text-grey-600">
                                {{
                                  responseData.data.target_period.month_name_la
                                }}
                              </div>
                            </td>
                            <td class="pa-4">
                              <div class="text-h5 text-info font-weight-bold">
                                {{
                                  formatNumber(
                                    responseData.data.summary.total_up_to_date
                                  )
                                }}
                              </div>
                              <div class="text-body-2 text-grey-600">
                                ລາຍການທັງໝົດ
                              </div>
                            </td>
                            <td class="pa-4">
                              <div class="text-h5 text-error font-weight-bold">
                                {{ total(responseData.data.up_to_date_items) }} ₭
                              </div>
                              <div class="text-body-2 text-grey-600">
                                ລາຍການທີ່ຕ້ອງຫັກ
                              </div>
                            </td>
                            <td class="pa-4">
                              <v-btn
                                color="primary"
                                @click="
                                  goPath(`/property/faassetdetription/create`)
                                "
                                >ລາຍລະອຽດການຫັກຄ່າຫຼູ້ຍຫ້ຽນ</v-btn
                              >
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card-text>
                  </v-card>
                </v-tabs-window-item>

                <v-tabs-window-item value="two">
                  <FaAssetDrestriptionArrea />
                </v-tabs-window-item>

                <v-tabs-window-item value="three"> Three </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>

          <v-card class="mt-3">
            <div>
              <v-card-title
                class="bg-primary d-flex justify-space-between align-center"
              >
                <h3>ປະຫວັດການຫັກຄ່າຫຼູ້ຍຫ້ຽນ</h3>

                <div class="position-relative">
                  <v-icon
                    color="white"
                    icon="mdi-bell"
                    size="small"
                    @click="handleNotificationClick"
                    class="cursor-pointer"
                  ></v-icon>
                  <v-chip
                    variant="flat"
                    v-if="notificationCount > 0"
                    class="notification-badge"
                    color="error"
                    size="x-small"
                    :text="
                      notificationCount > 99
                        ? '99+'
                        : notificationCount.toString()
                    "
                  />
                </div>
              </v-card-title>
              <v-chip color="primary" class="mt-3"
                ><p>
                  ທັງໝົດ: <b>{{ history?.length }}</b> ລາຍການ
                </p></v-chip
              >
              <v-data-table :items="history" :headers="header">
                <template v-slot:header.aldim_id="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.dpca_month="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.C_dpca="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.dpca_value="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.dpca_status="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.Maker_DT_Stamp="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>
                <template v-slot:header.actions="{ column }">
                  <b class="text-primary">{{ column.title }}</b>
                </template>

                <template v-slot:item.Maker_DT_Stamp="{ item }">
                  {{ dayjs(item.Maker_DT_Stamp).format("DD/MM/YYYY") }}
                </template>
                <template v-slot:item.dpca_value="{ item }">
                  {{ Number(item.dpca_value).toLocaleString("en-US") }}
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    color="primary"
                    @click="
                      goPath(
                        `/property/faassetdetription/list?deptription_id=${item.aldim_id}`
                      )
                    "
                    >ເບິ່ງລາຍລະອຽດ</v-btn
                  >
                </template>
              </v-data-table>
            </div>
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
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}
.v-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.font-weight-bold {
  font-weight: 600;
}

.elevation-2 {
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.text-primary {
  color: #1976d2 !important;
}

.text-info {
  color: #2196f3 !important;
}

.text-error {
  color: #f44336 !important;
}

.text-success {
  color: #4caf50 !important;
}

.text-warning {
  color: #ff9800 !important;
}

.text-grey-600 {
  color: #757575 !important;
}

.rounded-lg {
  border-radius: 12px;
}
</style>
