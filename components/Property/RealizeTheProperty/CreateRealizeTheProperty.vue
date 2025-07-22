
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const title = "ຈົດບັນທຶກຮັບຮູ້ຊັບສິນ";
const id = route.query.asset_list_id as string;
const assetStore = faAssetStore();
const masterStore = useMasterStore();

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

const displayStartDate = computed({
  get: () => {
    if (request.dpca_start_date) {
      if (request.dpca_start_date instanceof Date) {
        return request.dpca_start_date.toISOString().split("T")[0];
      }
      return request.dpca_start_date.toString().split("T")[0];
    }
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
    return calculateDepreciationEndDate(startDate, usefulLife);
  }
  return null;
});

// ການຄິດໄລ່ພື້ນຖານ
const depreciationBasicCalculation = computed(() => {
  if (!response.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response");
    return null;
  }

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));

  // ກວດສອບຄວາມຖືກຕ້ອງ
  if (assetValue <= 0 || salvageValue < 0 || salvageValue >= assetValue || usefulLife <= 0) {
    console.error("ຂໍ້ມູນບໍ່ຖືກຕ້ອງສຳລັບການຄິດໄລ່ຄ່າເສື່ອມ:");
    console.error(`- ມູນຄ່າຊັບສິນ: ${assetValue}`);
    console.error(`- ມູນຄ່າຊາກ: ${salvageValue}`);
    console.error(`- ອາຍຸການໃຊ້ງານ: ${usefulLife}`);
    return null;
  }

  // ມູນຄ່າທີ່ສາມາດຫັກເສື່ອມໄດ້
  const depreciableAmount = assetValue - salvageValue;

  // ຄ່າເສື່ອມຕໍ່ປີ
  const annualDepreciation = depreciableAmount / usefulLife;

  // ຄ່າເສື່ອມຕໍ່ເດືອນ (ເດືອນທີ 1-11)
  const monthlyDepreciation = Math.round((annualDepreciation / 12) * 100) / 100;

  // ຄ່າເສື່ອມເດືອນສຸດທ້າຍ (ປັບໃຫ້ຍອດລວມຖືກຕ້ອງ)
  const lastMonthDepreciation = annualDepreciation - (monthlyDepreciation * 11);

  // ການກວດສອບຍອດລວມ
  const totalCheck = (monthlyDepreciation * 11) + lastMonthDepreciation;

  console.log(`ການກວດສອບຍອດລວມ:
    - ມູນຄ່າທີ່ຫັກເສື່ອມໄດ້: ${depreciableAmount.toLocaleString()}
    - ຄ່າເສື່ອມຕໍ່ປີ: ${annualDepreciation.toLocaleString()}
    - ຄ່າເສື່ອມເດືອນທຳມະດາ (1-11): ${monthlyDepreciation.toLocaleString()}
    - ຄ່າເສື່ອມເດືອນສຸດທ້າຍ (12): ${lastMonthDepreciation.toLocaleString()}
    - ຍອດລວມ 12 ເດືອນ: ${totalCheck.toLocaleString()}
    - ຄວາມຖືກຕ້ອງ: ${Math.abs(totalCheck - annualDepreciation) < 0.01 ? '✅ ຖືກຕ້ອງ' : '❌ ບໍ່ຖືກຕ້ອງ'}`);

  return {
    depreciableAmount: Math.round(depreciableAmount * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    monthlyDepreciation: monthlyDepreciation,
    lastMonthDepreciation: Math.round(lastMonthDepreciation * 100) / 100,
    totalMonthlyCheck: Math.round(totalCheck * 100) / 100
  };
});

