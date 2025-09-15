<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import dayjs from "#build/dayjs.imports.mjs";

const route = useRoute();
const router = useRouter();
const title = "ຈົດບັນທຶກຮັບຮູ້ຊັບສິນ";
const id = route.query.asset_list_id as string;
const assetStore = faAssetStore();
const masterStore = useMasterStore();

// ✅ ຕົວແປຄວບຄຸມການບັນທຶກ
let isSaving = false;

const editableValues = ref({
  salvageValue: 0,
  isEditing: false,
});

const unitsOfProduction = ref({
  totalExpectedUnits: 0,
  yearlyUsage: [] as number[],
});

const masterdata = computed(() => {
  return masterStore.respone_data_master;
});

const request = assetStore.form_create_realizthe_property;

const response = computed(() => {
  return assetStore.response_fa_asset_detail;
});

const todayDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

// ✅ ປັບປຸງ displayStartDate ໃຫ້ຮອງຮັບການເລືອກວັນທີ່ຈາກ backend
const displayStartDate = computed({
  get: () => {
    // ✅ ຫາກມີຂໍ້ມູນຈາກ response ໃຫ້ໃຊ້ກ່ອນ
    if (response.value?.dpca_start_date) {
      if (response.value.dpca_start_date instanceof Date) {
        return response.value.dpca_start_date.toISOString().split("T")[0];
      }
      return response.value.dpca_start_date.toString().split("T")[0];
    }

    if (request.dpca_start_date) {
      if (request.dpca_start_date instanceof Date) {
        return request.dpca_start_date.toISOString().split("T")[0];
      }
      return request.dpca_start_date.toString().split("T")[0];
    }

    // ✅ ຖ້າບໍ່ມີທັງສອງ ໃຫ້ໃຊ້ວັນນີ້
    return todayDate.value;
  },
  set: (value: string) => {
    request.dpca_start_date = value ? new Date(value) : new Date();
  },
});

const isToday = computed(() => {
  return displayStartDate.value === todayDate.value;
});

const matchedMasterCode = computed(() => {
  if (
    !response.value?.asset_id_detail?.asset_type_detail?.type_code ||
    !masterdata.value
  ) {
    return null;
  }

  const typeCode = response.value.asset_id_detail.asset_type_detail.type_code;

  const masterObject = Array.isArray(masterdata.value)
    ? masterdata.value.find((item) => item.MasterCodes)
    : masterdata.value;

  if (!masterObject?.MasterCodes) {
    return null;
  }

  const matched = masterObject.MasterCodes.find(
    (item) => item.MC_code === typeCode
  );

  return matched;
});

const getAccountNumbers = computed(() => {
  if (!matchedMasterCode.value?.MC_detail) {
    return { dr: "", cr: "" };
  }

  const accounts = matchedMasterCode.value.MC_detail.split("|");
  const assetListCode = response.value?.asset_list_code || "";

  return {
    dr: accounts[0] ? `${accounts[0]}.${assetListCode}` : "",
    cr: accounts[1] ? `${accounts[1]}.${assetListCode}` : "",
  };
});

const updateAccountNumbers = () => {
  if (matchedMasterCode.value) {
    const accounts = getAccountNumbers.value;
    request.acc_no = accounts.cr;
  }
};

