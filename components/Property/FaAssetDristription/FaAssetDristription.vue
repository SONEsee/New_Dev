<script setup lang="ts">
const title = "ຈັດການຂໍ້ມູນຫັກຄ່າຫຼູ້ຍຫຽ້ນຊັບສົມບັດ";
const accoutStore = accountMethodStore();
const fassetStore = faAssetStore();
const accoutdata = computed(() => {
  return accoutStore.response_account_method_list || [];
});
const res = computed(() => {
  const data = fassetStore.response_fa_asset_list || [];
  const maindata = accoutStore.response_account_method_list || [];
  
  const fiterData = maindata.filter((item) => item.ref_id);
  return fiterData.map((item: any) => {
    const ref_id = data.find((code: any) => code.asset_list_id === item.ref_id);
    return {
      ...item,
      ref_id_text: ref_id ? ref_id.asset_spec : item.ref_id,
      ref_id_detail: ref_id ? ref_id.dpca_type : item.ref_id,
    };
  });
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

const headers = computed(() => [
  {
    title: "ລະຫັດຊັບສົມບັດ",
    value: "ref_id",
    align: "start" as const,
    sortable: true,
    filterable: true,
    width: "180px",
    class: "text-primary font-weight-bold",
  },

  {
    title: "ຊື່ຊັບສົມບັດ",
    value: "asset_id_detail.asset_name_la",
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
  {
    title: "ມູນຄ່າຊັບສົມບັດ",
    value: "asset_value",
    align: "end" as const,
    sortable: true,
    filterable: false,
    width: "150px",
    class: "text-end",
  },
  {
    title: "ມູນຄ່າຄົງເຫຼືອ",
    value: "asset_value_remain",
    align: "end" as const,
    sortable: true,
    filterable: false,
    width: "150px",
    class: "text-end",
  },
  {
    title: "ສະຖານະ",
    value: "Record_Status",
    align: "center" as const,
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
  ...(canView.value
    ? [
        {
          title: "ຫັກຄ່າຫຼູ້ຍຫຽ້ນ",
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

// const fassetStore = faAssetStore();
// const res = computed(() => {
//   const data = fassetStore.response_fa_asset_list || [];
//   if (!data || !Array.isArray(data)) return [];

//   return data.filter(
//     (item) => item.Auth_Status === "A" && item.Auth_Status_ARC === "A"
//   );
// });

// const formatCurrency = (value: string | number) => {
//   if (!value) return "0";
//   const num = typeof value === "string" ? parseFloat(value) : value;
//   return new Intl.NumberFormat("lo-LA", {
//     style: "currency",
//     currency: "LAK",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(num);
// };

// const formatDate = (date: string) => {
//   if (!date) return "";
//   return new Date(date).toLocaleDateString("lo-LA");
// };

// const transferAsset = (item: any) => {
//   goPath(`/property/faassetdetription/create?asset_list_id=${item.asset_list_id}`);
// };

// const viewHistory = (item: any) => {
//   goPath(`/property/transfer_log/detail/?asset_list_id=${item.asset_list_id}`);
// };

onMounted(() => {
  accoutStore.GetAccountMethodList();
  fassetStore.GetFaAssetList();
  initializeRole();
  roleStore.GetRoleDetail();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <pre>{{ res }}</pre> -->
    <!-- <v-data-table
      :items="res"
      :headers="headers"
      class="text-no-wrap"
    >
    
  </v-data-table> -->
    <v-data-table
      class="text-no-wrap"
      flat
      :items="res"
      :items-per-page="10"
      loading-text="ກຳລັງໂຫລດຂໍ້ມູນ..."
      no-data-text="ບໍ່ມີຂໍ້ມູນ"
    >
      <template v-slot:header.asset_list_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_tag="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.asset_id_detail.asset_name_la="{ column }">
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

      <template v-slot:header.Record_Status="{ column }">
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
      <template v-slot:item.acc_type="{ item }">
        {{ item.ref_id_text }}
      </template>

      <template v-slot:item.asset_value_remain="{ item }">
        {{ formatCurrency(item.asset_value_remain) }}
      </template>

      <template v-slot:item.Record_Status="{ item }">
        <v-icon
          icon="mdi-toggle-switch"
          v-if="item.Record_Status === 'O'"
          color="primary"
        ></v-icon>
        <v-icon
          icon="mdi-toggle-switch-off-outline"
          v-if="item.Record_Status === 'C'"
          color="red"
        ></v-icon>
      </template>

      <template v-slot:item.transfer="{ item }">
        <v-btn
          color="primary"
          size="small"
          variant="tonal"
          @click="transferAsset(item)"
        >
          <v-icon start>mdi-swap-horizontal</v-icon>
          ຫັກຄ່າຫຼູຍຫຽ້ນ
        </v-btn>
      </template>

      <template v-slot:item.history="{ item }">
        <v-btn icon size="small" color="info" @click="viewHistory(item)">
          <v-icon>mdi-history</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
