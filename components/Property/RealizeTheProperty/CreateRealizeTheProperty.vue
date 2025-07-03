<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const title = "ຈົດບັນທຶກຮັບຮູ້ຊັບສິນ";
const id = route.query.asset_list_id as string;
const assetStore = faAssetStore();

const request = assetStore.form_create_realizthe_property;
const editableValues = ref({
  salvageValue: 0,
  isEditing: false,
});

const unitsOfProduction = ref({
  totalExpectedUnits: 0,
  yearlyUsage: [] as number[],
});

const response = computed(() => {
  return assetStore.response_fa_asset_detail;
});

const calculateDepreciationEndDate = (
  startDate: Date | string | null,
  usefulLifeYears: number
): string | null => {
  if (!startDate || !usefulLifeYears) return null;

  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;

  const endDate = new Date(start);
  endDate.setFullYear(start.getFullYear() + usefulLifeYears);

  return endDate.toISOString().split("T")[0];
};


const calculateMonthsDifference = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  return yearsDiff * 12 + monthsDiff;
};

watch(
  () => assetStore.response_fa_asset_detail,
  (req) => {
    if (req) {
      request.asset_accu_dpca_value = req.asset_accu_dpca_value
        ? Number(req.asset_accu_dpca_value)
        : 0;
      request.acc_no = req.acc_no || "";
      request.asset_disposal_date = req.asset_disposal_date;
      request.asset_latest_date_dpca = req.asset_latest_date_dpca;
      request.asset_value_remain = req.asset_value_remain
        ? Number(req.asset_value_remain)
        : 0;
      request.asset_value_remainBegin = req.asset_value_remainBegin
        ? Number(req.asset_value_remainBegin)
        : 0;
      request.asset_value_remainLast = req.asset_value_remainLast
        ? Number(req.asset_value_remainLast)
        : 0;

     
      request.dpca_start_date = req.dpca_start_date
        ? new Date(req.dpca_start_date)
        : req.asset_date
        ? new Date(req.asset_date)
        : new Date();

   
      if (req.asset_useful_life) {
        const endDate = calculateDepreciationEndDate(
          request.dpca_start_date,
          req.asset_useful_life
        );
        request.dpca_end_date = endDate ? new Date(endDate) : null;
      }
    }
  }
);


watch(
  () => request.dpca_start_date,
  (newDate) => {
    if (newDate && response.value?.asset_useful_life) {
      const endDate = calculateDepreciationEndDate(
        newDate,
        response.value.asset_useful_life
      );
      request.dpca_end_date = endDate ? new Date(endDate) : null;
    }
  }
);

const validationErrors = computed(() => {
  const errors: any = [];
  if (!response.value) return errors;

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));

  if (assetValue <= 0) errors.push("ມູນຄ່າຊັບສິນຕ້ອງມາກກວ່າ 0");
  if (salvageValue < 0) errors.push("ມູນຄ່າຊາກບໍ່ສາມາດຕ່ຳກວ່າ 0 ໄດ້");
  if (salvageValue >= assetValue)
    errors.push("ມູນຄ່າຊາກຕ້ອງນ້ອຍກວ່າມູນຄ່າຊັບສິນ");
  if (usefulLife <= 0) errors.push("ອາຍຸການໃຊ້ງານຕ້ອງມາກກວ່າ 0");

  return errors;
});