const formatAssetValueRemain = computed({
  get: () => formatNumber(request.asset_value_remain || 0),
  set: (value: string) => {
    const numericValue = value.replace(/[,\s]/g, "").replace(/[^\d.]/g, "");
    const parsed = parseFloat(numericValue);
    request.asset_value_remain = isNaN(parsed) ? 0 : parsed;
  },
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

const computedEndDate = computed(() => {
  const startDate = displayStartDate.value;
  const usefulLife = response.value?.asset_useful_life;

  if (startDate && usefulLife) {
    try {
      const endDate = dayjs(startDate).add(usefulLife, "year");
      return endDate.format("YYYY-MM-DD");
    } catch (error) {
      console.error("Error calculating end date with dayjs:", error);
      return null;
    }
  }
  return null;
});

const formattedEndDate = computed(() => {
  const startDate = displayStartDate.value;
  const usefulLife = response.value?.asset_useful_life;

  if (!startDate || !usefulLife) return "";

  try {
    const endDate = dayjs(startDate).add(usefulLife, "year");
    if (!endDate.isValid()) {
      return "";
    }
    return endDate.format("YYYY-MM-DD");
  } catch (error) {
    console.error("Error with dayjs formatting:", error);
    return "";
  }
});

// ການຄິດໄລ່ພື້ນຖານ
const depreciationBasicCalculation = computed(() => {
  if (!response.value) {
    return null;
  }

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));

  if (
    assetValue <= 0 ||
    salvageValue < 0 ||
    salvageValue >= assetValue ||
    usefulLife <= 0
  ) {
    return null;
  }

  const depreciableAmount = assetValue - salvageValue;
  const annualDepreciation = depreciableAmount / usefulLife;
  const monthlyDepreciation = Math.round((annualDepreciation / 12) * 100) / 100;
  const lastMonthDepreciation = annualDepreciation - monthlyDepreciation * 11;
  const totalCheck = monthlyDepreciation * 11 + lastMonthDepreciation;

  return {
    depreciableAmount: Math.round(depreciableAmount * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    monthlyDepreciation: monthlyDepreciation,
    lastMonthDepreciation: Math.round(lastMonthDepreciation * 100) / 100,
    totalMonthlyCheck: Math.round(totalCheck * 100) / 100,
  };
});

// ✅ ປັບປຸງ monthlySetupValue ໃຫ້ແມ່ນຍຳແລະ stable
const monthlySetupValue = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) {
    return 0;
  }

  const monthlyDepreciation =
    depreciationBasicCalculation.value.monthlyDepreciation;
  const startDate = new Date(displayStartDate.value);

  if (isNaN(startDate.getTime())) {
    return 0;
  }

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  const lastDayOfStartMonth = new Date(startYear, startMonth + 1, 0).getDate();

  // ✅ ຄຳນວນວັນທີ່ໃຊ້ຈາກວັນເລີ່ມຫາທ້າຍເດືອນ
  const daysToUse = lastDayOfStartMonth - startDay + 1;
  const setupValue = (monthlyDepreciation * daysToUse) / lastDayOfStartMonth;

  return Math.round(setupValue * 100) / 100;
});

// ✅ ມູນຄ່າທ້າຍງວດ
const monthlyEndValue = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) {
    return 0;
  }

  const monthlyDepreciation =
    depreciationBasicCalculation.value.monthlyDepreciation;
  const setupValue = monthlySetupValue.value;
  const endValue = monthlyDepreciation - setupValue;

  return Math.max(0, Math.round(endValue * 100) / 100);
});

// ✅ ປັບປຸງ finalMonthlySetupValue ແລະ displayMonthlyEndValue
const finalMonthlySetupValue = computed(() => {
  const setupValue = monthlySetupValue.value;
  const fallbackValue = depreciationCalculator.value?.monthlyDepreciation || 0;
  return setupValue === 0 ? fallbackValue : setupValue;
});

const displayMonthlyEndValue = computed(() => {
  const endValue = monthlyEndValue.value;
  const fallbackValue = depreciationCalculator.value?.monthlyDepreciation || 0;
  return endValue === 0 ? fallbackValue : endValue;
});

const getCurrentMonthDetails = computed(() => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassedInMonth = currentDay - 1;
  const daysRemainingInMonth = lastDayOfMonth - currentDay;
  const daysRemainingIncludingToday = daysRemainingInMonth + 1;

  return {
    currentDay,
    lastDayOfMonth,
    totalDaysInMonth: lastDayOfMonth,
    daysPassedInMonth,
    daysRemainingInMonth,
    daysRemainingIncludingToday,
    formatted: {
      monthInfo: `ເດືອນ ${
        currentMonth + 1
      }/${currentYear} ມີ ${lastDayOfMonth} ວັນ`,
      currentStatus: `ວັນທີ່: ${currentDay}/${lastDayOfMonth}`,
      daysPassed: `ຜ່ານໄປແລ້ວ: ${daysPassedInMonth} ວັນ`,
      daysRemaining: `ເຫຼືອອີກ: ${daysRemainingInMonth} ວັນ (ບໍ່ລວມວັນນີ້)`,
      daysRemainingIncluding: `ເຫຼືອອີກ: ${daysRemainingIncludingToday} ວັນ (ລວມວັນນີ້)`,
      calculation: `${currentDay} ຫາ ${lastDayOfMonth} = ${daysRemainingInMonth} ວັນ`,
    },
  };
});

