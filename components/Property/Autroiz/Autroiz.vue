<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const mainStore = useFassetLidtDescription();
const route = useRoute();
const id = route.query.id_assetlist as string;
const title = "ອະນຸມັດຫັກຄ່າຫຼູ້ຍຫຽ້ນ";

const selectedItems = ref<any[]>([]);

const headers = computed(() => {
  return [
    { title: "", key: "checkbox", sortable: false, width: "50px" }, // ເພີ່ມຄໍລັມ checkbox
    { title: "ລາຍລະອຽດ", key: "dpca_desc" },
    { title: "ຈຳນວນວັນທີຫັກ", key: "dpca_no_of_days" },
    { title: "ວັນທີຫັກໂຕຈິງ", key: "dpca_date" },
    { title: "ຄ່າເສື່ອມລາຄາ", key: "dpca_value" },
    { title: "ມູນຄ່າຄົງເຫຼືອ", key: "remaining_value" },
    { title: "ອານຸມັດ", key: "action" },
  ];
});

const responseData = computed(() => {
  const data = mainStore.respons_data_driscription_main;

  const arrayData = Array.isArray(data)
    ? data
    : data && typeof data === "object"
    ? [data]
    : [];

  return arrayData.filter((item: any) => item.Auth_Status === "U");
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

const getUniqueKey = (item: any) => {
  if ((item as any).aldm_id) return `aldm_${(item as any).aldm_id}`;

  if ((item as any).asset_list_id && (item as any).dpca_date) {
    return `${(item as any).asset_list_id}_${(item as any).dpca_date}`;
  }

  return `${(item as any).dpca_date}_${
    (item as any).dpca_value
  }_${Math.random()}`;
};

const isSelected = (item: any) => {
  const itemKey = getUniqueKey(item);
  return selectedItems.value.some(
    (selected) => getUniqueKey(selected) === itemKey
  );
};

const toggleSelection = (item: any) => {
  const itemKey = getUniqueKey(item);
  const index = selectedItems.value.findIndex(
    (selected) => getUniqueKey(selected) === itemKey
  );
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

const toggleSelectAll = () => {
  if (selectedItems.value.length === responseData.value.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...responseData.value];
  }
};

const isAllSelected = computed(() => {
  return (
    responseData.value.length > 0 &&
    selectedItems.value.length === responseData.value.length
  );
});

const isIndeterminate = computed(() => {
  return (
    selectedItems.value.length > 0 &&
    selectedItems.value.length < responseData.value.length
  );
});

const debugSelection = () => {
  console.log("Selected items count:", selectedItems.value.length);
  console.log(
    "Selected items:",
    selectedItems.value.map((item: any) => ({
      aldm_id: item.aldm_id,
      asset_list_id: item.asset_list_id,
      dpca_desc: item.dpca_desc,
      uniqueKey: getUniqueKey(item),
    }))
  );
  console.log(
    "All response data:",
    responseData.value.map((item: any) => ({
      aldm_id: item.aldm_id,
      asset_list_id: item.asset_list_id,
      uniqueKey: getUniqueKey(item),
    }))
  );
};

const approveSelected = () => {
  if (selectedItems.value.length === 0) return;

  console.log(
    "Approving items:",
    selectedItems.value.map((item: any) => item.aldm_id)
  );

  alert(`ກຳລັງອະນຸມັດ ${selectedItems.value.length} ລາຍການ`);
};

const rejectSelected = () => {
  if (selectedItems.value.length === 0) return;

  console.log(
    "Rejecting items:",
    selectedItems.value.map((item: any) => item.aldm_id)
  );

  alert(`ກຳລັງປະຕິເສດ ${selectedItems.value.length} ລາຍການ`);
};
const formatCurrency = (value: any): any => {
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value)) + " ກີບ";
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
  }
  mainStore.getDetailDataMain();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <div v-if="selectedItems.length > 0" class="mb-4">
      <v-alert type="info" variant="tonal" class="mb-4">
        <v-icon>mdi-check-circle</v-icon>
        ເລືອກແລ້ວ {{ selectedItems.length }} ລາຍການຈາກທັງໝົດ
        {{ responseData.length }} ລາຍການ

        <template v-slot:append>
          <v-btn size="small" variant="text" @click="debugSelection">
            Debug
          </v-btn>

          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            @click="selectedItems = []"
          >
            ຍົກເລີກທັງໝົດ
          </v-btn>
        </template>
      </v-alert>
    </div>

    <v-data-table
      :items="responseData"
      :headers="headers"
      class="elevation-1"
      no-data-text="ບໍ່ມີຂໍ້ມູນ"
      items-per-page="10"
    >
      <template v-slot:header.checkbox="{}">
        <v-checkbox-btn
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @update:model-value="toggleSelectAll"
          color="primary"
        />
      </template>

      <template v-slot:item.checkbox="{ item }">
        <v-checkbox-btn
          :model-value="isSelected(item)"
          @update:model-value="toggleSelection(item)"
          color="primary"
        />
      </template>

      <template v-slot:header.dpca_desc="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_no_of_days="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_date="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.action="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.remaining_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:item.dpca_date="{ item }">
        {{ formatDate(item.dpca_date) }}
      </template>
      <template v-slot:item.dpca_value="{ item }">
        {{ new Intl.NumberFormat("en-US").format(item.dpca_value) }}
      </template>
      <template v-slot:item.remaining_value="{ item }">
        {{ new Intl.NumberFormat("en-US").format(item.remaining_value) }}
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

      <template v-slot:item.action="{ item }">
        <v-btn v-if="item.Auth_Status === 'U'" flat @click="goPath(`/property/autoriz/addprove/?id_autoriz=${item.aldm_id}`)">
          <v-icon icon="mdi-toggle-switch-off-outline" color="error"></v-icon>
        </v-btn>
        <v-btn v-if="item.Auth_Status === 'A'" flat readonly>
          <v-icon icon="mdi-toggle-switch" color="info"></v-icon>
        </v-btn>
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

    <div v-if="selectedItems.length > 0" class="mt-4 d-flex justify-end gap-2">
      <v-btn
      
        color="success"
        variant="elevated"
        prepend-icon="mdi-check-circle"
        @click="approveSelected"
      >
        ອະນຸມັດທີ່ເລືອກ ({{ selectedItems.length }})
      </v-btn>

      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-close-circle"
        @click="rejectSelected"
      >
        ປະຕິເສດທີ່ເລືອກ
      </v-btn>
    </div>
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
