<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const supplierStoreInstance = supplierStore();
const route = useRoute();
const router = useRouter();

const supplier_id = Number(route.query.supplier_id) || 0;

const title = ref("ລາຍລະອຽດຜູ້ສະໜອງ");
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

onMounted(() => {
  supplierStoreInstance.GetSupplierDetail(supplier_id);
  if (supplier_id) {
    loadSupplierDetail();
  }
  initializeRole();
});

const loadSupplierDetail = async () => {
  loading.value = true;
  try {
    await supplierStoreInstance.GetSupplierDetail(supplier_id);
  } catch (error) {
    console.error("Error loading supplier detail:", error);
  } finally {
    loading.value = false;
  }
};

const supplierData = computed(() => {
  return supplierStoreInstance.response_supplier_detail;
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
  return status === "O" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
};

const getStatusColor = (status: string) => {
  return status === "O" ? "success" : "error";
};
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

      <v-col cols="12" md="6">
        <GlobalCardTitle
          :title="'ລະຫັດຜູ້ສະໜອງ'"
          :text="supplierData?.supplier_code"
        />
        <GlobalCardTitle
          :title="'ຊື່ຜູ້ສະໜອງ'"
          :text="supplierData?.supplier_name"
        />
        <GlobalCardTitle
          :title="'ຜູ້ປະສານງານ'"
          :text="supplierData?.contact_person"
        />
        <v-list-item class="mt-4">
          <!-- <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
            ສະຖານະ
          </v-list-item-title> -->
          <!-- <v-list-item-subtitle class="mt-1">
            <v-chip
              :color="getStatusColor(supplierData.Record_Status || 'C')"
              variant="flat"
              size="small"
            >
              <v-icon
                start
                :icon="
                  supplierData.Record_Status === 'O'
                    ? 'mdi-check-circle'
                    : 'mdi-close-circle'
                "
              ></v-icon>
              {{ getStatusText(supplierData.Record_Status || "C") }}
            </v-chip>
          </v-list-item-subtitle> -->
        </v-list-item>
      </v-col>
      <v-col cols="12" md="6">
        <GlobalCardTitle :title="'ເບີໂທລະສັບ'" :text="supplierData?.phone" />
        <GlobalCardTitle :title="'ອີເມວ'" :text="supplierData?.email" />
        <GlobalCardTitle :title="'ທີ່ຢູ່'" :text="supplierData?.address" />
      </v-col>
      <!-- <v-col cols="12" class="">
        <v-card v-if="!loading && supplierData" class="elevation-2 rounded-lg">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-truck</v-icon>
            ຂໍ້ມູນຜູ້ສະໜອງ
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class=" text-grey-darken-1">
                      ລະຫັດຜູ້ສະໜອງ
                    </v-list-item-title>
                    <v-list-item-subtitle class=" text-black mt-1">
                      {{ supplierData.supplier_code || '-' }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ຊື່ຜູ້ສະໜອງ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1">
                      {{ supplierData.supplier_name || '-' }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ຊື່ຜູ້ຕິດຕໍ່
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1">
                      {{ supplierData.contact_person || '-' }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ສະຖານະ
                    </v-list-item-title>
                    <v-list-item-subtitle class="mt-1">
                      <v-chip 
                        :color="getStatusColor(supplierData.Record_Status || 'C')"
                        variant="flat"
                        size="small"
                      >
                        <v-icon start :icon="supplierData.Record_Status === 'O' ? 'mdi-check-circle' : 'mdi-close-circle'"></v-icon>
                        {{ getStatusText(supplierData.Record_Status || 'C') }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ເບີໂທລະສັບ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1">
                      <a v-if="supplierData.phone" :href="`tel:${supplierData.phone}`" class="text-decoration-none">
                        {{ supplierData.phone }}
                      </a>
                      <span v-else>-</span>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ອີເມວ
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1">
                      <a v-if="supplierData.email" :href="`mailto:${supplierData.email}`" class="text-decoration-none">
                        {{ supplierData.email }}
                      </a>
                      <span v-else>-</span>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item class="mt-4">
                    <v-list-item-title class="text-subtitle-2 text-grey-darken-1">
                      ທີ່ຢູ່
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-black mt-1">
                      {{ supplierData.address || '-' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
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
                      {{ formatDate(supplierData.Maker_DT_Stamp) }}
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
                      {{ formatDate(supplierData.Checker_DT_Stamp) }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
      <!-- <v-card v-else-if="loading" class="elevation-2 rounded-lg">
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
              ບໍ່ພົບຂໍ້ມູນຢູ້ສະໜອງ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບລະຫັດຜູ້ສະໜອງແລະລອງໃໝ່
            </p>
          </v-card-text>
        </v-card>
      </v-col>  -->
    </v-row>
  </section>
</template>
