<script setup lang="ts">
interface GLAccount {
  gl_code: string;
  gl_Desc_la: string;
  gl_Desc_en: string;
  children: GLAccount[];
}

interface TreeGLAccount {
  gl_code: string;
  gl_Desc_la: string;
  gl_Desc_en: string;
  level: number;
  parent_code?: string;
  has_children: boolean;
  children: TreeGLAccount[];
  expanded: boolean;
  visible: boolean;
  category?: string; // ເພີ່ມ category field
}

interface Header {
  title: string;
  align?: "start" | "center" | "end";
  sortable: boolean;
  key: string;
  width?: string;
}

const glStore = useGlStore();
const res = computed(() => {
  return glStore.respons_data_gl;
});

const loading = ref(false);
const showDebug = ref(false);
const debugTab = ref("raw");

// ⭐ ເພີ່ມ Filter States
const filterLevel = ref(null);
const filterCategory = ref(null);
const searchGlCode = ref("");

// ⭐ Level Options
const levelOptions = computed(() => [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ຂັ້ນທີ 1', value: 1 },
  { title: 'ຂັ້ນທີ 2', value: 2 },
  { title: 'ຂັ້ນທີ 3', value: 3 },
  { title: 'ຂັ້ນທີ 4', value: 4 },
  { title: 'ຂັ້ນທີ 5', value: 5 },
]);


const categoryOptions = computed(() => [
  { title: 'ທັງໝົດ-all', value: null },
  { title: 'ຊັບສິນ-1', value: '1' },
  { title: 'ໜີ້ສິນ-2', value: '2' },
  { title: 'ທືນ-3', value: '3' },
  { title: 'ລາຍຈ່າຍ-4', value: '4' },
  { title: 'ລາຍຮັບ-5', value: '5' },
  { title: 'ນອກຝັງ-6', value: '6' },
  { title: 'ບັນຊີເງົາ-7', value: '7' },
  { title: 'ບັນຊີນອກພັງ-8', value: '8' },
]);

const headers = ref<Header[]>([
  {
    title: "ລະຫັດຂັ້ນບັນຊີ (GL Code)",
    align: "start",
    sortable: false,
    key: "gl_code",
    width: "250px",
  },
  {
    title: "ລາຍລະອຽດ (ລາວ)",
    key: "gl_Desc_la",
    sortable: false,
    align: "start",
  },
  {
    title: "ລາຍລະອຽດ (English)",
    key: "gl_Desc_en",
    sortable: false,
    align: "start",
  },
  {
    title: "ຂັ້ນບັນຊີ (Level)",
    key: "level",
    sortable: false,
    width: "100px",
  },
  {
    title: "",
    key: "has_children",
    sortable: false,
    width: "80px",
  },
]);

const buildTreeData = (
  accounts: GLAccount[],
  level: number = 1,
  parentCode?: string
): TreeGLAccount[] => {
  return accounts.map((account) => ({
    gl_code: account.gl_code,
    gl_Desc_la: account.gl_Desc_la,
    gl_Desc_en: account.gl_Desc_en,
    level: level,
    parent_code: parentCode,
    has_children: account.children && account.children.length > 0,
    children: account.children
      ? buildTreeData(account.children, level + 1, account.gl_code)
      : [],
    expanded: false, 
    visible: true,
  
    category: getCategoryByGLCode(account.gl_code),
  }));
};


const getCategoryByGLCode = (glCode: string): string => {
  const firstDigit = glCode.charAt(0);

  const categoryMap: Record<string, string> = {
    '1': '1', 
    '2': '2', 
    '3': '3', 
    '4': '4', 
    '5': '5', 
    '6': '6', 
    '7': '7', 
    '8': '8', 
  };
  return categoryMap[firstDigit] || '1';
};

const treeData = ref<TreeGLAccount[]>([]);

const flattenTreeForDisplay = (items: TreeGLAccount[]): TreeGLAccount[] => {
  const result: TreeGLAccount[] = [];

  items.forEach((item) => {
    if (item.visible) {
      result.push(item);

      if (item.expanded && item.children.length > 0) {
        item.children.forEach((child) => {
          child.visible = true;
        });
        result.push(...flattenTreeForDisplay(item.children));
      } else {
        const hideChildren = (children: TreeGLAccount[]) => {
          children.forEach((child) => {
            child.visible = false;
            if (child.children.length > 0) {
              hideChildren(child.children);
            }
          });
        };
        hideChildren(item.children);
      }
    }
  });

  return result;
};


