<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const mainStore = useFassetLidtDescription();
const route = useRoute();
const id = route.query.id_assetlist as string;
const title = "ປະຫວັດການຫັກຄ່າຫຼູ້ຍຫ້ຽນ";

const headers = [
  { title: "ລາຍລະອຽດ", key: "dpca_desc" },
  { title: "ຈຳນວນວັນທີຫັກ", key: "dpca_no_of_days" },
  { title: "ວັນທີຫັກໂຕຈິງ", key: "dpca_date" },
  { title: "ຄ່າເສື່ອມລາຄາ", key: "dpca_value" },
  { title: "ມູນຄ່າຄົງເຫຼືອ", key: "remaining_value" },
];

const responseData = computed(() => {
  const data = mainStore.respons_data_driscription_main;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});

const summaryInfo = computed(() => {
  const data = responseData.value;

  if (!data || data.length === 0) {
    return {
      totalItems: 0,
      assetId: null,
      assetName: null,
      hasData: false,
    };
  }

  const firstItem = data[0];

  return {
    totalItems: data.length,
    assetId: firstItem?.asset_list_id || "ບໍ່ມີຂໍ້ມູນ",

    assetName:
      firstItem?.asset_list_id_detail?.asset_spec ||
      firstItem?.asset_spec ||
      "ບໍ່ມີຂໍ້ມູນ",
    hasData: true,
  };
});

const formatCurrency = (value: any): string => {
  if (!value || isNaN(Number(value))) return "0 ກີບ";
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value)) + " ກີບ"
  );
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  } catch (error) {
    return dateString;
  }
};

onMounted(() => {
  if (id) {
    mainStore.filter_data_assetlist.assetlist.asset_list_id = id;
    mainStore.getDetailDataMain();
  }
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card variant="outlined" color="indigo-darken-4">
          <v-card-text class="text-center">
            <v-icon size="24" color="blue">mdi-counter</v-icon>
            <div class="text-h6 mt-2">{{ summaryInfo.totalItems }}</div>
            <div class="">ຈຳນວນລາຍການທັງໝົດ</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" color="blue-darken-4">
          <v-card-text class="text-center">
            <v-icon size="24" color="green">mdi-identifier</v-icon>
            <div class="text-h6 mt-2" color="black">
              {{ summaryInfo.assetId }}
            </div>
            <div class="">ລະຫັດຊັບສິນ</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" color="blue-darken-4">
          <v-card-text class="text-center">
            <v-icon size="24" color="orange">mdi-tag</v-icon>
            <div class="text-subtitle-1 mt-2" style="min-height: 1.5rem">
              {{ summaryInfo.assetName }}
            </div>
            <div class="">ຊື່ຊັບສົມບັດ</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-data-table
      :items="responseData"
      :headers="headers"
      class="elevation-1"
      no-data-text="ບໍ່ມີຂໍ້ມູນ"
      items-per-page="10"
    >
    <template v-slot:header.dpca_desc="{column}">
       <b style="color: blue;">{{ column.title }}</b> 
    </template>
    <template v-slot:header.dpca_no_of_days="{column}">
       <b style="color: blue;">{{ column.title }}</b> 
    </template>
    <template v-slot:header.dpca_value="{column}">
       <b style="color: blue;">{{ column.title }}</b> 
    </template>
    <template v-slot:header.dpca_date="{column}">
       <b style="color: blue;">{{ column.title }}</b> 
    </template>
    <template v-slot:header.remaining_value="{column}">
       <b style="color: blue;">{{ column.title }}</b> 
    </template>
      <template v-slot:item.dpca_date="{ item }">
        {{ formatDate(item.dpca_date) }}
      </template>

      <template v-slot:item.dpca_value="{ item }">
        <span class="font-weight-medium text-primary">
          {{ formatCurrency(item.dpca_value) }}
        </span>
      </template>

      <template v-slot:item.remaining_value="{ item }">
        <span
          class="font-weight-medium"
          :class="{
            'text-success': Number(item.remaining_value) > 0,
            'text-grey': Number(item.remaining_value) === 0,
          }"
        >
          {{ formatCurrency(item.remaining_value) }}
        </span>
      </template>

      <template v-slot:item.dpca_no_of_days="{ item }">
        <v-chip size="small" variant="outlined" color="blue">
          {{ item.dpca_no_of_days || 0 }} ວັນ
        </v-chip>
      </template>

      <template v-slot:item.dpca_desc="{ item }">
        <div class="text-wrap" style="max-width: 300px">
          {{ item.dpca_desc || "-" }}
        </div>
      </template>

      <template v-slot:no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-database-off</v-icon>
          <div class="text-h6 mt-4">ບໍ່ມີຂໍ້ມູນ</div>
          <div class="text-body-2 text-grey">
            ບໍ່ພົບປະຫວັດການຫັກຄ່າເສື່ອມລາຄາສຳລັບຊັບສິນນີ້
          </div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<style scoped>
.text-wrap {
  white-space: normal;
  word-break: break-word;
}

@media (max-width: 768px) {
  .v-data-table {
    font-size: 0.875rem;
  }
}
</style>
