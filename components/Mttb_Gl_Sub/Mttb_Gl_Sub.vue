<template>
  <div>
    <v-data-table
      :group-by="groupBy"
      :headers="headers"
      :items="flattenedGlData"
      item-value="gl_code"
      hide-default-footer
      :loading="loading"
    >
      <template
        v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <tr>
          <td :colspan="columns.length">
            <div class="d-flex align-center">
              <v-btn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                color="medium-emphasis"
                density="comfortable"
                size="small"
                variant="outlined"
                @click="toggleGroup(item)"
              ></v-btn>

              <span class="ms-4">Level: {{ item.value }}</span>
            </div>
          </td>
        </tr>
      </template>

      <template v-slot:item.gl_code="{ item }">
        <span :class="getCodeClass(item.level)">{{ item.gl_code }}</span>
      </template>

      <template v-slot:item.gl_Desc_la="{ item }">
        <span :class="getDescClass(item.level)">{{ item.gl_Desc_la }}</span>
      </template>
    </v-data-table>

   
    <v-card class="mt-4" v-if="showDebug">
      <v-card-title>Debug Data:</v-card-title>
      <v-card-text>
        <pre>{{ res }}</pre>
      </v-card-text>
    </v-card>

    <!-- <v-btn @click="showDebug = !showDebug" class="mt-2">
      {{ showDebug ? "Hide" : "Show" }} Debug Data
    </v-btn> -->
  </div>
</template>

<script setup lang="ts">
interface GLAccount {
  gl_code: string;
  gl_Desc_la: string;
  gl_Desc_en: string;
  children: GLAccount[];
}

interface FlattenedGLAccount {
  gl_code: string;
  gl_Desc_la: string;
  gl_Desc_en: string;
  level: number;
  parent_code?: string;
  has_children: boolean;
}

interface Header {
  title: string;
  align?: "start" | "center" | "end";
  sortable: boolean;
  key: string;
  width?: string;
}

interface GroupBy {
  key: string;
  order: "asc" | "desc";
}

const glStore = useGlStore();
const res = computed(() => {
  return glStore.respons_data_gl;
});

const loading = ref(false);
const showDebug = ref(false);

const groupBy = ref<GroupBy[]>([
  {
    key: "level",
    order: "asc",
  },
]);

const headers = ref<Header[]>([
  {
    title: "GL Code",
    align: "start",
    sortable: true,
    key: "gl_code",
    width: "200px",
  },
  {
    title: "Description (Lao)",
    key: "gl_Desc_la",
    sortable: true,
    align: "start",
  },
  {
    title: "Description (English)",
    key: "gl_Desc_en",
    sortable: true,
    align: "start",
  },
  {
    title: "ຂັ້ນ",
    key: "level",
    sortable: true,
    width: "100px",
  },
  {
    title: "Has Children",
    key: "has_children",
    sortable: true,
    width: "120px",
  },
]);

const flattenGLData = (
  accounts: GLAccount[],
  level: number = 1,
  parentCode?: string
): FlattenedGLAccount[] => {
  const result: FlattenedGLAccount[] = [];

  accounts.forEach((account) => {
    result.push({
      gl_code: account.gl_code,
      gl_Desc_la: account.gl_Desc_la,
      gl_Desc_en: account.gl_Desc_en,
      level: level,
      parent_code: parentCode,
      has_children: account.children && account.children.length > 0,
    });

    if (account.children && account.children.length > 0) {
      result.push(
        ...flattenGLData(account.children, level + 1, account.gl_code)
      );
    }
  });

  return result;
};

const flattenedGlData = computed(() => {
  if (!res.value || !Array.isArray(res.value)) {
    return [];
  }
  return flattenGLData(res.value);
});

const getCodeClass = (level: number): string => {
  const classes = ["font-weight-bold"];
  if (level === 1) classes.push("text-primary");
  else if (level === 2) classes.push("text-secondary");
  else if (level >= 3) classes.push("text-medium-emphasis");

  return classes.join(" ");
};

const getDescClass = (level: number): string => {
  const classes = [];
  if (level === 1) classes.push("font-weight-bold", "text-primary");
  else if (level === 2) classes.push("font-weight-medium", "text-secondary");
  else if (level >= 3) classes.push("text-medium-emphasis");

  classes.push(`ml-${(level - 1) * 4}`);

  return classes.join(" ");
};

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

const refreshData = async () => {
  loading.value = true;
  try {
    await glStore.getGl();
  } finally {
    loading.value = false;
  }
};

const findAccountByCode = (code: string): FlattenedGLAccount | undefined => {
  return flattenedGlData.value.find((account) => account.gl_code === code);
};

const getChildrenByParentCode = (parentCode: string): FlattenedGLAccount[] => {
  return flattenedGlData.value.filter(
    (account) => account.parent_code === parentCode
  );
};

onMounted(async () => {
  await refreshData();
});

useHead({
  title: "Chart of Accounts",
  meta: [
    {
      name: "description",
      content: "General Ledger Chart of Accounts Management",
    },
  ],
});

defineExpose({
  flattenedGlData,
  glStats,
  refreshData,
});
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}

.ms-4 {
  font-weight: 500;
  color: var(--v-theme-on-surface);
}

.ml-0 {
  margin-left: 0px;
}
.ml-4 {
  margin-left: 16px;
}
.ml-8 {
  margin-left: 32px;
}
.ml-12 {
  margin-left: 48px;
}
.ml-16 {
  margin-left: 64px;
}
.ml-20 {
  margin-left: 80px;
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}

.text-secondary {
  color: rgb(var(--v-theme-secondary)) !important;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

pre {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
