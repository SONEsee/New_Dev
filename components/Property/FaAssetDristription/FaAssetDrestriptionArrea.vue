<script setup lang="ts">
import dayjs from "dayjs";
const mainStore = useFassetLidtDescription();
const assetStores = faAssetStore();

const eodStore = useDateStore();
const selectedItems = ref([]);
const journalStore = usejournalStore();


const selectedAssetType = ref(null);
const selectedJournalStatus = ref(null); 

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

// ເພີ່ມ options สຳລັບ filter ສະຖານະ journal
const journalStatusOptions = [
  { value: "pending", title: "ລໍຖ້າອະນຸມັດ" },
  { value: "not_created", title: "ຍັງບໍ່ໄດ້ຫັກ" }
];

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

const eod = computed(() => {
  const data = eodStore.response_data_eod;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const assetdata = computed(() => {
  const data = assetStores.response_fa_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

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

const StardDate = (apdc_start_date: any) => {
  if (!apdc_start_date || !Array.isArray(assetdata.value)) return "_";
  const itemData = assetdata.value.find(
    (item) => item.asset_list_id === apdc_start_date
  );
  return itemData ? itemData.dpca_start_date : "_";
};

const mappedData = computed(() => {
  const eodData = eod.value[0];
  const prevWorkingDay = eodData?.prev_working_day
    ? dayjs(eodData.prev_working_day)
    : dayjs();

  return res.value.map((overdueItem) => {
    const matchedAsset = assetdata.value.find(
      (asset) => asset.asset_list_id === overdueItem.asset_id
    );

    const isInJournal = journalAssetIds.value.has(overdueItem.asset_id);

    if (matchedAsset) {
      let actualOverdueDays = 0;
      let actualOverdueMonths = 0;
      let dueDate = null;
      let dueYear = null;
      let dueMonth = null;
      let currentYear = null;
      let currentMonth = null;
      let dueMonthTotal = null;
      let currentMonthTotal = null;

      if (overdueItem.due_end_date) {
        const dueDateParts = overdueItem.due_end_date.split("/");
        dueDate = dayjs(
          `${dueDateParts[2]}-${dueDateParts[1]}-${dueDateParts[0]}`
        );

        actualOverdueDays = prevWorkingDay.diff(dueDate, "days");

        dueYear = parseInt(dueDateParts[2]);
        dueMonth = parseInt(dueDateParts[1]);
        currentYear = prevWorkingDay.year();
        currentMonth = prevWorkingDay.month() + 1;

        dueMonthTotal = dueYear * 12 + dueMonth;
        currentMonthTotal = currentYear * 12 + currentMonth;

        actualOverdueMonths = currentMonthTotal - dueMonthTotal + 1;

        if (actualOverdueDays < 0) {
          actualOverdueDays = 0;
          actualOverdueMonths = 0;
        }
      } else {
        actualOverdueDays = overdueItem.overdue_months * 30;
        actualOverdueMonths = overdueItem.overdue_months;
      }

      const dailyDepreciation =
        parseFloat(matchedAsset.asset_value_remainMonth) / 30;
      let calculatedAmount = 0;

      const cDpacValue = parseInt(matchedAsset.C_dpac) || 0;
      const overdueMonthsFloor = Math.floor(actualOverdueMonths);
      const assetValueRemainMonth = parseFloat(
        matchedAsset.asset_value_remainMonth
      );
      const assetValueRemainBegin = parseFloat(
        matchedAsset.asset_value_remainBegin
      );
      const accuDpcaValueTotal = parseFloat(matchedAsset.accu_dpca_value_total);
      const totalMonths = overdueItem.total_months;

      let finalOverdueMonths = overdueMonthsFloor;

      if (overdueMonthsFloor < totalMonths) {
        finalOverdueMonths = overdueMonthsFloor;
      }

      if (finalOverdueMonths < 1 && actualOverdueMonths > 0) {
        finalOverdueMonths = 1;
      }

      const assetUsefulLife = parseInt(matchedAsset.asset_useful_life) || 0;
      const maxAllowedMonths = assetUsefulLife * 12;

      console.log(`🔍 Debug for asset ${overdueItem.asset_id}:`, {
        assetUsefulLife: assetUsefulLife,
        maxAllowedMonths: maxAllowedMonths,
        finalOverdueMonths_before: finalOverdueMonths,
        condition1: assetUsefulLife > 0,
        condition2: finalOverdueMonths > maxAllowedMonths,
        bothConditions:
          assetUsefulLife > 0 && finalOverdueMonths > maxAllowedMonths,
        rawUsefulLife: matchedAsset.asset_useful_life,
      });

      if (assetUsefulLife > 0 && finalOverdueMonths > maxAllowedMonths) {
        console.log(
          `✅ APPLYING useful_life limit for ${overdueItem.asset_id}: ${finalOverdueMonths} → ${maxAllowedMonths}`
        );
        finalOverdueMonths = maxAllowedMonths;
      } else {
        console.log(
          `❌ NOT applying useful_life limit for ${overdueItem.asset_id}`
        );
      }

      console.log(
        `🎯 Final result for ${overdueItem.asset_id}: finalOverdueMonths = ${finalOverdueMonths}`
      );

      if (cDpacValue === 0) {
        if (finalOverdueMonths >= totalMonths) {
          calculatedAmount = accuDpcaValueTotal;
        } else {
          const adjustedMonths = Math.max(0, finalOverdueMonths - 1);
          calculatedAmount =
            adjustedMonths * assetValueRemainMonth + assetValueRemainBegin;
        }
      } else {
        if (finalOverdueMonths >= totalMonths) {
          calculatedAmount = accuDpcaValueTotal;
        } else {
          calculatedAmount = finalOverdueMonths * assetValueRemainMonth;
        }
      }

      return {
        ...overdueItem,
        overdue_months: finalOverdueMonths,
        overdue_days: actualOverdueDays,
        matched_asset: matchedAsset,
        daily_depreciation: dailyDepreciation,
        calculated_overdue_amount: calculatedAmount,
        asset_value_remainMonth: matchedAsset.asset_value_remainMonth,
        is_in_journal: isInJournal,
        journal_status: isInJournal ? "ລໍຖ້າອະນຸມັດ" : "ຍັງບໍ່ໄດ້ຫັກ",
        journal_status_key: isInJournal ? "pending" : "not_created", 
        asset_full_name:
          matchedAsset.asset_id_detail?.asset_name_la || overdueItem.asset_name,
        location_name: matchedAsset.location_detail?.location_name_la,
        supplier_name: matchedAsset.supplier_detail?.supplier_name,
      
        asset_type_id: matchedAsset.asset_type_id,
        debug_info: {
          asset_useful_life: assetUsefulLife,
          max_allowed_months: maxAllowedMonths,
          overdue_months_floor: overdueMonthsFloor,
          final_overdue_months: finalOverdueMonths,
          actual_overdue_days: actualOverdueDays,
          actual_overdue_months: actualOverdueMonths,
          original_overdue_months: overdueItem.overdue_months,
          due_end_date: overdueItem.due_end_date,
          due_year: dueYear || "N/A",
          due_month: dueMonth || "N/A",
          current_year: currentYear || "N/A",
          current_month: currentMonth || "N/A",
          due_month_total: dueMonthTotal || "N/A",
          current_month_total: currentMonthTotal || "N/A",
          month_calculation:
            dueMonthTotal && currentMonthTotal
              ? `${currentMonthTotal} - ${dueMonthTotal} + 1 = ${actualOverdueMonths}`
              : "No calculation",
          prev_working_day: prevWorkingDay.format("YYYY-MM-DD"),
          total_months: totalMonths,
          asset_value_remain_month: assetValueRemainMonth,
          asset_value_remain_begin: assetValueRemainBegin,
          accu_dpca_value_total: accuDpcaValueTotal,
          calculation_method:
            cDpacValue === 0 ? "C_dpac_zero" : "C_dpac_has_value",
          added_one_month: overdueMonthsFloor < totalMonths ? "Yes" : "No",
          calculation_formula:
            cDpacValue === 0
              ? `(${Math.max(
                  0,
                  finalOverdueMonths - 1
                )} * ${assetValueRemainMonth}) + ${assetValueRemainBegin} = ${calculatedAmount}`
              : `${finalOverdueMonths} * ${assetValueRemainMonth} = ${calculatedAmount}`,
          final_overdue_used: finalOverdueMonths,
          is_in_journal: isInJournal,
          useful_life_limit_applied:
            assetUsefulLife > 0 && overdueMonthsFloor > maxAllowedMonths,
          values_check: {
            assetValueRemainMonth: assetValueRemainMonth,
            assetValueRemainBegin: assetValueRemainBegin,
            accuDpcaValueTotal: accuDpcaValueTotal,
            cDpacValue: cDpacValue,
            isNaN_check: {
              assetValueRemainMonth: isNaN(assetValueRemainMonth),
              assetValueRemainBegin: isNaN(assetValueRemainBegin),
              accuDpcaValueTotal: isNaN(accuDpcaValueTotal),
            },
          },
        },
      };
    }

    return {
      ...overdueItem,
      overdue_months: overdueItem.overdue_months,
      matched_asset: null,
      daily_depreciation: 0,
      calculated_overdue_amount: 0,
      asset_value_remainMonth: 0,
      is_in_journal: journalAssetIds.value.has(overdueItem.asset_id),
      journal_status: journalAssetIds.value.has(overdueItem.asset_id)
        ? "ລໍຖ້າອະນຸມັດ"
        : "ຍັງບໍ່ໄດ້ຫັກ",
      journal_status_key: journalAssetIds.value.has(overdueItem.asset_id) ? "pending" : "not_created", 
      asset_type_id: null, 
    };
  });
});


const filteredMappedData = computed(() => {
  let filtered = mappedData.value;


  if (selectedAssetType.value) {
    filtered = filtered.filter(
      (item) => item.asset_type_id === selectedAssetType.value
    );
  }

  
  if (selectedJournalStatus.value) {
    filtered = filtered.filter(
      (item) => item.journal_status_key === selectedJournalStatus.value
    );
  }

  return filtered;
});

const selectableItems = computed(() => {
  return filteredMappedData.value.filter((item) => !item.is_in_journal);
});

const headers = [
  { title: "ລະຫັດຊັບສິນ", key: "asset_id" },
  { title: "ຊື່ຊັບສິນ", key: "asset_name" },
  { title: "ຈຳນວນເງິນທີ່ຈະຫັກ", key: "calculated_overdue_amount" },
  { title: "ຄ້າງ (ເດືອນ)", key: "overdue_months" },
  { title: "ງວດທີ່ຈະຫັກ", key: "due_end_date" },
  { title: "ຄືບໜ້າ", key: "completion_percentage" },
  { title: "ສະຖານະ", key: "journal_status" },
];

const formatNumber = (num: any) => {
  return new Intl.NumberFormat("en-US").format(num);
};

const processBulkItems = async () => {
  if (selectedItems.value.length === 0) {
    alert("ກະລຸນາເລືອກລາຍການກ່ອນ");
    return;
  }

  mainStore.total_caculate.mapping_ids = selectedItems.value;

  const eodData = eod.value[0];
  const targetDate = eodData?.prev_working_day
    ? dayjs(eodData.prev_working_day).format("YYYY-MM-DD")
    : dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD");

  mainStore.total_caculate.target_date = targetDate;

  console.log("Bulk process data:", mainStore.total_caculate);
  console.log("Using EOD prev_working_day:", targetDate);

  await mainStore.postArreat();

  selectedItems.value = [];
};

const toggleSelectAll = () => {
  if (selectedItems.value.length === selectableItems.value.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = selectableItems.value.map((item) => item.mapping_id);
  }
};

// ປັບປຸງ clearFilter ໃຫ້ລົບ filter ສະຖານະ journal ດ້ວຍ
const clearFilter = () => {
  selectedAssetType.value = null;
  selectedJournalStatus.value = null; // ເພີ່ມການລົບ filter ສະຖານະ journal
  selectedItems.value = [];
};

const title = "ຫັກຄ່າຫຼູຍຫ້ຽນຍອ້ນຫຼັງ";

onMounted(() => {
  mainTypeStore.GetAssetTypes();
  assetStores.GetFaAssetList();

  mainStore.getArrears();
  eodStore.GetEOD();
  journalStore.getData();
});
</script>

<template>
  <v-row>
    <v-col cols="12" md="3">
      <v-autocomplete
        v-model="selectedAssetType"
        :items="mainType"
        item-title="asset_name_la"
        item-value="coa_id"
        label="ເລືອກປະເພດຊັບສິນ"
        variant="outlined"
        density="compact"
        clearable
        prepend-inner-icon="mdi-format-list-bulleted-type"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="`${item.raw.asset_name_la}-${item.raw.coa_id}`"
          >
            <template v-slot:prepend>
              <v-avatar size="small" flat color="primary">
                <v-icon
                  icon="mdi-format-list-bulleted-type"
                  size="small"
                  color="white"
                />
              </v-avatar>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
    </v-col>
    
    <!-- ເພີ່ມ filter ສຳລັບສະຖານະ journal -->
    <v-col cols="12" md="3">
      <v-select
        v-model="selectedJournalStatus"
        :items="journalStatusOptions"
        item-title="title"
        item-value="value"
        label="ເລືອກສະຖານະ"
        variant="outlined"
        density="compact"
        clearable
        prepend-inner-icon="mdi-clipboard-list-outline"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :title="item.raw.title">
            <template v-slot:prepend>
              <v-avatar size="small" flat :color="item.raw.value === 'pending' ? 'orange' : 'grey'">
                <v-icon
                  :icon="item.raw.value === 'pending' ? 'mdi-clock-outline' : 'mdi-plus-circle-outline'"
                  size="small"
                  color="white"
                />
              </v-avatar>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </v-col>
    
    <!-- ເພີ່ມປຸ່ມລົບ filter -->
    <!-- <v-col cols="12" md="2">
      <v-btn
        @click="clearFilter"
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-filter-remove"
        :disabled="!selectedAssetType && !selectedJournalStatus"
        style="height: 40px;"
      >
        ລົບ Filter
      </v-btn>
    </v-col> -->
  </v-row>

  <div
    class="mb-2 pa-2"
    style="background-color: #fff3e0; border-radius: 4px; font-size: 12px"
  >
    ລາຍການທີ່ເລືອກໄດ້:
    {{ selectableItems.length }}/{{ filteredMappedData.length }}
    <span v-if="selectedAssetType || selectedJournalStatus" style="color: #ff6f00">
      (ກອງແລ້ວ: {{ filteredMappedData.length }}/{{ mappedData.length }})
    </span>
  </div>

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
          :disabled="selectedItems.length === 0"
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
    <br />
    <small style="color: #2196f3">
      📅 ວັນທີ່ກຳນົດສຳລັບການຫັກ:
      {{
        eod[0]?.prev_working_day
          ? dayjs(eod[0].prev_working_day).format("DD/MM/YYYY")
          : "ວັນນີ້"
      }}
    </small>
  </div>

  <v-row>
    <v-col cols="12" md="3">
      <v-card
        class="text-center ustify-center align-center"
        style="height: 15vh"
      >
        <v-card-title style="background-color: #64b5f6">
          ລາຍການທັງໝົດ
        </v-card-title>
        <div class="">
          <h2 class="">{{ filteredMappedData.length }}</h2>
          <p>ລາຍການ</p>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="3">
      <v-card
        class="text-center ustify-center align-center"
        style="height: 15vh"
      >
        <v-card-title style="background-color: #4caf50">
          ຈຳນວນເງິນລວມ
        </v-card-title>
        <div class="">
          <h2 class="">
            {{
              formatNumber(
                filteredMappedData.reduce(
                  (sum, item) => sum + (item.calculated_overdue_amount || 0),
                  0
                )
              )
            }}
          </h2>
          <p>ກີບ</p>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="3">
      <v-card
        class="text-center ustify-center align-center"
        style="height: 15vh"
      >
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
      <v-card
        class="text-center ustify-center align-center"
        style="height: 15vh"
      >
        <v-card-title style="background-color: #4caf50">
          ຈຳນວນເງິນທີ່ຈະຫັກ
        </v-card-title>
        <div class="">
          <h2 class="">
            {{
              formatNumber(
                filteredMappedData
                  .filter((item) => selectedItems.includes(item.mapping_id))
                  .reduce(
                    (sum, item) => sum + (item.calculated_overdue_amount || 0),
                    0
                  )
              )
            }}
          </h2>
          <p>ກີບ</p>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <div
    class="mb-2 pa-2"
    style="background-color: #f8f9fa; border-radius: 4px; font-size: 12px"
  >
    <strong>📅 EOD Info:</strong>
    <span v-if="eod[0]">
      prev_working_day:
      {{ dayjs(eod[0].prev_working_day).format("DD/MM/YYYY HH:mm") }} | date_id:
      {{ eod[0].date_id }} | eod_time: {{ eod[0].eod_time }}
    </span>
    <span v-else style="color: #f44336">ບໍ່ມີຂໍ້ມູນ EOD</span>
  </div>

  <v-data-table
    class="text-no-wrap"
    v-model="selectedItems"
    :items="filteredMappedData"
    :headers="headers"
    show-select
    item-value="mapping_id"
    :loading="mainStore.isLoading"
    :item-selectable="(item) => !item.is_in_journal"
  >
    <template
      v-slot:item.data-table-select="{ item, isSelected, toggleSelect }"
    >
      <div v-if="!item.is_in_journal">
        <v-checkbox-btn
          :model-value="selectedItems.includes(item.mapping_id)"
          @update:model-value="
            (value) => {
              if (value) {
                if (!selectedItems.includes(item.mapping_id)) {
                  selectedItems.push(item.mapping_id);
                }
              } else {
                const index = selectedItems.indexOf(item.mapping_id);
                if (index > -1) {
                  selectedItems.splice(index, 1);
                }
              }
            }
          "
          color="primary"
        />
      </div>
      <div v-else>
        <v-tooltip>
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" icon="mdi-lock" color="grey" size="small" />
          </template>
          <div>
            <div>
              ກົດຫັກແລ້ວສຳຫຼັບງວດ:
              <span v-if="item.due_end_date">
                <span v-if="item.debug_info?.useful_life_limit_applied">
                  {{
                    dayjs(
                      item.due_end_date.split("/").reverse().join("-")
                    ).format("MM/YYYY")
                  }}
                  ຫາ
                  {{
                    item.matched_asset?.dpca_end_date
                      ? dayjs(item.matched_asset.dpca_end_date).format(
                          "MM/YYYY"
                        )
                      : eod[0]?.prev_working_day
                      ? dayjs(eod[0].prev_working_day).format("MM/YYYY")
                      : dayjs().format("MM/YYYY")
                  }}
                  (ຈຳກັດຕາມອາຍຸການໃຊ້ງານ)
                </span>
                <span v-else>
                  {{
                    dayjs(
                      item.due_end_date.split("/").reverse().join("-")
                    ).format("MM/YYYY")
                  }}
                  ຫາ
                  {{
                    eod[0]?.prev_working_day
                      ? dayjs(eod[0].prev_working_day).format("MM/YYYY")
                      : dayjs().format("MM/YYYY")
                  }}
                </span>
                ສະຖານະ: ລໍຖ້າອະນຸມັດ
              </span>
              <span v-else>-</span>
            </div>
          </div>
        </v-tooltip>
      </div>
    </template>

    <template v-slot:header.asset_id="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.asset_name="{ column }">
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
    <template v-slot:header.journal_status="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>

    <template v-slot:item.asset_id="{ item }">
      <span :style="{ opacity: item.is_in_journal ? 0.5 : 1 }">
        {{ item.asset_id }}
      </span>
    </template>

    <template v-slot:item.asset_name="{ item }">
      <span :style="{ opacity: item.is_in_journal ? 0.5 : 1 }">
        {{ item.asset_name }}
      </span>
    </template>

    <template v-slot:item.calculated_overdue_amount="{ item }">
      <strong
        :style="{
          color: item.is_in_journal ? '#999' : '#f44336',
          fontSize: '16px',
          opacity: item.is_in_journal ? 0.5 : 1,
        }"
      >
        {{ formatNumber((item.calculated_overdue_amount || 0)) }} ກີບ
      </strong>
    </template>

    <template v-slot:item.completion_percentage="{ item }">
      <span :style="{ opacity: item.is_in_journal ? 0.5 : 1 }">
        {{ item.current_month - 1 }}/{{ item.total_months }} ({{
          (item.completion_percentage)
        }}%)
      </span>
    </template>

    <template v-slot:item.due_end_date="{ item }">
      <span
        v-if="item.due_end_date"
        :style="{ opacity: item.is_in_journal ? 0.5 : 1 }"
      >
        <span v-if="item.debug_info?.useful_life_limit_applied">
          {{
            dayjs(item.due_end_date.split("/").reverse().join("-")).format(
              "MM/YYYY"
            )
          }}
        </span>
        <span v-else>
          {{
            dayjs(item.due_end_date.split("/").reverse().join("-")).format(
              "MM/YYYY"
            )
          }}
        </span>
        <span style="color: #666"> ຫາ </span>
        <span v-if="item.debug_info?.useful_life_limit_applied">
          {{
            item.matched_asset?.dpca_end_date
              ? dayjs(item.matched_asset.dpca_end_date).format("MM/YYYY")
              : eod[0]?.prev_working_day
              ? dayjs(eod[0].prev_working_day).format("MM/YYYY")
              : dayjs().format("MM/YYYY")
          }}
        </span>
        <span v-else>
          {{
            eod[0]?.prev_working_day
              ? dayjs(eod[0].prev_working_day).format("MM/YYYY")
              : dayjs().format("MM/YYYY")
          }}
        </span>
      </span>
      <span v-else :style="{ opacity: item.is_in_journal ? 0.5 : 1 }">-</span>
    </template>

    <template v-slot:item.overdue_months="{ item }">
      <v-chip
        :color="
          item.is_in_journal
            ? 'grey'
            : item.urgency_level === 'critical'
            ? 'error'
            : 'warning'
        "
        size="small"
        :style="{ opacity: item.is_in_journal ? 0.7 : 1 }"
      >
        {{ Math.floor(item.overdue_months) }} ເດືອນ
      </v-chip>
    </template>

    <template v-slot:item.journal_status="{ item }">
      <v-chip
        :color="item.is_in_journal ? 'orange' : 'grey'"
        size="small"
        variant="outlined"
      >
        <v-icon
          :icon="
            item.is_in_journal ? 'mdi-clock-outline' : 'mdi-plus-circle-outline'
          "
          size="small"
          class="mr-1"
        />
        {{ item.journal_status }}
      </v-chip>
    </template>
  </v-data-table>
</template>
