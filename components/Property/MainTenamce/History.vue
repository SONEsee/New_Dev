<script setup lang="ts">
const title = "ປະຫວັດການບໍາລຸງຮັກສາ";
const route = useRoute();
const asset_list_id = route.query.history as string;
const mantanenceStore = useMentenance();

const datahistory = computed(() => {
  const data = mantanenceStore.response_data_mantanacelist;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const header = [
  { title: "ລຳດັບ", value: "index", width: "80px", align: "center" },
  { title: "ປີກວດສອບ", value: "audit_year", width: "100px", align: "center" },
  { title: "ປະເພດການກວດສອບ", value: "audit_period", width: "150px" },
  { title: "ວັນທີກວດສອບ", value: "audit_date", width: "120px", align: "center" },
  { title: "ຜູ້ກວດສອບ", value: "auditor_name", width: "120px" },
  { title: "ສະຖານະກາຍະພາບ", value: "physical_status", width: "140px" },
  { title: "ສະພາບໃຊ້ງານ", value: "condition_status", width: "120px" },
  { title: "ສະຖານທີ່ຕົວຈິງ", value: "actual_location", width: "140px" },
  { title: "ມູນຄ່າຕາມບັນຊີ", value: "book_value", width: "150px", align: "end" },
  { title: "ມູນຄ່າປະເມີນ", value: "estimated_value", width: "130px", align: "end" },
//   { title: "ສະຖານະກວດສອບ", value: "audit_status", width: "140px" },
//   { title: "ການກະທຳ", value: "actions", width: "120px", sortable: false, align: "center" }
] as const;


const getAuditPeriodText = (period: string) => {
  switch(period) {
    case 'ANNUAL': return 'ປະຈຳປີ';
    case 'QUARTERLY': return 'ປະຈຳໄຕມາດ';
    case 'MONTHLY': return 'ປະຈຳເດືອນ';
    default: return period;
  }
};


const getPhysicalStatusText = (status: string) => {
  switch(status) {
    case 'FOUND': return 'ພົບຊັບສິນຕາມທີ່ບັນທຶກ';
    case 'MISSING': return 'ຊັບສິນສູນຫາຍ';
    case 'DAMAGED': return 'ຊັບສິນເສຍຫາຍ';
    case 'DISPOSED': return 'ຊັບສິນຖືກຈຳໜ່າຍແລ້ວ';
    default: return status;
  }
};


const getConditionStatusText = (status: string) => {
  switch(status) {
    case 'EXCELLENT': return 'ສະພາບດີເລີດ';
    case 'GOOD': return 'ສະພາບດີ';
    case 'FAIR': return 'ສະພາບພໍໃຊ້ໄດ້';
    case 'POOR': return 'ສະພາບບໍ່ດີ';
    case 'UNUSABLE': return 'ໃຊ້ການບໍ່ໄດ້';
    default: return status;
  }
};


const getAuditStatusText = (status: string) => {
  switch(status) {
    case 'DRAFT': return 'ຮ່າງ';
    case 'COMPLETED': return 'ສຳເລັດແລ້ວ';
    case 'REVIEWED': return 'ທົບທວນແລ້ວ';
    case 'APPROVED': return 'ອະນຸມັດແລ້ວ';
    default: return status;
  }
};


const getStatusColor = (status: string) => {
  switch(status) {
    case 'FOUND': case 'EXCELLENT': case 'APPROVED': return 'success';
    case 'MISSING': case 'DAMAGED': case 'UNUSABLE': return 'error';
    case 'GOOD': case 'REVIEWED': case 'COMPLETED': return 'info';
    case 'FAIR': case 'POOR': case 'DRAFT': return 'warning';
    case 'DISPOSED': return 'secondary';
    default: return 'default';
  }
};


const formatCurrency = (value: any): string => {
  if (!value || isNaN(Number(value))) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};


const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};


const getGlobalIndex = (localIndex: number) => {
  return localIndex + 1;
};


const viewDetails = (item: any) => {
  console.log('View details:', item);
 
};


const editItem = (item: any) => {
  console.log('Edit item:', item);

};

onMounted(() => {
  mantanenceStore.fiter_asset_list.fiter.asset_list_id = asset_list_id;
  mantanenceStore.getDataTotal();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    
   
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card 
          elevation="3" 
          class="asset-info-card h-100"
          style="border-left: 5px solid #1976D2;"
        >
          <v-card-title class="bg-blue-lighten-4 py-3">
            <v-icon icon="mdi-identifier" class="mr-2 text-blue-darken-2"></v-icon>
            ລະຫັດຊັບສິນ
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="text-h6 text-blue-darken-1 font-weight-bold">
              {{ datahistory[0]?.asset_list_id || 'ບໍ່ມີຂໍ້ມູນ' }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card 
          elevation="3" 
          class="asset-info-card h-100"
          style="border-left: 5px solid #388E3C;"
        >
          <v-card-title class="bg-green-lighten-4 py-3">
            <v-icon icon="mdi-package-variant" class="mr-2 text-green-darken-2"></v-icon>
            ຊື່ຊັບສິນ
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="text-h6 text-green-darken-1 font-weight-medium">
              {{ datahistory[0]?.asset_list_id_detail?.asset_spec || 'ບໍ່ມີຂໍ້ມູນ' }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card 
          elevation="3" 
          class="asset-info-card h-100"
          style="border-left: 5px solid #F57C00;"
        >
          <v-card-title class="bg-orange-lighten-4 py-3">
            <v-icon icon="mdi-map-marker" class="mr-2 text-orange-darken-2"></v-icon>
            ສະຖານທີ່
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="text-h6 text-orange-darken-1 font-weight-medium">
              {{ datahistory[0]?.actual_location || 'ບໍ່ລະບຸສະຖານທີ່' }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2" class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-chart-bar" class="mr-2 text-primary"></v-icon>
              <span class="text-h6 font-weight-medium">ສະຫຼຸບຂໍ້ມູນ</span>
            </div>
            <v-chip color="primary" variant="outlined" size="large">
              <v-icon icon="mdi-format-list-numbered" class="mr-1"></v-icon>
              ທັງໝົດ: {{ datahistory.length }} ລາຍການ
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

   
    <v-card elevation="3">
      <v-card-title class="bg-grey-lighten-4 py-3">
        <v-icon icon="mdi-table" class="mr-2"></v-icon>
        ປະຫວັດການບຳລຸງຮັກສາລາຍລະອຽດ
      </v-card-title>
      <v-data-table
        :headers="header"
        :items="datahistory"
        :loading="mantanenceStore.isLoading"
        class="elevation-0"
        hover
        :items-per-page="10"
      >
        
        <template #item.index="{ index }">
          <v-chip size="small" color="primary" variant="outlined">
            {{ getGlobalIndex(index) }}
          </v-chip>
        </template>

       
        <template #item.audit_year="{ item }">
          <v-chip size="small" color="indigo" variant="tonal">
            {{ item.audit_year }}
          </v-chip>
        </template>

       
        <template #item.audit_period="{ item }">
          <v-chip 
            size="small" 
            :color="item.audit_period === 'ANNUAL' ? 'purple' : item.audit_period === 'QUARTERLY' ? 'orange' : 'teal'"
            variant="tonal"
          >
            {{ getAuditPeriodText(item.audit_period) }}
          </v-chip>
        </template>

       
        <template #item.audit_date="{ item }">
          <div class="text-center">
            <v-icon icon="mdi-calendar" size="small" class="mr-1 text-grey"></v-icon>
            {{ formatDate(item.audit_date) }}
          </div>
        </template>

       
        <template #item.auditor_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="24" color="blue-grey-lighten-2" class="mr-2">
              <v-icon icon="mdi-account" size="small"></v-icon>
            </v-avatar>
            <span class="text-caption">{{ item.auditor_name }}</span>
          </div>
        </template>

       
        <template #item.physical_status="{ item }">
          <v-chip 
            size="small" 
            :color="getStatusColor(item.physical_status)"
            variant="flat"
          >
            <v-icon 
              :icon="item.physical_status === 'FOUND' ? 'mdi-check-circle' : 
                    item.physical_status === 'MISSING' ? 'mdi-alert-circle' : 
                    item.physical_status === 'DAMAGED' ? 'mdi-alert' : 'mdi-delete'"
              size="small" 
              class="mr-1"
            ></v-icon>
            {{ getPhysicalStatusText(item.physical_status) }}
          </v-chip>
        </template>

       
        <template #item.condition_status="{ item }">
          <v-chip 
            size="small" 
            :color="getStatusColor(item.condition_status)"
            variant="tonal"
          >
            {{ getConditionStatusText(item.condition_status) }}
          </v-chip>
        </template>

    
        <template #item.actual_location="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-map-marker" size="small" class="mr-1 text-orange"></v-icon>
            <span class="text-caption">{{ item.actual_location || '-' }}</span>
          </div>
        </template>

       
        <template #item.book_value="{ item }">
          <div class="text-end font-weight-medium">
            <span class="text-success">{{ formatCurrency(item.book_value) }}</span>
            <small class="text-grey ml-1">ກີບ</small>
          </div>
        </template>

       
        <template #item.estimated_value="{ item }">
          <div class="text-end font-weight-medium">
            <span class="text-info">{{ formatCurrency(item.estimated_value) }}</span>
            <small class="text-grey ml-1">ກີບ</small>
          </div>
        </template>

        
        <template #item.audit_status="{ item }">
          <v-chip 
            size="small" 
            :color="getStatusColor(item.audit_status)"
            variant="flat"
          >
            <v-icon 
              :icon="item.audit_status === 'APPROVED' ? 'mdi-check-circle' : 
                    item.audit_status === 'REVIEWED' ? 'mdi-eye-check' : 
                    item.audit_status === 'COMPLETED' ? 'mdi-check' : 'mdi-file-edit'"
              size="small" 
              class="mr-1"
            ></v-icon>
            {{ getAuditStatusText(item.audit_status) }}
          </v-chip>
        </template>

        <!-- ການກະທຳ -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-center ga-1">
            <v-tooltip text="ເບິ່ງລາຍລະອຽດ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  color="info"
                  variant="text"
                  v-bind="props"
                  @click="viewDetails(item)"
                ></v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip text="ແກ້ໄຂ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="warning"
                  variant="text"
                  v-bind="props"
                  @click="editItem(item)"
                  :disabled="item.audit_status === 'APPROVED'"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        
        <template #loading>
          <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
        </template>

       
        <template #no-data>
          <div class="text-center py-8">
            <v-icon icon="mdi-database-off" size="64" class="text-grey-lighten-1 mb-4"></v-icon>
            <div class="text-h6 text-grey">ບໍ່ມີຂໍ້ມູນການບຳລຸງຮັກສາ</div>
            <div class="text-caption text-grey">ກະລຸນາເພີ່ມຂໍ້ມູນການບຳລຸງຮັກສາ</div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.asset-info-card {
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.asset-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.v-data-table {
  border-radius: 0 0 4px 4px;
}

.v-data-table ::v-deep(.v-data-table__tr:hover) {
  background-color: rgba(33, 150, 243, 0.04) !important;
}

.v-chip {
  font-weight: 500;
}

/* ສຳລັບມືຖື */
@media (max-width: 768px) {
  .v-data-table {
    font-size: 0.875rem;
  }
  
  .v-chip {
    font-size: 0.75rem !important;
  }
}
</style>