// [ຮັກສາຟັງຊັນອື່ນໆທີ່ຍາວໆເປັນແບບເດີມ...]
const calculateDepreciationForAnyMonth = (
  targetYear: number,
  targetMonth: number
) => {
  if (!response.value || !depreciationBasicCalculation.value) {
    return null;
  }

  const monthlyDepreciation =
    depreciationBasicCalculation.value.monthlyDepreciation;
  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value
    ? new Date(computedEndDate.value)
    : null;

  const lastDayOfTargetMonth = new Date(
    targetYear,
    targetMonth + 1,
    0
  ).getDate();
  const firstDayOfTargetMonth = new Date(targetYear, targetMonth, 1);

  let daysToCalculate = 0;
  let calculationType = "";
  let description = "";

  if (endDate && firstDayOfTargetMonth > endDate) {
    return {
      month: targetMonth + 1,
      year: targetYear,
      daysCalculated: 0,
      monthlyAmount: 0,
      calculationType: "ເກີນກຳນົດ",
      description: "ເດືອນນີ້ເກີນໄລຍະເວລາຫັກຄ່າເສື່ອມແລ້ວ",
      formula: "ບໍ່ມີການຄິດໄລ່",
    };
  }

  if (
    startDate.getMonth() === targetMonth &&
    startDate.getFullYear() === targetYear
  ) {
    const startDay = startDate.getDate();
    if (
      endDate &&
      endDate.getMonth() === targetMonth &&
      endDate.getFullYear() === targetYear
    ) {
      const endDay = endDate.getDate();
      daysToCalculate = endDay - startDay + 1;
      calculationType = "ເລີ່ມແລະສິ້ນສຸດໃນເດືອນນີ້";
      description = `ຈາກວັນທີ່ ${startDay} ຫາ ${endDay}`;
    } else {
      daysToCalculate = lastDayOfTargetMonth - startDay + 1;
      calculationType = "ເລີ່ມໃນເດືອນນີ້";
      description = `ຈາກວັນທີ່ ${startDay} ຫາ ${lastDayOfTargetMonth}`;
    }
  } else if (startDate < firstDayOfTargetMonth) {
    if (
      endDate &&
      endDate.getMonth() === targetMonth &&
      endDate.getFullYear() === targetYear
    ) {
      const endDay = endDate.getDate();
      daysToCalculate = endDay;
      calculationType = "ສິ້ນສຸດໃນເດືອນນີ້";
      description = `ຈາກວັນທີ່ 1 ຫາ ${endDay}`;
    } else {
      daysToCalculate = lastDayOfTargetMonth;
      calculationType = "ເດືອນເຕັມ";
      description = `ທັງເດືອນ (1-${lastDayOfTargetMonth})`;
    }
  } else {
    daysToCalculate = 0;
    calculationType = "ຍັງບໍ່ເລີ່ມ";
    description = "ຍັງບໍ່ຖຶງເວລາຫັກ";
  }

  const monthlyAmount =
    daysToCalculate > 0
      ? (monthlyDepreciation * daysToCalculate) / lastDayOfTargetMonth
      : 0;

  return {
    month: targetMonth + 1,
    year: targetYear,
    daysCalculated: daysToCalculate,
    totalDaysInMonth: lastDayOfTargetMonth,
    monthlyAmount: Math.round(monthlyAmount * 100) / 100,
    calculationType,
    description: `${description} = ${daysToCalculate} ວັນ`,
    formula:
      daysToCalculate > 0
        ? `(${formatNumber(
            monthlyDepreciation
          )} × ${daysToCalculate}) ÷ ${lastDayOfTargetMonth} = ${formatNumber(
            monthlyAmount
          )}`
        : "ບໍ່ມີການຄິດໄລ່",
  };
};

