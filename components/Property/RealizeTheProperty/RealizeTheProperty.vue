<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { formats } from "numeral";
import { ref, computed, onMounted, watch, onActivated } from "vue";

const title = "ໜ້າຈັດການການຮັບຮູ້ຊັບສິນ";
const faassetStore = faAssetStore();
const assetStores = assetStore();

// Key ສຳລັບບັນທຶກໃນ localStorage
const SELECTED_ASSET_TYPE_KEY = "selected_asset_type_filter";

// ປ່ຽນເປັນ ref ທຳມະດາ
const selectAssetType = ref<any | null>(null);

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

const masterStore = useMasterStore();
const masterstatus = computed(() => {
  return masterStore.respone_data_master;
});

const response = computed(() => {
  return assetStores.response_asset_list || [];
});

const respons = computed(() => {
  const data = faassetStore.response_fa_asset_list || [];
  return data.filter(
    (item) => !(item.asset_status === "AC" && item.Auth_Status_ARC === "A")
  );
});

const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});

// ຟັງຊັນສຳລັບໂຫຼດການເລືອກທີ່ບັນທຶກໄວ້
const loadSavedAssetTypeSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_ASSET_TYPE_KEY);
    if (saved) {
      const parsedAssetType = JSON.parse(saved);
      selectAssetType.value = parsedAssetType;
    } else {
      // ຖ້າບໍ່ມີການບັນທຶກ ໃຫ້ຕັ້ງເປັນ "all"
      selectAssetType.value = "all";
    }
  } catch (error) {
    console.error("Failed to load saved asset type selection:", error);
    selectAssetType.value = "all";
  }
};

// ຟັງຊັນສຳລັບບັນທຶກການເລືອກ
const saveAssetTypeSelection = (assetType: any) => {
  try {
    if (assetType) {
      localStorage.setItem(SELECTED_ASSET_TYPE_KEY, JSON.stringify(assetType));
    } else {
      localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);
    }
  } catch (error) {
    console.error("Failed to save asset type selection:", error);
  }
};

// Watch ການປ່ຽນແປງແລະບັນທຶກອັດຕະໂນມັດ
watch(
  selectAssetType,
  async (newValue) => {
    saveAssetTypeSelection(newValue);

    // ຖ້າຕ້ອງການໃຫ້ filter ແບບ real-time ສາມາດເພີ່ມການເອີ້ນ API ຫຼື update filter ຢູ່ນີ້
    // ເຊັ່ນ: await faassetStore.GetFaAssetList();
  },
  { deep: true }
);

const filterAssetType = computed(() => {
  let data = respons.value;
  const authStatus = masterstatus.value?.MasterCodes || [];

  if (!Array.isArray(data)) {
    return [];
  }

  // ການກັ່ນຕອງຕາມປະເພດທີ່ເລືອກ
  if (selectAssetType.value && selectAssetType.value !== "all") {
    const selectedValue =
      typeof selectAssetType.value === "object"
        ? selectAssetType.value.coa_id
        : selectAssetType.value;

    data = data.filter((item: any) => item.asset_type_id === selectedValue);
  }

  // ແປງຂໍ້ມູນແລະເພີ່ມ Auth Status
  const mappedData = data.map((item: any) => {
    const authStatusARC = authStatus.find(
      (code: any) => code.MC_code === item.Auth_Status_ARC
    );
    return {
      ...item,
      Auth_Status_ARC_Text: authStatusARC
        ? authStatusARC.MC_name_la
        : item.Auth_Status_ARC,
      Auth_Status_Detail: authStatusARC ? authStatusARC.MC_detail : "",
    };
  });

  return mappedData.sort((a: any, b: any) => {
    if (a.created_at && b.created_at) {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    if (a.asset_date && b.asset_date) {
      return (
        new Date(a.asset_date).getTime() - new Date(b.asset_date).getTime()
      );
    }

    if (a.asset_list_id && b.asset_list_id) {
      return parseInt(a.asset_list_id) - parseInt(b.asset_list_id);
    }

    return 0;
  });
});

const clearFilters = () => {
  selectAssetType.value = "all";
};

const loadDataAndApplyFilter = async () => {
  try {
    await Promise.all([
      assetStores.GetAssetList(),
      faassetStore.GetFaAssetList(),
      masterStore.getStatus(),
    ]);

    loadSavedAssetTypeSelection();
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
};
const route = useRoute();
const sub_menu_id = route.query.sub_menu_id as string;
onMounted(async () => {
  initializeRole(sub_menu_id);
  roleStore.GetRoleDetail();
  await loadDataAndApplyFilter();
});

onActivated(async () => {
  await loadDataAndApplyFilter();
});

// ຟັງຊັນລົບການບັນທຶກ localStorage (ສຳລັບ debug ຫຼື reset)
const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_ASSET_TYPE_KEY);
  selectAssetType.value = "all";
};

