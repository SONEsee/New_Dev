<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { useRoute } from "vue-router";
const form = ref();
const masterStore = useMasterStore();
const status = computed(() => {
  const data = masterStore.respone_data_master;

  if (!data) return [];

  const arrayData = Array.isArray(data) ? data : [data];

  return arrayData.flatMap((item) => item?.MasterCodes || []);
});
const route = useRoute();
const id = Number(route.query.id_autoriz);
const title = "ອະນຸມັດລາຍການ";
const mainStore = useFassetLidtDescription();
const datadetail = computed(() => {
  return mainStore.respons_data_driscription_main;
});
const formatCurrency = (value: any): string => {
  if (!value || isNaN(Number(value))) return "0 ກີບ";
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value)) + " ກີບ"
  );
};

const Submit = async () => {
  const isValidate = await form.value.validate();
  mainStore.confirm_form_mark.aldm_ids = [
    Number(datadetail.value?.aldm_id) || 0,
  ];

  if (isValidate) {
     mainStore.postConfirm();
  }
};
onMounted(() => {
  mainStore.getDataDetail(id);
  masterStore.getStatus();
});
</script>
<template>
  <div class="pa-4">
    <!-- <pre>{{ datadetail }}</pre> -->
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="Submit">
      <v-card style="border: 1px #64b5f6 solid">
        <v-card-title style="background-color: #64b5f6">
          ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
        </v-card-title>
        <v-col cols="12">
          <v-row>
            <v-col cols="3">
              <GlobalCardTitle
                :title="'ລະຫັດຊັບສິນ'"
                :text="datadetail?.asset_list_id_detail.asset_list_id"
              />
              <GlobalCardTitle
                :title="'ມູນຄ່າຫັກຄ່າຫຼູ້ຍຫຽ້ນ'"
                :text="formatCurrency(datadetail?.dpca_value)"
              />
            </v-col>
            <v-col cols="3">
              <GlobalCardTitle
                :title="'ຊື່ຊັບສົມບັດ'"
                :text="datadetail?.asset_list_id_detail.asset_spec"
              />
              <GlobalCardTitle
                :title="'ມູຄ່າຄົງເຫຼືອ'"
                :text="formatCurrency(datadetail?.remaining_value)"
              />
            </v-col>
            <v-col cols="3">
              <GlobalCardTitle
                :title="'ຄັ້ງທີ່ຫັກ'"
                :text="datadetail?.dpca_desc ?? ''"
              />
              <GlobalCardTitle
                :title="'ມູນຄ່າສະສົມ'"
                :text="formatCurrency(datadetail?.accumulated_dpca)"
              />
            </v-col>
            <v-col cols="3">
              <GlobalCardTitle
                :title="'ມື້ຫັກ'"
                :text="
                  dayjs(datadetail?.Maker_DT_Stamp ?? '').format('DD/MM/YYYY')
                "
              />
              <GlobalCardTitle
                :title="'ຈຳນວນມື້ທີ່ຫັກ'"
                :text="`${datadetail?.dpca_no_of_days ?? ''} ວັນ`"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-card>
      <v-card style="border: 1px #81c784 solid">
        <v-card-title style="background-color: #81c784">
          ການອານຸມັດ
        </v-card-title>
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
              v-model="mainStore.confirm_form_mark.status"
                placeholder="ເລືອກສະຖານະການອະນຸມັດ"
                variant="outlined"
                :items="status"
                item-title="MC_name_la"
                item-value="MC_code"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
              v-model="mainStore.confirm_form_mark.reason"
                variant="outlined"
                placeholder="ລາຍລະອຽດ"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
      <v-col cols="12" class="d-flex justify-center">
        <v-btn color="primary" class="mr-2" type="submit"> ບັນທືກ </v-btn>
        <v-btn color="error" @click="$router.go(-1)"> ຍົກເລີກ </v-btn>
      </v-col></v-form
    >
  </div>
</template>