// ✅ ມູນຄ່າຕົ້ນງວດ (ຮອງຮັບການຄຳນວນຍ້ອນຫຼັງ)
const monthlySetupValue = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response ຫຼື depreciationBasicCalculation");
    return 0;
  }

  const monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
  const startDate = new Date(displayStartDate.value);
  const currentDate = new Date();
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const lastDayOfStartMonth = new Date(startYear, startMonth + 1, 0).getDate();

  // ກວດສອບວ່າວັນທີ່ເລີ່ມຖືກຕ້ອງບໍ່
  if (isNaN(startDate.getTime())) {
    console.error("ວັນທີ່ເລີ່ມບໍ່ຖືກຕ້ອງ:", displayStartDate.value);
    return 0;
  }

  let daysToUse = 0;
  let calculationType = '';
  let calculationMonth = '';

  // ກໍລະນີ 1: ວັນທີ່ເລີ່ມຢູ່ໃນອະດີດ (ຍ້ອນຫຼັງ)
  if (startDate < currentDate) {
    // ຄຳນວນສຳລັບເດືອນຂອງ displayStartDate
    const startDay = startDate.getDate();
    daysToUse = lastDayOfStartMonth - startDay + 1;
    calculationType = 'ຄຳນວນຍ້ອນຫຼັງ';
    calculationMonth = `ເດືອນ ${startMonth + 1}/${startYear}`;
  }
  // ກໍລະນີ 2: ວັນທີ່ເລີ່ມຢູ່ໃນປັດຈຸບັນ (ເດືອນດຽວກັບມື້ນີ້)
  else if (startDate.getMonth() === currentDate.getMonth() && startDate.getFullYear() === currentDate.getFullYear()) {
    const currentDay = currentDate.getDate();
    daysToUse = lastDayOfStartMonth - currentDay + 1;
    calculationType = 'ເລີ່ມໃນເດືອນນີ້';
    calculationMonth = `ເດືອນ ${startMonth + 1}/${startYear}`;
  }
  // ກໍລະນີ 3: ວັນທີ່ເລີ່ມຢູ່ໃນອະນາຄົດ
  else {
    const startDay = startDate.getDate();
    daysToUse = lastDayOfStartMonth - startDay + 1;
    calculationType = 'ຈະເລີ່ມໃນອະນາຄົດ';
    calculationMonth = `ເດືອນ ${startMonth + 1}/${startYear}`;
  }

  const setupValue = daysToUse > 0
    ? (monthlyDepreciation * daysToUse) / lastDayOfStartMonth
    : 0;

  console.log(`ການຄິດໄລ່ມູນຄ່າຕົ້ນງວດ (${calculationType}):
    - ວັນທີ່ເລີ່ມ: ${startDate.toLocaleDateString('en-GB')}
    - ຄຳນວນສຳລັບ: ${calculationMonth}
    - ວັນທີ່ໃຊ້ຈິງ: ${daysToUse} ວັນ
    - ວັນທັງໝົດໃນເດືອນ: ${lastDayOfStartMonth} ວັນ
    - ມູນຄ່າຕໍ່ເດືອນ: ${monthlyDepreciation.toLocaleString()}
    - ສູດ: (${monthlyDepreciation.toLocaleString()} × ${daysToUse}) ÷ ${lastDayOfStartMonth}
    - ມູນຄ່າຕົ້ນງວດ: ${setupValue.toLocaleString()}`);

  return Math.round(setupValue * 100) / 100;
});

// ✅ ມູນຄ່າທ້າຍງວດ
const monthlyEndValue = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response ຫຼື depreciationBasicCalculation");
    return 0;
  }

  const monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
  const setupValue = monthlySetupValue.value;

  const endValue = monthlyDepreciation - setupValue;

  console.log(`ການຄິດໄລ່ມູນຄ່າທ້າຍງວດ:
    - ຄ່າເສື່ອມຕໍ່ເດືອນ: ${monthlyDepreciation.toLocaleString()}
    - ມູນຄ່າຕົ້ນງວດ: ${setupValue.toLocaleString()}
    - ມູນຄ່າທ້າຍງວດ: ${endValue.toLocaleString()}`);

  return Math.max(0, Math.round(endValue * 100) / 100);
});

// ✅ ປັບ finalMonthlySetupValue ແລະ displayMonthlyEndValue
const finalMonthlySetupValue = computed(() => {
  const setupValue = monthlySetupValue.value;
  return setupValue === 0
    ? depreciationCalculator.value?.monthlyDepreciation || 0
    : setupValue;
});

const displayMonthlyEndValue = computed(() => {
  const endValue = monthlyEndValue.value;
  return endValue === 0
    ? depreciationCalculator.value?.monthlyDepreciation || 0
    : endValue;
});