const filteredTreeData = computed(() => {
  if (!filterLevel.value && !filterCategory.value && !searchGlCode.value.trim()) {
    return treeData.value;
  }

  const filterTree = (items: TreeGLAccount[]): TreeGLAccount[] => {
    return items.filter(item => {
  
      const categoryMatch = !filterCategory.value || item.category === filterCategory.value;
      

      const glCodeMatch = !searchGlCode.value.trim() || 
        item.gl_code.toLowerCase().includes(searchGlCode.value.trim().toLowerCase()) ||
        item.gl_Desc_la?.toLowerCase().includes(searchGlCode.value.trim().toLowerCase()) ||
        item.gl_Desc_en?.toLowerCase().includes(searchGlCode.value.trim().toLowerCase());
      
  
      let levelMatch = true;
      let shouldIncludeChildren = true;
      
      if (filterLevel.value) {
    
        levelMatch = item.level === filterLevel.value || 
                    (item.level < filterLevel.value && hasChildrenAtLevel(item, filterLevel.value));
      }
      
  
      const directMatch = levelMatch && categoryMatch && glCodeMatch;
      

      const hasMatchingChildren = item.children.length > 0 && 
        filterTree(item.children).length > 0;
      
      return directMatch || hasMatchingChildren;
    }).map(item => ({
      ...item,
      children: filterTree(item.children),
     
      expanded: (searchGlCode.value.trim() || filterCategory.value) ? true : item.expanded
    }));
  };

  return filterTree(treeData.value);
});


const hasChildrenAtLevel = (item: TreeGLAccount, targetLevel: number): boolean => {
  if (item.level === targetLevel) return true;
  if (item.children.length === 0) return false;
  
  return item.children.some(child => hasChildrenAtLevel(child, targetLevel));
};

const displayedItems = computed(() => {
  return flattenTreeForDisplay(filteredTreeData.value);
});

const flattenedGlData = computed(() => {
  const flatten = (items: TreeGLAccount[]): TreeGLAccount[] => {
    const result: TreeGLAccount[] = [];
    items.forEach((item) => {
      result.push(item);
      if (item.children.length > 0) {
        result.push(...flatten(item.children));
      }
    });
    return result;
  };
  return flatten(treeData.value);
});

const glStats = computed(() => {
  const data = flattenedGlData.value;
  return {
    total: data.length,
    byLevel: data.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    withChildren: data.filter((item) => item.has_children).length,
    leafNodes: data.filter((item) => !item.has_children).length,
  };
});


const clearFilters = () => {
  filterLevel.value = null;
  filterCategory.value = null;
  searchGlCode.value = "";
};

const getCodeClass = (level: number): string => {
  const classes = ["font-weight-bold"];
  if (level === 1) classes.push("text-primary");
  else if (level === 2) classes.push("text-secondary");
  else if (level === 3) classes.push("text-success");
  else classes.push("text-medium-emphasis");

  return classes.join(" ");
};

const getDescClass = (level: number): string => {
  const classes = [];
  if (level === 1) classes.push("font-weight-bold", "text-primary");
  else if (level === 2) classes.push("font-weight-medium", "text-secondary");
  else if (level === 3) classes.push("text-success");
  else classes.push("text-medium-emphasis");

  return classes.join(" ");
};

const getLevelColor = (level: number): string => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "warning",
    "info",
    "error",
  ];
  return colors[(level - 1) % colors.length];
};

const findItemByCode = (
  code: string,
  items: TreeGLAccount[] = treeData.value
): TreeGLAccount | null => {
  for (const item of items) {
    if (item.gl_code === code) {
      return item;
    }
    if (item.children.length > 0) {
      const found = findItemByCode(code, item.children);
      if (found) return found;
    }
  }
  return null;
};

const toggleExpand = (item: TreeGLAccount) => {
  if (item.has_children) {
    item.expanded = !item.expanded;
  }
};

const expandAll = () => {
  const expand = (items: TreeGLAccount[]) => {
    items.forEach((item) => {
      if (item.has_children) {
        item.expanded = true;
        expand(item.children);
      }
    });
  };
  expand(treeData.value);
};

const collapseAll = () => {
  const collapse = (items: TreeGLAccount[]) => {
    items.forEach((item) => {
      if (item.has_children) {
        item.expanded = false;
        collapse(item.children);
      }
    });
  };
  collapse(treeData.value);
};

const refreshData = async () => {
  loading.value = true;
  try {
    await glStore.getGl();
    updateTreeData();
  } finally {
    loading.value = false;
  }
};

const updateTreeData = () => {
  if (!res.value || !Array.isArray(res.value)) {
    treeData.value = [];
    return;
  }
  treeData.value = buildTreeData(res.value);
};

watch(
  res,
  () => {
    updateTreeData();
  },
  { immediate: true }
);

onMounted(async () => {
  await refreshData();
});

useHead({
  title: "Chart of Accounts - Tree View",
  meta: [
    {
      name: "description",
      content: "Hierarchical Chart of Accounts with expandable tree structure",
    },
  ],
});

