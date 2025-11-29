<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRolePermissions } from "@/composables/useRolePermissions";
import axios from "@/helpers/axios";
const supplierStoreInstance = supplierStore();
const isUpdatingStatus = ref(false);
const mockData = computed(() => {
  return supplierStoreInstance.response_supplier_list;
});

const updateAdproveStatus = async (id: any) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອະນຸມັດຜູ້ສະໜອງ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/asset_suppliers/${id}/set_open/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await supplierStoreInstance.GetSupplierList();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອະນຸມັດຜູ້ສະໜອງແລ້ວ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      if (res.status === 406) {
        await CallSwal({
          icon: "warning",
          title: "ບໍ່ສາມາດອະນຸມັດໄດ້",
          text: "ບໍ່ສາມາດເປີດໄດ້ ເນື່ອງຈາກ ຍັງບໍ່ທັນອະນຸມັດ",
        });
      }
    }
  } catch (error) {
    console.error("Error updating approve status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອະນຸມັດຜູ້ສະໜອງໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const unupdateAdproveStatus = async (id: any) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງຍົກເລີກອະນຸມັດຜູ້ສະໜອງ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/asset_suppliers/${id}/set_close/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await supplierStoreInstance.GetSupplierList();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຍົກເລີກອະນຸມັດຜູ້ສະໜອງແລ້ວ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  } catch (error) {
    console.error("Error updating approve status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດຍົກເລີກອະນຸມັດຜູ້ສະໜອງໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();

const roleStore = RoleStore();
const role = computed(() => {
  return roleStore.responst_data_detail;
});



const response_data = computed(() => {
  const data = mockData.value || null;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
const route = useRoute();
const sub_menu_id = route.query.sub_menu_id as string;
onMounted(async () => {
  initializeRole();
  roleStore.GetRoleDetail(sub_menu_id);
  supplierStoreInstance.GetSupplierList();
});

const onDeleteSupplier = async (supplier_id: any) => {
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ສະໜອງນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (confirmation.isConfirmed) {
    try {
      await supplierStoreInstance.DeleteSupplier(supplier_id);
      
    } catch (error) {
      console.error("Error deleting supplier:", error);
      await CallSwal({
        icon: "error",
        title: "ເກີດຂໍ້ຜິດພາດ",
        text: "ບໍ່ສາມາດລົບຜູ້ສະໜອງໄດ້",
      });
    }
  }
};

const title = "ຂໍ້ມູນຜູ້ສະໜອງ";

const header = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "supplier_code",
      key: "supplier_code",
      align: "start",
      sortable: true,
      filterable: true,
      groupable: false,
      divider: false,
      class: "text-primary font-weight-bold",
      cellClass: "pa-2",
    },
    {
      title: "ຊື່ຜູ້ສະໜອງ",
      value: "supplier_name",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
      cellClass: "text-wrap",
    },
    {
      title: "ຜູ້ຕິດຕໍ່",
      value: "contact_person",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-subtitle-1",
    },
    {
      title: "ເບີໂທ",
      value: "phone",
      align: "center",
      sortable: true,
      filterable: true,
      class: "text-center",
      cellClass: "text-center font-weight-bold",
    },
    {
      title: "ອີເມວ",
      value: "email",
      align: "center",
      sortable: true,
      filterable: true,
      class: "text-center",
    },
    {
      title: "ທີ່ຢູ່",
      value: "address",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-start",
    },
    {
      title: "ມື້ສ້າງຂໍ້ມູນ",
      value: "Maker_DT_Stamp",
      align: "center",
      sortable: true,
      filterable: false,
      class: "text-center",
    },
    ...(canRecordStatus.value
      ? [
          {
            title: "ສະຖານະ",
            value: "Record_Status",
            align: "center",
            sortable: true,
            filterable: true,
            width: "",
            class: "text-center",
            cellClass: "text-center",
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
            class: "text-center",
            cellClass: "text-center",
          },
        ]
      : []),
    ...(canView.value
      ? [
          {
            title: "ແກ້ໄຂ",
            value: "edit",
            align: "center",
            sortable: false,
            filterable: false,
            class: "text-center",
            cellClass: "text-center",
            width: "80px",
          },
        ]
      : []),
    ...(canView.value
      ? [
          {
            title: "ລົບ",
            value: "delete",
            align: "center",
            sortable: false,
            filterable: false,
            class: "text-center",
            cellClass: "text-center",
            width: "80px",
          },
        ]
      : []),
  ];
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine
      :title="`${title} (${formatnumber(response_data?.length ?? 0)})`"
    />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex">
            <v-btn
              color="primary"
              @click="goPath('/property/supplier/create')"
              v-if="canAdd"
            >
              <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຜູ້ສະໜອງ
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-data-table
        :headers="header"
        :items="response_data || []"
        class="text-no-wrap"
      >
        <template v-slot:header.supplier_code="{ column }">
          <v-icon start>mdi-identifier</v-icon>
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.supplier_name="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.contact_person="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.phone="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.email="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.address="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.Maker_DT_Stamp="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.Record_Status="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.edit="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.view="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.delete="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.confirm="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:item.Maker_DT_Stamp="{ item }">
          {{ dayjs(item.Maker_DT_Stamp).format("DD/MM/YYYY") }}
        </template>

        <template v-slot:item.contact_person="{ item }">
          <span>{{ item.contact_person || "-" }}</span>
        </template>

        <template v-slot:item.phone="{ item }">
          <span>{{ item.phone || "-" }}</span>
        </template>

        <template v-slot:item.email="{ item }">
          <span>{{ item.email || "-" }}</span>
        </template>

        <template v-slot:item.address="{ item }">
          <div class="text-truncate" style="max-width: 250px">
            {{ item.address || "-" }}
            <v-tooltip activator="parent" location="top" v-if="item.address">
              {{ item.address }}
            </v-tooltip>
          </div>
        </template>

        <template v-slot:item.Record_Status="{ item }">
          <div>
            <v-btn
              v-if="item.Record_Status === 'O'"
              flat
              @click="unupdateAdproveStatus(item.supplier_id)"
            >
              <v-icon color="info">mdi-toggle-switch</v-icon>
            </v-btn>
            <v-btn
              v-if="item.Record_Status === 'C'"
              flat
              @click="updateAdproveStatus(item.supplier_id)"
            >
              <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.no="{ item, index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.view="{ item }">
          <v-btn
            small
            flat
            class="text-primary"
            icon="mdi-eye-outline"
            @click="
              goPath(
                `/property/supplier/detail/?supplier_id=${item.supplier_id}`
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
              goPath(`/property/supplier/edit/?supplier_id=${item.supplier_id}`)
            "
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
            small
            flat
            class="text-error"
            icon="mdi-delete-outline"
            @click="onDeleteSupplier(item.supplier_id)"
          />
        </template>
      </v-data-table>
    </v-col>
  </div>
</template>
