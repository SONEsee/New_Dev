<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const accountMethodStoreInstance = accountMethodStore();
const route = useRoute();
const router = useRouter();

const mapping_id = route.query.mapping_id as string;

const title = ref("ລາຍລະອຽດຕັ້ງຄ່າບັນທຶກບັນຊີຊັບສົມບັດ");
const loading = ref(false);

const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();

const goBack = () => {
  router.go(-1);
};

const editAccountMethod = () => {
  router.push(`/account-methods/edit/?mapping_id=${mapping_id}`);
};

onMounted(() => {
  if (mapping_id) {
    loadAccountMethodDetail();
  }
  initializeRole();
});

const loadAccountMethodDetail = async () => {
  loading.value = true;
  try {
    await accountMethodStoreInstance.GetAccountMethodDetail(mapping_id);
  } catch (error) {
    console.error("Error loading account method detail:", error);
  } finally {
    loading.value = false;
  }
};

const accountMethodData = computed(() => {
  return accountMethodStoreInstance.response_account_method_detail;
});

const formatDate = (date: Date | string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatDateOnly = (date: Date | string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
  }).format(value);
};

const getAccountTypeText = (type: string) => {
  const typeMap = {
    'ASSET': 'ຊັບສົມບັດ',
    'DEPRECIATION': 'ເສື່ອມລາຄາ',
    'DISPOSAL': 'ຖອນຈຳໜ່າຍ'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getAccountTypeColor = (type: string) => {
  const colorMap = {
    'ASSET': 'success',
    'DEPRECIATION': 'warning',
    'DISPOSAL': 'error'
  };
  return colorMap[type as keyof typeof colorMap] || 'grey';
};

const getAccountTypeIcon = (type: string) => {
  const iconMap = {
    'ASSET': 'mdi-treasure-chest',
    'DEPRECIATION': 'mdi-trending-down',
    'DISPOSAL': 'mdi-delete'
  };
  return iconMap[type as keyof typeof iconMap] || 'mdi-help-circle';
};

const getStatusText = (status: string) => {
  return status === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ';
};

const getStatusColor = (status: string) => {
  return status === 'O' ? 'success' : 'error';
};

const getStatusIcon = (status: string) => {
  return status === 'O' ? 'mdi-check-circle' : 'mdi-close-circle';
};


const getAccountName = (accountId: string) => {
  const accounts = {
    '1441001': 'ຊັບສົມບັດຄົງທີ່ - ເຄື່ອງຈັກ',
    '1442001': 'ຄ່າເສື່ອມລາຄາສະສົມ - ເຄື່ອງຈັກ',
    '5551001': 'ຄ່າເສື່ອມລາຄາ - ເຄື່ອງຈັກ',
    '1101100': 'ເງິນສົດໃນມື',
    '4551001': 'ກຳໄລຈາກການຂາຍຊັບສົມບັດ',
    '5551002': 'ຂາດທຶນຈາກການຂາຍຊັບສົມບັດ',
  };
  return accounts[accountId as keyof typeof accounts] || `ບັນຊີ ${accountId}`;
};
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

   
      <v-col cols="12" class="pb-0">
        <div class="d-flex justify-space-between align-center">
          <v-btn color="grey" variant="outlined" @click="goBack" prepend-icon="mdi-arrow-left">
            ກັບຄືນ
          </v-btn>
          <div v-if="accountMethodData && !loading" class="d-flex gap-2">
            <v-btn v-if="canEdit" color="primary" @click="editAccountMethod" prepend-icon="mdi-pencil">
              ແກ້ໄຂ
            </v-btn>
            <v-btn color="info" variant="outlined" prepend-icon="mdi-file-document">
              ສ້າງ Journal Entry
            </v-btn>
          </div>
        </div>
      </v-col>

      <v-col cols="12" class="pt-6">
      
        <v-card v-if="loading" class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey-darken-1">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </v-card-text>
        </v-card>

       
        <v-card v-else-if="accountMethodData" class="elevation-2 rounded-lg">
      
          <v-card-title class="bg-primary text-white pa-6">
            <div class="d-flex align-center w-100">
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-3" size="32">{{ getAccountTypeIcon(accountMethodData.acc_type) }}</v-icon>
                  <div>
                    <div class="text-h4 mb-1">{{ getAccountTypeText(accountMethodData.acc_type) }}</div>
                    <div class="text-h6 opacity-90">Mapping ID: {{ accountMethodData.mapping_id }}</div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <v-chip 
                  :color="getAccountTypeColor(accountMethodData.acc_type)"
                  variant="flat"
                  size="large"
                  class="mb-3"
                >
                  <v-icon start>{{ getAccountTypeIcon(accountMethodData.acc_type) }}</v-icon>
                  {{ getAccountTypeText(accountMethodData.acc_type) }}
                </v-chip>
                <div class="text-h5">{{ formatCurrency(accountMethodData.amount) }}</div>
                <div class="text-subtitle-1 opacity-90">ຍອດເງິນ</div>
              </div>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row>
         
              <v-col cols="12" lg="8">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານ
                </h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          Mapping ID
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-black">
                          {{ accountMethodData.mapping_id }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          Reference ID
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <v-chip color="secondary" variant="outlined" size="small">
                            {{ accountMethodData.ref_id }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          Asset ID
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <v-chip v-if="accountMethodData.asset_id" color="primary" variant="outlined" size="small">
                            {{ accountMethodData.asset_id }}
                          </v-chip>
                          <span v-else class="text-grey">-</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນທີ່ທຸລະກຳ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ formatDateOnly(accountMethodData.transaction_date) }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ຍອດເງິນ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-success">
                          {{ formatCurrency(accountMethodData.amount) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ບັນຊີເດບິດ (Dr)
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <div class="d-flex flex-column">
                            <v-chip color="error" variant="outlined" size="small" class="mb-1">
                              {{ accountMethodData.debit_account_id }}
                            </v-chip>
                            <span class="text-caption">{{ getAccountName(accountMethodData.debit_account_id) }}</span>
                          </div>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ບັນຊີເຄຣດິດ (Cr)
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <div class="d-flex flex-column">
                            <v-chip color="success" variant="outlined" size="small" class="mb-1">
                              {{ accountMethodData.credit_account_id }}
                            </v-chip>
                            <span class="text-caption">{{ getAccountName(accountMethodData.credit_account_id) }}</span>
                          </div>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          Journal Entry ID
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <v-chip v-if="accountMethodData.journal_entry_id" color="info" variant="outlined" size="small">
                            {{ accountMethodData.journal_entry_id }}
                          </v-chip>
                          <span v-else class="text-grey">ຍັງບໍ່ສ້າງ</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະຖານະ
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="getStatusColor(accountMethodData.record_stat)"
                            variant="flat"
                            size="small"
                          >
                            <v-icon start>{{ getStatusIcon(accountMethodData.record_stat) }}</v-icon>
                            {{ getStatusText(accountMethodData.record_stat) }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>

               
                <div v-if="accountMethodData.description" class="mt-6">
                  <h4 class="text-subtitle-1 mb-2 d-flex align-center">
                    <v-icon class="mr-2" size="small">mdi-text-long</v-icon>
                    ຄຳອະທິບາຍ
                  </h4>
                  <v-card variant="outlined" class="pa-3">
                    <p class="text-body-2 mb-0">{{ accountMethodData.description }}</p>
                  </v-card>
                </div>
              </v-col>

             
              <v-col cols="12" lg="4">
              
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
                    ລາຍການບັນຊີ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div class="text-center pa-4">
                      <v-icon size="48" :color="accountMethodData.journal_entry_id ? 'success' : 'grey'" class="mb-3">
                        {{ accountMethodData.journal_entry_id ? 'mdi-check-circle' : 'mdi-file-plus' }}
                      </v-icon>
                      <p v-if="accountMethodData.journal_entry_id" class="text-body-1 mb-2">
                        ສ້າງ Journal Entry ແລ້ວ
                      </p>
                      <p v-else class="text-body-1 mb-2">
                        ຍັງບໍ່ສ້າງ Journal Entry
                      </p>
                      <v-btn 
                        v-if="!accountMethodData.journal_entry_id && canAdd"
                        color="primary" 
                        variant="outlined" 
                        size="small"
                        prepend-icon="mdi-plus"
                        block
                      >
                        ສ້າງ Journal Entry
                      </v-btn>
                      <v-btn 
                        v-else-if="accountMethodData.journal_entry_id"
                        color="info" 
                        variant="outlined" 
                        size="small"
                        prepend-icon="mdi-eye"
                        block
                      >
                        ເບິ່ງ Journal Entry
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

               
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-chart-pie</v-icon>
                    ການວິເຄາະບັນຊີ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ປະເພດທຸລະກຳ</v-list-item-title>
                        <v-list-item-subtitle class="text-body-1 font-weight-medium">
                          {{ getAccountTypeText(accountMethodData.acc_type) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ລາຍການເດບິດ</v-list-item-title>
                        <v-list-item-subtitle class="text-error">
                          Dr. {{ formatCurrency(accountMethodData.amount) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ລາຍການເຄຣດິດ</v-list-item-title>
                        <v-list-item-subtitle class="text-success">
                          Cr. {{ formatCurrency(accountMethodData.amount) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                
                <v-card variant="outlined">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    ດຳເນີນການດ່ວນ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div class="d-flex flex-column gap-2">
                      <v-btn 
                        v-if="accountMethodData.asset_id"
                        block 
                        color="primary" 
                        variant="outlined" 
                        prepend-icon="mdi-treasure-chest"
                        @click="goPath(`/fa-assets/detail?asset_id=${accountMethodData.asset_id}`)"
                      >
                        ເບິ່ງຊັບສົມບັດ
                      </v-btn>
                      <v-btn 
                        block 
                        color="info" 
                        variant="outlined"
                        prepend-icon="mdi-history"
                      >
                        ປະຫວັດທຸລະກຳ
                      </v-btn>
                      <v-btn 
                        v-if="canRecordStatus"
                        block 
                        :color="accountMethodData.record_stat === 'O' ? 'warning' : 'success'"
                        variant="outlined"
                        prepend-icon="mdi-toggle-switch"
                      >
                        {{ accountMethodData.record_stat === 'O' ? 'ປິດໃຊ້ງານ' : 'ເປີດໃຊ້ງານ' }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

         
              <v-col cols="12" class="mt-6">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-flow-chart</v-icon>
                  ໂຟລການບັນຊີ
                </h3>
                
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-around flex-wrap">
                 
                    <div class="text-center ma-2">
                      <v-card variant="outlined" color="error" class="pa-3" width="200">
                        <v-icon color="error" size="32" class="mb-2">mdi-minus-circle</v-icon>
                        <div class="text-subtitle-2 font-weight-bold">ບັນຊີເດບິດ</div>
                        <v-chip size="small" color="error" variant="flat" class="my-2">
                          {{ accountMethodData.debit_account_id }}
                        </v-chip>
                        <div class="text-caption">{{ getAccountName(accountMethodData.debit_account_id) }}</div>
                        <div class="text-h6 text-error mt-2">{{ formatCurrency(accountMethodData.amount) }}</div>
                      </v-card>
                    </div>

             
                    <div class="text-center">
                      <v-icon size="48" color="primary">mdi-arrow-right-bold</v-icon>
                      <div class="text-caption text-primary mt-1">ຈາກ ➔ ໄປ</div>
                    </div>

             
                    <div class="text-center ma-2">
                      <v-card variant="outlined" color="success" class="pa-3" width="200">
                        <v-icon color="success" size="32" class="mb-2">mdi-plus-circle</v-icon>
                        <div class="text-subtitle-2 font-weight-bold">ບັນຊີເຄຣດິດ</div>
                        <v-chip size="small" color="success" variant="flat" class="my-2">
                          {{ accountMethodData.credit_account_id }}
                        </v-chip>
                        <div class="text-caption">{{ getAccountName(accountMethodData.credit_account_id) }}</div>
                        <div class="text-h6 text-success mt-2">{{ formatCurrency(accountMethodData.amount) }}</div>
                      </v-card>
                    </div>
                  </div>

           
                  <v-divider class="my-4"></v-divider>
                  <div class="text-center">
                    <div class="text-h6 mb-2">ສະຫຼຸບທຸລະກຳ</div>
                    <v-chip :color="getAccountTypeColor(accountMethodData.acc_type)" variant="flat" size="large">
                      {{ getAccountTypeText(accountMethodData.acc_type) }} - {{ formatCurrency(accountMethodData.amount) }}
                    </v-chip>
                    <div class="text-caption mt-2 text-grey">
                      ວັນທີ່: {{ formatDateOnly(accountMethodData.transaction_date) }}
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

       
        <v-card v-else class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-book-open-page-variant-outline
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ພົບຂໍ້ມູນວິທີການບັນຊີ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບ Mapping ID ແລະລອງໃໝ່
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.flex-wrap {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .d-flex.justify-space-around.flex-wrap {
    flex-direction: column;
    align-items: center;
  }
  
  .d-flex.justify-space-around.flex-wrap > div {
    margin: 8px 0;
  }
}
</style>