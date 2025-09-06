<script setup lang="ts">
const title = "ຊຳລະສະສາງຊັບສົມບັດ";
const dispalsoStore = useDispoalStore();
const faasetStore = faAssetStore();
const masterType = useMasterStore();
const employee = useEmployeeStore();
const form = ref();
const rout = useRoute();
const type = rout.query.type as string;

const dpsData = computed(()=>{
  const data = masterType.respons_data_status_dps;
  if(Array.isArray(data)){
    return data
  }if(data && typeof data ==="object"){
    return [data]
  }
  return []
})

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

const employees = computed(() => {
  const data = employee.respose_data_employee;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});

const typeData = computed(() => {
  const data = masterType.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const request = dispalsoStore.from_create_disposal;

const dataList = computed(() => {
  const data = faasetStore.response_fa_asset_list;
  let asset = [];
  if (Array.isArray(data)) {
    return (asset = data);
  } else if (data && typeof data === "object") {
    return (asset = [data]);
  } else {
    return [];
  }
  return asset.filter(
    (item) =>
      item.asset.asset_status !== "UC" ||
      item.Auth_Status === "A" ||
      item.Auth_Status_ARC === "A" ||
      item.asset.asset_status !== "DS"
  );
});

const getComparisonValue = computed(() => {
  if (!request.asset_list_id || !Array.isArray(dataList.value)) {
    return 0;
  }
  
  const selectedAsset = dataList.value.find(
    item => item.asset_list_id === request.asset_list_id
  );
  
  if (!selectedAsset) return 0;
  
  if (type === 'expired') {
    // ກໍລະນີຄົບກຳນົດ: ໃຊ້ asset_salvage_value (ມູນຄ່າຊາກ)
    return parseFloat(selectedAsset.asset_salvage_value || '0');
  } else {
    // ກໍລະນີບໍ່ຄົບກຳນົດ: asset_value - asset_accu_dpca_value
    const assetValue = parseFloat(selectedAsset.asset_value || '0');
    const accuDpca = parseFloat(selectedAsset.asset_accu_dpca_value || '0');
    return assetValue - accuDpca;
  }
});

// ສ້າງ computed property ສຳລັບດຶງ options ຈາກ dpsData
const disposalStatusOptions = computed(() => {
  if (!Array.isArray(dpsData.value) || dpsData.value.length === 0) {
    return [];
  }
  
  // ກັ່ນຕອງຕາມປະເພດ (expired ຫຼື not_expired)
  const filteredData = dpsData.value.filter(item => {
    if (type === 'expired') {
      // ສຳລັບຄົບກຳນົດ: DPS01, DPS02, DPS03, DPS04
      return ['DPS01', 'DPS02', 'DPS03', 'DPS04'].includes(item.MC_code);
    } else {
      // ສຳລັບບໍ່ຄົບກຳນົດ: DPS05, DPS06, DPS07, DPS08
      return ['DPS05', 'DPS06', 'DPS07', 'DPS08'].includes(item.MC_code);
    }
  });
  
  return filteredData.map(item => ({
    title: item.MC_name_la,
    value: item.MC_code,
    detail: item.MC_detail,
    bol_code: item.BOL_code
  }));
});

// ອັບເດດ calculateGainLoss ເພື່ອໃຊ້ logic ທີ່ສາມາດ map ກັບ DPS codes
const calculateGainLoss = computed(() => {
  const proceeds = parseFloat(request.disposal_proceeds || '0');
  const comparisonValue = getComparisonValue.value;
  
  // ກວດສອບວ່າມີຂໍ້ມູນພຽງພໍ່ບໍ່
  if (!request.asset_list_id || proceeds === 0) {
    return {
      status: '',
      label: 'ກະລຸນາເລືອກຊັບສິນ ແລະ ໃສ່ລາຍຮັບຈາກການຂາຍ',
      color: 'info'
    };
  }
  
  if (type === 'expired') {
    // ກໍລະນີຄົບກຳນົດ: ທຽບກັບ asset_salvage_value (ມູນຄ່າຊາກ)
    if (proceeds > comparisonValue) {
      return {
        status: 'DPS02', // ກຳໄລ
        label: 'ຊັບສົມບັດຄົງທີ່ຄົບອາຍຸ ແລະຂາຍໄດ້ກຳໄລ',
        color: 'success'
      };
    } else if (proceeds === comparisonValue) {
      return {
        status: 'DPS01', // ເທົ່າທຶນ
        label: 'ຊັບສົມບັດຄົງທີ່ ຄົບອາຍຸ ແລະ ຂາຍໄດ້ເທົ່າທຶນ',
        color: 'warning'
      };
    } else {
      return {
        status: 'DPS03', // ຂາດທຶນ
        label: 'ຊັບສົມບັດຄົງທີ່ຄົບອາຍຸ ແລະ ຂາຍຂາດທຶນ',
        color: 'error'
      };
    }
  } else {
    // ກໍລະນີບໍ່ຄົບກຳນົດ: ທຽບກັບ (asset_value - asset_accu_dpca_value)
    if (proceeds > comparisonValue) {
      return {
        status: 'DPS06', // ກຳໄລ
        label: 'ສະສາງບໍ່ຄົບກຳນົດມີກຳໄລ',
        color: 'success'
      };
    } else if (proceeds === comparisonValue) {
      return {
        status: 'DPS05', // ເທົ່າທຶນ
        label: 'ສະສາງບໍ່ຄົບກຳນົດເທົ່າທຶນ',
        color: 'warning'
      };
    } else {
      return {
        status: 'DPS07', // ຂາດທຶນ
        label: 'ສະສາງບໍ່ຄົບກຳນົດຂາດທຶນ',
        color: 'error'
      };
    }
  }
});

// ເພີ່ມ method ສຳລັບກໍລະນີທີ່ user ເລືອກວ່າບໍ່ຂາຍ
const handleNonSaleDisposal = () => {
  if (type === 'expired') {
    request.gain_loss = 'DPS04';
  } else {
    request.gain_loss = 'DPS08';
  }
  // ຖ້າບໍ່ຂາຍ ກໍໃຫ້ clear disposal_proceeds
  request.disposal_proceeds = '0';
};

// ອັບເດດ watch ເພື່ອຮອງຮັບກໍລະນີທີ່ບໍ່ມີການຂາຍ ແລະ ສະແດງຂໍ້ມູນການຄິດໄລ່
watch([() => request.disposal_proceeds, () => request.asset_list_id], () => {
  if (request.asset_list_id) {
    if (request.disposal_proceeds && parseFloat(request.disposal_proceeds) > 0) {
      // ມີການຂາຍ - auto assign ສະຖານະຕາມການຄິດໄລ່
      const result = calculateGainLoss.value;
      if (result.status) {
        request.gain_loss = result.status;
      }
    } else {
      // ຖ້າບໍ່ມີ disposal_proceeds ຫຼື = 0 ກໍ່ clear gain_loss
      request.gain_loss = '';
    }
  }
}, { immediate: true });

const handelSubmit = async () => {
  try {
    const isValid = form.value.validate();
    if (isValid) {
      const notification = await CallSwal({
        icon: "warning",
        title: "ຄຳເຕືອນ",
        text: `ທ່ານກຳລັງຈະເພີ່ມລາຍການສ່າງ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });
      if (notification.isConfirmed) {
        await dispalsoStore.CreateDispalso();
      }
    }
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    });
  }
};

watch(
  () => rout.query.asset_list_id,
  (newValue) => {
    if (newValue) {
      request.asset_list_id = newValue as any;
    }
  },
  { immediate: true }
);

onMounted(() => {
  masterType.getDT();
  faasetStore.GetFaAssetList();
  employee.GetEmployee();
  masterType.getEP();
  masterType.getDPS();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    
    <v-form ref="form" @submit.prevent="handelSubmit">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-end aling-end">
            <p>
              ສະຖານະ:
              <v-chip v-if="type === 'not_expired'" color="error">
                ບໍ່ຄົບກຳນົດການໃຊ້ງານ</v-chip
              >
              <v-chip v-if="type === 'expired'" color="success">
                ຄົບກຳນົດການໃຊ້ງານ</v-chip
              >
            </p>
          </div>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="request.asset_list_id"
            label="ລາຍການຊັບສີນ"
            :items="dataList"
            item-title="asset_spec"
            item-value="asset_list_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.asset_spec}(${item.raw.asset_list_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          
          <v-autocomplete
            v-model="request.disposal_type"
            label="ປະເພດການຊຳລະສະສາງ"
            :items="typeData"
            item-title="MC_name_la"
            item-value="MC_code"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.MC_name_la}(${item.raw.MC_code})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_cost"
            label="ຄ່າໃຊ້ຈ່າຍໃນການຖອນ"
            type="number"
          >
          </v-text-field>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_purpose"
            label="ຈຸດປະສົງການຖອນ"
          >
          </v-text-field>
          
          <v-text-field
            v-model="request.disposal_value"
            label="ມູນຄ່າການຖອນ"
            variant="outlined"
            density="compact"
            type="number"
          >
          </v-text-field>
          
          <v-autocomplete
            v-model="request.gain_loss"
            label="ສະຖານະການຖອນ"
            :items="disposalStatusOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.title"
                :subtitle="`Code: ${item.raw.value} | BOL: ${item.raw.bol_code}`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          
          <!-- ເພີ່ມປຸ່ມສຳລັບກໍລະນີບໍ່ຂາຍ -->
          <div class="mt-2">
            <v-btn 
              v-if="type === 'expired'"
              @click="handleNonSaleDisposal"
              variant="outlined"
              color="warning"
              size="small"
              block
            >
              ສະສາງແບບບໍ່ໄດ້ຂາຍອອກ
            </v-btn>
            <v-btn 
              v-if="type === 'not_expired'"
              @click="handleNonSaleDisposal"
              variant="outlined"
              color="warning"
              size="small"
              block
            >
              ສະສາງໂດຍບໍ່ໄດ້ຂາຍ (ເປ້ເພ/ຖິ້ມ)
            </v-btn>
          </div>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_reason"
            label="ເຫດຜົນການຖອນ"
          >
          </v-text-field>
          
          <v-autocomplete
            v-model="request.disposal_by"
            label="ຜູ້ຖອນ"
            :items="employees"
            item-title="employee_name_la"
            item-value="employee_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.employee_name_la}(${item.raw.employee_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          
          <v-text-field
            type="date"
            variant="outlined"
            density="compact"
            v-model="request.disposal_date"
            label="ວັນທີ່ຖອນ"
          >
          </v-text-field>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.buyer_name"
            label="ຊື່ຜູ້ຊື້ (ກໍລະນີຂາຍ)"
          >
          </v-text-field>
          
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_proceeds"
            label="ລາຍຮັບຈາກການຂາຍ"
            type="number"
          >
          </v-text-field>
          
          <!-- ສະແດງຄ່າທີ່ໃຊ້ໃນການທຽບໃນການຄິດໄລ່ ແລະ ສະຖານະປະຈຸບັນ -->
          <div v-if="request.asset_list_id" class="mt-2">
            <v-card variant="outlined" density="compact">
              <v-card-text class="py-2">
                <div class="text-caption mb-1">
                  <strong>ຂໍ້ມູນການຄິດໄລ່:</strong>
                </div>
                <div class="text-caption">
                  ມູນຄ່າທີ່ໃຊ້ທຽບ: 
                  <span class="font-weight-bold text-primary">
                    {{ new Intl.NumberFormat('en-US').format(getComparisonValue) }} LAK
                  </span>
                  <span class="text-grey" style="font-size: 10px;">
                    {{ type === 'expired' ? '(ມູນຄ່າຊາກ)' : '(ມູນຄ່າຄົງເຫຼືອ)' }}
                  </span>
                </div>
                <div class="text-caption">
                  ລາຍຮັບຈາກການຂາຍ: 
                  <span class="font-weight-bold text-secondary">
                    {{ new Intl.NumberFormat('en-US').format(parseFloat(request.disposal_proceeds || '0')) }} LAK
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </div>
          
          <v-alert
            v-if="request.asset_list_id && request.disposal_proceeds && parseFloat(request.disposal_proceeds) > 0"
            :color="calculateGainLoss.color"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            <div class="text-caption">
              <strong>ສະຖານະການຄິດໄລ່:</strong><br>
              {{ calculateGainLoss.label }}
            </div>
          </v-alert>
        </v-col>
      </v-row>
      
      <v-col cols="12">
        <div class="d-flex justify-center">
          <v-btn type="submit" color="primary">ບັນທຶກ</v-btn>
          <v-btn
            type="button"
            color="error"
            class="ml-2"
            @click="goPath(`/property/dispalso/`)"
          >
            ຍົກເລີກ
          </v-btn>
        </div>
      </v-col>
    </v-form>
  </div>
</template>