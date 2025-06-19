<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useRolePermissions } from "@/composables/useRolePermissions";
import axios from "@/helpers/axios";

const isUpdatingStatus = ref(false);


const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອະນຸມັດຜູ້ໃຊ້ງານ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/users/${id}/authorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await agencyStore.GetUser();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
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
      text: "ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ງານໄດ້",
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
      text: `ທ່ານກຳລັງຍົກເລີກອະນຸມັດຜູ້ໃຊ້ງານ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/users/${id}/unauthorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await agencyStore.GetUser();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຍົກເລີກອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
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
      text: "ບໍ່ສາມາດຍົກເລີກອະນຸມັດຜູ້ໃຊ້ງານໄດ້",
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

const selectedDivision = ref<any | null>(null);
const selectedRole = ref<any | null>(null);

const SELECTED_DIVISION_KEY = "selected_division_filter";
const SELECTED_ROLE_KEY = "selected_role_filter";


const updatRecodeStatus = async (user_id: string) => {
  try {
    await agencyStore.updateRecordStatus(user_id);
    await agencyStore.GetUser();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const updatRecodeStatusof = async (user_id: string) => {
  try {
    await agencyStore.updateRecordStatusOff(user_id);
    await agencyStore.GetUser();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const loadSavedDivisionSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_DIVISION_KEY);
    if (saved) {
      const parsedDivision = JSON.parse(saved);
      selectedDivision.value = parsedDivision;
    }
  } catch (error) {
    console.error("Failed to load saved division selection:", error);
  }
};

const loadSavedRoleSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_ROLE_KEY);
    if (saved) {
      const parsedRole = JSON.parse(saved);
      selectedRole.value = parsedRole;
    }
  } catch (error) {
    console.error("Failed to load saved role selection:", error);
  }
};

const saveDivisionSelection = (division: any) => {
  try {
    if (division) {
      localStorage.setItem(SELECTED_DIVISION_KEY, JSON.stringify(division));
    } else {
      localStorage.removeItem(SELECTED_DIVISION_KEY);
    }
  } catch (error) {
    console.error("Failed to save division selection:", error);
  }
};

const saveRoleSelection = (role: any) => {
  try {
    if (role) {
      localStorage.setItem(SELECTED_ROLE_KEY, JSON.stringify(role));
    } else {
      localStorage.removeItem(SELECTED_ROLE_KEY);
    }
  } catch (error) {
    console.error("Failed to save role selection:", error);
  }
};

watch(
  [selectedDivision, selectedRole],
  async ([newDivision, newRole]) => {
    saveDivisionSelection(newDivision);
    saveRoleSelection(newRole);
    
    try {
      agencyStore.reqest_get_user.query.div_id = newDivision?.div_id || null;
      agencyStore.reqest_get_user.query.role_id = newRole?.role_id || null;
      await agencyStore.GetUser();
    } catch (error) {
      console.error("Failed to auto search users:", error);
    }
  },
  { deep: true }
);

const clearFilters = async () => {
  selectedDivision.value = null;
  selectedRole.value = null;
  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
  await agencyStore.GetUser();
};

const loadDataAndApplyFilter = async () => {
  try {
    await Promise.all([
      agencyStore.GetUser(),
      devision.GetListData(),
      roleStore.GetRole(),
    ]);

    loadSavedDivisionSelection();
    loadSavedRoleSelection();

    if (selectedDivision.value || selectedRole.value) {
      agencyStore.reqest_get_user.query.div_id = selectedDivision.value?.div_id || null;
      agencyStore.reqest_get_user.query.role_id = selectedRole.value?.role_id || null;
      await agencyStore.GetUser();
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
};

const route = useRoute();
const user_id = route.query.user_id as string;
const agencyStore = UserStore();
const devision = UseCategoryStore();

const response_data = computed(() => {
  const data = agencyStore.userList || null;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});

const roleData = computed(() => roleStore.respons_data_role || []);
const userItems = computed(() => devision.categories || []);

onMounted(async () => {
  initializeRole();
  roleStore.GetRoleDetail();
  await loadDataAndApplyFilter();
  
  if (user_id) {
    agencyStore.DeleteUser(user_id);
  }
});

const onDeleteUser = async (user_id: string) => {
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຜູ້ໃຊ້ນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (confirmation.isConfirmed) {
    const result = await agencyStore.DeleteUser(user_id);
    if (result) {
      await agencyStore.GetUser();
    }
  }
};

const title = "ຂໍ້ມູນຜູ້ໃຊ້ງານ";


const header = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "user_id",
      key: "user_id",
      align: "start",
      sortable: true,
      filterable: true,
      groupable: false,
      divider: false,
      class: "text-primary font-weight-bold",
      cellClass: "pa-2",
    },
    {
      title: "ຊື່ຜູ້ໃຊ້ງານ",
      value: "user_name",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
      cellClass: "text-wrap",
    },
    {
      title: "ອີເມວ",
      value: "user_email",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-subtitle-1",
    },
    {
      title: "ເບີ້ໂທ",
      value: "user_mobile",
      align: "center",
      sortable: true,
      filterable: true,
      class: "text-center",
      cellClass: "text-center font-weight-bold",
    },
    {
      title: "ພະແນກ",
      value: "division",
      align: "center",
      sortable: true,
      filterable: true,
      sort: (a, b) => {
        return a.division?.div_id.localeCompare(b.division?.div_id) || 0;
      },
    },
    {
      title: "ສິດເຂົ້ານຳໃຊ້ລະບົບ",
      value: "role",
      align: "center",
      sortable: true,
      filterable: true,
      class: "text-center",
    },
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
      filter: (value, query, item) => {
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
    // {
    ...(canDelete.value ? [
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
    ] : []),
    // {
    //   title: "ແກ້ໄຂ",
    //   value: "edit",
    //   align: "center",
    //   sortable: false,
    //   filterable: false,
    //   class: "text-center",
    //   cellClass: "text-center",
    //   width: "80px",
    // },
    
    
    
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
});

const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_DIVISION_KEY);
  localStorage.removeItem(SELECTED_ROLE_KEY);
  selectedDivision.value = null;
  selectedRole.value = null;
  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
};

defineExpose({
  clearSavedSelection,
});
</script>

<template>
  <GlobalTextTitleLine :title="`${title} (${formatnumber(response_data?.length ?? 0)})`" />

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex">
          <v-btn color="primary" @click="goPath('/user/create')" v-if="canAdd">
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຜູ້ໃຊ້ງານ
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="4" class="text-no-wrap">
        <v-autocomplete
          v-model="selectedDivision"
          density="compact"
          label="ເລືອກພະແນກ"
          :items="userItems"
          item-value="div_id"
          item-title="division_name_la"
          variant="outlined"
          clearable
          placeholder="ເລືອກພະແນກ"
          return-object
          :loading="agencyStore.loading"
        >
          <template v-slot:selection="{ item }">
            {{ item.raw.division_name_la }}-{{ item.raw.div_id }}
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :subtitle="`ID: ${item.raw.div_id}`"
              :title="item.raw.division_name_la"
            />
          </template>
        </v-autocomplete>
      </v-col>

      <v-col cols="12" md="3" class="text-no-wrap">
        <v-autocomplete
          v-model="selectedRole"
          density="compact"
          label="ເລືອກສິດການນຳໃຊ້ລະບົບ"
          :items="roleData"
          item-value="role_id"
          item-title="role_name_la"
          variant="outlined"
          clearable
          placeholder="ເລືອກສິດການນຳໃຊ້ລະບົບ"
          return-object
          :loading="agencyStore.loading"
        >
          <template v-slot:selection="{ item }">
            {{ item.raw.role_name_la }}-{{ item.raw.role_id }}
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :subtitle="`ID: ${item.raw.role_id}`"
              :title="item.raw.role_name_la"
            />
          </template>
        </v-autocomplete>
      </v-col>

      <v-col cols="12" md="2">
        <v-btn
          color="secondary"
          variant="outlined"
          @click="clearFilters"
          :loading="agencyStore.loading"
          block
        >
          <v-icon class="mr-2">mdi-filter-remove</v-icon>
          ເຄລຍການກັ່ນຕອງ
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table :headers="header" :items="response_data || []" class="text-no-wrap">
      <template v-slot:header.user_id="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b style="color: blue">{{ column.title }}</b>
      </template>

      <template v-slot:header.user_name="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.user_email="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.user_mobile="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.division="{ column }">
        <b style="color: blue">{{ column.title }}</b>
      </template>
      
      <template v-slot:header.role="{ column }">
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
            @click="updatRecodeStatusof(item.user_id)"
          >
            <v-icon color="info">mdi-toggle-switch</v-icon>
          </v-btn>
          <v-btn
            v-if="item.Record_Status === 'C'"
            flat
            @click="updatRecodeStatus(item.user_id)"
          >
            <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.no="{ item, index }">
        {{ index + 1 }}
      </template>

      <template v-slot:item.division="item" class="text-center">
        <div class="text-center">
          <p>{{ item.item.division?.division_name_la || "No Data" }}</p>
          <p>{{ item.item.division?.div_id || "ບໍ່ມີຂໍ້ມູນ" }}</p>
        </div>
      </template>

      <template v-slot:item.role="item" class="text-center">
        <div class="text-center">
          <p>{{ item.item.role?.role_name_la || "No Data" }}</p>
          <p>{{ item.item.role?.role_id || "ບໍ່ມີຂໍ້ມູນ" }}</p>
        </div>
      </template>

      <template v-slot:item.confirm="{ item }">
        <div class="d-flex align-center">
          <v-btn
            @click="unupdateAdproveStatus(item.user_id)"
            class="text-primary"
            v-if="item.Auth_Status === 'A'"
            flat
          >
            <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
          </v-btn>
          <v-btn
            @click="updateAdproveStatus(item.user_id)"
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
          @click="goPath(`/user/detail?user_id=${item.user_id}`)"
        />
      </template>

      <template v-slot:item.edit="{ item }">
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/user/edit?user_id=${item.user_id}`)"
        />
      </template>

      <template v-slot:item.delete="{ item }">
        <v-btn
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteUser(item.user_id)"
        />
      </template>
    </v-data-table>
  </v-col>
</template>