// [ຮັກສາ computed properties ອື່ນໆທີ່ຍາວໆເປັນແບບເດີມ...]
const getYearlyDepreciationPlan = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) return null;

  const startDate = new Date(displayStartDate.value);
  const startYear = startDate.getFullYear();
  const plan = [];

  for (let month = 0; month < 12; month++) {
    const calculation = calculateDepreciationForAnyMonth(startYear, month);
    if (calculation) {
      plan.push(calculation);
    }
  }

  const totalAmount = plan.reduce((sum, item) => sum + item.monthlyAmount, 0);

  return {
    year: startYear,
    months: plan,
    totalAmount: Math.round(totalAmount * 100) / 100,
    formattedTotal: formatNumber(totalAmount),
  };
});

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
  if (
    !response.value ||
    validationErrors.value.length > 0 ||
    !depreciationBasicCalculation.value
  ) {
    return null;
  }

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));
  const depreciationType = response.value.dpca_type || "SL";

  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value;

  let annualDepreciation = 0;
  let monthlyDepreciation = 0;

  switch (depreciationType) {
    case "SL":
      annualDepreciation =
        depreciationBasicCalculation.value.annualDepreciation;
      monthlyDepreciation =
        depreciationBasicCalculation.value.monthlyDepreciation;
      break;
    case "DL":
      const depreciationRate =
        parseFloat(response.value.dpca_percentage || "0") / 100;
      annualDepreciation = assetValue * depreciationRate;
      monthlyDepreciation = annualDepreciation / 12;
      break;
    case "PU":
      if (unitsOfProduction.value.totalExpectedUnits > 0) {
        const depreciationPerUnit =
          depreciationBasicCalculation.value.depreciableAmount /
          unitsOfProduction.value.totalExpectedUnits;
        const averageYearlyUnits =
          unitsOfProduction.value.totalExpectedUnits / usefulLife;
        annualDepreciation = depreciationPerUnit * averageYearlyUnits;
        monthlyDepreciation = annualDepreciation / 12;
      } else {
        annualDepreciation =
          depreciationBasicCalculation.value.annualDepreciation;
        monthlyDepreciation =
          depreciationBasicCalculation.value.monthlyDepreciation;
      }
      break;
    default:
      annualDepreciation =
        depreciationBasicCalculation.value.annualDepreciation;
      monthlyDepreciation =
        depreciationBasicCalculation.value.monthlyDepreciation;
  }

  const currentAccumulated = parseFloat(
    response.value.asset_accu_dpca_value || "0"
  );
  const remainingValue = assetValue - currentAccumulated;

  return {
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    startDate: startDate.toISOString().split("T")[0],
    endDate,
    totalDepreciableAmount:
      depreciationBasicCalculation.value.depreciableAmount,
    depreciationType,
    effectiveRate: (annualDepreciation / assetValue) * 100,
    yearsToFullyDepreciate:
      depreciationBasicCalculation.value.depreciableAmount > 0
        ? depreciationBasicCalculation.value.depreciableAmount /
          annualDepreciation
        : 0,
    remainingValue,
    depreciationProgress:
      depreciationBasicCalculation.value.depreciableAmount > 0
        ? (currentAccumulated /
            depreciationBasicCalculation.value.depreciableAmount) *
          100
        : 0,
  };
});

// [ຮັກສາຟັງຊັນ helper ອື່ນໆ...]
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

const goBack = () => {
  router.go(-1);
};

const generateReferenceNumber = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateString = `${year}${month}${day}`;
  const assetListCode = response.value?.asset_list_code || "000";
  return `AS-ARC-${dateString}-${assetListCode}`;
};

