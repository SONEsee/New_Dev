<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";


const accountStoreInstance = accountStore();
const route = useRoute();
const router = useRouter();

const account_id = route.query.account_id as string;


const title = ref("ລາຍລະອຽດບັນຊີ");
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


const editAccount = () => {
  router.push(`/account/edit/?account_id=${account_id}`);
};


onMounted(() => {
  if (account_id) {
    loadAccountDetail();
  }
  initializeRole();
});


const loadAccountDetail = async () => {
  loading.value = true;
  try {
    await accountStoreInstance.GetAccountDetail(account_id);
  } catch (error) {
    console.error("Error loading account detail:", error);
  } finally {
    loading.value = false;
  }
};


const accountData = computed(() => {
  return accountStoreInstance.response_account_detail;
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

const getAccountTypeColor = (type: string) => {
  const colors = {
    Asset: "success",
    Liability: "error",
    Equity: "primary",
    Revenue: "info",
    Expense: "warning",
  };
  return colors[type as keyof typeof colors] || "grey";
};

const getAccountTypeText = (type: string) => {
  const types = {
    Asset: "ຊັບສິນ",
    Liability: "ໜີ້ສິນ", 
    Equity: "ທຶນ",
    Revenue: "ລາຍຮັບ",
    Expense: "ຄ່າໃຊ້ຈ່າຍ",
  };
  return types[type as keyof typeof types] || type;
};

const getAccountTypeIcon = (type: string) => {
  const icons = {
    Asset: "mdi-treasure-chest",
    Liability: "mdi-credit-card-outline",
    Equity: "mdi-bank",
    Revenue: "mdi-trending-up",
    Expense: "mdi-trending-down",
  };
  return icons[type as keyof typeof icons] || "mdi-account";
};
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

     

      <v-col cols="12" class="pt-12">
        <v-card v-if="!loading && accountData" class="elevation-2 rounded-lg">
          <v-card-title class="bg-primary text-white d-flex align-center">
            <v-icon class="mr-3" size="24">{{ getAccountTypeIcon(accountData.account_type) }}</v-icon>
            <div>
              <div class="text-h5">{{ accountData.account_name }}</div>
              <div class="text-subtitle-1 opacity-90">{{ accountData.account_code }}</div>
            </div>
            <v-spacer></v-spacer>
            <div class="d-flex flex-column align-end">
              <v-chip 
                :color="getAccountTypeColor(accountData.account_type)"
                variant="flat"
                size="large"
                class="mb-2"
              >
                <v-icon start>{{ getAccountTypeIcon(accountData.account_type) }}</v-icon>
                {{ getAccountTypeText(accountData.account_type) }}
              </v-chip>
              <v-chip 
                :color="getStatusColor(accountData.record_stat || 'C')"
                variant="flat"
                size="small"
              >
                <v-icon start :icon="accountData.record_stat === 'O' ? 'mdi-check-circle' : 'mdi-close-circle'"></v-icon>
                {{ getStatusText(accountData.record_stat|| 'C') }}
              </v-chip>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="8">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-identifier</v-icon>
                      ລະຫັດບັນຊີ (Account ID)
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1 ml-6">
                      {{ accountData.account_id }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-tag-outline</v-icon>
                      ລະຫັດບັນຊີ (Account Code)
                    </v-list-item-title>
                    <v-list-item-subtitle class="mt-1 ml-6">
                      <v-chip color="primary" variant="outlined" size="large">
                        {{ accountData.account_code }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-format-title</v-icon>
                      ຊື່ບັນຊີ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1 ml-6">
                      {{ accountData.account_name }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4" v-if="accountData.parent_account_id">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-file-tree</v-icon>
                      ບັນຊີແມ່
                    </v-list-item-title>
                    <v-list-item-subtitle class="mt-1 ml-6">
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex align-center">
                          <v-chip size="small" color="secondary" variant="outlined" class="mr-2">
                            {{ accountData.account_code }}
                          </v-chip>
                          <span class="text-body-1">{{ accountData.account_name }}</span>
                        </div>
                      </v-card>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4" v-if="accountData.description">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      <v-icon class="mr-2" size="small">mdi-text</v-icon>
                      ຄຳອະທິບາຍ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-1 text-black mt-1 ml-6">
                      {{ accountData.description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="4">
                <!-- Account Hierarchy -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2">mdi-file-tree</v-icon>
                    ໂຄງສ້າງບັນຊີ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div v-if="accountData.parent_account_id" class="text-caption text-grey mb-2">ບັນຊີແມ່:</div>
                    <div v-if="accountData.parent_account_id" class="mb-3">
                      <v-chip size="small" color="secondary" variant="outlined">
                        {{ accountData.account_code }}
                      </v-chip>
                      <div class="text-body-2 mt-1">{{ accountData.account_name }}</div>
                    </div>
                    
                    <div class="text-caption text-grey mb-2">ບັນຊີປັດຈຸບັນ:</div>
                    <v-chip color="primary" variant="flat">
                      {{ accountData.account_code }}
                    </v-chip>
                    <div class="text-body-2 mt-1 font-weight-bold">{{ accountData.account_name }}</div>
                  </v-card-text>
                </v-card>

                <!-- Statistics Card -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    ສະຖິຕິ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ຈຳນວນທຸລະກຳ</v-list-item-title>
                        <v-list-item-subtitle class="text-h5 text-primary">-</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ຍອດຄົງເຫຼືອ</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-success">-</v-list-item-subtitle>
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
                      @click="goPath(`/transaction/create?account_id=${accountData.account_id}`)"
                    >
                      ເພີ່ມທຸລະກຳ
                    </v-btn>
                    <v-btn 
                      block 
                      color="info" 
                      variant="outlined"
                      prepend-icon="mdi-view-list"
                      @click="goPath(`/transaction?account_id=${accountData.account_id}`)"
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
                    <!-- <div class="text-body-2">
                      {{ formatDate(accountData.account_id) }}
                    </div> -->
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="info"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ແກ້ໄຂຄັ້ງສຸດທ້າຍ</div>
                    </template>
                    <!-- <div class="text-body-2">
                      {{ formatDate(accountData.updated_at) }}
                    </div> -->
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        
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

    
        <v-card v-else class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-database-off
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ພົບຂໍ້ມູນບັນຊີ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບລະຫັດບັນຊີແລະລອງໃໝ່
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>