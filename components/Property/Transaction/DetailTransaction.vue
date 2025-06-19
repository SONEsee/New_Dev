<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";


const transactionTypeStoreInstance = transactionTypeStore();
const route = useRoute();
const router = useRouter();

const tranID = route.query.tranID as string;


const title = ref("ລາຍລະອຽດປະເພດທຸລະກຳ");
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


const editTransactionType = () => {
  router.push(`/transaction-type/edit/?tranID=${tranID}`);
};


onMounted(() => {
  if (tranID) {
    loadTransactionTypeDetail();
  }
  initializeRole();
});


const loadTransactionTypeDetail = async () => {
  loading.value = true;
  try {
    await transactionTypeStoreInstance.GetTransactionTypeDetail(tranID);
  } catch (error) {
    console.error("Error loading transaction type detail:", error);
  } finally {
    loading.value = false;
  }
};


const transactionTypeData = computed(() => {
  return transactionTypeStoreInstance.response_transaction_type_detail;
});

const formatDate = (date: Date | string) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getStatusText = (status: string) => {
  return status === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ';
};

const getStatusColor = (status: string) => {
  return status === 'O' ? 'success' : 'error';
};

const getTransactionTypeIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    'ຮັບເງິນ': 'mdi-cash-plus',
    'ຈ່າຍເງິນ': 'mdi-cash-minus',
    'ໂອນເງິນ': 'mdi-bank-transfer',
    'ປັບຍອດ': 'mdi-tune',
    'ຖອນເງິນ': 'mdi-cash-remove',
    'Receipt': 'mdi-cash-plus',
    'Payment': 'mdi-cash-minus',
    'Transfer': 'mdi-bank-transfer',
    'Adjustment': 'mdi-tune',
    'Withdrawal': 'mdi-cash-remove',
  };
  return iconMap[type] || 'mdi-swap-horizontal';
};
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

      
   

      <v-col cols="12" class="pt-12">
        <v-card v-if="!loading && transactionTypeData" class="elevation-2 rounded-lg">
          <v-card-title class="bg-primary text-white d-flex align-center">
            <v-icon class="mr-3" size="24">{{ getTransactionTypeIcon(transactionTypeData.tranNameL) }}</v-icon>
            <div>
              <div class="text-h5">{{ transactionTypeData.tranNameL }}</div>
              <div class="text-subtitle-1 opacity-90">{{ transactionTypeData.tranNameE }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip 
              :color="getStatusColor(transactionTypeData.record_stat || 'C')"
              variant="flat"
              size="large"
            >
              <v-icon start :icon="transactionTypeData.record_stat === 'O' ? 'mdi-check-circle' : 'mdi-close-circle'"></v-icon>
              {{ getStatusText(transactionTypeData.record_stat || 'C') }}
            </v-chip>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="8">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-identifier</v-icon>
                      ລະຫັດປະເພດທຸລະກຳ (Transaction ID)
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1 ml-6">
                      {{ transactionTypeData.tranID }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-translate</v-icon>
                      ຊື່ປະເພດທຸລະກຳ (ພາສາລາວ)
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1 ml-6">
                      {{ transactionTypeData.tranNameL }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-web</v-icon>
                      ຊື່ປະເພດທຸລະກຳ (ພາສາອັງກິດ)
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1 ml-6">
                      {{ transactionTypeData.tranNameE }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4" v-if="transactionTypeData.description">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-text</v-icon>
                      ຄຳອະທິບາຍ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-black mt-1 ml-6">
                      {{ transactionTypeData.description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="4">
                <!-- Statistics Card -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    ສະຖິຕິການໃຊ້ງານ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ຈຳນວນທຸລະກຳທັງໝົດ</v-list-item-title>
                        <v-list-item-subtitle class="text-h5 text-primary">-</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ມູນຄ່າລວມ</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-success">-</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ທຸລະກຳມື້ນີ້</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-info">-</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                
                <v-card variant="outlined">
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    ດຳເນີນການດ່ວນ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-btn 
                      v-if="canAdd"
                      block 
                      color="primary" 
                      variant="outlined" 
                      class="mb-2"
                      prepend-icon="mdi-plus"
                      @click="goPath(`/transaction/create?type_id=${transactionTypeData.tranID}`)"
                    >
                      ສ້າງທຸລະກຳໃໝ່
                    </v-btn>
                    <v-btn 
                      block 
                      color="info" 
                      variant="outlined"
                      prepend-icon="mdi-view-list"
                      @click="goPath(`/transaction?type_id=${transactionTypeData.tranID}`)"
                    >
                      ເບິ່ງປະຫວັດທຸລະກຳ
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              
              <v-col cols="12" class="mt-6">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-clock-outline</v-icon>
                  ປະຫວັດການເຮັດວຽກ
                </h3>
                
                <v-timeline density="compact" direction="horizontal">
                  <v-timeline-item
                    dot-color="success"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ສ້າງວັນທີ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDate(transactionTypeData.created_at) }}
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="info"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ແກ້ໄຂຄັ້ງສຸດທ້າຍ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDate(transactionTypeData.updated_at) }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
        <v-card v-else-if="loading" class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-grey-darken-1">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </v-card-text>
        </v-card>

        <!-- No Data State -->
        <v-card v-else class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-database-off
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ພົບຂໍ້ມູນປະເພດທຸລະກຳ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບລະຫັດປະເພດທຸລະກຳແລະລອງໃໝ່
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>