const generateCompleteJournalEntry = () => {
  if (!response.value) {
    return null;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const periodCode = `${currentYear}${currentMonth}`;
  const valueDateISO = currentDate.toISOString();

  const referenceNo = generateReferenceNumber();
  const mastercodeName =
    response.value.mastercode_detail?.MC_name_la ||
    response.value.asset_id_detail?.asset_type_detail?.type_name_la ||
    "";
  const assetName =
    response.value.mastercode_detail?.chart_detail?.asset_name_la ||
    response.value.asset_id_detail?.asset_name_la ||
    response.value.asset_tag ||
    "";
  const addlText = `${mastercodeName}-${assetName}`;

  const accountNumbers = getAccountNumbers.value;

  const journalEntry = {
    Reference_No: referenceNo,
    Ccy_cd: response.value.asset_currency || "LAK",
    Txn_code: "ARC",
    Value_date: valueDateISO,
    Addl_text: addlText.length > 0 ? addlText : "Asset Recognition Entry",
    fin_cycle: currentYear,
    Period_code: periodCode,
    module_id: "AS",
    entries: [
      {
        Account_no: accountNumbers.dr || "",
        Amount: parseFloat(response.value.asset_value || "0"),
        Dr_cr: "D",
        Addl_sub_text:
          response.value.asset_spec || response.value.asset_tag || "",
        Ac_relatives: response.value.asset_list_id || "",
      },
      {
        Account_no: accountNumbers.cr || "",
        Amount: parseFloat(response.value.asset_value || "0"),
        Dr_cr: "C",
        Addl_sub_text:
          response.value.asset_spec || response.value.asset_tag || "",
        Ac_relatives: response.value.asset_list_id || "",
      },
    ],
  };

  return journalEntry;
};

// ✅ ປັບປຸງຟັງຊັນ saveCalculation ໃຫ້ແກ້ບັນຫາຫຼັກ
const saveCalculation = async () => {
  try {
    const notification = await CallSwal({
      icon: "warning",
      title: "ກຳລັງບັນທຶກ...",
      text: "ທ່ານຕ້ອງການບັນທຶກຂໍ້ມູນນີ້ແທ້ບໍ?",
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      // ✅ ເລີ່ມການບັນທຶກ - ປ້ອງກັນ watcher override
      isSaving = true;

      // ✅ ເກັບຄ່າທີ່ຄິດໄວ້ກ່ອນທຸກຢ່າງ
      const setupValueToSave = finalMonthlySetupValue.value;
      const endValueToSave = displayMonthlyEndValue.value;

      console.log("=== ຄ່າທີ່ຈະບັນທຶກ (ກ່ອນ API calls) ===");
      console.log("setupValueToSave:", setupValueToSave);
      console.log("endValueToSave:", endValueToSave);
      console.log("displayStartDate:", displayStartDate.value);

      // ✅ ບັງຄັບໃຫ້ໃຊ້ຄ່າທີ່ຄິດໄວ້ກ່ອນທຸກ API call
      request.asset_value_remainBegin = setupValueToSave.toFixed(2);
      request.asset_value_remainLast = endValueToSave.toFixed(2);

      if (depreciationBasicCalculation.value) {
        request.accu_dpca_value_total =
          depreciationBasicCalculation.value.depreciableAmount;
      }

      await assetStore.Update(id);

      // ✅ ຢືນຢັນຄ່າອີກຄັ້ງຫຼັງ Update
      request.asset_value_remainBegin = setupValueToSave.toFixed(2);
      request.asset_value_remainLast = endValueToSave.toFixed(2);

      console.log("=== ຄ່າສຸດທ້າຍທີ່ບັນທຶກ ===");
      console.log("asset_value_remainBegin:", request.asset_value_remainBegin);
      console.log("asset_value_remainLast:", request.asset_value_remainLast);

      const journalData = generateCompleteJournalEntry();

      if (journalData) {
        assetStore.creat_form_jornal = {
          Reference_No: journalData.Reference_No,
          Ccy_cd: journalData.Ccy_cd,
          Txn_code: journalData.Txn_code,
          Value_date: journalData.Value_date,
          Addl_text: journalData.Addl_text,
          fin_cycle: journalData.fin_cycle,
          Period_code: journalData.Period_code,
          module_id: journalData.module_id,
          entries: journalData.entries,
        };

        await assetStore.CreateJournalto(false);

        CallSwal({
          icon: "success",
          title: "ສຳເລັດ!",
          text: "ບັນທຶກຂໍ້ມູນແລະສ້າງ Journal Entry ສຳເລັດແລ້ວ",
          timer: 2000,
        });
      } else {
        CallSwal({
          icon: "warning",
          title: "ແຈ້ງເຕືອນ!",
          text: "ບັນທຶກຂໍ້ມູນສຳເລັດ ແຕ່ບໍ່ສາມາດສ້າງ Journal Entry ໄດ້",
        });
      }
    }
  } catch (error) {
    console.error("Error saving calculation:", error);
    CallSwal({
      icon: "error",
      title: "ຜິດພາດ!",
      text: `ເກີດຂໍ້ຜິດພາດ: ${error.message || error}`,
    });
  } finally {
    editableValues.value.isEditing = false;
    editableValues.value.salvageValue = 0;

    // ✅ ຢຸດການບັນທຶກຫຼັງ 2 ວິນາທີ (ເພີ່ມເວລາ)
    setTimeout(() => {
      isSaving = false;
      console.log("🔓 isSaving reset to false");
    }, 2000);
  }
};

// ✅ Watchers - ປັບປຸງໃຫ້ມີ debug ແລະ ປ້ອງກັນ override
watch(
  () => response.value?.asset_id_detail?.asset_type_detail?.type_code,
  (newTypeCode) => {
    if (newTypeCode) {
      updateAccountNumbers();
    }
  },
  { immediate: true }
);

watch(
  [() => displayStartDate.value, () => response.value?.asset_useful_life],
  ([newStartDate, newUsefulLife]) => {
    if (newStartDate && newUsefulLife) {
      const endDate = calculateDepreciationEndDate(newStartDate, newUsefulLife);
      request.dpca_end_date = endDate ? new Date(endDate) : null;
    }
  },
  { immediate: true }
);

watch(
  () => assetStore.response_fa_asset_detail,
  (req) => {
    console.log(`
=== WATCHER TRIGGERED ===
🔒 isSaving: ${isSaving}
📊 has request: ${!!req}
📅 Time: ${new Date().toLocaleString()}
    `);

    if (req && !isSaving) {
      console.log("✅ Watcher: Processing update...");

      request.asset_accu_dpca_value = req.asset_accu_dpca_value
        ? Number(req.asset_accu_dpca_value)
        : 0;
      request.acc_no = req.acc_no || "";
      request.asset_disposal_date = req.asset_disposal_date;
      request.asset_latest_date_dpca = req.asset_latest_date_dpca;
      request.asset_value_remain = req.asset_value_remain
        ? Number(req.asset_value_remain)
        : 0;

      nextTick(() => {
        if (!isSaving) {
          const newBeginValue = finalMonthlySetupValue.value.toFixed(2);
          const newEndValue = displayMonthlyEndValue.value.toFixed(2);

          console.log(`
=== WATCHER nextTick UPDATE ===
🔒 isSaving: ${isSaving}
💰 New Begin Value: ${newBeginValue}
💰 New End Value: ${newEndValue}
📅 Current displayStartDate: ${displayStartDate.value}
          `);

          request.asset_value_remainBegin = newBeginValue;
          request.asset_value_remainLast = newEndValue;

          const assetValue = parseFloat(req.asset_value || "0");
          const salvageValue = parseFloat(req.asset_salvage_value || "0");
          request.accu_dpca_value_total = Math.max(
            0,
            assetValue - salvageValue
          );
        } else {
          console.log("🔒 WATCHER: Blocked by isSaving flag");
        }
      });

      
      if (!request.dpca_start_date) {
        
        if (req.dpca_start_date) {
          request.dpca_start_date = new Date(req.dpca_start_date);
        } else {
          // ✅ ຖ້າບໍ່ມີໃຫ້ໃຊ້ວັນນີ້
          request.dpca_start_date = new Date();
        }
      }

      if (req.asset_useful_life && displayStartDate.value) {
        const endDate = calculateDepreciationEndDate(
          displayStartDate.value,
          req.asset_useful_life
        );
        request.dpca_end_date = endDate ? new Date(endDate) : null;
      }
    } else {
      console.log(
        `❌ Watcher: Skipped - isSaving: ${isSaving}, hasReq: ${!!req}`
      );
    }
  }
);

// ✅ ເພີ່ມຟັງຊັນ debug manual
const debugCurrentValues = () => {
  console.log(`
=== MANUAL DEBUG - CURRENT VALUES ===
📊 monthlySetupValue: ${monthlySetupValue.value.toLocaleString()}
📊 finalMonthlySetupValue: ${finalMonthlySetupValue.value.toLocaleString()}
📊 displayMonthlyEndValue: ${displayMonthlyEndValue.value.toLocaleString()}
📊 request.asset_value_remainBegin: ${request.asset_value_remainBegin}
📊 request.asset_value_remainLast: ${request.asset_value_remainLast}
🔒 isSaving: ${isSaving}
📅 displayStartDate: ${displayStartDate.value}
📅 todayDate: ${todayDate.value}
  `);

  if (depreciationBasicCalculation.value) {
    console.log(`
📊 Monthly Depreciation: ${depreciationBasicCalculation.value.monthlyDepreciation.toLocaleString()}
📊 Annual Depreciation: ${depreciationBasicCalculation.value.annualDepreciation.toLocaleString()}
    `);
  }
};

// ✅ ປັບປຸງ onMounted ໃຫ້ດີກວ່າ
onMounted(async () => {
  console.log("🚀 Component mounted - Loading data...");

  try {
    // ✅ Load ຂໍ້ມູນ
    await assetStore.GetFaAssetDetail(id);
    await masterStore.getDataAsset();

    // ✅ ຕັ້ງວັນທີ່ເລີ່ມຖ້າຍັງບໍ່ມີ
    if (!request.dpca_start_date) {
      // ✅ ລອງໃຊ້ຂໍ້ມູນຈາກ response ກ່ອນ
      if (response.value?.dpca_start_date) {
        request.dpca_start_date = new Date(response.value.dpca_start_date);
        console.log(
          "✅ Using dpca_start_date from response:",
          response.value.dpca_start_date
        );
      } else {
        // ✅ ຖ້າບໍ່ມີໃຫ້ໃຊ້ວັນນີ້
        request.dpca_start_date = new Date().toISOString().split("T")[0];
        console.log(
          "✅ Set dpca_start_date to today:",
          request.dpca_start_date
        );
      }
    }

    // ✅ Debug ຫຼັງ load ຂໍ້ມູນເສັດ
    setTimeout(() => {
      console.log("🔍 === POST-MOUNT DEBUG ===");
      debugCurrentValues();
    }, 2000);
  } catch (error) {
    console.error("❌ Error in onMounted:", error);
  }
});

// ✅ Date Modal functionality
const showDateModal = ref(false);
const tempDate = ref("");

const openDateModal = () => {
  tempDate.value = displayStartDate.value;
  showDateModal.value = true;
};

const confirmDate = () => {
  displayStartDate.value = tempDate.value;
  showDateModal.value = false;
  console.log("📅 Date updated to:", tempDate.value);
};

// ✅ ເພີ່ມຟັງຊັນສຳລັບ template debug (ໃຊ້ໃນ dev mode)
const logCalculationDetails = () => {
  if (depreciationBasicCalculation.value && displayStartDate.value) {
    const startDate = new Date(displayStartDate.value);
    console.log(`
=== CALCULATION DETAILS ===
📅 Start Date: ${startDate.toLocaleDateString(
      "en-GB"
    )} (Day ${startDate.getDate()})
📅 Month: ${startDate.getMonth() + 1}/${startDate.getFullYear()}
📊 Monthly Depreciation: ${depreciationBasicCalculation.value.monthlyDepreciation.toLocaleString()}
📊 Setup Value: ${monthlySetupValue.value.toLocaleString()}
📊 End Value: ${monthlyEndValue.value.toLocaleString()}
✅ Final Setup: ${finalMonthlySetupValue.value.toLocaleString()}
✅ Final End: ${displayMonthlyEndValue.value.toLocaleString()}
    `);
  }
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
                    ສະຫຼຸບຂໍ້ມູນຫຼູຍຫຽ້ນ
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
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນສະສົມ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-purple-lighten-5">
                          <div class="text-h6 text-purple-darken-2">
                            {{
                              formatCurrency(
                                depreciationSummary.totalDepreciation,
                                response?.asset_currency || ""
                              )
                            }}
                          </div>
                          <div class="text-caption">ມູນຄ່າຊັບສົມບັດເຫຼືອ</div>
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
                    ຂໍ້ມູນຊັບສົມບັດ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="2">
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຫັກຊັບສິນ'"
                          :text="
                            formatCurrency(
                              response?.asset_value &&
                                response?.asset_salvage_value
                                ? parseFloat(response.asset_value) -
                                    parseFloat(response.asset_salvage_value)
                                : 0,
                              response?.asset_currency || ''
                            )
                          "
                        />
                      </v-col>
                      <v-col cols="12" md="2">
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
                      <v-col cols="12" md="2">
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
                      <v-col cols="12" md="2">
                        <GlobalCardTitle
                          :title="'ສະກຸນເງິນ'"
                          :text="response?.asset_currency"
                        />
                      </v-col>
                      <v-col cols="12" md="2">
                        <GlobalCardTitle
                          :title="'ວັນທີ່ຊື້ຊັບສົມບັດ'"
                          :text="
                            response?.asset_date?.toString() ?? 'ບໍ່ມີຂໍ້ມູນ'
                          "
                        />
                      </v-col>
                      <v-col cols="12" md="2">
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
                    ຂໍ້ມູນຄ່າຫຼູຍຫ້ຽນ
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

                        <label>
                          ວັນທີ່ເລີ່ມຄິດລາຄາຫຼູ້ຍຫຽ້ນ
                          <span class="text-error">*</span>
                          <span class="text-caption text-success ml-2">
                            ({{
                              displayStartDate === todayDate
                                ? "ວັນນີ້"
                                : "ວັນທີ່ເລືອກ"
                            }})
                          </span>
                        </label>
                        <!-- <v-text-field
                          v-model="displayStartDate"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          :placeholder="todayDate"
                          class="date-field-with-default"
                        >
                          <template v-slot:append-inner>
                            <v-icon
                              color="success"
                              size="small"
                              v-if="displayStartDate === todayDate"
                            >
                              mdi-calendar-today
                            </v-icon>
                            <v-icon color="primary" size="small" v-else>
                              mdi-calendar-check
                            </v-icon>
                          </template>
                        </v-text-field> -->
                        <v-text-field
                          v-model="displayStartDate"
                          label="ວັນທີ່"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          readonly
                          @click="openDateModal"
                        >
                          <template v-slot:append-inner>
                            <v-icon color="primary" size="small">
                              mdi-calendar
                            </v-icon>
                          </template>
                        </v-text-field>

                        <v-dialog v-model="showDateModal" max-width="400px">
                          <v-card>
                            <v-card-title>ເລືອກວັນທີ່</v-card-title>
                            <v-card-text>
                              <v-text-field
                                v-model="tempDate"
                                type="date"
                                label="ວັນທີ່"
                                variant="outlined"
                              />
                            </v-card-text>
                            <v-card-actions>
                              <v-spacer />
                              <v-btn @click="showDateModal = false"
                                >ຍົກເລີກ</v-btn
                              >
                              <v-btn color="primary" @click="confirmDate"
                                >ຢືນຢັນ</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
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
                          v-model="formatAssetValueRemain"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          :suffix="response?.asset_currency || ''"
                          class="formatted-number-input"
                          placeholder="0.00"
                          @blur="formatOnBlur"
                        />

                        <label>ວັນທີ່ສິ້ນສຸດການລາຄາຫຼູຍຫຽ້ນ</label>
                        <!-- <v-text-field
                          :value="computedEndDate || ''"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          readonly
                          class="mt-3"
                          hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                        >
                          <template v-slot:append-inner>
                            <v-icon color="success" size="small">
                              mdi-calendar-clock
                            </v-icon>
                          </template>
                        </v-text-field> -->
                        <v-text-field
                          :value="
                            computedEndDate
                              ? $dayjs(computedEndDate).format('DD/MM/YYYY')
                              : ''
                          "
                          type="text"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          readonly
                          class="mt-3"
                          hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                        >
                          <template v-slot:append-inner>
                            <v-icon color="success" size="small">
                              mdi-calendar-clock
                            </v-icon>
                          </template>
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ເລກບັນຊີ/DR'"
                          :text="getAccountNumbers.dr || 'N/A'"
                        />

                        <label
                          >ມູນຄ່າຕົ້ນງວດ
                          <span class="text-error">*</span></label
                        >
                        <v-text-field
                          :value="formatNumber(finalMonthlySetupValue)"
                          variant="outlined"
                          density="compact"
                          readonly
                          :suffix="response?.asset_currency || ''"
                          class="formatted-number-input"
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
                          :text="
                            getAccountNumbers.cr || response?.acc_no || 'N/A'
                          "
                        />

                        <label
                          >ມູນຄ່າທ້າຍງວດ
                          <span class="text-success">*</span></label
                        >
                        <v-text-field
                          v-model="request.asset_value_remainLast"
                          :value="formatNumber(displayMonthlyEndValue)"
                          variant="outlined"
                          density="compact"
                          readonly
                          :suffix="response?.asset_currency || ''"
                          class="formatted-number-input"
                          persistent-hint
                        />

                        <!-- <GlobalCardTitle
                          :title="'ມູນຄ່າຊາກ'"
                          :text="
                            formatCurrency(
                              response?.asset_salvage_value || '0',
                              response?.asset_currency || ''
                            )
                          "
                        /> -->
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

.bg-deep-purple-lighten-4 {
  background-color: #d1c4e9 !important;
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
