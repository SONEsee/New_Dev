<script setup lang="ts">
const title = "ຈັດການຂໍ້ມູນການເຄື່ອນຍ້າຍຊັບສົມບັດ";
const assetTypeStore = assetStore();
const selecassetType = ref("");
const fassetStore = faAssetStore();
const res = computed(() => {
  const data = fassetStore.response_fa_asset_list || [];
  if (!data || !Array.isArray(data)) return [];

  return data.filter((item) => item.Auth_Status && item.Auth_Status_ARC);
});
const assetTypeData = computed(() => {
  const data = assetTypeStore.response_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
watch(selecassetType, async (newValue) => {
  fassetStore.isLoading = true;
  try {
    fassetStore.filter_data_assetlist_id1.filter.asset_type_id = newValue;
    await fassetStore.GetFaAssetList2();
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ບໍ່ສາມາດດືງຊໍ້ມູນໄດ້",
      text: "ກະລຸນາລອງໃຫມ່ຂໍ້ມູນການດືງຊໍ້ມູນໄດ້",
    });
  } finally {
    fassetStore.isLoading = false;
  }
});
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

const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});

// Headers ສຳລັບການເຄື່ອນຍ້າຍຊັບສົມບັດ
const headers = computed(() => [
  {
    title: "ລະຫັດຊັບສົມບັດ",
    value: "asset_list_id",
    align: "start" as const,
    sortable: true,
    filterable: true,
    width: "180px",
    class: "text-primary font-weight-bold",
  },
  {
    title: "ເລກບາໂຄດ",
    value: "asset_tag",
    align: "center" as const,
    sortable: true,
    filterable: true,
    width: "180px",
    class: "text-center",
  },
  {
    title: "ຊື່ຊັບສົມບັດ",
    value: "asset_spec",
    align: "start" as const,
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-start",
  },
  {
    title: "ປະເພດຊັບສົມບັດ",
    value: "asset_id_detail.asset_type_detail.type_name_la",
    align: "center" as const,
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  {
    title: "ສະຖານທີ່ປັດຈຸບັນ",
    value: "location_detail.location_name_la",
    align: "center" as const,
    sortable: true,
    filterable: true,
    width: "150px",
    class: "text-center",
  },
  // {
  //   title: "ມູນຄ່າຊັບສົມບັດ",
  //   value: "asset_value",
  //   align: "end" as const,
  //   sortable: true,
  //   filterable: false,
  //   width: "150px",
  //   class: "text-end",
  // },
  // {
  //   title: "ມູນຄ່າຄົງເຫຼືອ",
  //   value: "asset_value_remain",
  //   align: "end" as const,
  //   sortable: true,
  //   filterable: false,
  //   width: "150px",
  //   class: "text-end",
  // },
  {
    title: "ສະຖານະ",
    value: "asset_status_detail.MC_name_la",
    align: "center" as const,
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  ...(canView.value
    ? [
        {
          title: "ເຄື່ອນຍ້າຍ",
          value: "transfer",
          align: "center" as const,
          sortable: false,
          filterable: false,
          width: "100px",
          class: "text-center",
        },
      ]
    : []),
  ...(canView.value
    ? [
        {
          title: "ປະຫວັດ",
          value: "history",
          align: "center" as const,
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
]);

const formatCurrency = (value: string | number) => {
  if (!value) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("lo-LA");
};

const transferAsset = (item: any) => {
  goPath(`/property/transfer_log/create/?asset_list_id=${item.asset_list_id}`);
};

const viewHistory = (item: any) => {
  goPath(`/property/transfer_log/detail/?asset_list_id=${item.asset_list_id}`);
};

const nameTypeDisplay = (item:any)=>{
  if(!item || !item.asset_name_la || !item.coa_id){
    return "ທັງໝົດ"
  }
  return `${item.asset_name_la}-${item.coa_id}`
}
onMounted(() => {
  assetTypeStore.GetAssetList();
  fassetStore.GetFaAssetList2();
  initializeRole();
  roleStore.GetRoleDetail();
});
</script>

<template>
  <div class="pa-4">
    <v-col cols="12">
      <GlobalTextTitleLine :title="title" />
      <v-row>
        <v-col cols="3">
          <v-autocomplete
          label="ເລືອກຕາມປະເພດຊັບສົມບັດ"
          density="compact" 
          variant="outlined"
            v-model="selecassetType"
            :items="assetTypeData"
            item-value="coa_id"
            :item-title="nameTypeDisplay"
          >
          <template v-slot:item="{props,item}">
            <v-list-item v-bind="props" :title="`${item.raw.asset_name_la}(${item.raw.coa_id})`">
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon size="small">mdi-package-variant</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
        </v-col>
      </v-row>

      <!-- Debug: ລົບອັນນີ້ອອກເມື່ອໃຊ້ງານແລ້ວ -->
      <!-- <pre>{{ assetTypeData }}</pre> -->

      <v-data-table
        class="text-no-wrap"
        flat
        :items="res"
        :headers="headers"
        :items-per-page="10"
        :loading="fassetStore.isLoading"
        loading-text="ກຳລັງໂຫລດຂໍ້ມູນ..."
        no-data-text="ບໍ່ມີຂໍ້ມູນ"
      >
        <template v-slot:header.asset_list_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_tag="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_spec="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template
          v-slot:header.asset_id_detail.asset_type_detail.type_name_la="{
            column,
          }"
        >
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.location_detail.location_name_la="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_value="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_value_remain="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_status_detail.MC_name_la="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.transfer="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.history="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:item.asset_value="{ item }">
          {{ formatCurrency(item.asset_value) }}
        </template>

        <template v-slot:item.asset_value_remain="{ item }">
          {{ formatCurrency(item.asset_value_remain) }}
        </template>

        <template v-slot:item.asset_status_detail.MC_name_la="{ item }">
          <v-chip
            :color="item.asset_status === 'AC' ? 'success' : 'default'"
            size="small"
          >
            {{ item.asset_status_detail?.MC_name_la || item.asset_status }}
          </v-chip>
        </template>

        <template v-slot:item.transfer="{ item }">
          <v-btn color="primary" size="small" @click="transferAsset(item)">
            <v-icon start>mdi-swap-horizontal</v-icon>
            ເຄື່ອນຍ້າຍ
          </v-btn>
        </template>

        <template v-slot:item.history="{ item }">
          <v-btn
            icon
            size="small"
            color="info"
            @click="viewHistory(item)"
            variant="tonal"
          >
            <v-icon>mdi-history</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-col>
  </div>
</template>

<style scoped>
.header-blue {
  color: blue;
}
/* .header-green { color: green; }
.header-purple { color: purple; }
.header-orange { color: orange; }
.header-teal { color: teal; }
.header-red { color: red; }
.header-darkgreen { color: darkgreen; }
.header-indigo { color: indigo; } */
</style>
