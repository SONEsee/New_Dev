<script setup lang="ts">
const title = "ຊຳລະສະສາງຊັບສົມບັດ";
const dispalsoStore = useDispoalStore();
const faasetStore = faAssetStore();
const form = ref();
const request = dispalsoStore.from_create_disposal;
const dataList = computed(() => {
  const data = faasetStore.response_fa_asset_list;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
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
onMounted(() => {
  faasetStore.GetFaAssetList();
});
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <pre>{{ dataList }}</pre> -->
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
          <v-text-field
            v-model="request.disposal_value"
            label="ມູນຄ່າການຖອນ"
            
            variant="outlined"
            density="compact"
          >
           
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
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_reason"
            label="ເຫດຜົນການຖອນ"
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
        </v-col>
      </v-row>
      <v-btn type="submit" color="primary"></v-btn>
    </v-form>
  </div>
</template>
