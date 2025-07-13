<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { formats } from "numeral";
import { useRoute } from "vue-router";
const route = useRoute();
const valid = ref();
const form = ref();
const id = Number(route.query.mapping_id) || 0;
const accountMethodStoreInstance = accountMethodStore();
const request = accountMethodStoreInstance.form_update_account_method;
const detail = computed(() => {
  return accountMethodStoreInstance.response_account_method_detail;
});
watch(
  () => accountMethodStoreInstance.response_account_method_detail,
  (req) => {
    if (req) {
      request.description = req.description;
    }
  }
);
const handelSuvmit = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
   const notification = await CallSwal({
      icon:"warning",
      title: "ຕອງການຢືນຢັນ",
      text: "ທ່ານຕ້ອງການອັບເດດຂໍ້ມູນນີ້ ຫຼື ບໍ່?",
      showCancelButton: true,
      confirmButtonText: "ຢືນຢັນ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "primary",
      cancelButtonColor: "error",

    });if(notification.isConfirmed){
      await accountMethodStoreInstance.UpdateAccountMethod(id);
    }
    
  }
};
onMounted(() => {
  accountMethodStoreInstance.GetAccountMethodDetail(id);
});
const title = "ລາຍລະອຽດການຕັ້ງຄ່າທືກບັນຊີຊັບສົມບັດ";
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="handelSuvmit">
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="3">
            <GlobalCardTitle :title="'ປະເພດຊັບສົມບັດ'" :text="detail?.ref_id" />
            <GlobalCardTitle :title="'ປະເພດທຸລະກຳ'" :text="detail?.acc_type" />

            <GlobalCardTitle
              :title="'ວັນທີ່ເລີ່ມຖຸລະກຳ'"
              :text="
                detail?.transaction_date
                  ? new Date(detail.transaction_date).toLocaleDateString(
                      'en-CA'
                    )
                  : ''
              "
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ເລກບັນຊີ DR'"
              :text="detail?.debit_account_id"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າທັງໝົດ'"
              :text="formatnumber(detail?.amount ?? 0).toString()"
            />
            <div v-if="detail?.Record_Status === 'C'">
              <GlobalCardTitle
                :title="'ສະຖານະບັນຊີ'"
                :text="'ປິດບັນຊີ'"
                color="red"
              />
            </div>
            <div v-if="detail?.Record_Status === 'O'">
              <GlobalCardTitle
                :title="'ສະຖານະບັນຊີ'"
                :text="'ປິດບັນຊີ'"
                color="red"
              />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ເລກບັນຊີ CR'"
              :text="detail?.credit_account_id"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າຕົ້ນ'"
              :text="formatnumber(detail?.amount_start ?? 0).toString()"
            />
            <!-- <GlobalCardTitle :title="'ລາຍລະອຽດ'" :text="detail?.description" /> -->
            <v-label class="mb-1">
              ລາຍລະອຽດ <span class="text-error">*</span>
            </v-label>
            <v-text-field
              v-model="request.description"
              variant="outlined"
              density="compact"
              class="formatted-number-input"
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ວັນທີບັນທືກ'"
              :text="dayjs(detail?.Maker_DT_Stamp).format('DD/MM/YYYY')"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າທ້າຍ'"
              :text="formatnumber(detail?.amount_end ?? 0).toString()"
            />
          </v-col>
          <v-col cols="12">
            <div class="d-flex justify-center align-center mt-4">
              <v-btn type="submit" color="primary" class="mr-4"> ບັນທືກ</v-btn>
              <v-btn @click="goPath('/property/accountmethod/')" color="error"> ຍົກເລີກ</v-btn>
            </div></v-col
          >
        </v-row>
      </v-col></v-form
    >
  </div>
</template>