const title = "ຈັດການຂໍ້ມູນບັນຊີ";
</script>

<template>
  <div>
    <div>
      <GlobalTextTitleLine :title="title" />
      
      <!-- ⭐ Filter Section -->
      <v-card class="mb-4" elevation="1">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-filter</v-icon>
          ຟິວເຕີ້ຂໍ້ມູນ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchGlCode"
                label="ຄົ້ນຫາ GL Code / ຊື່ບັນຊີ"
                variant="outlined"
                density="compact"
                clearable
                placeholder="ເຊັ່ນ: 110, ເງິນສົດ, Cash"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-magnify</v-icon>
                </template>
              </v-text-field>
            </v-col>
            
            <!-- <v-col cols="12" md="3">
              <v-autocomplete
                v-model="filterLevel"
                :items="levelOptions"
                item-title="title"
                item-value="value"
                label="ເລືອກຂັ້ນບັນຊີ"
                variant="outlined"
                density="compact"
                clearable
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-layers</v-icon>
                </template>
              </v-autocomplete>
            </v-col> -->
            
            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="filterCategory"
                :items="categoryOptions"
                item-title="title"
                item-value="value"
                label="ເລືອກປະເພດບັນຊີ"
                variant="outlined"
                density="compact"
                clearable
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-tag</v-icon>
                </template>
              </v-autocomplete>
            </v-col>
            
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn
                @click="clearFilters"
                color="secondary"
                variant="outlined"
                class="mr-2 mb-5"
              >
                <v-icon class="mr-1">mdi-filter-off</v-icon>
                ລ້າງຟິວເຕີ້
              </v-btn>
              
              <v-chip
                v-if="filterLevel || filterCategory || searchGlCode.trim()"
                color="primary"
                size="small"
              >
                {{ displayedItems.length }} ລາຍການ
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-btn color="primary" class="mt-2 ml-2" @click="goPath('/gl/create')">
        <v-icon icon="mdi-plus"></v-icon>
        ເພີ່ມບັນຊີໃໝ່ຂັ້ນ 1
      </v-btn>
    </div>
    
    <v-data-table
      :headers="headers"
      :items="displayedItems"
      item-value="gl_code"
      :loading="loading"
      class="gl-tree-table"
    >
      <template v-slot:item.gl_code="{ item }">
        <div
          class="d-flex align-center"
          :style="{ paddingLeft: `${item.level * 20}px` }"
        >
          <v-btn
            v-if="item.has_children"
            :icon="item.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            size="small"
            variant="text"
            density="compact"
            @click="toggleExpand(item)"
            class="mr-2"
          />
          <div v-else class="mr-8"></div>

          <span
            :class="getCodeClass(item.level)"
            @click="item.has_children ? toggleExpand(item) : null"
            :style="{ cursor: item.has_children ? 'pointer' : 'default' }"
          >
            {{ item.gl_code }}
          </span>
        </div>
      </template>

      <template v-slot:item.gl_Desc_la="{ item }">
        <span
          :class="getDescClass(item.level)"
          @click="item.has_children ? toggleExpand(item) : null"
          :style="{ cursor: item.has_children ? 'pointer' : 'default' }"
        >
          {{ item.gl_Desc_la }}
        </span>
      </template>

      <template v-slot:item.gl_Desc_en="{ item }">
        <span :class="getDescClass(item.level)">
          {{ item.gl_Desc_en }}
        </span>
      </template>

      <template v-slot:item.level="{ item }">
        <v-chip :color="getLevelColor(item.level)" size="small" variant="flat">
          ຂັ້ນ{{ item.level }}
        </v-chip>
      </template>

      <template v-slot:item.has_children="{ item }">
        <div
          v-if="
            (item.children && item.children.length > 0) ||
            parseInt(item.level) < 5
          "
        >
          <v-btn
            @click="
              goPath(
                `/glsubal/create/?gl_code=${item.gl_code}&glType=${item.level}`
              )
            "
            width="100px"
            color="primary"
            size="small"
          >
            <v-icon icon="mdi-plus"></v-icon>ເພີ່ມ ຂັ້ນ{{ item.level + 1 }}
          </v-btn>
        </div>

        <div v-else-if="item.level === 5">
          <v-icon color="success" size="small"> mdi-check-circle </v-icon>
          <span class="text-caption ml-1">ສຸດທ້າຍ</span>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<style scoped>
.gl-tree-table {
  background-color: transparent;
}

.gl-tree-table .v-data-table__td {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}

.text-secondary {
  color: rgb(var(--v-theme-secondary)) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

pre {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.gap-2 {
  gap: 8px;
}

.v-data-table tbody tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.gl-tree-table .v-btn {
  min-width: 24px !important;
  width: 24px;
  height: 24px;
}
</style>