const depreciationCalculator = computed(() => {
  if (!response.value || validationErrors.value.length > 0) return null;

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = editableValues.value.isEditing
    ? editableValues.value.salvageValue
    : parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));
  const depreciationRate =
    parseFloat(response.value.dpca_percentage || "0") / 100;
  const depreciationType = response.value.dpca_type || "SL";

  
  const startDate =
    request.dpca_start_date ||
    new Date(response.value.asset_date || new Date());
  const endDate = calculateDepreciationEndDate(startDate, usefulLife);

  const depreciableAmount = assetValue - salvageValue;
  let annualDepreciation = 0;
  let monthlyDepreciation = 0;


  if (
    depreciationType === "PU" &&
    unitsOfProduction.value.totalExpectedUnits === 0
  ) {
    unitsOfProduction.value.totalExpectedUnits = usefulLife * 1000;
    unitsOfProduction.value.yearlyUsage = Array(usefulLife).fill(1000);
  }

 
  switch (depreciationType) {
    case "SL": 
      annualDepreciation = depreciableAmount / usefulLife;
      monthlyDepreciation = annualDepreciation / 12;
      break;

    case "DL": 
      annualDepreciation = assetValue * depreciationRate;
      monthlyDepreciation = annualDepreciation / 12;
      break;

    case "PU": 
      if (unitsOfProduction.value.totalExpectedUnits > 0) {
        const depreciationPerUnit =
          depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
        const averageYearlyUnits =
          unitsOfProduction.value.totalExpectedUnits / usefulLife;
        annualDepreciation = depreciationPerUnit * averageYearlyUnits;
        monthlyDepreciation = annualDepreciation / 12;
      } else {
     
        annualDepreciation = depreciableAmount / usefulLife;
        monthlyDepreciation = annualDepreciation / 12;
      }
      break;

    default:
      annualDepreciation = depreciableAmount / usefulLife;
      monthlyDepreciation = annualDepreciation / 12;
  }

  
  const currentAccumulated = parseFloat(
    response.value.asset_accu_dpca_value || "0"
  );
  const remainingValue = assetValue - currentAccumulated;

  return {
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    startDate:
      typeof startDate === "string"
        ? startDate
        : startDate.toISOString().split("T")[0],
    endDate: endDate,
    totalDepreciableAmount: depreciableAmount,
    depreciationType: depreciationType,
    effectiveRate: (annualDepreciation / assetValue) * 100,
    yearsToFullyDepreciate:
      depreciableAmount > 0 ? depreciableAmount / annualDepreciation : 0,
    remainingValue: remainingValue,
    depreciationProgress:
      depreciableAmount > 0
        ? (currentAccumulated / depreciableAmount) * 100
        : 0,
  };
});

const depreciationSchedule = computed(() => {
  if (
    !response.value ||
    !depreciationCalculator.value ||
    validationErrors.value.length > 0
  ) {
    return [];
  }

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));
  const depreciationType = response.value.dpca_type || "SL";
  const depreciationRate =
    parseFloat(response.value.dpca_percentage || "0") / 100;
  const depreciableAmount = assetValue - salvageValue;

  const schedule = [];
  let bookValue = assetValue;
  let totalAccumulatedDepreciation = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const beginningBookValue = bookValue;
    let currentYearDepreciation = 0;

    switch (depreciationType) {
      case "SL":
        currentYearDepreciation = depreciableAmount / usefulLife;
        break;

      case "DL":
        currentYearDepreciation = beginningBookValue * depreciationRate;
       
        if (beginningBookValue - currentYearDepreciation < salvageValue) {
          currentYearDepreciation = beginningBookValue - salvageValue;
        }
        break;

      case "PU":
        if (unitsOfProduction.value.totalExpectedUnits > 0) {
          const depreciationPerUnit =
            depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
          const unitsThisYear =
            unitsOfProduction.value.yearlyUsage[year - 1] ||
            unitsOfProduction.value.totalExpectedUnits / usefulLife;
          currentYearDepreciation = depreciationPerUnit * unitsThisYear;
        } else {
          currentYearDepreciation = depreciableAmount / usefulLife;
        }
        break;
    }

   
    if (year === usefulLife && depreciationType !== "DL") {
      currentYearDepreciation = Math.max(0, beginningBookValue - salvageValue);
    }

   
    currentYearDepreciation = Math.max(0, currentYearDepreciation);
    if (beginningBookValue - currentYearDepreciation < salvageValue) {
      currentYearDepreciation = Math.max(0, beginningBookValue - salvageValue);
    }

    totalAccumulatedDepreciation += currentYearDepreciation;
    bookValue = assetValue - totalAccumulatedDepreciation;

   
    if (bookValue < salvageValue) {
      bookValue = salvageValue;
    }

    schedule.push({
      year: year,
      beginningBookValue: Math.round(beginningBookValue * 100) / 100,
      depreciationExpense: Math.round(currentYearDepreciation * 100) / 100,
      accumulatedDepreciation:
        Math.round(totalAccumulatedDepreciation * 100) / 100,
      endingBookValue: Math.round(bookValue * 100) / 100,
      depreciationRate:
        depreciationType === "DL"
          ? (currentYearDepreciation / beginningBookValue) * 100
          : (currentYearDepreciation / assetValue) * 100,
    });

   
    if (bookValue <= salvageValue && year < usefulLife) {
      break;
    }
  }

  return schedule;
});

