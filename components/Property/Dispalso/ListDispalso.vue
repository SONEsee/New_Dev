<script setup lang="ts">
const title = "ຈັດການຊຳລະສະສາງ";
const faasetStore = faAssetStore();
const masterType = useMasterStore();
const AssetListStore = assetStore();
const selectAssetList = ref("");
const selectUseLife = ref("");
const selectType = ref("");
const rout = useRoute();
const headers = computed(() => [
  {
    title: "ລະຫັດ",
    value: "asset_list_id",
    align: "start",
    sortable: true,
    filterable: true,
    width: "80px",
    class: "text-primary font-weight-bold",
  },

  {
    title: "ລາຍລະອຽດສົມບັດ",
    value: "asset_spec",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-h6",
  },
  {
    title: "ປະເພດຊັບສົມບັດ",
    value: "asset_type_id",
    align: "start",
    sortable: true,
    filterable: true,
    width: "120px",
  },
  {
    title: "ມູນຄ່າເລີ່ມຕົ້ນ",
    value: "asset_value",
    align: "end",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-end",
  },
  {
    title: "ວັນທີ່ໄດ້ຮັບ",
    value: "asset_date",
    align: "center",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ອາຍຸການໃຊ້ງານ (ປີ)",
    value: "asset_useful_life",
    align: "center",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ສະຖານະອາຍຸ",
    value: "useful_life_status",
    align: "center",
    sortable: false,
    filterable: false,
    width: "120px",
    class: "text-center",
  },
  {
    title: "ຈັດການ",
    value: "expense_status",
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
]) as any;
watch(selectAssetList, async (newValue) => {
  faasetStore.isLoading = true;
  try {
    faasetStore.filter_data_assetlist_id1.filter.asset_type_id = newValue;
    await faasetStore.GetFaAssetList2();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
    });
  } finally {
    faasetStore.isLoading = false;
  }
});
watch(selectUseLife, async (newValue) => {
  faasetStore.isLoading = true;
  try {
    faasetStore.filter_data_assetlist_id1.filter.useful_life_status = newValue;
    await faasetStore.GetFaAssetList2();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
    });
  } finally {
    faasetStore.isLoading = false;
  }
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
const masterData = computed(() => {
  const data = masterType.respons_data_status_nuw1;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const faasetData = computed(() => {
  const data = faasetStore.response_fa_asset_list;

  let asset = [];
  if (Array.isArray(data)) {
    asset = data;
  } else if (data && typeof data === "object") {
    asset = [data];
  } else {
    return [];
  }

  return asset
    .filter((item) => item.asset_status !== "DS")
    .map((item) => {
      const usefulLifeMonths = (item.asset_useful_life || 0) * 12;
      const currentDepreciation = item.C_dpac;
      const isExpired = currentDepreciation >= usefulLifeMonths;

      return {
        ...item,
        useful_life_status: isExpired ? "expired" : "not_expired",
        useful_life_display: isExpired ? "ຄົບກຳນົດ" : "ຍັງບໍ່ຄົບກຳນົດ",
        remaining_months: Math.max(0, usefulLifeMonths - currentDepreciation),
      };
    });
});

const usefulLifeStats = computed(() => {
  const total = faasetData.value.length;
  const expired = faasetData.value.filter(
    (item) => item.useful_life_status === "expired"
  ).length;
  const notExpired = total - expired;

  return {
    total,
    expired,
    notExpired,
    expiredPercentage: total > 0 ? Math.round((expired / total) * 100) : 0,
  };
});

const getDisplayText = (item: any) => {
  if (!item || !item.MC_name_la || !item.MC_code) {
    return "ທັງໝົດ";
  }
  return `${item.MC_name_la}-${item.MC_code}`;
};
const getDisplayTextType = (item: any) => {
  if (!item || !item.asset_name_la || !item.coa_id) {
    return "ທັງໝົດ";
  }
  return `${item.asset_name_la}-${item.coa_id}`;
};

const getStatusColor = (status: string) => {
  return status === "expired" ? "error" : "success";
};

const getStatusIcon = (status: string) => {
  return status === "expired" ? "mdi-clock-alert" : "mdi-clock-check";
};
const formatNumber = (value: any) => {
  if (!value && value !== 0) return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  if (num % 1 === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
};
const getName = (nameType: any) => {
  if (!nameType || !Array.isArray(assetType.value)) {
    return "-";
  }

  const data = assetType.value.find((item: any) => item.coa_id === nameType);
  return data ? data.asset_name_la : "-";
};

onMounted(() => {
  masterType.getEP();
  faasetStore.GetFaAssetList2();
  AssetListStore.GetAssetList();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <pre>{{ assetType }}</pre> -->
    <v-row>
      <v-col cols="12" md="3">
        <v-autocomplete
          prepend-inner-icon="mdi-weather-cloudy-clock"
          :loading="faasetStore.isLoading"
          v-model="selectUseLife"
          label="ເລືອກຕາມອາຍຸການໃຊ້ງານ"
          density="compact"
          variant="outlined"
          :items="masterData"
          :item-title="getDisplayText"
          item-value="MC_code"
          clearable
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.MC_name_la}-(${item.raw.MC_code}}`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-weather-cloudy-clock</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="3">
        <v-autocomplete
          v-model="selectAssetList"
          :loading="faasetStore.isLoading"
          prepend-inner-icon="mdi-format-list-bulleted-type"
          label="ເລືອກຕາມອາຍຸການໃຊ້ງານ"
          density="compact"
          variant="outlined"
          :items="assetType"
          :item-title="getDisplayTextType"
          item-value="coa_id"
          clearable
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.asset_name_la}-(${item.raw.coa_id})`"
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
      <v-col cols="12" md="6" class="d-flex justify-end">
        <v-btn
          :disabled="!selectUseLife"
          color="primary"
          @click="goPath(`/property/dispalso/create/?type=${selectUseLife}`)"
          >ສະສາງຊັບສົມບັດ</v-btn
        >
      </v-col>
    </v-row>

    <v-data-table
      class="text-no-wrap"
      :items="faasetData"
      :loading="faasetStore.isLoading"
      :headers="headers"
      items-per-page="15"
      show-current-page
    >
      <template v-slot:header.asset_list_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_type_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_spec="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_date="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_useful_life="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.useful_life_status="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.expense_status="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:item.useful_life_status="{ item }">
        <v-chip
          :color="getStatusColor(item.useful_life_status)"
          variant="tonal"
          size="small"
          :prepend-icon="getStatusIcon(item.useful_life_status)"
        >
          {{ item.useful_life_display }}
        </v-chip>
      </template>
      <template v-slot:item.asset_type_id="{ item }">
        <v-chip flat>{{ getName(item.asset_type_id) }}</v-chip>
      </template>

      <template v-slot:item.asset_value="{ item }">
        <span class="font-weight-bold">
          {{ formatNumber(item.asset_value) }} ກີບ
        </span>
      </template>

      <template v-slot:item.asset_useful_life="{ item }">
        <v-chip color="info" variant="outlined" size="small">
          {{ item.asset_useful_life || 0 }} ປີ
        </v-chip>
      </template>
      <template v-slot:item.expense_status="{ item }">
        <v-btn
          flat
          class="text-primary"
          @click="
            goPath(
              `/property/dispalso/create/?asset_list_id=${item.asset_list_id}&type=${item.useful_life_status}`
            )
          "
        >
          ສະສາງ
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