const headers = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "asset_list_id",
      key: "asset_list_id",
      align: "start",
      sortable: true,
      filterable: true,
      width: "80px",
      class: "text-primary font-weight-bold",
    },
    {
      title: "ປະເພດຊັບສົມບັດ",
      value: "asset_type_id",
      key: "asset_type_id",
      align: "start",
      sortable: true,
      filterable: true,
      width: "120px",
    },
    {
      title: "ລາຍລະອຽດສົມບັດ",
      value: "asset_spec",
      key: "asset_spec",
      align: "start",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-h6",
    },
    {
      title: "ມູນຄ່າເລີ່ມຕົ້ນ",
      value: "asset_value",
      key: "asset_value",
      align: "end",
      sortable: true,
      filterable: false,
      width: "120px",
      class: "text-end",
    },
    {
      title: "ມູນຄ່າຕໍ່ເດືອນ",
      value: "asset_value_remainMonth",
      key: "asset_value_remainMonth",
      align: "center",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-center",
    },
    {
      title: "ວັນທີ່ໄດ້ຮັບ",
      value: "asset_date",
      key: "asset_date",
      align: "center",
      sortable: true,
      filterable: false,
      width: "120px",
      class: "text-center",
    },
    // {
    //   title: "ຂັ້ນຕອນດຳເນີນການ",
    //   value: "asset_status",
    //   key: "asset_status",
    //   align: "center",
    //   sortable: true,
    //   filterable: true,
    //   width: "120px",
    //   class: "text-center",
    // },
    {
      title: "ສະຖານະ",
      value: "Auth_Status_ARC",
      key: "Auth_Status_ARC",
      align: "center",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-center",
    },
    {
      title: "ຈັດການ",
      value: "action",
      key: "action",
      align: "center",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-center",
    },
  ] as any;
});

const getAuthStatusColor = (authStatusCode: string) => {
  const colors = {
    A: "success",
    U: "warning",
    R: "error",
    P: "info",
  };
  return colors[authStatusCode as keyof typeof colors] || "grey";
};

