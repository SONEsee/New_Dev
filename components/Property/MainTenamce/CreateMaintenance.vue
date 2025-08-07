<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useMentenance } from "@/stores/mantenaces";

const validate = ref();
const form = ref();
const isFormValid = ref(false);
const faAssetStoreInstance = faAssetStore();
const mantanances = useMentenance();
const Dapremen = DevisionStore()
const searchBarcode = ref("");
const isSearching = ref(false);
const responsdevice = computed(()=>{
    const data =  Dapremen.respons_detail_query_data;
    if(Array.isArray(data)){
        return data
    }
    if(data && typeof data==="object"){
        return [data]
    }
    return []
})
const rules = {
  required: (value: any) => !!value || "ກະລຸນາກຳນົດຄ່າ",
};

const dataSearch = async () => {
  if (searchBarcode.value.trim() && !isSearching.value) {
    isSearching.value = true;
    try {
      faAssetStoreInstance.filterBarcode.request.asset_tag =
        searchBarcode.value;
      await faAssetStoreInstance.getDataBarcode();

      if (dataFasset.value.length > 0 && dataFasset.value[0]?.asset_list_id) {
        mantanances.form_creat_mantenance.asset_list_id =
          dataFasset.value[0].asset_list_id;
        mantanances.form_creat_mantenance.book_value =
          dataFasset.value[0]?.asset_value || "";
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      isSearching.value = false;
    }
  }
};

const handlePaste = async (event: ClipboardEvent) => {
  await nextTick();
  if (searchBarcode.value.trim()) {
    setTimeout(() => {
      dataSearch();
    }, 100);
  }
};

const dataFasset = computed(() => {
  const data = faAssetStoreInstance.response_fa_asset_detail;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const formatCurrency = (value: any): string => {
  if (!value || isNaN(Number(value))) {
    return "ບໍ່ມີຂໍ້ມູນ";
  }
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value)) + " ກີບ"
  );
};

const SubmitDataMentenance = async () => {
  const validation = await form.value.validate();
  if (validation.valid) {
    await mantanances.createMantenance();
  }
};

onMounted(() => {
  mantanances.form_creat_mantenance.audit_year = new Date().getFullYear();

});

