<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
const router = useRouter();
const title = "ຈົດບັນທຶກຮັບຮູ້ຊັບສິນ";
const id = route.query.asset_list_id as string;
const assetStore = faAssetStore();

// State for editable values
const editableValues = ref({
  salvageValue: 0,
  isEditing: false
});

// State for Units of Production
const unitsOfProduction = ref({
  totalExpectedUnits: 0,
  yearlyUsage: [] as number[]
});

// Computed responses
const response = computed(() => {
  return assetStore.response_fa_asset_detail;
});

// Validation computed
const validationErrors = computed(() => {
  const errors = [];
  if (!response.value) return errors;
  
  const assetValue = parseFloat(response.value.asset_value || '0');
  const salvageValue = parseFloat(response.value.asset_salvage_value || '0');
  const usefulLife = parseInt(response.value.asset_useful_life || '0');
  
  if (assetValue <= 0) errors.push('ມູນຄ່າຊັບສິນຕ້ອງມາກກວ່າ 0');
  if (salvageValue < 0) errors.push('ມູນຄ່າຊາກບໍ່ສາມາດຕ່ຳກວ່າ 0 ໄດ້');
  if (salvageValue >= assetValue) errors.push('ມູນຄ່າຊາກຕ້ອງນ້ອຍກວ່າມູນຄ່າຊັບສິນ');
  if (usefulLife <= 0) errors.push('ອາຍຸການໃຊ້ງານຕ້ອງມາກກວ່າ 0');
  
  return errors;
});

// Enhanced depreciation calculator
const depreciationCalculator = computed(() => {
  if (!response.value || validationErrors.value.length > 0) return null;
  
  const assetValue = parseFloat(response.value.asset_value || '0');
  // Use editable salvage value if editing, otherwise use response value
  const salvageValue = editableValues.value.isEditing ? 
    editableValues.value.salvageValue : 
    parseFloat(response.value.asset_salvage_value || '0');
  const usefulLife = parseInt(response.value.asset_useful_life || '0');
  const depreciationRate = parseFloat(response.value.dpca_percentage || '0') / 100;
  const depreciationType = response.value.dpca_type || 'SL';
  
  // Calculate dates
  const startDate = new Date(response.value.asset_date || new Date());
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + usefulLife);
  
  let annualDepreciation = 0;
  let monthlyDepreciation = 0;
  const depreciableAmount = assetValue - salvageValue;
  
  // Initialize units for production method
  if (depreciationType === 'PU' && unitsOfProduction.value.totalExpectedUnits === 0) {
    unitsOfProduction.value.totalExpectedUnits = usefulLife * 1000; // Default assumption
    unitsOfProduction.value.yearlyUsage = Array(usefulLife).fill(1000);
  }
  
  // Calculate based on depreciation type
  switch(depreciationType) {
    case 'SL': // Straight Line Method
      annualDepreciation = depreciableAmount / usefulLife;
      monthlyDepreciation = annualDepreciation / 12;
      break;
      
    case 'DL': // Declining Balance Method
      // First year calculation
      annualDepreciation = assetValue * depreciationRate;
      monthlyDepreciation = annualDepreciation / 12;
      break;
      
    case 'PU': // Production Units Method
      if (unitsOfProduction.value.totalExpectedUnits > 0) {
        const depreciationPerUnit = depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
        const averageYearlyUnits = unitsOfProduction.value.totalExpectedUnits / usefulLife;
        annualDepreciation = depreciationPerUnit * averageYearlyUnits;
        monthlyDepreciation = annualDepreciation / 12;
      }
      break;
      
    default:
      annualDepreciation = depreciableAmount / usefulLife;
      monthlyDepreciation = annualDepreciation / 12;
  }
  
  return {
    annualDepreciation: annualDepreciation,
    monthlyDepreciation: monthlyDepreciation,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    totalDepreciableAmount: depreciableAmount,
    depreciationType: depreciationType,
    effectiveRate: ((annualDepreciation / assetValue) * 100),
    yearsToFullyDepreciate: depreciableAmount > 0 ? depreciableAmount / annualDepreciation : 0
  };
});