const depreciationSummary = computed(() => {
  if (!depreciationSchedule.value.length) return null;

  const schedule = depreciationSchedule.value;
  const totalDepreciation = schedule.reduce(
    (sum, item) => sum + item.depreciationExpense,
    0
  );
  const averageAnnualDepreciation = totalDepreciation / schedule.length;
  const highestDepreciation = Math.max(
    ...schedule.map((item) => item.depreciationExpense)
  );
  const lowestDepreciation = Math.min(
    ...schedule.map((item) => item.depreciationExpense)
  );

  return {
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    averageAnnualDepreciation:
      Math.round(averageAnnualDepreciation * 100) / 100,
    highestDepreciation: Math.round(highestDepreciation * 100) / 100,
    lowestDepreciation: Math.round(lowestDepreciation * 100) / 100,
    finalBookValue: schedule[schedule.length - 1].endingBookValue,
  };
});

const depreciationProgress = computed(() => {
  if (!response.value || !depreciationCalculator.value) return 0;
  return depreciationCalculator.value.depreciationProgress;
});

const formatNumber = (value: string | number) => {
  if (!value) return "0.00";
  return parseFloat(value.toString()).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (value: string | number, currency: string = "LAK") => {
  return `${formatNumber(value)} ${currency}`;
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

const getDepreciationMethodName = (type: string) => {
  switch (type) {
    case "SL":
      return "ແບບເສັ້ນຊື່ (Straight Line)";
    case "DL":
      return "ແບບຫຼຸດລົງ (Declining Balance)";
    case "PU":
      return "ແບບຕາມໜ່ວຍຜະລິດ (Production Unit)";
    default:
      return type;
  }
};

const getDepreciationMethodDescription = (type: string) => {
  switch (type) {
    case "SL":
      return "ຫັກຄ່າເສື່ອມເທົ່າໆກັນທຸກປີ = (ມູນຄ່າຊັບສິນ - ມູນຄ່າຊາກ) ÷ ອາຍຸການໃຊ້ງານ";
    case "DL":
      return "ຫັກຄ່າເສື່ອມສູງໃນປີທຳອິດ ແລ້ວຫຼຸດລົງ = ມູນຄ່າຄົງເຫຼືອ × ອັດຕາເສື່ອມ";
    case "PU":
      return "ຫັກຄ່າເສື່ອມຕາມການນຳໃຊ້ຈິງ = (ມູນຄ່າຊັບສິນ - ມູນຄ່າຊາກ) ÷ ໜ່ວຍຜະລິດທັງໝົດ × ໜ່ວຍທີ່ໃຊ້";
    default:
      return "ບໍ່ມີຂໍ້ມູນວິທີການຄຳນວນ";
  }
};

const exportToExcel = () => {};

const printReport = () => {
  window.print();
};

const saveCalculation = async () => {
  try {
    const notification = await CallSwal({
      icon: "warning",
      title: "ກຳລັງບັນທຶກ...",
      text: "ທ່ານຕອ້ງການບັນທືກຂໍ້ມູນນີແທ້ບໍ ?",
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    if (notification.isConfirmed) {
      assetStore.Update(id);
    }
  } catch (error) {
    console.error("Error saving calculation:", error);
  } finally {
    editableValues.value.isEditing = false;
    editableValues.value.salvageValue = 0;
  }
};

onMounted(() => {
  assetStore.GetFaAssetDetail(id);
});

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div class="pa-4">
    <section class="pa-6">
      <v-form ref="form">
        <v-row>
          <v-col cols="12">
            <GlobalTextTitleLine :title="title" />
          </v-col>

          <v-col cols="12" v-if="validationErrors.length > 0">
            <v-alert type="error" prominent border="start">
              <v-alert-title>ຂໍ້ຜິດພາດໃນຂໍ້ມູນ</v-alert-title>
              <ul class="mt-2">
                <li v-for="error in validationErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </v-alert>
          </v-col>

          <v-col cols="12" class="">
            <v-row>
              <v-col cols="12">
                <v-card
                  variant="outlined"
                  class=""
                  style="border: 2px solid #4caf50"
                >
                  <v-card-title class="text-h6 pb-2 bg-success">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="4">
                        <GlobalCardTitle
                          :title="'ລາຍການປະເພດຊັບສົມບັດຍອ່ຍ'"
                          :text="
                            response?.asset_list_id?.toString() ?? 'ບໍ່ມີຂໍ້ມູນ'
                          "
                        />
                        <GlobalCardTitle
                          :title="'ລຳດັບ'"
                          :text="response?.asset_list_code"
                        />
                        <GlobalCardTitle
                          :title="'ປ້າຍຊັບສິນ (Asset Tag)'"
                          :text="response?.asset_tag"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <GlobalCardTitle
                          :title="'ລະຫັດ'"
                          :text="response?.asset_list_id"
                        />
                        <GlobalCardTitle
                          :title="'ເລກຊີຣີ (Serial Number)'"
                          :text="response?.asset_serial_no"
                        />
                        <GlobalCardTitle
                          :title="'ສະຖານທີ່ຕັ້ງ'"
                          :text="response?.location_detail.location_name_la"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <label
                          >ລາຍລະອຽດຄຸນລັກສະນະ<span class="text-error"
                            >*</span
                          ></label
                        >
                        <v-textarea
                          :value="response?.asset_spec"
                          placeholder="ບັນລະອຽດຄຸນລັກສະນະຂອງຊັບສົມບັດ"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          rows="3"
                          maxlength="500"
                          counter
                          readonly
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" v-if="depreciationSummary">
                <v-card variant="outlined" style="border: 2px solid #ff5722">
                  <v-card-title class="text-h6 pb-2 bg-deep-orange-lighten-4">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    ສະຫຼຸບການຄຳນວນການຫຼູຍຫຽ້ນລາຄາ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-blue-lighten-5">
                          <div class="text-h6 text-blue-darken-2">
                            {{
                              formatCurrency(
                                depreciationSummary.totalDepreciation,
                                response?.asset_currency || ""
                              )
                            }}
                          </div>
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນທັງໝົດ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-green-lighten-5">
                          <div class="text-h6 text-green-darken-2">
                            {{
                              formatCurrency(
                                depreciationCalculator?.annualDepreciation ||
                                  "0",
                                response?.asset_currency || ""
                              )
                            }}
                          </div>
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນຕໍ່ປີ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-orange-lighten-5">
                          <div class="text-h6 text-orange-darken-2">
                            {{
                              formatCurrency(
                                response?.asset_accu_dpca_value || "0",
                                response?.asset_currency || ""
                              )
                            }}
                          </div>
                          <div class="text-caption">ຄ່าຫຼູຍຫຽ້ນສະສົມ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-purple-lighten-5">
                          <div class="text-h6 text-purple-darken-2">
                            {{
                              formatCurrency(
                                depreciationCalculator?.remainingValue || "0",
                                response?.asset_currency || ""
                              )
                            }}
                          </div>
                          <div class="text-caption">ມູນຄ່າຄົງເຫຼືອ</div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card
                  variant="outlined"
                  class=""
                  style="border: 2px solid #ffc107"
                >
                  <v-card-title class="text-h6 pb-2 bg-warning text-dark">
                    <v-icon class="mr-2">mdi-shield-check</v-icon>
                    ສະຖານະແລະການຮັບປະກັນ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຊັບສິນ'"
                          :text="
                            formatCurrency(
                              response?.asset_value || '0',
                              response?.asset_currency || ''
                            )
                          "
                        />
                      </v-col>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ສະກຸນເງິນ'"
                          :text="response?.asset_currency"
                        />
                      </v-col>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ວັນທີ່ຊື້ຊັບສົມບັດ'"
                          :text="
                            response?.asset_date?.toString() ?? 'ບໍ່ມີຂໍ້ມູນ'
                          "
                        />
                      </v-col>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ຜູ້ສະໜອງ/ຜູ້ຂາຍ'"
                          :text="response?.supplier_detail.supplier_name"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card
                  variant="outlined"
                  class="mb-6"
                  style="border: 2px solid #9c27b0"
                >
                  <v-card-title class="text-h6 pb-2 bg-purple text-white">
                    <v-icon class="mr-2">mdi-calculator</v-icon>
                    ຂໍ້ມູນການຫຼູຍຫຽ້ນລາຄາ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ວິທີຫັກຄ່າຫຼຸຍຫຽ້ນ'"
                          :text="
                            getDepreciationMethodName(response?.dpca_type || '')
                          "
                        />

                        <GlobalCardTitle
                          :title="'ອາຍຸການໃຊ້ງານ (ປີ)'"
                          :text="response?.asset_useful_life?.toString() ?? '0'"
                        />
                        <GlobalCardTitle
                          :title="'ອັດຕາຄ່າຫຼູຍຫຽ້ນລາຄາ (%)'"
                          :text="response?.dpca_percentage?.toString() ?? '0'"
                        />

                        <label
                          >ວັນທີ່ເລີ່ມຄິດລາຄາຫຼູ້ຍຫຽ້ນ
                          <span class="text-error">*</span></label
                        >
                        <v-text-field
                          v-model="request.dpca_start_date"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ປະເພດການຊຳລະ'"
                          :text="response?.type_of_pay_detail.MC_name_la"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຕໍ່ເດືອນ'"
                          :text="
                            formatCurrency(
                              depreciationCalculator?.monthlyDepreciation ||
                                '0',
                              response?.asset_currency || ''
                            )
                          "
                        />
                        <label>ມູນຄ່າຊັບສົມບັດເຫຼືອ</label>
                        <v-text-field
                          v-model="request.asset_value_remain"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                        />

                        <label>ວັນທີ່ສິ້ນສຸດການລາຄາຫຼູຍຫຽ້ນ</label>
                        <v-text-field
                          :value="depreciationCalculator?.endDate ?? ''"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          readonly
                          class="mt-3"
                          hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <GlobalCardTitle :title="'ເລກບັນຊີ/DR'" :text="'N/A'" />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຕັ້ນ'"
                          :text="
                            formatCurrency(
                              response?.asset_value || '0',
                              response?.asset_currency || ''
                            )
                          "
                        />
                        <v-label
                          >ມູນຄ່າຫຼູ້ຍຫຽ້ນລາຄາສະສົມ
                          <span style="color: red">*</span></v-label
                        >
                        <v-text-field
                          v-model="request.asset_accu_dpca_value"
                          variant="outlined"
                          density="compact"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ເລກບັນຊີ/CR'"
                          :text="response?.acc_no ?? ''"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າທ້າຍ'"
                          :text="
                            formatCurrency(
                              response?.asset_value_remainLast || '0',
                              response?.asset_currency || ''
                            )
                          "
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຊາກ'"
                          :text="
                            formatCurrency(
                              response?.asset_salvage_value || '0',
                              response?.asset_currency || ''
                            )
                          "
                        />
                      </v-col>
                    </v-row>

                    <v-row class="mt-4" v-if="depreciationProgress > 0">
                      <v-col cols="12">
                        <div class="mb-2">
                          <label class="text-subtitle-2"
                            >ສະຖານະການຫຼູຍຫຽ້ນລາຄາ</label
                          >
                        </div>
                        <v-progress-linear
                          :model-value="depreciationProgress"
                          height="20"
                          :color="
                            depreciationProgress < 50
                              ? 'success'
                              : depreciationProgress < 80
                              ? 'warning'
                              : 'error'
                          "
                          rounded
                        >
                          <template v-slot:default="{ value }">
                            <strong class="text-white"
                              >{{ Math.ceil(value) }}%</strong
                            >
                          </template>
                        </v-progress-linear>
                        <div class="text-caption mt-1 text-grey-darken-1">
                          ຫຼູຍຫຽ້ນລາຄາແລ້ວ
                          {{
                            formatCurrency(
                              response?.asset_accu_dpca_value || "0",
                              response?.asset_currency || ""
                            )
                          }}
                          ຈາກທັງໝົດ
                          {{
                            formatCurrency(
                              depreciationCalculator?.totalDepreciableAmount ||
                                "0",
                              response?.asset_currency || ""
                            )
                          }}
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- ຕາລາງເສື່ອມລາຄາ -->
              <!-- <v-col cols="12" v-if="depreciationSchedule.length > 0">
                <v-card variant="outlined" style="border: 2px solid #2196f3">
                  <v-card-title class="text-h6 pb-2 bg-blue-lighten-5">
                    <v-icon class="mr-2">mdi-table</v-icon>
                    ຕາລາງແຜນການຫຼູຍຫຽ້ນລາຄາ
                    <v-spacer></v-spacer>
                    <v-btn
                      size="small"
                      color="success"
                      prepend-icon="mdi-microsoft-excel"
                      @click="exportToExcel"
                      class="mr-2"
                    >
                      Export Excel
                    </v-btn>
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-data-table
                      :headers="[
                        { title: 'ປີ', key: 'year', align: 'center', width: '80px' },
                        { title: 'ມູນຄ່າເລີ່ມຕົ້ນ', key: 'beginningBookValue', align: 'end', width: '150px' },
                        { title: 'ຄ່າຫຼູຍຫຽ້ນປີນີ້', key: 'depreciationExpense', align: 'end', width: '150px' },
                        { title: 'ອັດຕາຫຼູຍຫຽ້ນ (%)', key: 'depreciationRate', align: 'end', width: '120px' },
                        { title: 'ຫຼູຍຫຽ້ນສະສົມ', key: 'accumulatedDepreciation', align: 'end', width: '150px' },
                        { title: 'ມູນຄ່າສຸດທ້າຍ', key: 'endingBookValue', align: 'end', width: '150px' }
                      ]"
                      :items="depreciationSchedule"
                      :items-per-page="-1"
                      hide-default-footer
                      class="elevation-1"
                      density="compact"
                    >
                      <template v-slot:item.year="{ item }">
                        <v-chip size="small" color="primary">{{ item.year }}</v-chip>
                      </template>
                      <template v-slot:item.beginningBookValue="{ item }">
                        <span class="font-weight-medium">{{ formatNumber(item.beginningBookValue) }}</span>
                      </template>
                      <template v-slot:item.depreciationExpense="{ item }">
                        <span class="text-red-darken-2 font-weight-medium">{{ formatNumber(item.depreciationExpense) }}</span>
                      </template>
                      <template v-slot:item.depreciationRate="{ item }">
                        <span class="text-blue-darken-2">{{ formatPercentage(item.depreciationRate) }}</span>
                      </template>
                      <template v-slot:item.accumulatedDepreciation="{ item }">
                        <span class="text-orange-darken-2 font-weight-medium">{{ formatNumber(item.accumulatedDepreciation) }}</span>
                      </template>
                      <template v-slot:item.endingBookValue="{ item }">
                        <span class="text-green-darken-2 font-weight-bold">{{ formatNumber(item.endingBookValue) }}</span>
                      </template>
                    </v-data-table>
                    
                    <v-divider class="my-4"></v-divider>
                    <v-row class="bg-grey-lighten-4 pa-3 rounded">
                      <v-col cols="12" md="6">
                        <div class="text-subtitle-2 mb-2">ສະຫຼຸບການຄຳນວນ:</div>
                        <div class="text-body-2">
                          • ວິທີການຫຼູຍຫຽ້ນລາຄາ: <strong>{{ getDepreciationMethodName(response?.dpca_type || '') }}</strong>
                        </div>
                        <div class="text-body-2">
                          • ມູນຄ່າທີ່ສາມາດຫຼູຍຫຽ້ນໄດ້: <strong>{{ formatCurrency(depreciationCalculator?.totalDepreciableAmount || '0', response?.asset_currency || '') }}</strong>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-body-2">
                          • ຄ່າຫຼູຍຫຽ້ນທັງໝົດ: <strong class="text-red-darken-2">{{ formatCurrency(depreciationSummary?.totalDepreciation || '0', response?.asset_currency || '') }}</strong>
                        </div>
                        <div class="text-body-2">
                          • ມູນຄ່າຊາກສຸດທ້າຍ: <strong class="text-green-darken-2">{{ formatCurrency(depreciationSummary?.finalBookValue || '0', response?.asset_currency || '') }}</strong>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col> -->

              <!-- Units of Production Settings (if applicable) -->
              <v-col cols="12" v-if="response?.dpca_type === 'PU'">
                <v-card variant="outlined" style="border: 2px solid #795548">
                  <v-card-title class="text-h6 pb-2 bg-brown-lighten-4">
                    <v-icon class="mr-2">mdi-factory</v-icon>
                    ການຕັ້ງຄ່າໜ່ວຍຜະລິດ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="6">
                        <label>ໜ່ວຍຜະລິດທີ່ຄາດຫວັງທັງໝົດ</label>
                        <v-text-field
                          v-model.number="unitsOfProduction.totalExpectedUnits"
                          type="number"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          suffix="ໜ່ວຍ"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <label>ໜ່ວຍຜະລິດສະເລ່ຍຕໍ່ປີ</label>
                        <v-text-field
                          :value="
                            unitsOfProduction.totalExpectedUnits /
                            parseInt(String(response?.asset_useful_life || '1'))
                          "
                          type="number"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          suffix="ໜ່ວຍ"
                          readonly
                        />
                      </v-col>
                    </v-row>

                    <div class="mt-4">
                      <label class="text-subtitle-2">ແຜນການນຳໃຊ້ແຕ່ລະປີ:</label>
                      <v-row class="mt-2">
                        <v-col
                          cols="12"
                          md="2"
                          v-for="(
                            usage, index
                          ) in unitsOfProduction.yearlyUsage"
                          :key="index"
                        >
                          <v-text-field
                            v-model.number="
                              unitsOfProduction.yearlyUsage[index]
                            "
                            :label="`ປີ ${index + 1}`"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                            suffix="ໜ່ວຍ"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="goBack"
                  class="mr-2 mb-2"
                  prepend-icon="mdi-arrow-left"
                >
                  ກັບຄືນ
                </v-btn>

                <v-btn
                  color="primary"
                  @click="saveCalculation"
                  class="mb-2"
                  prepend-icon="mdi-content-save"
                >
                  ບັນທຶກ
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </section>
  </div>
</template>

<style scoped>
.v-text-field input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.formatted-number-input .v-field__input {
  text-align: right;
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

.formatted-number-input .v-field__input input {
  text-align: right;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 4px;
  display: block;
}

.pb-4 {
  margin-bottom: 16px;
}

.bg-success {
  background-color: #eceeec !important;
}

.bg-warning {
  background-color: #dad2bc !important;
}

.bg-purple {
  background-color: #ccaed1 !important;
}

.bg-purple-lighten-2 {
  background-color: #ce93d8 !important;
}

.bg-blue-lighten-5 {
  background-color: #e3f2fd !important;
}

.bg-deep-orange-lighten-4 {
  background-color: #ffccbc !important;
}

.bg-brown-lighten-4 {
  background-color: #d7ccc8 !important;
}

.text-white {
  color: white !important;
}

.text-dark {
  color: rgba(0, 0, 0, 0.87) !important;
}

.v-data-table {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-data-table ::v-deep(.v-data-table__td) {
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 8px;
}

.v-data-table ::v-deep(.v-data-table__th) {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
}

.v-data-table ::v-deep(.v-data-table-header__content) {
  font-weight: 600;
}

.v-progress-linear {
  border-radius: 10px;
  overflow: hidden;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 6px;
}

.v-alert {
  border-radius: 8px;
}

.v-chip {
  font-weight: 600;
}

.bg-blue-lighten-5,
.bg-green-lighten-5,
.bg-orange-lighten-5,
.bg-purple-lighten-5 {
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.bg-blue-lighten-5:hover,
.bg-green-lighten-5:hover,
.bg-orange-lighten-5:hover,
.bg-purple-lighten-5:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .v-data-table {
    font-size: 12px;
  }

  .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media print {
  .v-btn,
  .v-navigation-drawer,
  .v-app-bar {
    display: none !important;
  }

  .v-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }

  .v-data-table {
    border: 1px solid #ddd;
  }

  .v-data-table ::v-deep(.v-data-table__th),
  .v-data-table ::v-deep(.v-data-table__td) {
    border: 1px solid #ddd !important;
    padding: 8px !important;
  }
}
</style>