const title = "ບຳລູງຮັກສາຊັບສຶນ";
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchBarcode"
            label="ຄົນຫາຕາມເລກ Barcode"
            variant="outlined"
            density="compact"
            @keyup.enter="dataSearch"
            @paste="handlePaste"
            :loading="isSearching"
            placeholder="ພິມຫຼືວາງ Barcode..."
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn
            color="primary"
            @click="dataSearch"
            :disabled="!searchBarcode.trim()"
            :loading="isSearching"
          >
            ຄົ້ນຫາ
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-card flat style="border: solid 1px #64b5f6" class="mb-4">
      <v-card-title style="background-color: #64b5f6">
        ຂໍ້ມູນພື້ນຖານຊັບສິນ
      </v-card-title>
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ລະຫັດຊັບສິນ'"
              :text="dataFasset[0]?.asset_list_id || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າທັງໝົດ'"
              :text="
                formatCurrency(dataFasset[0]?.asset_value) || 'ບໍ່ມີຂໍ້ມູນ'
              "
            />
            <!-- <GlobalCardTitle
              :title="'ມູນຄ່າທັງໝົດ'"
              :text="
                formatCurrency(dataFasset[0]?.) || 'ບໍ່ມີຂໍ້ມູນ'
              "
            /> -->
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ຊື່ຊັບສິນ'"
              :text="dataFasset[0]?.asset_spec || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ອາຍຸໃຊ້ງານ'"
              :text="`${dataFasset[0]?.asset_useful_life} ປີ` || 'ບໍ່ມີຂໍ້ມູນ'"
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ສະຖານທີ່ຕັ້ງ'"
              :text="
                dataFasset[0]?.location_detail.location_name_la || 'ບໍ່ມີຂໍ້ມູນ'
              "
            />
            <GlobalCardTitle
              :title="'ມື້ຊື້'"
              :text="dataFasset[0]?.asset_date || 'ບໍ່ມີຂໍ້ມູນ'"
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ຜູ້ສະໜອງ'"
              :text="
                dataFasset[0]?.supplier_detail.supplier_name || 'ບໍ່ມີຂໍ້ມູນ'
              "
            />
            <GlobalCardTitle
              :title="'ສະຖານະໃຊ້ງານ'"
              :text="
                dataFasset[0]?.asset_status_detail.MC_name_la || 'ບໍ່ມີຂໍ້ມູນ'
              "
            />
          </v-col>
        </v-row>
      </v-col>
    </v-card>

    <v-form ref="form" v-model="isFormValid">
      <v-card style="border: 1px solid #bbdefb" class="mb-4">
        <v-card-title style="background-color: #bbdefb">
          ຂໍ້ມູນການກວດສອບ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.audit_year"
                label="ປີທີ່ກວດສອບ"
                variant="outlined"
                density="compact"
                type="number"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.audit_period"
                label="ໄລຍະການກວດສອບ"
                :items="['ປະຈຳປີ', 'ປະຈຳໄຕມາດ', 'ປະຈຳເດືອນ']"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
              <!-- <v-text-field
                v-model="mantanances.form_creat_mantenance.audit_period"
                label="ໄລຍະການກວດສອບ"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-text-field> -->
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.audit_date"
                label="ວັນທີກວດສອບ"
                variant="outlined"
                density="compact"
                type="date"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.auditor_name"
                label="ຊື່ຜູ້ກວດສອບ"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #c8e6c9" class="mb-4">
        <v-card-title style="background-color: #c8e6c9">
          ສະຖານະທາງກາຍະພາບ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.physical_status"
                label="ສະຖານະທາງກາຍະພາບ"
                :items="['ດີເລີດ', 'ດີ', 'ປົກກະຕິ', 'ຊຳລຸດ', 'ເສຍຫາຍ']"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.condition_status"
                label="ສະພາບການທຳງານ"
                :items="[
                  'ໃຊ້ງານໄດ້ປົກກະຕິ',
                  'ໃຊ້ງານໄດ້ບາງສ່ວນ',
                  'ບໍ່ສາມາດໃຊ້ງານໄດ້',
                ]"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.location_verified"
                label="ສະຖານທີ່ຖືກຕ້ອງ?"
                :items="['ຖືກຕ້ອງ', 'ບໍ່ຖືກຕ້ອງ']"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.actual_location"
                label="ສະຖານທີ່ຕົວຈິງ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #fff9c4" class="mb-4">
        <v-card-title style="background-color: #fff9c4">
          ຂໍ້ມູນມູນຄ່າ ແລະ ຄ່າເສື່ອມລາຄາ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.book_value"
                label="ມູນຄ່າໃນບັນຊີ"
                variant="outlined"
                density="compact"
                type="number"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.estimated_value"
                label="ມູນຄ່າປະເມີນ"
                variant="outlined"
                density="compact"
                type="number"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.depreciation_rate"
                label="ອັດຕາເສື່ອມລາຄາ"
                variant="outlined"
                density="compact"
                type="number"
                suffix="%"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="
                  mantanances.form_creat_mantenance.accumulated_depreciation
                "
                label="ຄ່າເສື່ອມລາຄາສະສົມ"
                variant="outlined"
                density="compact"
                type="number"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="
                  mantanances.form_creat_mantenance.remaining_useful_life
                "
                label="ອາຍຸໃຊ້ງານເຫຼືອ"
                variant="outlined"
                density="compact"
                type="number"
                suffix="ປີ"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #ffcdd2" class="mb-4">
        <v-card-title style="background-color: #ffcdd2">
          ການຢັ້ງຢືນຂໍ້ມູນ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="
                  mantanances.form_creat_mantenance.serial_number_verified
                "
                label="Serial Number ຖືກຕ້ອງ?"
                :items="['ຖືກຕ້ອງ', 'ບໍ່ຖືກຕ້ອງ', 'ບໍ່ມີ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.tag_number_verified"
                label="Tag Number ຖືກຕ້ອງ?"
                :items="['ຖືກຕ້ອງ', 'ບໍ່ຖືກຕ້ອງ', 'ບໍ່ມີ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.insurance_coverage"
                label="ການປົກປ້ອງປະກັນໄພ"
                :items="['ມີ', 'ບໍ່ມີ', 'ບໍ່ແນ່ໃຈ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.documents_verified"
                label="ເອກະສານຖືກຕ້ອງ?"
                :items="['ຖືກຕ້ອງ', 'ບໍ່ຖືກຕ້ອງ', 'ບໍ່ສົມບູນ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #f3e5f5" class="mb-4">
        <v-card-title style="background-color: #f3e5f5">
          ຄຳແນະນຳ ແລະ ການບຳລຸງຮັກສາ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="mantanances.form_creat_mantenance.maintenance_required"
                label="ຕ້ອງການບຳລຸງຮັກສາ?"
                :items="['ຕ້ອງການ', 'ບໍ່ຕ້ອງການ', 'ບຳລຸງຮັກສາເລື້ອຍໆ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="
                  mantanances.form_creat_mantenance.replacement_recommended
                "
                label="ແນະນຳໃຫ້ປ່ຽນແທນ?"
                :items="['ແນະນຳ', 'ບໍ່ແນະນຳ', 'ຍັງໃຊ້ໄດ້']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="mantanances.form_creat_mantenance.disposal_recommended"
                label="ແນະນຳໃຫ້ກຳຈັດ?"
                :items="['ແນະນຳ', 'ບໍ່ແນະນຳ', 'ຍັງສາມາດໃຊ້ໄດ້']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #e1f5fe" class="mb-4">
        <v-card-title style="background-color: #e1f5fe">
          ຜົນການກວດສອບ ແລະ ຄຳແນະນຳ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.audit_findings"
                label="ຜົນການກວດສອບ"
                variant="outlined"
                rows="4"
                no-resize
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.recommendations"
                label="ຄຳແນະນຳ"
                variant="outlined"
                rows="4"
                no-resize
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.remarks"
                label="ໝາຍເຫດ"
                variant="outlined"
                rows="3"
                no-resize
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Follow-up Section -->
      <v-card style="border: 1px solid #fce4ec" class="mb-4">
        <v-card-title style="background-color: #fce4ec">
          ການຕິດຕາມ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.follow_up_required"
                label="ຕ້ອງການຕິດຕາມ?"
                :items="['ຕ້ອງການ', 'ບໍ່ຕ້ອງການ']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.follow_up_date"
                label="ວັນທີຕິດຕາມ"
                variant="outlined"
                density="compact"
                type="date"
                :disabled="
                  mantanances.form_creat_mantenance.follow_up_required !==
                  'ຕ້ອງການ'
                "
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.audit_status"
                label="ສະຖານະການກວດສອບ"
                :items="['ສຳເລັດ', 'ກຳລັງດຳເນີນ', 'ລໍຖ້າອະນຸມັດ']"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #e8f5e8" class="mb-4">
        <v-card-title style="background-color: #e8f5e8">
          ການອະນຸມັດ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.reviewer_name"
                label="ຊື່ຜູ້ກວດກາ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.review_date"
                label="ວັນທີກວດກາ"
                variant="outlined"
                density="compact"
                type="date"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.approver_name"
                label="ຊື່ຜູ້ອະນຸມັດ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.approval_date"
                label="ວັນທີອະນຸມັດ"
                variant="outlined"
                density="compact"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card style="border: 1px solid #fff3e0" class="mb-4">
        <v-card-title style="background-color: #fff3e0">
          ເອກະສານແນບ
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="mantanances.form_creat_mantenance.photos_attached"
                label="ຮູບພາບແນບ"
                variant="outlined"
                density="compact"
                multiple
                accept="image/*"
                chips
                show-size
                prepend-icon="mdi-camera"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <v-row class="mt-4">
        <v-col cols="12" class="text-center">
          <v-btn
            color="primary"
            size="large"
            @click="SubmitDataMentenance"
            :loading="mantanances.isLoading"
            :disabled="!isFormValid"
            class="mx-2"
          >
            ບັນທຶກຂໍ້ມູນ
          </v-btn>
          <v-btn color="error" variant="outlined" size="large" class="mx-2">
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
