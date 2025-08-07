<script setup lang="ts">
import { useBarcode } from "~/composables/useBarcode";
const title = "ບໍາລຸງຮັກສາຊັບສິນ";
const faAssetStoreInstance = faAssetStore();

const { generateBarcode, generateBarcodeBase64, generateBarcodeSVG } =
  useBarcode();

const showBarcodeDialog = ref(false);
const selectedAsset = ref<Asset | null>(null);
const barcodeElement = ref<HTMLElement>();

// const FaAassetData = computed(() => {
//   const data = faAssetStoreInstance.response_fa_asset_list;
//   if (Array.isArray(data)) {
//     return data;
//   }
//   if (data && typeof data === "object") {
//     return [data];
//   }
//   return [];
// });
const FaAassetData = computed(() => {
  const data = faAssetStoreInstance.response_fa_asset_list;
  const dataArray = Array.isArray(data)
    ? data
    : data && typeof data === "object"
    ? [data]
    : [];

  return dataArray.filter((item) => item.asset_status === "AC");
});
onMounted(() => {
  faAssetStoreInstance.GetFaAssetList();
});

const header = [
  { title: "ລຳດັບ", value: "index" },
  { title: "ບາໂຄດ", value: "asset_tag" },
  { title: "ຊື່ຊັບສົມບັດ", value: "asset_spec" },
  { title: "ສະຖານທີ່", value: "location_detail.location_name_la" },
  { title: "ວັນທີຊື້ຊັບສົມບັດ", value: "asset_date" },
  { title: "ການກະທຳ", value: "actions", sortable: false },
];

const page = ref(1);
const itemsPerPage = ref(10);

const getGlobalIndex = (localIndex: number) => {
  return (page.value - 1) * itemsPerPage.value + localIndex + 1;
};
interface Asset {
  asset_list_id: string;
  asset_tag: string;
  asset_spec: string;
  asset_date: string | Date;
  asset_id_detail: {
    coa_id: number;
    asset_code: string;
    asset_name_en: string;
    asset_name_la: string;
    asset_type_detail: {
      type_code: string;
      type_name_la: string;
      type_name_en: string;
    };
  };
  location_detail?: {
    location_name_la: string;
  };
  [key: string]: any;
}

const barcodeRefs = ref({});

const generateInlineBarcode = (assetTag: string) => {
  return generateBarcodeSVG(assetTag, {
    height: 40,
    width: 0.9,
    margin: 2,
    fontSize: 10,
  });
};

const showBarcode = (asset: Asset) => {
  selectedAsset.value = asset;
  showBarcodeDialog.value = true;

  nextTick(() => {
    if (barcodeElement.value && asset.asset_tag) {
      barcodeElement.value.innerHTML = "";

      const barcodeHTML = generateBarcodeSVG(asset.asset_tag, {
        height: 60,
        width: 1,
        margin: 5,
        fontSize: 12,
      });

      barcodeElement.value.innerHTML = barcodeHTML;
    }
  });
};

const printBarcode = () => {
  if (!selectedAsset.value) return;

  const barcodeHTML = generateBarcodeSVG(selectedAsset.value.asset_tag, {
    height: 100,
    width: 2,
    margin: 10,
  });

  const printWindow = window.open("", "_blank");
  printWindow?.document.write(`
    <html>
      <head>
        <title>ພິມບາໂຄດ - ${selectedAsset.value?.asset_tag}</title>
        <style>
          body { 
            text-align: center; 
            font-family: Arial, sans-serif; 
            margin: 20px;
          }
          .print-barcode { 
            margin: 20px auto; 
            max-width: 400px;
            border: 1px solid #ccc;
            padding: 20px;
          }
          h3 { margin-bottom: 15px; }
          p { margin-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="print-barcode">
          <h3>${selectedAsset.value?.asset_spec}</h3>
          ${barcodeHTML}
          <p>Asset Tag: ${selectedAsset.value?.asset_tag}</p>
          <p>Location: ${
            selectedAsset.value?.location_detail?.location_name_la || "-"
          }</p>
        </div>
      </body>
    </html>
  `);

  printWindow?.document.close();
  setTimeout(() => {
    printWindow?.print();
  }, 100);
};

const downloadBarcode = () => {
  if (!selectedAsset.value) return;

  const base64Image = generateBarcodeBase64(selectedAsset.value.asset_tag, {
    height: 100,
    width: 2,
    margin: 10,
  });

  if (base64Image) {
    const link = document.createElement("a");
    link.download = `barcode-${selectedAsset.value.asset_tag}.png`;
    link.href = base64Image;
    link.click();
  }
};
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-data-table
      :headers="header"
      :items="FaAassetData"
      :loading="faAssetStoreInstance.isLoading"
      :items-per-page="itemsPerPage"
      v-model:page="page"
    >
      <template #item.index="{ index }">
        {{ getGlobalIndex(index) }}
      </template>

      <template #item.asset_tag="{ item }">
        <div
          class="inline-barcode-container"
          @click="showBarcode(item)"
          style="cursor: pointer"
        >
          <div v-html="generateInlineBarcode(item.asset_tag)"></div>
          <!-- <div class="barcode-text">{{ item.asset_tag }}</div> -->
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-qrcode"
          size="small"
          color="primary"
          variant="text"
          @click="showBarcode(item)"
        />
      </template>
    </v-data-table>

    <v-dialog v-model="showBarcodeDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>ບາໂຄດຊັບສິນ</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showBarcodeDialog = false"
          />
        </v-card-title>

        <v-card-text v-if="selectedAsset">
          <div class="text-center">
            <h4 class="mb-4">{{ selectedAsset.asset_spec }}</h4>

            <div class="barcode-container mb-4" ref="barcodeElement"></div>

            <v-chip color="info" variant="outlined" class="mb-3">
              {{ selectedAsset.asset_tag }}
            </v-chip>

            <div class="text-body-2 text-grey">
              <strong>ສະຖານທີ່:</strong>
              {{ selectedAsset.location_detail?.location_name_la || "-" }}
            </div>

            <div class="text-body-2 text-grey mt-1">
              <strong>ວັນທີຊື້:</strong>
              {{ selectedAsset.asset_date || "-" }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            @click="printBarcode"
          >
            ພິມບາໂຄດ
          </v-btn>

          <v-btn
            color="success"
            prepend-icon="mdi-download"
            @click="downloadBarcode"
          >
            ດາວໂຫຼດ
          </v-btn>

          <v-btn variant="outlined" @click="showBarcodeDialog = false">
            ປິດ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.barcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  max-width: 100%;
  overflow: hidden;
}

.barcode-container svg {
  max-width: 100%;
  height: auto;
  max-height: 80px;
}

.inline-barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  max-width: 120px;
}

.inline-barcode-container:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
}

.barcode-text {
  font-size: 10px;
  font-weight: bold;
  margin-top: 2px;
  color: #666;
}

.inline-barcode-container svg {
  max-width: 100px;
  height: auto;
}

.v-chip {
  transition: all 0.3s ease;
}

.v-chip:hover {
  transform: scale(1.05);
}
</style>
