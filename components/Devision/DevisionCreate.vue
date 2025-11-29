<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRolePermissions } from "@/composables/useRolePermissions";
import { UseCategoryStore } from "~/stores/category";
import axios from "@/helpers/axios";

const isUpdatingStatus = ref(false);


const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອະນຸມັດພະແນກ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/divisions/${id}/authorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await categories.GetListData();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອະນຸມັດພະແນກແລ້ວ",
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
      text: "ບໍ່ສາມາດອະນຸມັດພະແນກໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};


const unupdateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງຍົກເລີກອະນຸມັດພະແນກ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/divisions/${id}/unauthorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await categories.GetListData();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຍົກເລີກອະນຸມັດພະແນກແລ້ວ",
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
      text: "ບໍ່ສາມາດຍົກເລີກອະນຸມັດພະແນກໄດ້",
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


const updatRecodeStatus = async (div_id: string) => {
  try {
    await categories.updateAdproveStatus(div_id);
    await categories.GetListData();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const updatRecodeStatusof = async (div_id: string) => {
  try {
    await categories.updateRecordStatusOff(div_id);
    await categories.GetListData();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const categories = UseCategoryStore();
const route = useRoute();
const sub_menu_id = route.query.sub_menu_id as string;
const response_data = computed(() => {
  const data = categories.categories || null;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});

onMounted(async () => {
  initializeRole(sub_menu_id);
  roleStore.GetRoleDetail();
  await categories.GetListData();
});

const onDeleteType = async (div_id: string) => {
  const result = await categories.DeleteCategory(div_id);
  if (result) {
    await CallSwal({
      icon: "success",
      title: "ສຳເລັດ",
      text: "ລົບຂໍ້ມູນສຳເລັດ",
      showConfirmButton: false,
      timer: 1500,
    });
    await categories.GetListData();
  }
};

const title = "ຂໍ້ມູນພະແນກ";


const header = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "div_id",
      key: "div_id",
      align: "start",
      sortable: true,
      filterable: true,
      groupable: false,
      divider: false,
      class: "text-primary font-weight-bold",
      cellClass: "pa-2",
    },
    {
      title: "ຊື່ພະແນກພາສາລາວ",
      value: "division_name_la",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
      cellClass: "text-wrap",
    },
    {
      title: "ຊື່ພະແນກພາສາອັງກິດ",
      value: "division_name_en",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-subtitle-1",
    },
    // {
    //   title: "ລຳດັບ",
    //   value: "division_order",
    //   align: "center",
    //   sortable: true,
    //   filterable: false,
    //   class: "text-center",
    //   cellClass: "text-center font-weight-bold",
    // },
    {
      title: "ມື້ສ້າງຂໍ້ມູນ",
      value: "created_date",
      align: "center",
      sortable: true,
      filterable: false,
      class: "text-center",
    },
    ...(canRecordStatus.value ? [{
      title: "ສະຖານະ",
      value: "Record_Status",
      align: "center",
      sortable: true,
      filterable: true,
      width: "120px",
      class: "text-center",
      cellClass: "text-center",
      filter: (value:any, query:any, item:any) => {
        if (!query) return true;
        const statusText = value === "Y" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
        return statusText.includes(query);
      },
    }] : []),
    ...(canView.value ? [{
      title: "ເບິ່ງ",
      value: "view",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    }] : []),
    ...(canEdit.value ? [{
      title: "ແກ້ໄຂ",
      value: "edit",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    }] : []),
    ...(canEdit.value ? [{
      title: "ລົບ",
      value: "delete",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    }] : []),
    
    
    ...(canAuthorize.value ? [{
      title: "ອະນຸມັດ",
      value: "confirm",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    }] : []),
  ];
}) as any;
</script>

<template>
  <div class="pa-4">
  <GlobalTextTitleLine :title="`${title} (${formatnumber(response_data?.length ?? 0)})`" />

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex">
          <v-btn color="primary" @click="goPath('/devision/create')" v-if="canAdd">
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມພະແນກ
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-data-table :headers="header" :items="response_data || []" class="text-no-wrap">
      <template v-slot:header.div_id="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.division_name_la="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.division_name_en="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.division_order="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.created_date="{ column }">
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

      <template v-slot:item.created_date="{ item }">
        {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
      </template>

      <template v-slot:item.Record_Status="{ item }">
        <div>
          <v-btn
            v-if="item.Record_Status === 'O'"
            flat
            @click="updatRecodeStatusof(item.div_id)"
          >
            <v-icon color="info">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.Record_Status === 'C'"
            flat
            @click="updatRecodeStatus(item.div_id)"
          >
            <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.index="{ item, index }">
        {{ index + 1 }}
      </template>

      <template v-slot:item.confirm="{ item }">
        <div class="d-flex align-center">
          <v-btn
            @click="unupdateAdproveStatus(item.div_id)"
            class="text-primary"
            v-if="item.Auth_Status === 'A'"
            flat
          >
            <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
          </v-btn>
          <v-btn
            @click="updateAdproveStatus(item.div_id)"
            class="text-error"
            v-if="item.Auth_Status === 'U'"
            flat
          >
            <v-icon icon="mdi-toggle-switch-off-outline" color="error"></v-icon>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.view="{ item }">
        <v-btn
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="goPath(`/devision/detail?div_id=${item.div_id}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/devision/update?div_id=${item.div_id}`)"
        />
      </template>

      <template v-slot:item.delete="{ item }">
        <v-btn
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteType(item.div_id)"
        />
      </template>
    </v-data-table>
  </v-col></div>
</template>