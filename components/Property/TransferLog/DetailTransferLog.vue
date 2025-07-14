<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, onMounted, ref } from "vue";

const route = useRoute();
const id = route.query.asset_list_id as string;
const title = "ລາຍລະອຽດການເຄື່ອນຍ້າຍຊັບສົມບັດ";
const transactionLog = useTransactionLogStore();
const loading = ref(false);

const header = [
  { title: "ລະຫັດ", value: "transfer_id" },
  { title: "ສະຖານທີ່ຕົ້ນທາງ", value: "from_location_id" },
  { title: "ສະຖານທີ່ປາຍທາງ", value: "to_location_id" },
  { title: "ເຫດຜົນໃນການໂອນຍ້າຍ", value: "transfer_reason" },
  { title: "ສະພາບກ່ອນໂອນຍ້າຍ", value: "condition_before" },
  { title: "ສະພາບຫຼັງໂອນຍ້າຍ", value: "condition_after" },
  { title: "ວັນທີ່ໂອນຍ້າຍ", value: "transfer_date" },
  { title: "ວັນທີ່ມາເຖິງຈິງ", value: "actual_arrival" },
];

const items = computed(() => {
  const data = transactionLog.responst_transaction_log;
  
  if (Array.isArray(data)) {
    return data.sort((a, b) => new Date(a.transfer_date).getTime() - new Date(b.transfer_date).getTime());
  }
  
  if (data && typeof data === "object") {
    return [data];
  }
  
  return [];
});

// ສ້າງຂໍ້ມູນສຳລັບ Timeline
const timelineData = computed(() => {
  return items.value.map((item, index) => ({
    ...item,
    step: index + 1,
    isCompleted: item.actual_arrival ? true : false,
    color: item.actual_arrival ? 'success' : 'warning'
  }));
});

// ສ້າງຂໍ້ມູນສຳລັບ Path visualization
const pathData = computed(() => {
  const locations = new Set();
  const connections = [];
  
  items.value.forEach(item => {
    locations.add(item.from_location_id);
    locations.add(item.to_location_id);
    connections.push({
      from: item.from_location_id,
      to: item.to_location_id,
      transfer_date: item.transfer_date,
      transfer_id: item.transfer_id,
      transfer_reason: item.transfer_reason,
      isCompleted: !!item.actual_arrival
    });
  });
  
  return {
    locations: Array.from(locations),
    connections: connections
  };
});