// ✅ ລາຍລະອຽດເດືອນປັດຈຸບັນ
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
      monthInfo: `ເດືອນ ${currentMonth + 1}/${currentYear} ມີ ${lastDayOfMonth} ວັນ`,
      currentStatus: `ວັນທີ່: ${currentDay}/${lastDayOfMonth}`,
      daysPassed: `ຜ່ານໄປແລ້ວ: ${daysPassedInMonth} ວັນ`,
      daysRemaining: `ເຫຼືອອີກ: ${daysRemainingInMonth} ວັນ (ບໍ່ລວມວັນນີ້)`,
      daysRemainingIncluding: `ເຫຼືອອີກ: ${daysRemainingIncludingToday} ວັນ (ລວມວັນນີ້)`,
      calculation: `${currentDay} ຫາ ${lastDayOfMonth} = ${daysRemainingInMonth} ວັນ`
    }
  };
});

// ✅ ຟັງຊັນສຳລັບຄິດໄລ່ເດືອນອື່ນໆ
const calculateDepreciationForAnyMonth = (targetYear: number, targetMonth: number) => {
  if (!response.value || !depreciationBasicCalculation.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response ຫຼື depreciationBasicCalculation");
    return null;
  }

  const monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value ? new Date(computedEndDate.value) : null;

  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const firstDayOfTargetMonth = new Date(targetYear, targetMonth, 1);
  const lastDayOfTargetMonthDate = new Date(targetYear, targetMonth, lastDayOfTargetMonth);

  let daysToCalculate = 0;
  let calculationType = '';
  let description = '';

  if (endDate && firstDayOfTargetMonth > endDate) {
    return {
      month: targetMonth + 1,
      year: targetYear,
      daysCalculated: 0,
      monthlyAmount: 0,
      calculationType: 'ເກີນກຳນົດ',
      description: 'ເດືອນນີ້ເກີນໄລຍະເວລາຫັກຄ່າເສື່ອມແລ້ວ',
      formula: 'ບໍ່ມີການຄິດໄລ່'
    };
  }

  if (startDate.getMonth() === targetMonth && startDate.getFullYear() === targetYear) {
    const startDay = startDate.getDate();
    if (endDate && endDate.getMonth() === targetMonth && endDate.getFullYear() === targetYear) {
      const endDay = endDate.getDate();
      daysToCalculate = endDay - startDay + 1;
      calculationType = 'ເລີ່ມແລະສິ້ນສຸດໃນເດືອນນີ້';
      description = `ຈາກວັນທີ່ ${startDay} ຫາ ${endDay}`;
    } else {
      daysToCalculate = lastDayOfTargetMonth - startDay + 1;
      calculationType = 'ເລີ່ມໃນເດືອນນີ້';
      description = `ຈາກວັນທີ່ ${startDay} ຫາ ${lastDayOfTargetMonth}`;
    }
  } else if (startDate < firstDayOfTargetMonth) {
    if (endDate && endDate.getMonth() === targetMonth && endDate.getFullYear() === targetYear) {
      const endDay = endDate.getDate();
      daysToCalculate = endDay;
      calculationType = 'ສິ້ນສຸດໃນເດືອນນີ້';
      description = `ຈາກວັນທີ່ 1 ຫາ ${endDay}`;
    } else {
      daysToCalculate = lastDayOfTargetMonth;
      calculationType = 'ເດືອນເຕັມ';
      description = `ທັງເດືອນ (1-${lastDayOfTargetMonth})`;
    }
  } else {
    daysToCalculate = 0;
    calculationType = 'ຍັງບໍ່ເລີ່ມ';
    description = 'ຍັງບໍ່ຖຶງເວລາຫັກ';
  }

  const monthlyAmount = daysToCalculate > 0
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
    formula: daysToCalculate > 0
      ? `(${formatNumber(monthlyDepreciation)} × ${daysToCalculate}) ÷ ${lastDayOfTargetMonth} = ${formatNumber(monthlyAmount)}`
      : 'ບໍ່ມີການຄິດໄລ່'
  };
};

// ✅ ສ້າງແຜນການຫັກຄ່າເສື່ອມທັງປີ
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
    formattedTotal: formatNumber(totalAmount)
  };
});

