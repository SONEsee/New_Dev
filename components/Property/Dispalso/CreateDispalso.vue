<script setup lang="ts">
const title = "ຊຳລະສະສາງຊັບສົມບັດ";
const dispalsoStore = useDispoalStore();
const faasetStore = faAssetStore();
const masterType = useMasterStore();
const employee = useEmployeeStore();
const form = ref();
const employees = computed(() => {
  const data = employee.respose_data_employee;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});
const typeData = computed(() => {
  const data = masterType.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});
const request = dispalsoStore.from_create_disposal;

const dataList = computed(() => {
  const data = faasetStore.response_fa_asset_list;
  let asset = [];
  if(Array.isArray(data)){
    return (asset = data)
  }else if(data && typeof data ==="object"){
    return (asset = [data])
  }else{
    return []
  }
  return asset.filter((item)=>item.asset.asset_status !== "UC" || item.Auth_Status === "A" || item.Auth_Status_ARC === "A" || item.asset.asset_status !== "DS");
});
const handelSubmit = async () => {
  try {
    const isValid = form.value.validate();
    if (isValid) {
      const notification = await CallSwal({
        icon: "warning",
        title: "ຄຳເຕືອນ",
        text: `ທ່ານກຳລັງຈະເພີ່ມລາຍການສ່າງ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });
      if (notification.isConfirmed) {
        await dispalsoStore.CreateDispalso();
      }
    }
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    });
  }
};
const gainLoss = [
  { title: "ກຳໄລ", value: "ROIP" },
  { title: "ຂາດທຶນ", value: "ROIN" },
];
onMounted(() => {
  masterType.getDT();
  faasetStore.GetFaAssetList();
  employee.GetEmployee();
});
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <pre>{{ employees }}</pre> -->
    <v-form ref="form" @submit.prevent="handelSubmit">
      <v-row>
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="request.asset_list_id"
            label="ລາຍການຊັບສີນ"
            :items="dataList"
            item-title="asset_spec"
            item-value="asset_list_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.asset_spec}(${item.raw.asset_list_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
<<<<<<< HEAD
          <v-text-field
            v-model="request.disposal_value"
            label="ມູນຄ່າການຖອນ"
            variant="outlined"
            density="compact"
          >
=======
          <v-autocomplete
            v-model="request.disposal_type"
            label="ປະເພດການຊຳລະສະສາງ"
            :items="typeData"
            item-title="MC_name_la"
            item-value="MC_code"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.MC_name_la}(${item.raw.MC_code})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_cost"
            label="ຄ່າໃຊ້ຈ່າຍໃນການຖອນ"
            type="number"
          >
>>>>>>> f4a864e562d2896cd34dd46b736eb79472ebc537
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_purpose"
            label="ຈຸດປະສົງການຖອນ"
          >
          </v-text-field>
          <v-text-field
            v-model="request.disposal_value"
            label="ມູນຄ່າການຖອນ"
            variant="outlined"
            density="compact"
            type="number"
          >
          </v-text-field>
          <v-autocomplete
            v-model="request.gain_loss"
            label="ສະຖານະການຖອນ"
            :items="gainLoss"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.title}(${item.raw.value})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_reason"
            label="ເຫດຜົນການຖອນ"
          >
          </v-text-field>
          <v-autocomplete
            v-model="request.disposal_by"
            label="ຜູ້ຖອນ"
            :items="employees"
            item-title="employee_name_la"
            item-value="employee_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.employee_name_la}(${item.raw.employee_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>
          <v-text-field
            type="date"
            variant="outlined"
            density="compact"
            v-model="request.disposal_date"
            label="ວັນທີ່ຖອນ"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.buyer_name"
            label="ຊື່ຜູ້ຊື້ (ກໍລະນີຂາຍ)"
          >
          </v-text-field>
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_proceeds"
            label="ລາຍຮັບຈາກການຂາຍ"
            type="number"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-col cols="12">
        <div class="d-flex justify-center">
          <v-btn type="submit" color="primary">ບັນທຶກ</v-btn>
          <v-btn
            type="submit"
            color="error"
            class="ml-2"
            @click="goPath(`/property/dispalso/`)"
            >ຍົກເລີກ</v-btn
          >
        </div>
      </v-col>
    </v-form>
  </div>
</template>