// Enhanced depreciation schedule
const depreciationSchedule = computed(() => {
  if (!response.value || !depreciationCalculator.value || validationErrors.value.length > 0) return [];
  
  const assetValue = parseFloat(response.value.asset_value || '0');
  const salvageValue = parseFloat(response.value.asset_salvage_value || '0');
  const usefulLife = parseInt(response.value.asset_useful_life || '0');
  const depreciationType = response.value.dpca_type || 'SL';
  const depreciationRate = parseFloat(response.value.dpca_percentage || '0') / 100;
  const depreciableAmount = assetValue - salvageValue;
  
  const schedule = [];
  let bookValue = assetValue;
  let totalAccumulatedDepreciation = 0;
  
  for (let year = 1; year <= usefulLife; year++) {
    const beginningBookValue = bookValue;
    let currentYearDepreciation = 0;
    
    switch(depreciationType) {
      case 'SL': // Straight Line
        currentYearDepreciation = depreciableAmount / usefulLife;
        break;
        
      case 'DL': // Declining Balance
        currentYearDepreciation = beginningBookValue * depreciationRate;
        // Ensure we don't go below salvage value
        if (beginningBookValue - currentYearDepreciation < salvageValue) {
          currentYearDepreciation = beginningBookValue - salvageValue;
        }
        break;
        
      case 'PU': // Production Units
        if (unitsOfProduction.value.totalExpectedUnits > 0) {
          const depreciationPerUnit = depreciableAmount / unitsOfProduction.value.totalExpectedUnits;
          const unitsThisYear = unitsOfProduction.value.yearlyUsage[year - 1] || 
                               (unitsOfProduction.value.totalExpectedUnits / usefulLife);
          currentYearDepreciation = depreciationPerUnit * unitsThisYear;
        }
        break;
    }
    
    // Final year adjustment to ensure we reach salvage value exactly
    if (year === usefulLife && depreciationType !== 'DL') {
      currentYearDepreciation = beginningBookValue - salvageValue;
    }
    
    // Ensure depreciation is not negative
    currentYearDepreciation = Math.max(0, currentYearDepreciation);
    
    // Ensure we don't depreciate below salvage value
    if (beginningBookValue - currentYearDepreciation < salvageValue) {
      currentYearDepreciation = beginningBookValue - salvageValue;
    }
    
    totalAccumulatedDepreciation += currentYearDepreciation;
    bookValue = assetValue - totalAccumulatedDepreciation;
    
    // Ensure book value doesn't go below salvage value
    if (bookValue < salvageValue) {
      bookValue = salvageValue;
    }
    
    schedule.push({
      year: year,
      beginningBookValue: beginningBookValue,
      depreciationExpense: currentYearDepreciation,
      accumulatedDepreciation: totalAccumulatedDepreciation,
      endingBookValue: bookValue,
      depreciationRate: depreciationType === 'DL' ? 
        ((currentYearDepreciation / beginningBookValue) * 100) : 
        ((currentYearDepreciation / assetValue) * 100)
    });
  }
  
  return schedule;
});

// Summary statistics
const depreciationSummary = computed(() => {
  if (!depreciationSchedule.value.length) return null;
  
  const schedule = depreciationSchedule.value;
  const totalDepreciation = schedule.reduce((sum, item) => sum + item.depreciationExpense, 0);
  const averageAnnualDepreciation = totalDepreciation / schedule.length;
  const highestDepreciation = Math.max(...schedule.map(item => item.depreciationExpense));
  const lowestDepreciation = Math.min(...schedule.map(item => item.depreciationExpense));
  
  return {
    totalDepreciation,
    averageAnnualDepreciation,
    highestDepreciation,
    lowestDepreciation,
    finalBookValue: schedule[schedule.length - 1].endingBookValue
  };
});

// Progress percentage
const depreciationProgress = computed(() => {
  if (!response.value) return 0;
  
  const currentAccumulated = parseFloat(response.value.asset_accu_dpca_value || '0');
  const totalDepreciable = parseFloat(response.value.asset_value || '0') - 
                          parseFloat(response.value.asset_salvage_value || '0');
  
  return totalDepreciable > 0 ? (currentAccumulated / totalDepreciable) * 100 : 0;
});

