<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const faAssetStoreInstance = faAssetStore();
const res = computed(() => {
  return faAssetStoreInstance.response_fa_asset_detail;
});
const route = useRoute();

const router = useRouter();

const asset_id = route.query.id_faasset as string;
onMounted(() => {
  faAssetStoreInstance.GetFaAssetDetail(asset_id);
});
const title = ref("ລາຍລະອຽດຊັບສົມບັດຄົງທີ່");
const loading = ref(false);


const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};


const formatCurrency = (value, currency = 'LAK') => {
  const formatted = formatNumber(value);
  const symbols = {
    'LAK': '₭',
    'USD': '$',
    'THB': '฿'
  };
  return `${formatted} ${symbols[currency] || '₭'}`;
};


const getStatusText = (status) => {
  const statusMap = {
    'UC': 'ພວມຊື້ພວມກໍ່ສ້າງ',
    'AC': 'ໃຊ້ງານຢູ່ ',
    'IA': 'ປິດໃຊ້ງານ',
    'MT': 'ບໍາລຸງຮັກສາ',
    'DS': 'ຖອນຈຳໜ່າຍ',
    'DM': 'ເສຍຫາຍ'
  };
  return statusMap[status] || status;
};


const getDepreciationType = (type) => {
  const typeMap = {
    'SL': 'ເສັ້ນຊື່ (Straight Line)',
    'DL': 'ຍອດລົດລົງ (Declining Balance)',
    'PU': 'ຕາມໜ່ວຍພະລິດ (Units of Production)'
  };
  return typeMap[type] || type;
};
</script>

