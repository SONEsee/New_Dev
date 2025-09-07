<script setup lang="ts">
import { useRoute } from "vue-router";

const store = DevisionStore();
const route = useRoute();
const div_id = route.query.div_id as string;
onMounted(() => {
  return store.GetDataDetail(div_id);
});
const res = computed(() => {
  return store.respons_detail_query_data;
});
onMounted(() => {
  store.GetDataDetail(div_id);
});
const title = ref("ລາຍລະອຽດພະແນກ / Detail of Division");
</script>
<template>
  <div class="pa-4">
  <v-col cols="12">
    <GlobalTextTitleLine :title="title" />
  </v-col>
  <section class="">
    <v-form ref="form">
      <v-row>
        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="12">
              <v-row>
                <v-col cols="12" md="6">
                  <GlobalCardTitle
                    :title="'ລະຫັດພະແນກ / Division ID'"
                    :text="res?.div_id ?? 'N/A'"
                  />

                  <GlobalCardTitle
                    :title="'ຊື່ພະແນກພາສາລາວ / Division Name (Lao)'"
                    :text="res?.division_name_la ?? 'N/A'"
                  />

                  <GlobalCardTitle
                    :title="'ຊື່ພະແນກພາສາອັງກິດ / Division Name (English)'"
                    :text="res?.division_name_en ?? 'N/A'"
                  />
                </v-col>

                <v-col cols="6">
                  <GlobalCardTitle
                    :title="'ລະຫັດຜູ້ບັນທຶກ / Maker ID'"
                    :text="res?.Maker_Id ?? 'N/A'"
                  />

                  <GlobalCardTitle
                    v-if="res?.Auth_Status === 'P'"
                    :title="'ສະຖານະການໃຊ້ງານ / Status'"
                    :text="'ເປີດໃຊ້ງານ'"
                  />
                  <GlobalCardTitle
                    v-if="res?.Auth_Status === 'C'"
                    :title="'ສະຖານະການໃຊ້ງານ / Status'"
                    :text="'ປິດໃຊ້ງານ'"
                  />

                  <GlobalCardTitle
                    v-if="res?.Once_Auth === 'Y'"
                    :title="'ສະຖານະເຄີຍຖືກອະນຸມັດ '"
                    :text="'ເຄີຍຖືກອະນຸມັດແລ້ວ'"
                  />
                  <GlobalCardTitle
                    v-if="res?.Once_Auth === 'N'"
                    :title="'ສະຖານະເຄີຍຖືກອະນຸມັດ '"
                    :text="'ບໍ່ເຄີຍຖືກອະນຸມັດ'"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section></div>
</template>