// ✅ ລາຍລະອຽດການຄິດໄລ່ຕາມວັນທີ່ເລີ່ມ
const getStartDateCalculationDetails = computed(() => {
  if (!response.value || !depreciationBasicCalculation.value) return null;

  const monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
  const startDate = new Date(displayStartDate.value);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const currentDate = new Date();

  const lastDayOfStartMonth = new Date(startYear, startMonth + 1, 0).getDate();

  let calculationType = '';
  let daysUsed = 0;
  let description = '';

  if (startDate > currentDate) {
    calculationType = 'ຈະເລີ່ມໃນອະນາຄົດ';
    const startDay = startDate.getDate();
    daysUsed = lastDayOfStartMonth - startDay + 1;
    description = `ຈາກວັນທີ່ ${startDay} ຫາ ${lastDayOfStartMonth} = ${daysUsed} ວັນ`;
  } else if (startDate.getMonth() === startMonth && startDate.getFullYear() === startYear && startDate <= currentDate) {
    calculationType = 'ຄຳນວນຍ້ອນຫຼັງ ຫຼື ເລີ່ມໃນເດືອນນີ້';
    const startDay = startDate.getDate();
    daysUsed = lastDayOfStartMonth - startDay + 1;
    description = `ຈາກວັນທີ່ ${startDay} ຫາ ${lastDayOfStartMonth} = ${daysUsed} ວັນ`;
  } else {
    calculationType = 'ເລີ່ມກ່ອນເດືອນນີ້';
    daysUsed = lastDayOfStartMonth;
    description = `ທັງເດືອນ (1-${lastDayOfStartMonth}) = ${daysUsed} ວັນ`;
  }

  const calculatedValue = daysUsed > 0
    ? (monthlyDepreciation * daysUsed) / lastDayOfStartMonth
    : 0;

  return {
    startDate: startDate.toISOString().split('T')[0],
    currentDate: currentDate.toISOString().split('T')[0],
    calculationType,
    daysUsed,
    totalDaysInMonth: lastDayOfStartMonth,
    description,
    monthlyDepreciation,
    calculatedValue: Math.round(calculatedValue * 100) / 100,
    formula: daysUsed > 0
      ? `(${formatNumber(monthlyDepreciation)} × ${daysUsed}) ÷ ${lastDayOfStartMonth} = ${formatNumber(calculatedValue)}`
      : 'ບໍ່ມີການຄິດໄລ່',
    formatted: {
      startDate: `ວັນທີ່ເລີ່ມ: ${startDate.toLocaleDateString('en-GB')}`,
      currentDate: `ວັນນີ້: ${currentDate.toLocaleDateString('en-GB')}`,
      calculation: `${calculationType}: ${description}`,
      result: `ມູນຄ່າຕົ້ນງວດ: ${formatNumber(calculatedValue)} LAK`
    }
  };
});

// ✅ ການຄິດໄລ່ຈຳນວນວັນທັງໝົດ
const getTotalDaysCalculation = computed(() => {
  if (!response.value) return null;

  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));
  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value ? new Date(computedEndDate.value) : null;

  if (!endDate) return null;

  const timeDiff = endDate.getTime() - startDate.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

  const totalMonths = usefulLife * 12;
  const standardDays = totalMonths * 30;

  const currentDate = new Date();
  const daysFromStart = Math.max(0, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const remainingDays = Math.max(0, totalDays - daysFromStart);

  return {
    usefulLifeYears: usefulLife,
    totalMonths,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    currentDate: currentDate.toISOString().split('T')[0],
    totalDaysActual: totalDays,
    standardDays,
    daysFromStart,
    remainingDays,
    progressPercentage: totalDays > 0 ? (daysFromStart / totalDays * 100).toFixed(2) : 0,
    formatted: {
      totalDaysActual: `${totalDays.toLocaleString()} ວັນ`,
      standardDays: `${standardDays.toLocaleString()} ວັນ (${totalMonths} ເດືອນ × 30)`,
      daysFromStart: `${daysFromStart.toLocaleString()} ວັນ`,
      remainingDays: `${remainingDays.toLocaleString()} ວັນ`,
      yearBreakdown: `${usefulLife} ປີ = ${totalMonths} ເດືອນ = ${standardDays} ວັນ (ມາດຕະຖານ)`
    }
  };
});

