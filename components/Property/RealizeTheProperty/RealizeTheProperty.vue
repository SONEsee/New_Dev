<script setup lang="ts">
import dayjs from '#build/dayjs.imports.mjs';
import { formats } from 'numeral';
const title = "ໜ້າຈັດການການຮັບຮູ້ຊັບສິນ";
const faassetStore = faAssetStore();
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
const respons = computed(() => {
  return faassetStore.response_fa_asset_list;
});
onMounted(() => {
  faassetStore.GetFaAssetList();
});
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
  },{
    title: "ມູນຄ່າຍັງເຫຼືອ",
    value: "asset_value_remain",
    key: "asset_value_remain", 
    align: "end",
    sortable: true,
    filterable: false,
    width: "120px",
    class: "text-end",
  },
  // {
  //   title: "ມູນຄ່າສະສົມ",
  //   value: "asset_accu_dpca_value",
  //   align: "center",
  //   sortable: true,
  //   filterable: true,
  //   width: "100px",
  //   class: "text-center",
  // },
  {
    title: "ມູນຄ່າຕໍ່ເດືອນ",
    value: "asset_value_remainMonth",
    key: "asset_value_remainMonth", 
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },{
    title: "ປະເພດການຈ່າຍ",
    value: "type_of_pay",
    key: "type_of_pay", 
    align: "center",
    sortable: true,
    filterable: true,
    width: "150px",
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

  
  {
    title: "ສະຖານະ",
    value: "asset_status",
    key: "asset_status", 
    align: "center",
    sortable: true,
    filterable: true,
    width: "120px",
    class: "text-center",
  },
 
  ...(canView.value
    ? [
        {
          title: "ເບິ່ງ",
          value: "view",
          key: "view", 
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
  ...(canEdit.value
    ? [
        {
          title: "ແກ້ໄຂ",
          value: "edit",
          key: "edit", 
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
  ...(canDelete.value
    ? [
        {
          title: "ລົບ",
          value: "delete",
          key: "delete", 
          align: "center",
          sortable: false,
          filterable: false,
          width: "80px",
          class: "text-center",
        },
      ]
    : []),
  // {
  //   title: "ຄິດເສື່ອມ",
  //   value: "depreciation",
  //   align: "center",
  //   sortable: false,
  //   filterable: false,
  //   width: "80px",
  //   class: "text-center",
  // },
    
  ];
});
</script>
<template>
  <div class="pa-4">
  <pre> {{ respons }}</pre> 
    <GlobalTextTitleLine :title="title" />
    <v-data-table :items="respons || []" :headers="headers" class="text-no-wrap">
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

      <template v-slot:item.asset_list_id="{ item }">
        <v-chip style="border: 1px #76FF03 solid;" color="primary">{{ item.asset_list_id }}</v-chip>
      </template>
      <template v-slot:item.asset_type_id="{ item }">
        <v-chip style="border: 1px  solid;" color="info">{{ item.asset_id_detail.asset_name_la }}</v-chip>
      </template>
    </v-data-table>
  </div>
</template>