// Formatting functions
const formatNumber = (value: string | number) => {
  if (!value) return '0.00';
  return parseFloat(value.toString()).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatCurrency = (value: string | number, currency: string = 'LAK') => {
  return `${formatNumber(value)} ${currency}`;
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

// Method name and description functions
const getDepreciationMethodName = (type: string) => {
  switch(type) {
    case 'SL': return 'ແບບເສັ້ນຊື່ (Straight Line)';
    case 'DL': return 'ແບບຫຼຸດລົງ (Declining Balance)';
    case 'PU': return 'ແບບຕາມໜ່ວຍຜະລິດ (Production Unit)';
    default: return type;
  }
};

const getDepreciationMethodDescription = (type: string) => {
  switch(type) {
    case 'SL': 
      return 'ຫັກຄ່າເສື່ອມເທົ່າໆກັນທຸກປີ = (ມູນຄ່າຊັບສິນ - ມູນຄ່າຊາກ) ÷ ອາຍຸການໃຊ້ງານ';
    case 'DL': 
      return 'ຫັກຄ່າເສື່ອມສູງໃນປີທຳອິດ ແລ້ວຫຼຸດລົງ = ມູນຄ່າຄົງເຫຼືອ × ອັດຕາເສື່ອມ';
    case 'PU': 
      return 'ຫັກຄ່າເສື່ອມຕາມການນຳໃຊ້ຈິງ = (ມູນຄ່າຊັບສິນ - ມູນຄ່າຊາກ) ÷ ໜ່ວຍຜະລິດທັງໝົດ × ໜ່ວຍທີ່ໃຊ້';
    default: 
      return 'ບໍ່ມີຂໍ້ມູນວິທີການຄຳນວນ';
  }
};

// Export functions
const exportToExcel = () => {
  // Implementation for Excel export
  console.log('Exporting to Excel...');
};

const printReport = () => {
  window.print();
};

const saveCalculation = () => {
  // Implementation for saving calculation
  console.log('Saving calculation...');
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

          <!-- Validation Errors -->
          <v-col cols="12" v-if="validationErrors.length > 0">
            <v-alert type="error" prominent border="start">
              <v-alert-title>ຂໍ້ຜິດພາດໃນຂໍ້ມູນ</v-alert-title>
              <ul class="mt-2">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </v-alert>
          </v-col>
          
          <v-col cols="12" class="">
            <v-row>
              <!-- ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ -->
              <v-col cols="12">
                <v-card variant="outlined" class="" style="border: 2px solid #4caf50">
                  <v-card-title class="text-h6 pb-2 bg-success">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="4">
                        <GlobalCardTitle
                          :title="'ລາຍການປະເພດຊັບສົມບັດຍອ່ຍ'"
                          :text="response?.asset_list_id?.toString() ?? 'ບໍ່ມີຂໍ້ມູນ'"
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
                        <label>ລາຍລະອຽດຄຸນລັກສະນະ<span class="text-error">*</span></label>
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

              <!-- ສະຖານະແລະການຮັບປະກັນ -->
              <v-col cols="12">
                <v-card variant="outlined" class="" style="border: 2px solid #ffc107">
                  <v-card-title class="text-h6 pb-2 bg-warning text-dark">
                    <v-icon class="mr-2">mdi-shield-check</v-icon>
                    ສະຖານະແລະການຮັບປະກັນ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຊັບສິນ'"
                          :text="formatCurrency(response?.asset_value || '0', response?.asset_currency || '')"
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
                          :text="response?.asset_date?.toString() ?? 'ບໍ່ມີຂໍ້ມູນ'"
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

              <!-- ຂໍ້ມູນການເສື່ອມລາຄາ -->
              <v-col cols="12">
                <v-card variant="outlined" class="mb-6" style="border: 2px solid #9c27b0">
                  <v-card-title class="text-h6 pb-2 bg-purple text-white">
                    <v-icon class="mr-2">mdi-calculator</v-icon>
                    ຂໍ້ມູນການຫຼູຍຫຽ້ນລາຄາ
                  </v-card-title>
                  <v-card-text class="pt-4">
                    <v-row>
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ວິທີຫັກຄ່າຫຼຸຍຫຽ້ນ'"
                          :text="getDepreciationMethodName(response?.dpca_type || '')"
                        />
                        <div class="mb-3">
                          <label class="text-caption text-grey-darken-1">ວິທີການຄຳນວນ:</label>
                          <div class="text-caption bg-blue-lighten-5 pa-2 rounded">
                            {{ getDepreciationMethodDescription(response?.dpca_type || '') }}
                          </div>
                        </div>
                        <GlobalCardTitle
                          :title="'ອາຍຸການໃຊ້ງານ (ປີ)'"
                          :text="response?.asset_useful_life?.toString() ?? '0'"
                        />
                        <GlobalCardTitle
                          :title="'ອັດຕາຄ່າຫຼູຍຫຽ້ນລາຄາ (%)'"
                          :text="response?.dpca_percentage?.toString() ?? '0'"
                        />
                        
                        <label>ວັນທີ່ເລີ່ມຄິດລາຄາຫຼູ້ຍຫຽ້ນ</label>
                        <v-text-field
                          :value="depreciationCalculator?.startDate ?? response?.dpca_start_date ?? ''"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          :disabled="true"
                        />
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ປະເພດການຊຳລະ'"
                          :text="response?.type_of_pay_detail.MC_name_la"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຕໍ່ເດືອນ'"
                          :text="formatCurrency(depreciationCalculator?.monthlyDepreciation || response?.asset_value_remainMonth || '0', response?.asset_currency || '')"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຄົງເຫຼືອ'"
                          :text="formatCurrency(response?.asset_value_remain || '0', response?.asset_currency || '')"
                        />
                        
                        <label>ວັນທີ່ສິ້ນສຸດການລາຄາຫຼູຍຫຽ້ນ</label>
                        <v-text-field
                          :value="depreciationCalculator?.endDate ?? response?.dpca_end_date ?? ''"
                          type="date"
                          density="compact"
                          variant="outlined"
                          hide-details="auto"
                          readonly
                          hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                          :disabled="true"
                        />
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <GlobalCardTitle :title="'ເລກບັນຊີ/DR'" :text="'N/A'" />
                        <GlobalCardTitle 
                          :title="'ມູນຄ່າຕັ້ນ'" 
                          :text="formatCurrency(response?.asset_value || '0', response?.asset_currency || '')" 
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຫຼູ້ຍຫຽ້ນລາຄາສະສົມ'"
                          :text="formatCurrency(response?.asset_accu_dpca_value || '0', response?.asset_currency || '')"
                        />
                        <GlobalCardTitle
                          :title="'ວັນທີ່ຖອນຈຳໜ່າຍຊັບສົມບັດ'"
                          :text="response?.asset_disposal_date ?? 'ຍັງບໍ່ໄດ້ຖອນ'"
                        />
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <GlobalCardTitle
                          :title="'ເລກບັນຊີ/CR'"
                          :text="response?.acc_no ?? ''"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າຊາກ'"
                          :text="formatCurrency(response?.asset_salvage_value || '0', response?.asset_currency || '')"
                        />
                        <GlobalCardTitle
                          :title="'ມູນຄ່າທ້າຍ'"
                          :text="formatCurrency(response?.asset_value_remainLast || '0', response?.asset_currency || '')"
                        />
                        <GlobalCardTitle
                          :title="'ວັນທີ່ຫຼູຍຫຽ້ນລາຄາຄັ້ງລາສຸດ'"
                          :text="response?.asset_latest_date_dpca ?? 'ຍັງບໍ່ໄດ້ຫຼູຍຫຽ້ນ'"
                        />
                      </v-col>
                    </v-row>

                    <!-- Progress Bar -->
                    <v-row class="mt-4" v-if="depreciationProgress > 0">
                      <v-col cols="12">
                        <div class="mb-2">
                          <label class="text-subtitle-2">ສະຖານະການຫຼູຍຫຽ້ນລາຄາ</label>
                        </div>
                        <v-progress-linear
                          :model-value="depreciationProgress"
                          height="20"
                          :color="depreciationProgress < 50 ? 'success' : depreciationProgress < 80 ? 'warning' : 'error'"
                          rounded
                        >
                          <template v-slot:default="{ value }">
                            <strong class="text-white">{{ Math.ceil(value) }}%</strong>
                          </template>
                        </v-progress-linear>
                        <div class="text-caption mt-1 text-grey-darken-1">
                          ຫຼູຍຫຽ້ນລາຄາແລ້ວ {{ formatCurrency(response?.asset_accu_dpca_value || '0', response?.asset_currency || '') }} 
                          ຈາກທັງໝົດ {{ formatCurrency(depreciationCalculator?.totalDepreciableAmount || '0', response?.asset_currency || '') }}
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- ສະຫຼຸບການຄຳນວນ -->
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
                            {{ formatCurrency(depreciationSummary.totalDepreciation, response?.asset_currency || '') }}
                          </div>
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນທັງໝົດ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-green-lighten-5">
                          <div class="text-h6 text-green-darken-2">
                            {{ formatCurrency(depreciationSummary.averageAnnualDepreciation, response?.asset_currency || '') }}
                          </div>
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນສະເລ່ຍຕໍ່ປີ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-orange-lighten-5">
                          <div class="text-h6 text-orange-darken-2">
                            {{ formatCurrency(depreciationSummary.highestDepreciation, response?.asset_currency || '') }}
                          </div>
                          <div class="text-caption">ຄ່າຫຼູຍຫຽ້ນສູງສຸດ</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-card class="pa-3 text-center bg-purple-lighten-5">
                          <div class="text-h6 text-purple-darken-2">
                            {{ formatCurrency(depreciationSummary.finalBookValue, response?.asset_currency || '') }}
                          </div>
                          <div class="text-caption">ມູນຄ່າສຸດທ້າຍ</div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- ຕາລາງເສື່ອມລາຄາ -->
              <v-col cols="12" v-if="depreciationSchedule.length > 0">
                <v-card variant="outlined" style="border: 2px solid #2196f3">
                  <v-card-title class="text-h6 pb-2 bg-blue-lighten-5">
                    <v-icon class="mr-2">mdi-table</v-icon>
                    ຕາລາງແຜນການຫຼູຍຫຽ້ນລາຄາ
                   
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
                    
                    <!-- Summary Row -->
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
                          :value="unitsOfProduction.totalExpectedUnits / (parseInt(response?.asset_useful_life || '1'))"
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
                          v-for="(usage, index) in unitsOfProduction.yearlyUsage"
                          :key="index"
                        >
                          <v-text-field
                            v-model.number="unitsOfProduction.yearlyUsage[index]"
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

              <!-- Action Buttons -->
              <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="goBack"
                  class="mr-2 mb-2"
                  :disabled="assetStore.isLoading"
                  prepend-icon="mdi-arrow-left"
                >
                  ກັບຄືນ
                </v-btn>
                
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="printReport"
                  class="mr-2 mb-2"
                  prepend-icon="mdi-printer"
                >
                  ພິມລາຍງານ
                </v-btn>

                <v-btn
                  color="success"
                  variant="outlined"
                  @click="exportToExcel"
                  class="mr-2 mb-2"
                  prepend-icon="mdi-download"
                >
                  ດາວໂຫຼດ Excel
                </v-btn>

                <v-btn
                  color="primary"
                  @click="saveCalculation"
                  class="mb-2"
                  prepend-icon="mdi-content-save"
                >
                  ບັນທຶກການຄຳນວນ
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

/* Enhanced table styling */
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

/* Progress bar styling */
.v-progress-linear {
  border-radius: 10px;
  overflow: hidden;
}

/* Card hover effects */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Button styling */
.v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 6px;
}

/* Alert styling */
.v-alert {
  border-radius: 8px;
}

/* Custom chip styling */
.v-chip {
  font-weight: 600;
}

/* Summary cards styling */
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

/* Responsive design improvements */
@media (max-width: 768px) {
  .v-data-table {
    font-size: 12px;
  }
  
  .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Print styles */
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