// ✅ ລາຍລະອຽດການຄິດໄລ່
const getDepreciationDetails = computed(() => {
  if (!depreciationBasicCalculation.value || !response.value) return null;

  const basic = depreciationBasicCalculation.value;
  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");
  const usefulLife = parseInt(String(response.value.asset_useful_life || "0"));

  const totalDays = getTotalDaysCalculation.value;
  const monthDetails = getCurrentMonthDetails.value;

  return {
    calculation: `(${formatNumber(assetValue)} - ${formatNumber(salvageValue)}) ÷ ${usefulLife} ປີ ÷ 12 ເດືອນ`,
    yearlyAmount: `${formatNumber(basic.annualDepreciation)} LAK ຕໍ່ປີ`,
    monthlyAmount: `${formatNumber(basic.monthlyDepreciation)} LAK ຕໍ່ເດືອນ (ເດືອນທີ 1-11)`,
    lastMonthAmount: `${formatNumber(basic.lastMonthDepreciation)} LAK (ເດືອນທີ 12)`,
    dailyAmountInCurrentMonth: monthDetails ? `${formatNumber(basic.monthlyDepreciation / monthDetails.totalDaysInMonth)} LAK ຕໍ່ວັນ (ເດືອນນີ້)` : 'N/A',
    depreciableTotal: formatNumber(basic.depreciableAmount),
    totalCheck: `ຍອດລວມ 12 ເດືອນ: ${formatNumber(basic.totalMonthlyCheck)} LAK`,
    daysInformation: {
      totalLifeDays: totalDays?.formatted.totalDaysActual || 'N/A',
      standardDays: totalDays?.formatted.standardDays || 'N/A',
      yearBreakdown: totalDays?.formatted.yearBreakdown || 'N/A',
      currentProgress: totalDays ? `${totalDays.daysFromStart.toLocaleString()} / ${totalDays.totalDaysActual.toLocaleString()} ວັນ (${totalDays.progressPercentage}%)` : 'N/A'
    },
    currentMonthInfo: {
      monthStatus: monthDetails?.formatted.monthInfo || 'N/A',
      currentDay: monthDetails?.formatted.currentStatus || 'N/A',
      daysRemaining: monthDetails?.formatted.daysRemaining || 'N/A',
      calculationDays: monthDetails?.daysRemainingInMonth || 0
    },
    startDateCalculation: {
      details: getStartDateCalculationDetails.value?.formatted || {},
      formula: getStartDateCalculationDetails.value?.formula || 'N/A',
      calculationType: getStartDateCalculationDetails.value?.calculationType || 'N/A'
    },
    newCalculationMethod: {
      formula: monthDetails
        ? `(${formatNumber(basic.monthlyDepreciation)} × ${monthDetails.daysRemainingInMonth}) ÷ ${monthDetails.totalDaysInMonth}`
        : 'N/A',
      setupValue: monthDetails
        ? `ມູນຄ່າຕົ້ນງວດ = ${formatNumber((basic.monthlyDepreciation * monthDetails.daysRemainingInMonth) / monthDetails.totalDaysInMonth)}`
        : 'N/A',
      endValue: monthDetails
        ? `ມູນຄ່າທ້າຍງວດ = ${formatNumber(basic.monthlyDepreciation)} - ${formatNumber((basic.monthlyDepreciation * monthDetails.daysRemainingInMonth) / monthDetails.totalDaysInMonth)} = ${formatNumber(basic.monthlyDepreciation - ((basic.monthlyDepreciation * monthDetails.daysRemainingInMonth) / monthDetails.totalDaysInMonth))}`
        : 'N/A'
    }
  };
});

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
  if (!response.value || validationErrors.value.length > 0 || !depreciationBasicCalculation.value) {
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
      annualDepreciation = depreciationBasicCalculation.value.annualDepreciation;
      monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
      break;

    case "DL":
      const depreciationRate = parseFloat(response.value.dpca_percentage || "0") / 100;
      annualDepreciation = assetValue * depreciationRate;
      monthlyDepreciation = annualDepreciation / 12;
      break;

    case "PU":
      if (unitsOfProduction.value.totalExpectedUnits > 0) {
        const depreciationPerUnit = depreciationBasicCalculation.value.depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
        const averageYearlyUnits = unitsOfProduction.value.totalExpectedUnits / usefulLife;
        annualDepreciation = depreciationPerUnit * averageYearlyUnits;
        monthlyDepreciation = annualDepreciation / 12;
      } else {
        annualDepreciation = depreciationBasicCalculation.value.annualDepreciation;
        monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
      }
      break;

    default:
      annualDepreciation = depreciationBasicCalculation.value.annualDepreciation;
      monthlyDepreciation = depreciationBasicCalculation.value.monthlyDepreciation;
  }

  const currentAccumulated = parseFloat(response.value.asset_accu_dpca_value || "0");
  const remainingValue = assetValue - currentAccumulated;

  return {
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    startDate: startDate.toISOString().split("T")[0],
    endDate,
    totalDepreciableAmount: depreciationBasicCalculation.value.depreciableAmount,
    depreciationType,
    effectiveRate: (annualDepreciation / assetValue) * 100,
    yearsToFullyDepreciate: depreciationBasicCalculation.value.depreciableAmount > 0
      ? depreciationBasicCalculation.value.depreciableAmount / annualDepreciation
      : 0,
    remainingValue,
    depreciationProgress: depreciationBasicCalculation.value.depreciableAmount > 0
      ? (currentAccumulated / depreciationBasicCalculation.value.depreciableAmount) * 100
      : 0,
  };
});

