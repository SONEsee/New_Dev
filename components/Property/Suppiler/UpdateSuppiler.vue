<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";


const supplierStoreInstance = supplierStore();
const route = useRoute();
const router = useRouter();

const supplier_id = Number(route.query.supplier_id) || 0;


const title = ref("ແກ້ໄຂຜູ້ສະໜອງ");
const loading = ref(false);
const form = ref();


const goBack = () => {
  router.go(-1);
};


onMounted(() => {
  if (supplier_id) {
    loadSupplierDetail();
  }
});


const loadSupplierDetail = async () => {
  try {
    await supplierStoreInstance.GetSupplierDetail(supplier_id);
  } catch (error) {
    console.error("Error loading supplier detail:", error);
  }
};


watch(
  () => supplierStoreInstance.response_supplier_detail,
  (newVal) => {
    if (newVal) {
     
      supplierStoreInstance.form_update_supplier.supplier_code = newVal.supplier_code || "";
      supplierStoreInstance.form_update_supplier.supplier_name = newVal.supplier_name || "";
      supplierStoreInstance.form_update_supplier.contact_person = newVal.contact_person || "";
      supplierStoreInstance.form_update_supplier.phone = newVal.phone || "";
      supplierStoreInstance.form_update_supplier.email = newVal.email || "";
      supplierStoreInstance.form_update_supplier.address = newVal.address || "";
    }
  },
  { immediate: true }
);


const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await supplierStoreInstance.UpdateSupplier(supplier_id);
    }
  }
};


const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  email: (value: string) => {
    if (!value) return true; 
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ";
  },
  phone: (value: string) => {
    if (!value) return true; 
    const pattern = /^[0-9\-\+\s\(\)]+$/;
    return pattern.test(value) || "ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ";
  },
  maxLength20: (value: string) => {
    if (!value) return true;
    return value.length <= 20 || "ຄວາມຍາວບໍ່ເກີນ 20 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
};
</script>

<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

       

        <v-col cols="12" >
          <v-row>
            <v-col cols="12" md="6">
              <label>ລະຫັດຜູ້ສະໜອງ / Supplier Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="supplierStoreInstance.form_update_supplier.supplier_code"
                :rules="[rules.required, rules.maxLength20]"
                placeholder="ກະລຸນາປ້ອນລະຫັດຜູ້ສະໜອງ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
              ></v-text-field>

              <label>ຊື່ຜູ້ສະໜອງ / Supplier Name <span class="text-error">*</span></label>
              <v-text-field
                v-model="supplierStoreInstance.form_update_supplier.supplier_name"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ສະໜອງ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>

              <label>ຊື່ຜູ້ຕິດຕໍ່ / Contact Person</label>
              <v-text-field
                v-model="supplierStoreInstance.form_update_supplier.contact_person"
                :rules="[rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ຕິດຕໍ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ເບີໂທລະສັບ / Phone</label>
              <v-text-field
                v-model="supplierStoreInstance.form_update_supplier.phone"
                :rules="[rules.phone, rules.maxLength20]"
                placeholder="ກະລຸນາປ້ອນເບີໂທລະສັບ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
              ></v-text-field>

              <label>ອີເມວ / Email</label>
              <v-text-field
                v-model="supplierStoreInstance.form_update_supplier.email"
                :rules="[rules.email, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນອີເມວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
                type="email"
              ></v-text-field>

              <label>ທີ່ຢູ່ / Address</label>
              <v-textarea
                v-model="supplierStoreInstance.form_update_supplier.address"
                placeholder="ກະລຸນາປ້ອນທີ່ຢູ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
                maxlength="500"
              ></v-textarea>
            </v-col>
          </v-row>
           <v-col cols="12" class="d-flex flex-wrap justify-center pt-6">
         
          
          <v-btn color="primary" flat type="submit" :loading="supplierStoreInstance.isLoading">
            ບັນທຶກ
          </v-btn> <v-btn 
          class="ml-2"
            color="error" 
            flat 
            @click="goBack"
           
          >
            ຍົກເລີກ
          </v-btn>
        </v-col>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>