<template>
  <div class="pa-2">
    <v-col cols="12">
      <GlobalTextTitleLine :title="title" />
    </v-col>
    
   
    <v-row>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ລະຫັດຊັບສິນ'" :text="res?.asset_list_id" />
        <GlobalCardTitle :title="'ສະຖານທີ່'" :text="res?.supplier_detail?.supplier_name || 'ບໍ່ລະບຸ'" />
        <GlobalCardTitle :title="'ລຳດັບ'" :text="res?.asset_list_code" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ລາຍການຊັບສິນ'" :text="res?.asset_id_detail?.asset_name_la" />
        <GlobalCardTitle :title="'ລາຍລະອຽດ'" :text="res?.asset_spec || 'ບໍ່ລະບຸ'" />
        <GlobalCardTitle :title="'ວັນທີ່ຊື້'" :text="res?.asset_date" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ຊີລຽ້ວນໍ້ເບີ້'" :text="res?.asset_serial_no" />
        <GlobalCardTitle :title="'ສະຖານະ'" :text="getStatusText(res?.asset_status)" />
        <GlobalCardTitle :title="'ສະກຸນເງິນ'" :text="res?.asset_currency" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ເລກ Tag'" :text="res?.asset_tag" />
        <GlobalCardTitle :title="'ຜູ້ສະໜອງ'" :text="res?.supplier_detail?.supplier_name" />
        <GlobalCardTitle :title="'ເລກບັນຊີ'" :text="res?.acc_no || 'ບໍ່ລະບຸ'" />
      </v-col>
    </v-row>

  
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="outlined" style="border: 2px solid #2196F3">
          <v-card-title class="text-h6 pb-2" style="background-color: #E3F2FD;">
            <v-icon class="mr-2">mdi-currency-usd</v-icon>
            ຂໍ້ມູນການເງິນ
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ມູນຄ່າເລີ່ມຕົ້ນ'" :text="formatCurrency(res?.asset_value, res?.asset_currency)" />
                <GlobalCardTitle :title="'ມູນຄ່າຊາກ'" :text="formatCurrency(res?.asset_salvage_value, res?.asset_currency)" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ມູນຄ່າຕົ້ນ'" :text="formatCurrency(res?.asset_value_remainBegin, res?.asset_currency)" />
                <GlobalCardTitle :title="'ມູນຄ່າຄົງເຫຼືອ'" :text="formatCurrency(res?.asset_value_remain, res?.asset_currency)" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ເສື່ອມລາຄາສະສົມ'" :text="formatCurrency(res?.asset_accu_dpca_value, res?.asset_currency)" />
                <GlobalCardTitle :title="'ມູນຄ່າຕໍ່ເດືອນ'" :text="formatCurrency(res?.asset_value_remainMonth, res?.asset_currency)" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ມູນຄ່າທ້າຍ'" :text="formatCurrency(res?.asset_value_remainLast, res?.asset_currency)" />
                <GlobalCardTitle :title="'ປະເພດການຊຳລະ'" :text="res?.type_of_pay" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    
    <v-row class="mt-4" v-if="res?.has_depreciation === 'Y'">
      <v-col cols="12">
        <v-card variant="outlined" style="border: 2px solid #9C27B0">
          <v-card-title class="text-h6 pb-2" style="background-color: #F3E5F5;">
            <v-icon class="mr-2">mdi-calculator</v-icon>
            ຂໍ້ມູນການເສື່ອມລາຄາ
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວິທີຄິດເສື່ອມລາຄາ'" :text="getDepreciationType(res?.dpca_type)" />
                <GlobalCardTitle :title="'ອາຍຸການໃຊ້ງານ'" :text="`${res?.asset_useful_life} ປີ`" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ອັດຕາເສື່ອມລາຄາ'" :text="`${res?.dpca_percentage}%`" />
                <GlobalCardTitle :title="'ວັນທີ່ເລີ່ມຄິດ'" :text="res?.dpca_start_date" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວັນທີ່ສິ້ນສຸດ'" :text="res?.dpca_end_date" />
                <GlobalCardTitle :title="'ວັນທີ່ເສື່ອມລາຄາຄັ້ງລາສຸດ'" :text="res?.asset_latest_date_dpca" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວັນທີ່ຖອນຈຳໜ່າຍ'" :text="res?.asset_disposal_date || 'ຍັງບໍ່ຖອນ'" />
                <GlobalCardTitle :title="'ມີການຮັບປະກັນ'" :text="res?.asset_ac_yesno === 'Y' ? 'ມີ' : 'ບໍ່ມີ'" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

   
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="outlined" style="border: 2px solid #4CAF50">
          <v-card-title class="text-h6 pb-2" style="background-color: #E8F5E8;">
            <v-icon class="mr-2">mdi-information</v-icon>
            ຂໍ້ມູນລະບົບ
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ສະຖານະບັນທຶກ'" :text="res?.Record_Status === 'C' ? 'ສຳເລັດ' : 'ລໍຖ້າ'" />
                <GlobalCardTitle :title="'ຜູ້ສ້າງ'" :text="res?.Maker_Id" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວັນທີ່ສ້າງ'" :text="res?.Maker_DT_Stamp?.split('T')[0]" />
                <GlobalCardTitle :title="'ຜູ້ກວດສອບ'" :text="res?.Checker_Id || 'ຍັງບໍ່ກວດສອບ'" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວັນທີ່ກວດສອບ'" :text="res?.Checker_DT_Stamp?.split('T')[0] || 'ຍັງບໍ່ກວດສອບ'" />
                <GlobalCardTitle :title="'ຜູ້ຮັບປະກັນ'" :text="res?.asset_ac_by || 'ບໍ່ລະບຸ'" />
              </v-col>
              <v-col cols="12" md="3">
                <GlobalCardTitle :title="'ວັນທີ່ຮັບປະກັນສິ້ນສຸດ'" :text="res?.warranty_end_date || 'ບໍ່ມີ'" />
                <GlobalCardTitle :title="'ວັນທີ່ຮັບປະກັນ'" :text="res?.asset_ac_date || 'ບໍ່ມີ'" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  
  </div>
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-timeline-item {
  min-height: 60px;
}

.v-card-title {
  word-break: break-word;
}

.d-flex.gap-2 > * {
  margin-right: 8px;
}

.d-flex.gap-2 > *:last-child {
  margin-right: 0;
}
</style>