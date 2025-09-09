<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CallSwal } from "#build/imports";
import { useRoute } from "vue-router";
import dayjs from "#build/dayjs.imports.mjs";
const mainTypeStore = assetStore();
const mainType = computed(() => {
  const data = mainTypeStore.response_asset_types;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const route = useRoute();
const sub_menu_id = route.query.sub_menu_id as string;

const assetListStore = faAssetStore();
const assetlist = computed(() => {
  const data = assetListStore.response_fa_asset_list || [];
  return data.filter((item: any) => {
    return item.Auth_Status === "A" && item.Auth_Status_ARC === "A";
  });
});
const detailassetlis = computed(() => {
  const data = assetListStore.response_fa_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const dataFilter = ref([
  {
    title: "ທັງໝົດ",
    value: "all",
  },
  {
    title: "ເປີດໃຊ້ງານ",
    value: "O",
  },
  {
    title: "ປຶດໃຊ້ງານ",
    value: "C",
  },
]);
const accountMethodStoreInstance = accountMethodStore();
const mockData = computed(() => {
  return accountMethodStoreInstance.response_account_method_list || [];
});
const handleSubmit = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການສະຖານະວິທີການບັນຊີນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await accountMethodStoreInstance.UpdateAccountMethodStatus(
        item.mapping_id
      );
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
const handleSubmitof = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນ",
      text: `ທ່ານຕ້ອງການສະຖານະວິທີການບັນຊີນີ້ໃຊ່ບໍ່?`,
      icon: "question",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      showCancelButton: true,
    });
    if (notification.isConfirmed) {
      await accountMethodStoreInstance.UpdateAccountMethodStatusof(
        item.mapping_id
      );
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const search = ref("");
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAccType = ref("all");
const selectedStatus = ref("all");

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

const title = "ຈັດການຕັ້ງຄ່າບັນທຶກບັນຊີຊັບສົມບັດ";

const accTypes = [
  { title: "ທັງໝົດ", value: "all" },
  { title: "ຊື່ຊັບສົມບັດ", value: "ASSET" },
  { title: "ເສື່ອມລາຄາ", value: "DEPRECIATION" },
  { title: "ຖອນຈຳໜ່າຍ", value: "DISPOSAL" },
];

const headers = computed(
  () =>
    [
      // {
      //   title: "Mapping ID",
      //   value: "mapping_id",
      //   align: "start",
      //   sortable: true,
      //   filterable: true,
      //   width: "120px",
      //   class: "text-primary font-weight-bold",
      // },
      {
        title: "Ref ID",
        value: "ref_id",
        align: "center",
        sortable: true,
        filterable: true,
        width: "100px",
        class: "text-center",
      },
      {
        title: "ຊື່ຊັບສົມບັດ",
        value: "acc_type",
        align: "center",
        sortable: true,
        filterable: true,
        width: "140px",
        class: "text-center",
      },
      // {
      //   title: "Asset ID",
      //   value: "asset_id",
      //   align: "center",
      //   sortable: true,
      //   filterable: true,
      //   width: "100px",
      //   class: "text-center",
      // },
      {
        title: "ບັນຊີເດບິດ",
        value: "debit_account_id",
        align: "center",
        sortable: true,
        filterable: true,
        width: "150px",
        class: "text-center",
      },
      {
        title: "ບັນຊີເຄຣດິດ",
        value: "credit_account_id",
        align: "center",
        sortable: true,
        filterable: true,
        width: "150px",
        class: "text-center",
      },
      {
        title: "ຍອດເງິນ",
        value: "amount",
        align: "end",
        sortable: true,
        filterable: false,
        width: "130px",
        class: "text-end",
      },
      {
        title: "ວັນທີ່ທຸລະກຳ",
        value: "transaction_date",
        align: "center",
        sortable: true,
        filterable: false,
        width: "150px",
        class: "text-center",
      },
      // {
      //   title: "Journal Entry",
      //   value: "journal_entry_id",
      //   align: "center",
      //   sortable: false,
      //   filterable: true,
      //   width: "140px",
      //   class: "text-center",
      // },
      ...(canRecordStatus.value
        ? [
            {
              title: "ສະຖານະ",
              value: "Record_Status",
              align: "center",
              sortable: true,
              filterable: true,
              width: "120px",
              class: "text-center",
            },
          ]
        : []),
      ...(canView.value
        ? [
            {
              title: "ເບິ່ງ",
              value: "view",
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
              align: "center",
              sortable: false,
              filterable: false,
              width: "80px",
              class: "text-center",
            },
          ]
        : []),
    ] as any
);

const mappedData = computed(() => {
  const accountMethods = mockData.value || [];
  const assetDetails = detailassetlis.value || [];

  return accountMethods.map((method) => {
    const matchedAsset = assetDetails.find(
      (asset) => asset.asset_list_id === method.ref_id
    );

    return {
      ...method,

      asset_detail: matchedAsset || null,

      asset_name: matchedAsset?.asset_id_detail?.asset_name_la || "-",
      asset_code: matchedAsset?.asset_id_detail?.asset_code || "-",
      asset_spec: matchedAsset?.asset_spec || "-",
      location_name: matchedAsset?.location_detail?.location_name_la || "-",
      supplier_name: matchedAsset?.supplier_detail?.supplier_name || "-",
      asset_value: matchedAsset?.asset_value || "0",
      asset_status: matchedAsset?.asset_status_detail?.MC_name_la || "-",
    };
  });
});

const filteredData = computed(() => {
  let data = mappedData.value;

  if (selectedAccType.value !== "all") {
    data = data.filter(
      (item) =>
        item.asset_detail?.asset_id_detail?.asset_code === selectedAccType.value
    );
  }

  if (selectedStatus.value !== "all") {
    data = data.filter((item) => item.Record_Status === selectedStatus.value);
  }

  if (search.value) {
    data = data.filter(
      (item) =>
        item.mapping_id.toString().includes(search.value) ||
        item.ref_id.toString().includes(search.value) ||
        item.debit_account_id
          .toLowerCase()
          .includes(search.value.toLowerCase()) ||
        item.credit_account_id
          .toLowerCase()
          .includes(search.value.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_name?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.asset_spec?.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  return data;
});
// const filteredData = computed(() => {
//   let data = mappedData.value;

//   if (selectedAccType.value !== "all") {
//     data = data.filter((item) => item.asset_detail.asset_id_detail.asset_code === selectedAccType.value);
//   }
//   if (selectedStatus.value !== "all") {
//     data = data.filter((item) => item.Record_Status === selectedStatus.value);
//   }

//   if (search.value) {
//     data = data.filter(
//       (item) =>
//         item.mapping_id.toString().includes(search.value) ||
//         item.ref_id.toString().includes(search.value) ||
//         item.debit_account_id
//           .toLowerCase()
//           .includes(search.value.toLowerCase()) ||
//         item.credit_account_id
//           .toLowerCase()
//           .includes(search.value.toLowerCase()) ||
//         item.description?.toLowerCase().includes(search.value.toLowerCase()) ||
//         item.asset_name?.toLowerCase().includes(search.value.toLowerCase()) ||
//         item.asset_spec?.toLowerCase().includes(search.value.toLowerCase())
//     );
//   }

//   return data;
// });
// const filteredData = computed(() => {
//   let data = mockData.value;
// const maindata = assetListStore.response_fa_asset_detail;
//   if (selectedAccType.value !== "all") {
//     data = data.filter((item) => item.ref_id === selectedAccType.value);
//   }

//   if (search.value) {
//     data = data.filter(
//       (item) =>
//         item.mapping_id.toString().includes(search.value) ||
//         item.ref_id.toString().includes(search.value) ||
//         item.debit_account_id
//           .toLowerCase()
//           .includes(search.value.toLowerCase()) ||
//         item.credit_account_id
//           .toLowerCase()
//           .includes(search.value.toLowerCase()) ||
//         item.description?.toLowerCase().includes(search.value.toLowerCase())
//     );
//   }

//   return data;
// });

const formatDate = (date: Date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA").format(value);
};

const getAccTypeColor = (type: string) => {
  const colors = {
    ASSET: "success",
    DEPRECIATION: "warning",
    DISPOSAL: "error",
  };
  return colors[type as keyof typeof colors] || "grey";
};

const getAccTypeText = (type: string) => {
  const types = {
    ASSET: "ຊັບສົມບັດ",
    DEPRECIATION: "ເສື່ອມລາຄາ",
    DISPOSAL: "ຖອນຈຳໜ່າຍ",
  };
  return types[type as keyof typeof types] || type;
};

const getAccTypeIcon = (type: string) => {
  const icons = {
    ASSET: "mdi-treasure-chest",
    DEPRECIATION: "mdi-trending-down",
    DISPOSAL: "mdi-delete",
  };
  return icons[type as keyof typeof icons] || "mdi-help-circle";
};

const getAccountName = (accountId: string) => {
  const accounts = {
    "1441001": "ຊັບສົມບັດຄົງທີ່ - ເຄື່ອງຈັກ",
    "1442001": "ຄ່າເສື່ອມລາຄາສະສົມ - ເຄື່ອງຈັກ",
    "5551001": "ຄ່າເສື່ອມລາຄາ - ເຄື່ອງຈັກ",
    "1101100": "ເງິນສົດໃນມື",
    "2100000": "ໜີ້ສິນຫມູນວຽນ",
  };
  return accounts[accountId as keyof typeof accounts] || accountId;
};

const confirmDelete = async (item: any) => {
  try {
    const notification = await CallSwal({
      title: "ຢືນຢັນການລຶບ",
      text: `ທ່ານຕ້ອງການລຶບວິທີການບັນຊີ Mapping ID "${item.mapping_id}" ໃຊ່ບໍ່?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ລຶບ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#d33",
    });

    if (notification.isConfirmed) {
      await accountMethodStoreInstance.DeleteAccountMethod(item.mapping_id);
    }
  } catch (error) {
    console.error("Error confirming delete:", error);
  }
};

const clearFilters = async () => {
  selectedAccType.value = "all";
  selectedStatus.value = "all";
  search.value = "";
};

const statistics = computed(() => {
  const data = filteredData.value;
  return {
    total: data.length,
  };
});
const NameDisplay = (name: any) => {
  if (!name || !name.asset_name_la || !name.asset_code) {
    return "ທັງໝົດ";
  }
  return `${name.asset_name_la} - ${name.asset_code}`;
};

const nameDisplayStatus = (items: any) => {
  if (!items || !items.title || !items.value) {
    return "ທັໝົດ";
  }
  return `${items.title} - ${items.value}`;
};
onMounted(async () => {
  accountMethodStoreInstance.GetAccountMethodList();
  mainTypeStore.GetAssetTypes();
  initializeRole();
  roleStore.GetRoleDetail();
  assetListStore.GetFaAssetList();
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
  } catch (error) {
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ";
    showError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="pa-2">
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <!-- <v-col cols="6"><pre>{{ filteredData }}</pre></v-col> -->
        <!-- <v-col cols="6"><pre>{{ mainType }}</pre></v-col> -->
      </v-row>

      <v-row>
        <v-col cols="12" md="2">
          <div class="d-flex">
            <v-btn
              color="primary"
              @click="
                goPath(
                  `/property/accountmethod/create?sub_menu_id=${sub_menu_id}`
                )
              "
              v-if="canAdd"
            >
              <v-icon icon="mdi-plus"></v-icon> ເພີ່ມວິທີການບັນຊີໃໝ່
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="3" class="text-no-wrap">
          <v-autocomplete
            v-model="selectedAccType"
            :items="mainType"
            :item-title="NameDisplay"
            item-value="asset_code"
            label="ປະເພດທຸລະກຳ"
            variant="outlined"
            density="compact"
            placeholder="ເລືອກປະເພດທຸລະກຳ"
            :loading="loading"
            prepend-inner-icon="mdi-format-list-bulleted-type"
          >
            <template v-slot:item="{ item, props }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.asset_name_la}(${item.raw.asset_code})`"
              >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-format-list-bulleted-type</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="3" class="text-no-wrap">
          <v-autocomplete
            v-model="selectedStatus"
            :items="dataFilter"
            :item-title="nameDisplayStatus"
            item-value="value"
            label="ສະຖານະ"
            variant="outlined"
            prepend-inner-icon="mdi-list-status"
            density="compact"
            placeholder="ເລືອກສະຖານະ"
            :loading="loading"
          >
            <template v-slot:item="{ item, props }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.title}(${item.raw.value})`"
              >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-list-status</v-icon>
                </v-avatar>
              </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="search"
            label="ຄົ້ນຫາ"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            placeholder="ຄົ້ນຫາຕາມ ID, ບັນຊີ, ຄຳອະທິບາຍ..."
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearFilters"
            :loading="loading"
            block
          >
            <v-icon class="mr-2">mdi-filter-remove</v-icon>
            ເຄລຍການກັ່ນຕອງ
          </v-btn>
        </v-col>
      </v-row>
      <!-- <pre>{{ detailassetlis }}</pre> -->
      <!-- <pre>{{  }}</pre> -->

      <v-data-table
      
        :headers="headers"
        :items="filteredData || []"
        class="text-no-wrap"
        :loading="assetListStore.isLoading"
      >
        <template v-slot:header.mapping_id="{ column }">
          <v-icon start>mdi-identifier</v-icon>
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.ref_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.acc_type="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.asset_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.debit_account_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.credit_account_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.amount="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.transaction_date="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.journal_entry_id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.Record_Status="{ column }">
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

        <template v-slot:item.mapping_id="{ item }">
          <v-chip color="primary" variant="outlined" size="small">
            {{ item.mapping_id }}
          </v-chip>
        </template>

        <template v-slot:item.ref_id="{ item }">
          <v-chip color="secondary" variant="outlined" size="small">
            {{ item.ref_id }}
          </v-chip>
        </template>

        <template v-slot:item.acc_type="{ item }">
          <div class="text-center">
            <v-chip
              :color="getAccTypeColor(item.acc_type)"
              variant="flat"
              size="small"
            >
              <v-icon start size="small">{{
                getAccTypeIcon(item.asset_spec)
              }}</v-icon>
              {{ getAccTypeText(item.asset_spec) }}
            </v-chip>
          </div>
        </template>

        <template v-slot:item.asset_id="{ item }">
          <div class="text-center">
            <v-chip
              v-if="item.asset_id"
              color="info"
              variant="outlined"
              size="small"
            >
              {{ item.asset_id }}
            </v-chip>
            <span v-else class="text-grey">-</span>
          </div>
        </template>

        <template v-slot:item.debit_account_id="{ item }">
          <div class="text-center">
            <v-chip color="error" variant="outlined" size="small" class="mb-1">
              {{ item.debit_account_id }}
            </v-chip>
            <div class="text-caption text-grey">
              {{ getAccountName(item.debit_account_id) }}
            </div>
          </div>
        </template>

        <template v-slot:item.credit_account_id="{ item }">
          <div class="text-center">
            <v-chip
              color="success"
              variant="outlined"
              size="small"
              class="mb-1"
            >
              {{ item.credit_account_id }}
            </v-chip>
            <div class="text-caption text-grey">
              {{ getAccountName(item.credit_account_id) }}
            </div>
          </div>
        </template>

        <template v-slot:item.amount="{ item }">
          <div class="text-end">
            <div class="text-primary">{{ formatCurrency(item.amount) }}</div>
            <div class="text-caption text-grey">LAK</div>
          </div>
        </template>

        <template v-slot:item.transaction_date="{ item }">
          {{ dayjs(item.transaction_date).format("DD/MM/YYYY ") }}
        </template>

        <template v-slot:item.Record_Status="{ item }">
          <div>
            <v-btn
              v-if="item.Record_Status === 'O'"
              flat
              @click="handleSubmitof(item)"
            >
              <v-icon color="success">mdi-toggle-switch</v-icon>
            </v-btn>
            <v-btn
              v-if="item.Record_Status === 'C'"
              flat
              @click="handleSubmit(item)"
            >
              <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.view="{ item }">
          <v-btn
            small
            flat
            class="text-primary"
            icon="mdi-eye-outline"
            @click="
              goPath(
                `/property/accountmethod/detail?mapping_id=${item.mapping_id}`
              )
            "
          />
        </template>

        <template v-slot:item.edit="{ item }">
          <v-btn
            small
            flat
            class="text-info"
            icon="mdi-pen"
            @click="
              goPath(
                `/property/accountmethod/edit?mapping_id=${item.mapping_id}`
              )
            "
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
            small
            flat
            class="text-error"
            icon="mdi-delete-outline"
            @click="confirmDelete(item)"
          />
        </template>

        <template v-slot:item.description="{ item }">
          <div class="text-truncate" style="max-width: 200px">
            {{ item.description || "-" }}
            <v-tooltip
              activator="parent"
              location="top"
              v-if="item.description"
            >
              {{ item.description }}
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-col>

    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gap-4 > * {
  margin-right: 16px;
}

.gap-4 > *:last-child {
  margin-right: 0;
}

@media (max-width: 768px) {
  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: flex-start;
  }

  .d-flex.flex-wrap.gap-4 > div {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>
