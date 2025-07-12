<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { formats } from "numeral";
const title = "ໜ້າຈັດການການຮັບຮູ້ຊັບສິນ";
const faassetStore = faAssetStore();
const selectAssetType = ref("all");
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
// const respons = computed(() => {
//   return faassetStore.response_fa_asset_list;
// });
const assetStores = assetStore();
const response = computed(() => {
  return assetStores.response_asset_list || [];
});
const respons = computed(() => {
  const data = faassetStore.response_fa_asset_list || [];
  return data.filter(
    (item) => !(item.asset_status === "AC" && item.Auth_Status_ARC === "A")
  );
});
// const respons = computed(() => {
//   const data = faassetStore.response_fa_asset_list;
//   return data ? data.filter((item) => item.asset_status === "UC") : [];
// });
const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});
const filterAssetType = computed(() => {
  let data = respons.value;

  if (selectAssetType.value !== "all") {
    data = data.filter(
      (item: any) => item.asset_type_id === selectAssetType.value
    );
  }

  return data;
});
onMounted(() => {
  assetStores.GetAssetList();
  faassetStore.GetFaAssetList();
  initializeRole();
  roleStore.GetRoleDetail();
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
    },
    {
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
    },
    {
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
      title: "ຂັ້ນຕອນດຳເນີນການ",
      value: "asset_status",
      key: "asset_status",
      align: "center",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-center",
    },
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

    // ...(canView.value
    //   ? [
    //       {
    //         title: "ເບິ່ງ",
    //         value: "view",
    //         key: "view",
    //         align: "center",
    //         sortable: false,
    //         filterable: false,
    //         width: "80px",
    //         class: "text-center",
    //       },
    //     ]
    //   : []),
    // ...(canEdit.value
    //   ? [
    //       {
    //         title: "ແກ້ໄຂ",
    //         value: "edit",
    //         key: "edit",
    //         align: "center",
    //         sortable: false,
    //         filterable: false,
    //         width: "80px",
    //         class: "text-center",
    //       },
    //     ]
    //   : []),
    // ...(canDelete.value
    //   ? [
    //       {
    //         title: "ລົບ",
    //         value: "delete",
    //         key: "delete",
    //         align: "center",
    //         sortable: false,
    //         filterable: false,
    //         width: "80px",
    //         class: "text-center",
    //       },
    //     ]
    //   : []),
    // {
    //   title: "ຄິດເສື່ອມ",
    //   value: "depreciation",
    //   align: "center",
    //   sortable: false,
    //   filterable: false,
    //   width: "80px",
    //   class: "text-center",
    // },
  ] as any;
});
</script>
<template>
  <div class="pa-4">
    <!-- <pre> {{ respons }}</pre> -->
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12" md="3"
      ><v-autocomplete
        v-model="selectAssetType"
        :items="response || []"
        item-title="asset_name_la"
        item-value="coa_id"
        label="ເລືອກຕາມປະເພດຊັບສົມບັດຍອ່ຍ"
        variant="outlined"
        density="compact"
        clearable
        placeholder="ເລືອກສະຖານະ"
      ></v-autocomplete
    ></v-col>

    <v-data-table
    style="font-size: 80%;"
      :items="filterAssetType || []"
      :headers="headers"
      class="text-no-wrap"
    >
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
      <template v-slot:header.action="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:item.asset_list_id="{ item }">
        <v-chip style="border: 1px #76ff03 solid" color="primary">{{
          item.asset_list_id
        }}</v-chip>
      </template>
      <template v-slot:item.asset_type_id="{ item }">
        <v-chip style="border: 1px solid" color="info">{{
          item.asset_id_detail.asset_name_la
        }}</v-chip>
      </template>
      <template v-slot:item.asset_value="{ item }">
        <v-chip style="border: 1px solid" color="info">
          {{ Number(item.asset_value).toLocaleString("en-US") }}
          {{ item.asset_currency }}
        </v-chip>
      </template>
      <template v-slot:item.asset_value_remain="{ item }">
        <v-chip style="border: 1px solid" color="primary">
          {{ Number(item.asset_value_remain).toLocaleString("en-US") }}
          {{ item.asset_currency }}
        </v-chip>
      </template>
      <template v-slot:item.Auth_Status_ARC="{ item }">
        <div v-if="item.Auth_Status_ARC === 'U'">
          <v-chip color="info"> ລໍຖ້າການອະນຸມັດ </v-chip>
        </div>
        <div v-if="item.Auth_Status_ARC === 'P'">
          <v-chip color="info"> ກຳລັງດຳເນີນການ </v-chip>
        </div>
        <div v-if="item.Auth_Status_ARC === 'R'">
          <v-chip color="info"> ຖືກ Reject </v-chip>
        </div>
      </template>
      <template v-slot:item.asset_value_remainMonth="{ item }">
        <v-chip style="border: 1px solid" color="primary">
          {{ Number(item.asset_value_remainMonth).toLocaleString("en-US") }}
          {{ item.asset_currency }}
        </v-chip>
      </template>
      <template v-slot:item.asset_status="{ item }">
        <div v-if="item.asset_status === 'UC'">
          <v-chip style="border: 1px solid" color="info">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'AC'">
          <v-chip style="border: 1px solid" color="success">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'AI'">
          <v-chip style="border: 1px solid" color="error">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'MT'">
          <v-chip style="border: 1px solid" color="warning">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'DS'">
          <v-chip style="border: 1px solid" color="deep-purple">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
        <div v-if="item.asset_status === 'DM'">
          <v-chip style="border: 1px solid" color="deep-orange">
            {{ item.asset_status_detail.MC_name_la }}
          </v-chip>
        </div>
      </template>
      <template v-slot:item.type_of_pay="{ item }">
        <v-chip style="border: 1px solid" color="primary">
          {{ item.type_of_pay_detail.MC_name_la }}
        </v-chip>
      </template>
      <template v-slot:item.action="{ item }">
        <v-btn
          v-if="item.Auth_Status === 'A' && item.asset_status === 'UC'"
          class=""
          color="primary"
          @click="
            goPath(
              `/property/realizetheproperty/create?asset_list_id=${item.asset_list_id}`
            )
          "
          >ຢັ້ງຢືນ</v-btn
        >
        <v-chip
          v-if="item.Auth_Status === 'A' && item.asset_status === 'AC'"
          
          >
          <v-icon icon="mdi-check-underline" style="color: darkgreen;"></v-icon>
          </v-chip
        >
        <p v-if="item.asset_status==='AC' && item.Auth_Status!=='A'">ຖືກກົດຮັບຮູ້ແລ້ວ</p>
        <v-btn
          v-if="item.Auth_Status === 'U'"
          class=""
          color="primary"
          @click="
            goPath(
              `/property/realizetheproperty/create?asset_list_id=${item.asset_list_id}`
            )
          "
          disabled
          >ຢັ້ງຢືນ</v-btn
        >
      </template>
    </v-data-table>
  </div>
</template>