const loadData = async () => {
  try {
    loading.value = true;
    transactionLog.filter_asset_list.query.asset_list_id = id;
    await transactionLog.getDatadetail();
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('lo-LA');
};

const getStatusColor = (item: any) => {
  if (item.actual_arrival) return 'success';
  if (new Date(item.transfer_date) < new Date()) return 'error';
  return 'warning';
};

const getStatusText = (item: any) => {
  if (item.actual_arrival) return 'ສຳເລັດແລ້ວ';
  if (new Date(item.transfer_date) < new Date()) return 'ຊ້າກວ່າກຳນົດ';
  return 'ກຳລັງດຳເນີນການ';
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    
    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <div v-if="items.length > 0">
      <v-row>
        <!-- Path View - ເສັ້ນທາງການເຄື່ອນຍ້າຍ -->
        <v-col cols="12" md="12">
          <v-card class="h-100">
            <v-card-title class="bg-primary text-white">
              <v-icon class="mr-2">mdi-map-marker-path</v-icon>
              ເສັ້ນທາງການເຄື່ອນຍ້າຍ
            </v-card-title>
            
            <v-card-text class="pa-3">
              <div class="path-flow-horizontal">
                <div 
                  v-for="(location, index) in pathData.locations" 
                  :key="location"
                  class="location-step-horizontal"
                >
                  <div class="location-node-horizontal">
                    <v-avatar 
                      :color="index === 0 ? 'success' : index === pathData.locations.length - 1 ? 'warning' : 'primary'"
                      size="50"
                    >
                      <v-icon color="white">
                        {{ index === 0 ? 'mdi-map-marker' : index === pathData.locations.length - 1 ? 'mdi-map-marker-check' : 'mdi-map-marker-outline' }}
                      </v-icon>
                    </v-avatar>
                    <div class="location-name-horizontal">{{ location }}</div>
                  </div>
                  
                  <!-- Connection Arrow -->
                  <div v-if="index < pathData.locations.length - 1" class="connection-arrow-horizontal">
                    <v-icon color="primary" size="24">mdi-arrow-right</v-icon>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Timeline View - ປະຫວັດການເຄື່ອນຍ້າຍ -->
        <v-col cols="12" md="12">
          <v-card class="h-100">
            <v-card-title class="bg-info text-white">
              <v-icon class="mr-2">mdi-timeline</v-icon>
              ປະຫວັດການເຄື່ອນຍ້າຍ
            </v-card-title>
            
            <v-card-text class="pa-3">
              <div class="timeline-container">
                <div 
                  v-for="(item, index) in timelineData"
                  :key="item.transfer_id"
                  class="timeline-item"
                >
                  <div class="timeline-dot">
                    <v-avatar :color="getStatusColor(item)" size="30">
                      <v-icon color="white" size="16">
                        {{ item.actual_arrival ? 'mdi-check' : 'mdi-clock' }}
                      </v-icon>
                    </v-avatar>
                  </div>
                  
                  <div class="timeline-content">
                    <v-card variant="outlined" class="mb-2">
                      <v-card-text class="pa-2">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="font-weight-bold text-subtitle-2">
                            #{{ item.transfer_id }}
                          </span>
                          <v-chip :color="getStatusColor(item)" size="x-small">
                            {{ getStatusText(item) }}
                          </v-chip>
                        </div>
                        
                        <div class="transfer-info">
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" color="blue" class="mr-1">mdi-map-marker</v-icon>
                            <span class="text-caption">{{ item.from_location_id }}</span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="14" color="green" class="mr-1">mdi-map-marker-check</v-icon>
                            <span class="text-caption">{{ item.to_location_id }}</span>
                          </div>
                          <div class="d-flex align-center">
                            <v-icon size="14" color="orange" class="mr-1">mdi-calendar</v-icon>
                            <span class="text-caption">{{ formatDate(item.transfer_date) }}</span>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                  
                  <!-- Connection Line -->
                  <div v-if="index < timelineData.length - 1" class="timeline-line"></div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Table View - ລາຍລະອຽດແບບຕາຕະລາງ -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="bg-secondary text-white">
              <v-icon class="mr-2">mdi-table</v-icon>
              ລາຍລະອຽດແບບຕາຕະລາງ
            </v-card-title>
            
            <v-card-text class="pa-0">
              <v-data-table 
                :items="items" 
                :headers="header"
                :loading="loading"
                density="compact"
                class="elevation-0"
              >
                <template #item.transfer_date="{ item }">
                  {{ formatDate(item.transfer_date) }}
                </template>
                
                <template #item.actual_arrival="{ item }">
                  <v-chip 
                    v-if="item.actual_arrival"
                    color="success" 
                    size="small"
                    variant="outlined"
                  >
                    {{ formatDate(item.actual_arrival) }}
                  </v-chip>
                  <v-chip 
                    v-else
                    color="warning" 
                    size="small"
                    variant="outlined"
                  >
                    ລໍຖ້າ
                  </v-chip>
                </template>
                
                <template #item.transfer_id="{ item }">
                  <span class="font-weight-bold">#{{ item.transfer_id }}</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Empty State -->
    <v-card v-else class="pa-4 text-center">
      <v-card-text>
        <v-progress-circular 
          v-if="loading" 
          indeterminate 
          color="primary"
        />
        <div v-else>
          <v-icon size="64" color="grey">mdi-database-off</v-icon>
          <p class="mt-2">ບໍ່ມີຂໍ້ມູນການເຄື່ອນຍ້າຍສຳລັບ Asset ID: {{ id }}</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
/* Path Flow Styles - Horizontal */
.path-flow-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  overflow-x: auto;
  min-height: 120px;
}

.location-step-horizontal {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.location-node-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 80px;
}

.location-name-horizontal {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 120px;
  word-wrap: break-word;
  line-height: 1.2;
}

.connection-arrow-horizontal {
  display: flex;
  align-items: center;
  margin: 0 4px;
}

/* Timeline Styles */
.timeline-container {
  position: relative;
  max-height: 400px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-left: 45px;
  margin-bottom: 16px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
}

.timeline-content {
  flex: 1;
  margin-left: 15px;
}

.timeline-line {
  position: absolute;
  left: 15px;
  top: 30px;
  bottom: -16px;
  width: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.transfer-info {
  font-size: 12px;
}

/* Card Headers */
.v-card-title {
  font-size: 14px !important;
  font-weight: 600;
  padding: 12px 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-container {
    max-height: 300px;
  }
  
  .path-flow-horizontal {
    gap: 15px;
    padding: 15px 10px;
  }
  
  .location-step-horizontal {
    gap: 15px;
  }
  
  .location-name-horizontal {
    font-size: 12px;
    max-width: 80px;
  }
  
  .timeline-item {
    padding-left: 35px;
  }
  
  .timeline-dot {
    left: 0;
  }
  
  .timeline-content {
    margin-left: 10px;
  }
  
  .timeline-line {
    left: 15px;
  }
}

/* Scrollbar Styling */
.timeline-container::-webkit-scrollbar {
  width: 4px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>