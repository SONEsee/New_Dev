<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const assetStoreInstance = assetStore();
const route = useRoute();
const router = useRouter();

// ✅ ແກ້ໄຂການດຶງ parameters
const asset_code = route.query.asset_code as string;
const asset_id = route.query.asset_id as string;

const title = ref("ລາຍລະອຽດຊັບສິນ");
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

// ✅ ຈັດການ response ທີ່ເປັນ array
const assetData = computed(() => {
  const response = assetStoreInstance.response_asset_detail;
  if (Array.isArray(response)) {
    return response[0] || null;
  }
  return response || null;
});

const goBack = () => {
  router.go(-1);
};

const editAsset = () => {
  // ✅ ສົ່ງທັງ asset_code ແລະ asset_id
  router.push(`/asset/edit?asset_code=${asset_code}&asset_id=${asset_id}`);
};

const deleteAsset = async () => {
  const notification = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: `ທ່ານແນ່ໃຈຫຼືບໍ່ທີ່ຈະລົບຊັບສິນ "${assetData.value?.asset_name_la}"?`,
    showCancelButton: true,
    confirmButtonText: "ລົບ",
    cancelButtonText: "ຍົກເລີກ",
    confirmButtonColor: "#d33",
  });

  if (notification.isConfirmed) {
    // TODO: Implement delete functionality
    console.log("Delete asset:", asset_id);
  }
};

onMounted(() => {
  if (asset_code) {
    loadAssetDetail();
  }
  initializeRole();
});

const loadAssetDetail = async () => {
  loading.value = true;
  try {
    assetStoreInstance.req_filter_asset_code.query.asset_code = asset_code;
    await assetStoreInstance.GetAssetDetail();
  } catch (error) {
    console.error("Error loading asset detail:", error);
  } finally {
    loading.value = false;
  }
};

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

const getRecordStatusText = (status: string) => {
  switch (status) {
    case 'C': return 'ສ້າງໃໝ່';
    case 'U': return 'ແກ້ໄຂ';
    case 'D': return 'ລົບ';
    default: return status || '-';
  }
};
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
        
        
        <v-progress-circular 
          v-if="loading" 
          indeterminate 
          color="primary"
          class="d-flex justify-center ma-4"
        ></v-progress-circular>

        
        <template v-else-if="assetData">
          <v-card class="mt-4">
            <v-card-title>
              <h3>{{ assetData.asset_name_la }}</h3>
              <v-spacer></v-spacer>
              
              
            </v-card-title>

            <v-card-text>
              <v-row>
               
                <v-col cols="12" md="6">
                 
                  
                  <GlobalCardTitle 
                    title="ລະຫັດຊັບສິນ / Asset Code" 
                    :text="assetData.asset_code || '-'"
                  />
                  
                  <GlobalCardTitle 
                    title="ຊື່ຊັບສິນ (ລາວ) / Asset Name (Lao)" 
                    :text="assetData.asset_name_la || '-'"
                  />
                  
                  <GlobalCardTitle 
                    title="ຊື່ຊັບສິນ (ອັງກິດ) / Asset Name (English)" 
                    :text="assetData.asset_name_en || '-'"
                  />
                  
                  <GlobalCardTitle 
                    title="ປະເພດຊັບສິນ / Asset Type ID" 
                    :text="assetData.asset_type_id?.toString() || '-'"
                  />
                </v-col>

                
                <v-col cols="12" md="6">
                 
                  
                  <GlobalCardTitle 
                    title="COA ID" 
                    :text="assetData.coa_id?.toString() || '-'"
                  />
                  
                 
                  
                  <GlobalCardTitle 
                    title="ຜູ້ສ້າງ / Maker ID" 
                    :text="assetData.Maker_Id || '-'"
                  />
                  
                  <GlobalCardTitle 
                    title="ວັນທີສ້າງ / Created Date" 
                    :text="formatDate(assetData.Maker_DT_Stamp)"
                  />
                  
                  
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>

     
        
      </v-col>
    </v-row>
  </section>
</template>