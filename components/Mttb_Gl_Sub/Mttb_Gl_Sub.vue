<template>
  <div>
    <!-- Tree View Table -->
    <v-data-table
      :headers="headers"
      :items="displayedItems"
      item-value="gl_code"
      hide-default-footer
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
          L{{ item.level }}
        </v-chip>
      </template>

      <template v-slot:item.has_children="{ item }">
        <v-icon v-if="item.has_children" color="success" size="small">
          mdi-folder
        </v-icon>
        <v-icon v-else color="info" size="small"> mdi-file-document </v-icon>
      </template>
    </v-data-table>

    <!-- <div class="d-flex gap-2 mt-4">
      <v-btn @click="expandAll" color="primary" variant="outlined" size="small">
        <v-icon left>mdi-chevron-down</v-icon>
        Expand All
      </v-btn>
      <v-btn @click="collapseAll" color="secondary" variant="outlined" size="small">
        <v-icon left>mdi-chevron-up</v-icon>
        Collapse All
      </v-btn>
      <v-btn @click="refreshData" color="success" variant="outlined" size="small" :loading="loading">
        <v-icon left>mdi-refresh</v-icon>
        Refresh
      </v-btn>
      <v-btn @click="showDebug = !showDebug" color="info" variant="outlined" size="small">
        <v-icon left>mdi-bug</v-icon>
        {{ showDebug ? 'Hide' : 'Show' }} Debug
      </v-btn>
    </div> -->

    <!-- <v-card class="mt-4" elevation="2">
      <v-card-title class="text-h6">
        <v-icon left>mdi-chart-tree</v-icon>
        Chart of Accounts Statistics
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6" md="3">
            <div class="text-center">
              <div class="text-h4 text-primary">{{ glStats.total }}</div>
              <div class="text-caption">Total Accounts</div>
            </div>
          </v-col>
          <v-col cols="6" md="3">
            <div class="text-center">
              <div class="text-h4 text-success">{{ glStats.withChildren }}</div>
              <div class="text-caption">Parent Accounts</div>
            </div>
          </v-col>
          <v-col cols="6" md="3">
            <div class="text-center">
              <div class="text-h4 text-info">{{ glStats.leafNodes }}</div>
              <div class="text-caption">Leaf Accounts</div>
            </div>
          </v-col>
          <v-col cols="6" md="3">
            <div class="text-center">
              <div class="text-h4 text-warning">{{ Object.keys(glStats.byLevel).length }}</div>
              <div class="text-caption">Levels</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card> -->

    <v-card class="mt-4" v-if="showDebug" elevation="1">
      <v-card-title>
        <v-icon left>mdi-code-json</v-icon>
        Debug Data
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="debugTab">
          <v-tab value="raw">Raw API Data</v-tab>
          <v-tab value="flattened">Flattened Data</v-tab>
          <v-tab value="displayed">Displayed Items</v-tab>
        </v-tabs>

        <v-tabs-window v-model="debugTab">
          <v-tabs-window-item value="raw">
            <pre>{{ res }}</pre>
          </v-tabs-window-item>
          <v-tabs-window-item value="flattened">
            <pre>{{ flattenedGlData.slice(0, 10) }}...</pre>
          </v-tabs-window-item>
          <v-tabs-window-item value="displayed">
            <pre>{{ displayedItems.slice(0, 10) }}...</pre>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

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

const headers = ref<Header[]>([
  {
    title: "ລະຫັດຂັ້ນບັນຊີ (GL Code)",
    align: "start",
    sortable: false,
    key: "gl_code",
    width: "250px",
  },
  {
    title: "Description (ລາວ)",
    key: "gl_Desc_la",
    sortable: false,
    align: "start",
  },
  {
    title: "Description (English)",
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
    title: "Type",
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
    expanded: level === 1,
    visible: true,
  }));
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

const displayedItems = computed(() => {
  return flattenTreeForDisplay(treeData.value);
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
</script>

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
