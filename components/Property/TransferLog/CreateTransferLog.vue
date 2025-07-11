<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
const id = route.query.asset_list_id as string;
const form = ref();
const faasetStore = faAssetStore();
const transaction = useTransactionLogStore();
const location = locationStore();

const valid = ref(false);
watch(
  () => faasetStore.response_fa_asset_detail,
  (req) => {
    if (req) {
      request.value.asset_list_id = req.asset_list_id;
      request.value.from_location_id = req.asset_location_id.toString();
    }
  }
);
const locationlist = computed(() => {
  return location.response_location_list;
});
const request = computed(() => {
  return transaction.creat_form_transaction_log;
});
const res = computed(() => {
  return faasetStore.response_fa_asset_detail;
});
const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    CallSwal({
      title: "ກຳລັງບັນທຶກ...",
      icon: "info",
      showConfirmButton: false,
      timer: 2000,
    });
    console.log("request", request.value);
  }
};
onMounted(() => {
  faasetStore.GetFaAssetDetail(id);
  location.GetLocationList();
});
const title = "ບັນທຶກການໂອນຍ້າຍຊັບສົມບັດ";
</script>

<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>
        <!-- <pre>{{ res }}</pre> -->
        <v-col cols="12" class="">
          <v-row>
            <v-col cols="12">
              <v-card
                variant="outlined"
                class=""
                style="border: 2px solid #4caf50"
              >
                <v-card-title class="text-h6 pb-2 bg-success">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="4">
                      <label>ລະຫັດຊັບສິນ:</label>
                      <v-text-field
                        v-model="request.asset_list_id"
                        variant="outlined"
                        density="compact"
                        readonly
                        class="formatted-number-input"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <GlobalCardTitle
                        :text="res?.asset_spec"
                        :title="'ຊືຊັບສິນ:'"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <label>ສະຖານທີ່ຕົ້ນທາງ:</label>
                      <v-text-field
                        :value="res?.location_detail.location_name_la || ''"
                        variant="outlined"
                        density="compact"
                        readonly
                        class="formatted-number-input"
                      />
                    </v-col>

                    <v-col cols="12" md="4"> </v-col>
                    <v-col cols="12" md="4"> </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col>
              <v-card
                variant="outlined"
                class="mb-6"
                style="border: 2px solid #9c27b0"
              >
                <v-card-title class="text-h6 pb-2 bg-purple text-white">
                  <v-icon class="mr-2">mdi-calculator</v-icon>
                  ຂໍ້ມູນການເຄືອນຍ້າຍຊັບສົມບັດ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="4">
                      <label>ສະຖານທີ່ປາຍທາງ:</label>
                      <v-autocomplete
                        :items="locationlist || []"
                        v-model="request.to_location_id"
                        variant="outlined"
                        density="compact"
                        item-title="location_name_la"
                        item-value="location_id"
                        class="formatted-number-input"
                      />
                      <label>ສະພາບກອ່ນການໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.condition_before"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                      <label>ຜູ້ຂໍໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.requested_by"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                    </v-col>
                    <v-col cols="4">
                      <label>ເຫດຜົນໃນການໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.transfer_reason"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                      <label>ສະພາບຫຼັງການໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.condition_after"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                      <label>ຜູ້ອະນຸຍາດການໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.approved_by"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                    </v-col>
                    <v-col cols="4">
                      <label>ຄ່າໃຊ້ຈ່າຍໃນການໂອນຍ້າຍ:</label>
                      <v-text-field
                        v-model="request.transfer_cost"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                      <label>ວິທີການຂົນສົ່ງ:</label>
                      <v-text-field
                        v-model="request.transport_method"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                      <label>ຜູ້ຮັບໂອນ:</label>
                      <v-text-field
                        v-model="request.received_by"
                        variant="outlined"
                        density="compact"
                        class="formatted-number-input"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
              <!-- <v-btn
                color="error"
                variant="outlined"
                @click="goBack"
                class="mr-2"
                :disabled="faAssetStoreInstance.isLoading"
              >
                ຍົກເລີກ
              </v-btn> -->

              <v-btn
                color="primary"
                type="submit"
                prepend-icon="mdi-content-save"
              >
                ບັນທຶກ
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>

<style scoped>
/* .v-text-field input[type="number"] {
  -moz-appearance: textfield;
    
} */

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.formatted-number-input .v-field__input {
  text-align: right;
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

.formatted-number-input .v-field__input input {
  text-align: right;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 4px;
  display: block;
}

.pb-4 {
  margin-bottom: 16px;
}

.bg-success {
  background-color: #eceeec !important;
}

.bg-warning {
  background-color: #dad2bc !important;
}

.bg-purple {
  background-color: #ccaed1 !important;
}

.bg-purple-lighten-2 {
  background-color: #ce93d8 !important;
}

.text-white {
  color: white !important;
}

.text-dark {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