const getCurrentMonthDays = () => {
  if (!response.value) return 0;

  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value ? new Date(computedEndDate.value) : null;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  if (startDate > currentDate) return 0;

  if (endDate && endDate < new Date(currentYear, currentMonth, 1)) return 0;

  if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    let actualEndDate = endOfMonth;

    if (endDate && endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) {
      actualEndDate = endDate < endOfMonth ? endDate : endOfMonth;
    }

    const timeDiff = actualEndDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  } else if (startDate < new Date(currentYear, currentMonth, 1)) {
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    let actualEndDate = currentDate;

    if (endDate && endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) {
      actualEndDate = endDate < currentDate ? endDate : currentDate;
    }

    const timeDiff = actualEndDate.getTime() - currentMonthStart.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  return 0;
};

const getEndOfMonthDays = () => {
  if (!response.value) return 0;

  const startDate = new Date(displayStartDate.value);
  const endDate = computedEndDate.value ? new Date(computedEndDate.value) : null;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  if (startDate > currentDate) return 0;

  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
    let actualEndDate = endOfMonth;

    if (endDate && endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) {
      actualEndDate = endDate < endOfMonth ? endDate : endOfMonth;
    }

    const timeDiff = actualEndDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  } else if (startDate < new Date(currentYear, currentMonth, 1)) {
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    let actualEndDate = endOfMonth;

    if (endDate && endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) {
      actualEndDate = endDate < endOfMonth ? endDate : endOfMonth;
    }

    const timeDiff = actualEndDate.getTime() - currentMonthStart.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  return 0;
};

const calculateDaysFromStart = () => {
  if (!response.value) return 0;

  const startDate = new Date(displayStartDate.value);
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - startDate.getTime();
  return Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));
};

