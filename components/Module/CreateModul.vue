<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const title = "ສ້າງຂໍ້ມູນໂມດູນ"
const moduleStore = ModulesStore()
const valid = ref(false)
const form = ref()
const router = useRouter()

const DeviceDistributins = () => {
  valid.value = !valid.value
}

const goPath = (path: string) => {
  router.push(path)
}

const Create = async () => {
  try {
    const isValid = await form.value.validate()
    if (isValid) {
      await moduleStore.createModule()
    
      goPath('/module')
    }
  } catch (error) {
    console.error('Module creation failed:', error)
  }
}
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="Create">
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              @click:append-inner="DeviceDistributins"
              v-model="moduleStore.create_form_module.module_name_la"
              density="compact"
              variant="outlined"
              label="ຊື່ຟັງຊັ້ນ (ພາສາລາວ)"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
              required
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_name_en"
              density="compact"
              variant="outlined"
              label="ຊື່ຟັງຊັ້ນ (ພາສາອັງກິດ)"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
              required
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_icon"
              density="compact"
              variant="outlined"
              label="ໄອຄອນຟັງຊັ້ນ (ເຊັ່ນ mdi-home)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_order"
              density="compact"
              variant="outlined"
              label="ລຳດັບຟັງຊັ້ນ (ເຊັ່ນ 1, 2, 3)"
              type="number"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_Id"
              density="compact"
              variant="outlined"
              label="ລະຫັດຟັງຊັ້ນ"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຟັງຊັ້ນ']"
              required
            >
            </v-text-field>
          </v-col>
          <!-- <v-col cols="12" md="6">
            <v-autocomplete
              :items="[
                { title: 'ເປິດ', value: 'Y' },
                { title: 'ປິດ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="moduleStore.create_form_module.is_active"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
          </v-col> -->
        </v-row>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            type="submit"
            color="primary"
            class="d-flex justify-center mr-2"
            text="ບັນທຶກ"
          />
          <v-btn
            color="error"
            class="d-flex justify-center"
            text="ຍົກເລີກ"
            @click="goPath('/module')"
          />
        </v-col>
      </v-col>
    </v-form>
  </v-container>
</template>