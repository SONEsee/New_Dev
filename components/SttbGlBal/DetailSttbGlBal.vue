<script setup lang="ts">
const title = "ຂໍ້ມູນລາຍລະອຽດຍອດເຫຼືອບັນຊີ GL Balance";


const glBalanceData = ref({
  GL_BAL_ID: 1,
  GL_CODE: "1001001",
  CCY_CODE: "USD",
  FIN_YEAR: "2024-2025",
  PERIOD_CODE: "03",
  CATEGORY: "1",
  DR_MOV: 50000.00,
  CR_MOV: 5000.00,
  DR_MOV_LCY: 950000000.00,
  CR_MOV_LCY: 95000000.00,
  DR_BAL: 45000.00,
  CR_BAL: 0.00,
  DR_BAL_LCY: 855000000.00,
  CR_BAL_LCY: 0.00,
  OPEN_DR_BAL: 30000.00,
  OPEN_CR_BAL: 0.00,
  OPEN_DR_BAL_LCY: 570000000.00,
  OPEN_CR_BAL_LCY: 0.00
});

const formatNumber = (value:any) => {
  if (!value || value === 0) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const getCategoryText = (category:any) => {
  const texts = {
    '1': 'Asset (ຊັບສິນ)',
    '2': 'Liability (ໜີ້ສິນ)', 
    '3': 'Capital (ທຶນ)',
    '4': 'Expense (ຄ່າໃຊ້ຈ່າຍ)',
    '5': 'Income (ລາຍໄດ້)',
    '6': 'Position (ຕຳແໜ່ງ)',
    '7': 'Position Equivalent (ຕຳແໜ່ງເທົ່າທຽມ)'
  };
  return   'ບໍ່ຮູ້ຈັກ';
};

const getMonthText = (period:any) => {
  const months = {
    '01': 'ມັງກອນ', '02': 'ກຸມພາ', '03': 'ມີນາ', 
    '04': 'ເມສາ', '05': 'ພຶດສະພາ', '06': 'ມິຖຸນາ',
    '07': 'ກໍລະກົດ', '08': 'ສິງຫາ', '09': 'ກັນຍາ',
    '10': 'ຕຸລາ', '11': 'ພະຈິກ', '12': 'ທັນວາ'
  };
  return  period;
};

const getCurrencyName = (code:any) => {
  const currencies = {
    'LAK': 'ກີບລາວ',
    'USD': 'ໂດລາສະຫະລັດ',
    'THB': 'ບາດໄທ',
    'EUR': 'ເອີໂຣ',
    'JPY': 'ເຢນຍີ່ປຸ່ນ',
    'CNY': 'ຫຍວນຈີນ',
    'VND': 'ດົງຫວຽດນາມ'
  };
  return  code;
};
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon icon="mdi-information" class="mr-2" />
            ຂໍ້ມູນຫຼັກ GL Balance
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="info-item mb-3">
                  <strong class="text-primary">ລະຫັດບັນຊີ GL:</strong>
                  <div class="ml-4 text-h6">{{ glBalanceData.GL_CODE }}</div>
                </div>
                <div class="info-item mb-3">
                  <strong class="text-primary">ສະກຸນເງິນ:</strong>
                  <div class="ml-4">
                    <v-chip color="primary" text-color="white" size="small" class="mr-2">
                      {{ glBalanceData.CCY_CODE }}
                    </v-chip>
                    {{ getCurrencyName(glBalanceData.CCY_CODE) }}
                  </div>
                </div>
                <div class="info-item mb-3">
                  <strong class="text-primary">ຮອບວຽນບັນຊີຂອງປີ:</strong>
                  <div class="ml-4 text-h6">{{ glBalanceData.FIN_YEAR }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="info-item mb-3">
                  <strong class="text-primary">ຮອບວຽນບັນຊີຂອງເດືອນ:</strong>
                  <div class="ml-4">
                    <v-chip color="success" text-color="white" size="small" class="mr-2">
                      {{ glBalanceData.PERIOD_CODE }}
                    </v-chip>
                    {{ getMonthText(glBalanceData.PERIOD_CODE) }}
                  </div>
                </div>
                <div class="info-item mb-3">
                  <strong class="text-primary">ປະເພດໜວດບັນຊີ:</strong>
                  <div class="ml-4">
                    <v-chip color="orange" text-color="white" size="small" class="mr-2">
                      {{ glBalanceData.CATEGORY }}
                    </v-chip>
                    {{ getCategoryText(glBalanceData.CATEGORY) }}
                  </div>
                </div>
                <div class="info-item mb-3">
                  <strong class="text-primary">ID ບັນທຶກ:</strong>
                  <div class="ml-4 text-body-2 text-grey"># {{ glBalanceData.GL_BAL_ID }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="pa-3" color="blue-lighten-5" elevation="1">
                  <v-card-title class="text-subtitle-1 text-blue">ສະຫຼຸບຍອດເຫຼືອ</v-card-title>
                  <div class="text-center">
                    <div class="text-body-2 text-grey mb-1">ຍອດເຫຼືອສຸດທິ (ກີບ)</div>
                    <div class="text-h5 font-weight-bold" :class="(glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY) >= 0 ? 'text-red' : 'text-green'">
                      {{ formatNumber(Math.abs(glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY)) }} ₭
                    </div>
                    <div class="text-caption" :class="(glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY) >= 0 ? 'text-red' : 'text-green'">
                      {{ (glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY) >= 0 ? 'ດີບິດ' : 'ເຄຣດິດ' }}
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

 
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-success text-white">
            <v-icon icon="mdi-swap-horizontal" class="mr-2" />
            ຍອດການເຄື່ອນໄຫວພາຍໃນເດືອນ
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-orange">ສະກຸນເງິນຕ່າງປະເທດ ({{ glBalanceData.CCY_CODE }})</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" color="red-lighten-5" elevation="1">
                      <div class="text-body-2 text-red mb-1">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold text-red">
                        {{ formatNumber(glBalanceData.DR_MOV) }}
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" color="green-lighten-5" elevation="1">
                      <div class="text-body-2 text-green mb-1">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold text-green">
                        {{ formatNumber(glBalanceData.CR_MOV) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-purple">ສະກຸນກີບລາວ (LAK)</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" color="red-lighten-5" elevation="1">
                      <div class="text-body-2 text-red mb-1">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold text-red">
                        {{ formatNumber(glBalanceData.DR_MOV_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" color="green-lighten-5" elevation="1">
                      <div class="text-body-2 text-green mb-1">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold text-green">
                        {{ formatNumber(glBalanceData.CR_MOV_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

   
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-info text-white">
            <v-icon icon="mdi-account-balance" class="mr-2" />
            ຍອດເຫຼືອປັດຈຸບັນ
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-orange">ສະກຸນເງິນຕ່າງປະເທດ ({{ glBalanceData.CCY_CODE }})</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.DR_BAL > 0 ? 'red-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.DR_BAL > 0 ? 'text-red' : 'text-grey'">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.DR_BAL > 0 ? 'text-red' : 'text-grey'">
                        {{ formatNumber(glBalanceData.DR_BAL) }}
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.CR_BAL > 0 ? 'green-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.CR_BAL > 0 ? 'text-green' : 'text-grey'">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.CR_BAL > 0 ? 'text-green' : 'text-grey'">
                        {{ formatNumber(glBalanceData.CR_BAL) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-purple">ສະກຸນກີບລາວ (LAK)</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.DR_BAL_LCY > 0 ? 'red-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.DR_BAL_LCY > 0 ? 'text-red' : 'text-grey'">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.DR_BAL_LCY > 0 ? 'text-red' : 'text-grey'">
                        {{ formatNumber(glBalanceData.DR_BAL_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.CR_BAL_LCY > 0 ? 'green-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.CR_BAL_LCY > 0 ? 'text-green' : 'text-grey'">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.CR_BAL_LCY > 0 ? 'text-green' : 'text-grey'">
                        {{ formatNumber(glBalanceData.CR_BAL_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-warning text-white">
            <v-icon icon="mdi-history" class="mr-2" />
            ຍອດຍົກມາ (Opening Balance)
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-orange">ສະກຸນເງິນຕ່າງປະເທດ ({{ glBalanceData.CCY_CODE }})</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.OPEN_DR_BAL > 0 ? 'red-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.OPEN_DR_BAL > 0 ? 'text-red' : 'text-grey'">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.OPEN_DR_BAL > 0 ? 'text-red' : 'text-grey'">
                        {{ formatNumber(glBalanceData.OPEN_DR_BAL) }}
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.OPEN_CR_BAL > 0 ? 'green-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.OPEN_CR_BAL > 0 ? 'text-green' : 'text-grey'">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.OPEN_CR_BAL > 0 ? 'text-green' : 'text-grey'">
                        {{ formatNumber(glBalanceData.OPEN_CR_BAL) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3 text-purple">ສະກຸນກີບລາວ (LAK)</h4>
                <v-row>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.OPEN_DR_BAL_LCY > 0 ? 'red-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.OPEN_DR_BAL_LCY > 0 ? 'text-red' : 'text-grey'">ດີບິດ (ໜີ້)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.OPEN_DR_BAL_LCY > 0 ? 'text-red' : 'text-grey'">
                        {{ formatNumber(glBalanceData.OPEN_DR_BAL_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="pa-3 text-center" :color="glBalanceData.OPEN_CR_BAL_LCY > 0 ? 'green-lighten-5' : 'grey-lighten-4'" elevation="1">
                      <div class="text-body-2 mb-1" :class="glBalanceData.OPEN_CR_BAL_LCY > 0 ? 'text-green' : 'text-grey'">ເຄຣດິດ (ມີ)</div>
                      <div class="text-h6 font-weight-bold" :class="glBalanceData.OPEN_CR_BAL_LCY > 0 ? 'text-green' : 'text-grey'">
                        {{ formatNumber(glBalanceData.OPEN_CR_BAL_LCY) }} ₭
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

   
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="bg-purple text-white">
            <v-icon icon="mdi-calculator" class="mr-2" />
            ການຄິດໄລ່ແລະສະຫຼຸບ
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">ສູດການຄິດໄລ່:</h4>
                <div class="text-body-2 mb-2">
                  <strong>ຍອດເຫຼືອປັດຈຸບັນ</strong> = ຍອດຍົກມາ + ຍອດການເຄື່ອນໄຫວ
                </div>
                <div class="text-body-2 mb-2">
                  <strong>ດີບິດ:</strong> {{ formatNumber(glBalanceData.OPEN_DR_BAL_LCY) }} + {{ formatNumber(glBalanceData.DR_MOV_LCY) }} = {{ formatNumber(glBalanceData.DR_BAL_LCY) }} ₭
                </div>
                <div class="text-body-2 mb-2">
                  <strong>ເຄຣດິດ:</strong> {{ formatNumber(glBalanceData.OPEN_CR_BAL_LCY) }} + {{ formatNumber(glBalanceData.CR_MOV_LCY) }} = {{ formatNumber(glBalanceData.CR_BAL_LCY) }} ₭
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">ສະຖິຕິ:</h4>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-title>ຍອດການເຄື່ອນໄຫວສຸດທິ (ກີບ):</v-list-item-title>
                    <v-list-item-subtitle class="font-weight-bold">
                      {{ formatNumber(Math.abs(glBalanceData.DR_MOV_LCY - glBalanceData.CR_MOV_LCY)) }} ₭
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>ປະເພດການເຄື່ອນໄຫວ:</v-list-item-title>
                    <v-list-item-subtitle class="font-weight-bold" :class="(glBalanceData.DR_MOV_LCY - glBalanceData.CR_MOV_LCY) >= 0 ? 'text-red' : 'text-green'">
                      {{ (glBalanceData.DR_MOV_LCY - glBalanceData.CR_MOV_LCY) >= 0 ? 'ເພີ່ມຂຶ້ນທາງດີບິດ' : 'ເພີ່ມຂຶ້ນທາງເຄຣດິດ' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>ສະຖານະຍອດເຫຼືອ:</v-list-item-title>
                    <v-list-item-subtitle class="font-weight-bold" :class="(glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY) >= 0 ? 'text-red' : 'text-green'">
                      {{ (glBalanceData.DR_BAL_LCY - glBalanceData.CR_BAL_LCY) >= 0 ? 'ຍອດເຫຼືອດີບິດ' : 'ຍອດເຫຼືອເຄຣດິດ' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

   
    
  </v-col>
</template>