const depreciableAmountForSave = computed(() => {
  if (!response.value) return 0;

  const assetValue = parseFloat(response.value.asset_value || "0");
  const salvageValue = parseFloat(response.value.asset_salvage_value || "0");

  const depreciableAmount = assetValue - salvageValue;

  return Math.max(0, depreciableAmount);
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
  const depreciationRate = parseFloat(response.value.dpca_percentage || "0") / 100;
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
          const depreciationPerUnit = depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
          const unitsThisYear = unitsOfProduction.value.yearlyUsage[year - 1] ||
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
      year,
      beginningBookValue: Math.round(beginningBookValue * 100) / 100,
      depreciationExpense: Math.round(currentYearDepreciation * 100) / 100,
      accumulatedDepreciation: Math.round(totalAccumulatedDepreciation * 100) / 100,
      endingBookValue: Math.round(bookValue * 100) / 100,
      depreciationRate: depreciationType === "DL"
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
    averageAnnualDepreciation: Math.round(averageAnnualDepreciation * 100) / 100,
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

const setToToday = () => {
  request.dpca_start_date = new Date();
};

const formatOnBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (request.asset_value_remain && request.asset_value_remain > 0) {
    target.value = formatNumber(request.asset_value_remain);
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

const generateJournalEntry = () => {
  if (!response.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response");
    return null;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const periodCode = `${currentYear}${currentMonth}`;

  const valueDateISO = currentDate.toISOString();
  const referenceNo = generateReferenceNumber();
  const mastercodeName = masterdata.value.mastercode_detail?.MC_name_la || "";
  const assetName =
    response.value.mastercode_detail?.chart_detail?.asset_name_la ||
    response.value.asset_id_detail?.asset_name_la ||
    "";
  const addlText = `${mastercodeName}-${assetName}`;

  const accountNumbers = getAccountNumbers.value;

  const journalEntry = {
    Reference_No: referenceNo,
    Ccy_cd: response.value.asset_currency || "LAK",
    Txn_code: "ARC",
    Value_date: valueDateISO,
    Addl_text: addlText,
    fin_cycle: currentYear,
    Period_code: periodCode,
    module_id: "AS",
    entries: [
      {
        Account_no: accountNumbers.dr || "",
        Amount: parseFloat(response.value.asset_value || "0"),
        Dr_cr: "C",
        Addl_sub_text: response.value.asset_spec || "",
      },
    ],
  };

  return journalEntry;
};

const generateCompleteJournalEntry = () => {
  if (!response.value) {
    console.error("ບໍ່ມີຂໍ້ມູນ response");
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
        Addl_sub_text: response.value.asset_spec || response.value.asset_tag || "",
        Ac_relatives: response.value.asset_list_id || "",
      },
      {
        Account_no: accountNumbers.cr || "",
        Amount: parseFloat(response.value.asset_value || "0"),
        Dr_cr: "C",
        Addl_sub_text: response.value.asset_spec || response.value.asset_tag || "",
        Ac_relatives: response.value.asset_list_id || "",
      },
    ],
  };

  return journalEntry;
};

const showJournalEntryPreview = () => {
  const entry = generateCompleteJournalEntry();
  if (entry) {
    console.log("📋 Journal Entry Preview:");
    console.log(JSON.stringify(entry, null, 2));
    return entry;
  }
  return null;
};

const copyJournalEntryToClipboard = async () => {
  const entry = generateCompleteJournalEntry();
  if (entry) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      CallSwal({
        icon: "success",
        title: "ສຳເລັດ!",
        text: "ຄັດລອກຂໍ້ມູນ Journal Entry ໄປ Clipboard ແລ້ວ",
        timer: 2000,
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      CallSwal({
        icon: "error",
        title: "ຜິດພາດ!",
        text: "ບໍ່ສາມາດຄັດລອກໄດ້",
      });
    }
  }
};

const journalEntryData = computed(() => {
  return generateCompleteJournalEntry();
});

const submitJournalEntry = async () => {
  const entry = generateCompleteJournalEntry();
  if (!entry) return;

  try {
    const response = await fetch("journal/process-v2/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (response.ok) {
      CallSwal({
        icon: "success",
        title: "ສຳເລັດ!",
        text: "ສົ່ງຂໍ້ມູນ Journal Entry ສຳເລັດແລ້ວ",
      });
    } else {
      throw new Error("API Error");
    }
  } catch (error) {
    console.error("Error submitting journal entry:", error);
    CallSwal({
      icon: "error",
      title: "ຜິດພາດ!",
      text: "ບໍ່ສາມາດສົ່ງຂໍ້ມູນໄດ້",
    });
  }
};

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
      await assetStore.Update(id);

      request.asset_value_remainBegin = finalMonthlySetupValue.value.toString();
      request.asset_value_remainLast = displayMonthlyEndValue.value.toString();

      if (depreciationBasicCalculation.value) {
        request.accu_dpca_value_total = depreciationBasicCalculation.value.depreciableAmount;
      }

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
  }
};

// ✅ Watchers
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

      nextTick(() => {
        request.asset_value_remainBegin = finalMonthlySetupValue.value.toFixed(2);
        request.asset_value_remainLast = displayMonthlyEndValue.value.toFixed(2);
        const assetValue = parseFloat(req.asset_value || "0");
        const salvageValue = parseFloat(req.asset_salvage_value || "0");
        request.accu_dpca_value_total = Math.max(0, assetValue - salvageValue);
      });

      if (!request.dpca_start_date) {
        request.dpca_start_date = new Date();
      }

      if (req.asset_useful_life && displayStartDate.value) {
        const endDate = calculateDepreciationEndDate(
          displayStartDate.value,
          req.asset_useful_life
        );
        request.dpca_end_date = endDate ? new Date(endDate) : null;
      }
    }
  }
);

onMounted(() => {
  assetStore.GetFaAssetDetail(id);
  masterStore.getDataAsset();

  if (!request.dpca_start_date) {
    request.dpca_start_date = new Date().toISOString().split("T")[0];
  }
});
</script>
```

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
                    ຂໍ້ມູນຄ່າຫຼູຍຫຽ້ນ
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
                        <v-text-field
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
                        </v-text-field>
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
                        <v-text-field
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
                          v-model="request.asset_value_remainBegin"
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
