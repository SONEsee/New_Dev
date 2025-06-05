<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const glStore = useGlStore();


const searchGlCode = ref("");
const selectedCategory = ref("");


const categoryOptions = [
  { title: "ທັງໝົດ", value: "" },
  { title: "1 = ຊັບສິນ", value: "1" },
  { title: "2 = ໜີ້ສິນ", value: "2" },
  { title: "3 = ທືນ", value: "3" },
  { title: "4 = ລາຍຈ່າຍ", value: "4" },
  { title: "5 = ລາຍຮັບ", value: "5" },
  { title: "6 = ນອກຝັງ", value: "6" },
  { title: "7 = ບັນຊີເງົາ", value: "7" },
  { title: "8 = ບັນຊີນອກພັງ", value: "8" },
];


const rawData = computed((): any[] => {
  return (glStore.respons_gl_sup as any) || [];
});


const res = computed((): any[] => {
  let filtered = rawData.value;

 
  if (searchGlCode.value.trim()) {
    filtered = filtered.filter(item => 
      item.gl_code && 
      item.gl_code.toLowerCase().includes(searchGlCode.value.toLowerCase())
    );
  }


  if (selectedCategory.value) {
    filtered = filtered.filter(item => 
      item.category === selectedCategory.value
    );
  }

  return filtered;
});


const clearFilters = () => {
  searchGlCode.value = "";
  selectedCategory.value = "";
};


const goPath = (path: string) => {
  router.push(path);
};


onMounted(() => {
  glStore.getGlsup();
});


const header = [
  { title: "ລະຫັດ", value: "gl_code" },
  { title: "ຊື່ Gl sup", value: "gl_Desc_la" },
  { title: "ຊື່ Gl sup (EN)", value: "gl_Desc_en" },
  { title: "ຂັ້ນບັນຊີ", value: "glType" },
  { title: "ປະເພດ", value: "category" },
  { title: "ການຕີມູນຄ່າທາງດ້ານບັນຊີ", value: "retal" },
  { title: "ສາມາດໃຊ້ສະກຸນ", value: "ccy_Res" },
  { title: "ລະຫັດສະກຸນເງິນ", value: "Res_ccy" },
  { title: "ລົງຍ້ອນຫຼັງ", value: "Allow_BackPeriodEntry" },
  {
    title: "ການຕີມູນຄ່າແບບ2ຮູບແບບ, ພາຍໃນມື້ ແລະ ທ້າຍມື້",
    value: "pl_Split_ReqD",
  },
  { title: "ຈັດການ", value: "action" },
];

const title = "ຈັດການຂໍ້ມູນ Gl sup";


const getCategoryName = (category: string) => {
  const categories: Record<string, string> = {
    '1': 'ຊັບສິນ',
    '2': 'ໜີ້ສິນ',
    '3': 'ທືນ',
    '4': 'ລາຍຈ່າຍ',
    '5': 'ລາຍຮັບ',
    '6': 'ນອກຝັງ',
    '7': 'ບັນຊີເງົາ',
    '8': 'ບັນຊີນອກພັງ'
  };
  return categories[category] || category;
};


const getGlTypeName = (glType: string) => {
  return glType ? `ຂັ້ນທີ ${glType}` : '';
};
</script>

<template>
  <v-col cols="12">
   
    <GlobalTextTitleLine :title="title" />
    
    
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="text-h6 bg-blue-lighten-5">
        <v-icon icon="mdi-magnify" class="mr-2"></v-icon>
        ຄົ້ນຫາຂໍ້ມູນ
      </v-card-title>
      <v-card-text>
        <v-row>
       
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchGlCode"
              density="compact"
              variant="outlined"
              label="ຄົ້ນຫາຕາມລະຫັດ GL"
              placeholder="ພິມລະຫັດ GL..."
              prepend-inner-icon="mdi-account-search"
              clearable
            />
          </v-col>
          
         
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="selectedCategory"
              :items="categoryOptions"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              label="ເລືອກປະເພດບັນຊີ"
              prepend-inner-icon="mdi-filter"
              clearable
            />
          </v-col>
          
        
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn
              color="warning"
              prepend-icon="mdi-refresh"
              @click="clearFilters"
              class="mr-2"
            >
              ລ້າງຕົວກອງ
            </v-btn>
            <v-chip
              v-if="res.length !== rawData.length"
              color="primary"
              variant="outlined"
            >
              ພົບ {{ res.length }} ລາຍການ ຈາກທັງໝົດ {{ rawData.length }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  
    <v-card variant="outlined">
      <v-data-table
        :items="res"
        :loading="glStore.isloading"
        :headers="header"
        class="elevation-1"
        :items-per-page="10"
        :search="false"
      >
       
        <template v-slot:item.glType="{ item }">
          <v-chip 
            :color="item.glType ? 'primary' : 'grey'" 
            variant="outlined" 
            size="small"
          >
            {{ getGlTypeName(item.glType) }}
          </v-chip>
        </template>

       
        <template v-slot:item.category="{ item }">
          <v-chip 
            :color="item.category === '1' ? 'green' : 
                   item.category === '2' ? 'red' : 
                   item.category === '3' ? 'blue' : 
                   item.category === '4' ? 'orange' : 
                   item.category === '5' ? 'purple' : 'grey'" 
            variant="tonal" 
            size="small"
          >
            {{ getCategoryName(item.category) }}
          </v-chip>
        </template>

       
        <template v-slot:item.retal="{ item }">
          <v-icon 
            :icon="item.retal === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.retal === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

        <template v-slot:item.Allow_BackPeriodEntry="{ item }">
          <v-icon 
            :icon="item.Allow_BackPeriodEntry === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.Allow_BackPeriodEntry === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

        <template v-slot:item.pl_Split_ReqD="{ item }">
          <v-icon 
            :icon="item.pl_Split_ReqD === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.pl_Split_ReqD === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

     
        <template v-slot:item.action="{ item }">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            @click="goPath(`/gl/glsub/create/?id=${item.gl_code}&glsub_id=${item.glid}`)"
          >
            <v-icon icon="mdi-plus" class="mr-1"></v-icon>
            ເພີ່ມບັນຊີຍ່ອຍ
          </v-btn>
        </template>

       
        <template v-slot:no-data>
          <div class="text-center pa-4">
            <v-icon icon="mdi-database-search" size="48" color="grey"></v-icon>
            <div class="text-h6 mt-2">ບໍ່ພົບຂໍ້ມູນ</div>
            <div class="text-body-2 text-grey">
              {{ searchGlCode || selectedCategory ? 'ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ' : 'ຍັງບໍ່ມີຂໍ້ມູນໃນລະບົບ' }}
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-col>
</template>