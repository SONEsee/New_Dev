<script setup lang="ts">
const accoutStore = accountMethodStore();
const res = computed(() => {
  return accoutStore.response_account_method_list;
});
onMounted(() => {
  accoutStore.GetAccountMethodList();
});
</script>
<template>
 <pre>{{ res }}</pre> 
</template>
<!-- <script setup lang="ts">
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
    value: "datamaping",
    align: "start" as const,
    sortable: true,
    filterable: true,
    width: "200px",
    class: "text-start",
  },
 
  {
    title: "ມູນລວມຄ່າຊັບສົມບັດ",
    value: "amount",
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
    <v-data-table
      class="text-no-wrap"
      flat
      :headers="headers"
      :items="res"
      :items-per-page="10"
      loading-text="ກຳລັງໂຫລດຂໍ້ມູນ..."
      no-data-text="ບໍ່ມີຂໍ້ມູນ"
    >
      <template v-slot:header.ref_id="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.datamaping="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.amount="{ column }">
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

      <template v-slot:item.datamaping="{ item }">
        {{ item.ref_id_text }}
      </template>
      <template v-slot:item.amount="{ item }">
        {{ formatCurrency(item.amount) }}
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
          @click="goPath(`/faassetdetription?sub_menu_id/?mon=`)"
        >
          <v-icon start>mdi-swap-horizontal</v-icon>
          ຫັກຄ່າຫຼູຍຫຽ້ນ
        </v-btn>
      </template>

      <template v-slot:item.history="{ item }">
        <v-btn icon size="small" color="info">
          <v-icon>mdi-history</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template> -->