// Expose ຟັງຊັນສຳລັບໃຊ້ຢູ່ພາຍນອກ
defineExpose({
  clearSavedSelection,
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-row>
      <v-col cols="12" md="3">
        <v-autocomplete
          v-model="selectAssetType"
          :items="[...(response || [])]"
          item-title="asset_name_la"
          item-value="coa_id"
          prepend-inner-icon="mdi-format-list-bulleted-type"
          label="ເລືອກຕາມປະເພດຊັບສົມບັດຍ່ອຍ"
          variant="outlined"
          density="compact"
          clearable
          placeholder="ເລືອກສະຖານະ"
          return-object
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.asset_name_la}(${item.raw.coa_id})`"
            >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-format-list-bulleted-type</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>

          <!-- <template v-slot:selection="{ item }">
            {{ item.raw.asset_name_la }}
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.raw.asset_name_la"
              :subtitle="
                item.raw.coa_id !== 'all' ? `ID: ${item.raw.coa_id}` : ''
              "
            />
          </template> -->
        </v-autocomplete>
      </v-col>

      <v-col cols="12" md="2">
        <v-btn color="secondary" variant="outlined" @click="clearFilters" block>
          <v-icon class="mr-2">mdi-filter-remove</v-icon>
          ເຄລຍການກັ່ນຕອງ
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      style="font-size: 75%"
      :items="filterAssetType || []"
      :headers="headers"
      class="text-no-wrap"
      :loading="faassetStore.isLoading"
    >
      <!-- Header templates (ເກັບແບບເດີມ) -->
      <template v-slot:header.asset_list_id="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_spec="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_type_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_serial_no="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.type_of_pay="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_value_remainMonth="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_date="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_value_remain="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_status="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.has_depreciation="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.view="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.Auth_Status_ARC="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.edit="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.delete="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.depreciation="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.asset_accu_dpca_value="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:header.action="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      <template v-slot:item.asset_list_id="{ item }">
        <v-chip
          style="border: solid"
          color="primary"
          size="small"
          variant="flat"
          >{{ item.asset_list_id }}</v-chip
        >
      </template>

      <template v-slot:item.asset_type_id="{ item }">
        <v-chip
          style="border: 1px solid"
          color="info"
          size="small"
          variant="flat"
          >{{ item.asset_id_detail.asset_name_la }}</v-chip
        >
      </template>

      <template v-slot:item.asset_value="{ item }">
        <v-chip
          style="border: 1px solid"
          color="info"
          size="small"
          variant="flat"
        >
          {{ Number(item.asset_value).toLocaleString("en-US") }}
          {{ item.asset_currency }}
        </v-chip>
      </template>

      <template v-slot:item.Auth_Status_ARC="{ item }">
        <v-chip
          size="small"
          variant="flat"
          :color="getAuthStatusColor(item.Auth_Status_ARC)"
        >
          {{ item.Auth_Status_ARC_Text }}
        </v-chip>
      </template>

      <template v-slot:item.asset_value_remainMonth="{ item }">
        <v-chip
          style="border: 1px solid"
          color="primary"
          size="small"
          variant="flat"
        >
          {{ Number(item.asset_value_remainMonth).toLocaleString("en-US") }}
          {{ item.asset_currency }}
        </v-chip>
      </template>

      <template v-slot:item.asset_status="{ item }">
        <div v-if="item.asset_status === 'UC'">
          <v-chip
            style="border: 1px solid"
            color="info"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'AC'">
          <v-chip
            style="border: 1px solid"
            color="success"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'AI'">
          <v-chip
            style="border: 1px solid"
            color="error"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'MT'">
          <v-chip
            style="border: 1px solid"
            color="warning"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'DS'">
          <v-chip
            style="border: 1px solid"
            color="deep-purple"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'DM'">
          <v-chip
            style="border: 1px solid"
            color="deep-orange"
            size="small"
            variant="flat"
          >
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.action="{ item }">
        <v-btn
          v-if="item.Auth_Status === 'A' && item.asset_status === 'UC'"
          color="primary"
          @click="
            goPath(
              `/property/realizetheproperty/create?asset_list_id=${item.asset_list_id}`
            )
          "
        >
          ຢັ້ງຢືນ
        </v-btn>
        <v-chip v-if="item.Auth_Status === 'A' && item.asset_status === 'AC'">
          <v-icon icon="mdi-check-underline" style="color: darkgreen"></v-icon>
        </v-chip>
        <v-btn
          v-if="item.Auth_Status === 'U'"
          color="primary"
          @click="
            goPath(
              `/property/realizetheproperty/create?asset_list_id=${item.asset_list_id}`
            )
          "
          disabled
        >
          ຢັ້ງຢືນ
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
