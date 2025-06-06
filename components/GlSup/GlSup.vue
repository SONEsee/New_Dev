<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

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

const datares = computed((): any[] => {
  return (glStore.tree_gl_sup_response as any) || [];
});

const rawData = computed((): any[] => {
  return (glStore.respons_gl_sup as any) || [];
});

const res = computed((): any[] => {
  let filtered = rawData.value;

  if (searchGlCode.value.trim()) {
    filtered = filtered.filter(
      (item) =>
        item.gl_code &&
        item.gl_code.toLowerCase().includes(searchGlCode.value.toLowerCase())
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (item) => item.category === selectedCategory.value
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


const expandedRows = ref(new Set());


const subData = ref({});


const toggleExpand = async (item: any) => {
  const glCode = item.gl_code;
  const glid = item.glid;
  
  if (expandedRows.value.has(glCode)) {
 
    expandedRows.value.delete(glCode);
  } else {
  
    expandedRows.value.add(glCode);
    await loadSubData(glid, glCode);
  }
};


const loadSubData = async (glid: number, glCode: string) => {
  try {
    console.log(`Loading sub data for GL ID: ${glid}, GL Code: ${glCode}`);
    
   
    await glStore.getTreeGlSup(glid);
    
   
    const treeData = datares.value?.data || datares.value || [];
    console.log('Tree API response:', treeData);
    
   
    subData.value[glCode] = Array.isArray(treeData) ? treeData : [];
    console.log(`Loaded ${subData.value[glCode].length} sub records for ${glCode}`);
  } catch (error) {
    console.error("Error loading sub data:", error);
    subData.value[glCode] = [];
  }
};


const isExpanded = (glCode: string) => {
  return expandedRows.value.has(glCode);
};


const flatTableData = computed(() => {
  const result = [];
  
  res.value.forEach(masterItem => {
   
    result.push({
      id: `gl_${masterItem.glid}`,
      type: 'master',
      level: 0,
      gl_code: masterItem.gl_code,
      gl_Desc_la: masterItem.gl_Desc_la,
      gl_Desc_en: masterItem.gl_Desc_en,
      glType: masterItem.glType,
      category: masterItem.category,
      retal: masterItem.retal,
      ccy_Res: masterItem.ccy_Res,
      Res_ccy: masterItem.Res_ccy,
      Allow_BackPeriodEntry: masterItem.Allow_BackPeriodEntry,
      pl_Split_ReqD: masterItem.pl_Split_ReqD,
      rawData: masterItem,
      isExpanded: expandedRows.value.has(masterItem.gl_code),
      isLoaded: !!subData.value[masterItem.gl_code],
      hasChildren: (subData.value[masterItem.gl_code] || []).length > 0
    });
    
  
    if (expandedRows.value.has(masterItem.gl_code) && subData.value[masterItem.gl_code]) {
      subData.value[masterItem.gl_code].forEach(subItem => {
        result.push({
          id: `sub_${subItem.glsub_id || subItem.id}`,
          type: 'sub',
          level: 1,
          gl_code: subItem.glsub_code || subItem.code,
          gl_Desc_la: subItem.glsub_Desc_la || subItem.name_la,
          gl_Desc_en: subItem.glsub_Desc_en || subItem.name_en,
          glType: '',
          category: '',
          retal: '',
          ccy_Res: '',
          Res_ccy: '',
          Allow_BackPeriodEntry: '',
          pl_Split_ReqD: '',
          status: subItem.Auth_Status || subItem.status,
          maker: subItem.Maker_Id || subItem.created_by,
          date: subItem.Maker_DT_Stamp || subItem.created_at,
          rawData: subItem,
          parent_gl_code: masterItem.gl_code
        });
      });
    }
  });
  
  return result;
});
const deleteSubItem = async (subItem: any, glCode: string) => {
  const result = await Swal.fire({
    title: 'ຢືນຢັນການລຶບ',
    html: `
      <div>ທ່ານຕ້ອງການລຶບຂໍ້ມູນນີ້ບໍ?</div>
      <div class="mt-2">
        <strong>ລະຫັດ:</strong> ${subItem.glsub_code || subItem.code}<br>
        <strong>ຊື່:</strong> ${subItem.glsub_Desc_la || subItem.name_la}
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ'
  });

  if (result.isConfirmed) {
    try {
      
      console.log('Deleting SubMaster:', subItem);
      
      Swal.fire({
        title: 'ລຶບສຳເລັດ!', 
        text: `${subItem.glsub_code || subItem.code} ຖືກລຶບແລ້ວ`, 
        icon: 'success',
        timer: 2000
      });
      
    
      const parentGL = rawData.value.find(gl => gl.gl_code === glCode);
      if (parentGL) {
        await loadSubData(parentGL.glid, glCode);
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire('ເກີດຂໍ້ຜິດພາດ!', 'ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້', 'error');
    }
  }
};

onMounted(() => {
  glStore.getGlsup(); 
});

const header = [
  { title: "", value: "expand", width: "50px", sortable: false },
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
    "1": "ຊັບສິນ",
    "2": "ໜີ້ສິນ",
    "3": "ທືນ",
    "4": "ລາຍຈ່າຍ",
    "5": "ລາຍຮັບ",
    "6": "ນອກຝັງ",
    "7": "ບັນຊີເງົາ",
    "8": "ບັນຊີນອກພັງ",
  };
  return categories[category] || category;
};

const getGlTypeName = (glType: string) => {
  return glType ? `ຂັ້ນທີ ${glType}` : "";
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
        :headers="header"
        :items="flatTableData"
        :loading="glStore.isloading"
        class="elevation-1"
        :items-per-page="10"
        :search="false"
        item-value="id"
      >
       
        <template v-slot:item.expand="{ item }">
          <v-btn
            v-if="item.type === 'master'"
            :icon="item.isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            size="small"
            variant="text"
            :color="item.isExpanded ? 'primary' : 'grey'"
            @click="toggleExpand(item.rawData)"
          >
          </v-btn>
        </template>

       
        <template v-slot:item.gl_code="{ item }">
          <div class="d-flex align-center" :class="{ 'ml-6': item.level === 1 }">
           
            <template v-if="item.type === 'master'">
              <v-icon 
                :color="item.isExpanded ? 'primary' : 'grey'" 
                class="mr-2"
              >
                {{ item.isExpanded ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
              <span class="font-weight-bold">{{ item.gl_code }}</span>
            </template>
            
         
            <template v-else>
              <v-icon color="secondary" class="mr-2">
                mdi-file-document
              </v-icon>
              <span class="font-weight-medium">{{ item.gl_code }}</span>
              <v-chip 
                :color="item.status === 'A' ? 'success' : 
                       item.status === 'U' ? 'warning' : 'error'"
                size="x-small"
                variant="flat"
                class="ml-2"
              >
                {{ item.status === 'A' ? 'Approved' : 
                   item.status === 'U' ? 'Pending' : 'Rejected' }}
              </v-chip>
            </template>
          </div>
        </template>

       
        <template v-slot:item.glType="{ item }">
          <v-chip 
            v-if="item.glType && item.type === 'master'"
            color="primary"
            size="small"
            variant="outlined"
          >
            {{ getGlTypeName(item.glType) }}
          </v-chip>
        </template>

       
        <template v-slot:item.category="{ item }">
          <v-chip 
            v-if="item.category && item.type === 'master'"
            :color="item.category === '1' ? 'green' : 
                   item.category === '2' ? 'red' : 
                   item.category === '3' ? 'blue' : 
                   item.category === '4' ? 'orange' : 
                   item.category === '5' ? 'purple' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ getCategoryName(item.category) }}
          </v-chip>
          <div v-else-if="item.type === 'sub'" class="text-caption text-grey">
            ສ້າງໂດຍ: {{ item.maker }} | {{ item.date ? new Date(item.date).toLocaleDateString('lo-LA') : 'N/A' }}
          </div>
        </template>

        
        <template v-slot:item.retal="{ item }">
          <v-icon 
            v-if="item.type === 'master'"
            :icon="item.retal === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.retal === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

        <template v-slot:item.Allow_BackPeriodEntry="{ item }">
          <v-icon 
            v-if="item.type === 'master'"
            :icon="item.Allow_BackPeriodEntry === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.Allow_BackPeriodEntry === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

        <template v-slot:item.pl_Split_ReqD="{ item }">
          <v-icon 
            v-if="item.type === 'master'"
            :icon="item.pl_Split_ReqD === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.pl_Split_ReqD === 'Y' ? 'success' : 'error'"
          ></v-icon>
        </template>

        
        <template v-slot:item.action="{ item }">
          
          <v-btn
            v-if="item.type === 'master'"
            color="primary"
            variant="elevated"
            size="small"
            @click="goPath(`/gl/glsub/create/?id=${item.rawData.gl_code}&glsub_id=${item.rawData.glid}`)"
          >
            <v-icon icon="mdi-plus" class="mr-1"></v-icon>
            ເພີ່ມບັນຊີຍ່ອຍ
          </v-btn>
          
         
          <div v-else-if="item.status === 'U'" class="d-flex gap-1">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="goPath(`/gl/glsub/edit/?id=${item.rawData.glsub_id || item.rawData.id}`)"
              title="ແກ້ໄຂ"
            >
            </v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteSubItem(item.rawData, item.parent_gl_code)"
              title="ລຶບ"
            >
            </v-btn>
          </div>
          <div v-else class="d-flex gap-1">
           <v-chip color="primary">ຖືກນຳໃຊ້ແລ້ວ</v-chip>
          </div>
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