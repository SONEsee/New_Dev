

<script setup lang="ts">
// ໃຊ້ script ເດີມຂອງເຈົ້າແຕ່ເພີ່ມສ່ວນ scanner ເຂົ້າໄປ
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useMentenance } from "@/stores/mantenaces";

const validate = ref();
const form = ref();
const isFormValid = ref(false);
const faAssetStoreInstance = faAssetStore();
const mantanances = useMentenance();
const Dapremen = UseCategoryStore();
const employee = useEmployeeStore();
const searchBarcode = ref("");
const isSearching = ref(false);

const showScanner = ref(false);
const statusMessage = ref('');
const statusType = ref<'success' | 'error' | 'warning' | 'info'>('info');

// Scanner related refs
const videoRef = ref<HTMLVideoElement | null>(null);
const isScanning = ref(false);
const isLoading = ref(false);
const isReady = ref(false);
const scanResult = ref<{ text: string; format: string; timestamp: Date } | null>(null);
const error = ref('');
const availableCameras = ref<{ deviceId: string; label: string }[]>([]);
const currentCameraIndex = ref(0);
const route = useRoute();
watch(() => route.query.mantanence_id, (newValue) => {
  if (newValue) {
    mantanances.form_creat_mantenance.audit_period = newValue as string
  }
}, { immediate: true })

// ZXing related
let BrowserMultiFormatReader: any = null;
let codeReader: any = null;
let stream: MediaStream | null = null;

const employees = computed(() => {
  const data = employee.respose_data_employee;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const responsdevice = computed(() => {
  const data = Dapremen.categories;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const dataFasset = computed(() => {
  const data = faAssetStoreInstance.response_fa_asset_detail;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
});

const rules = {
  required: (value: any) => !!value || "ກະລຸນາກຳນົດຄ່າ",
  number: (value: any) => !isNaN(Number(value)) || "ກະລຸນາກຳນົດຕົວເລກ",
};

const auditPeriodOptions = [
  { value: 'ANNUAL', text: 'ປະຈຳປີ' },
  { value: 'QUARTERLY', text: 'ປະຈຳໄຕມາດ' },
  { value: 'MONTHLY', text: 'ປະຈຳເດືອນ' }
];

const physicalStatusOptions = [
  { value: 'FOUND', text: 'ພົບຊັບສິນຕາມທີ່ບັນທຶກ' },
  { value: 'MISSING', text: 'ຊັບສິນສູນຫາຍ' },
  { value: 'DAMAGED', text: 'ຊັບສິນເສຍຫາຍ' },
  { value: 'DISPOSED', text: 'ຊັບສິນຖືກຈຳໜ່າຍແລ້ວ' }
];

const conditionStatusOptions = [
  { value: 'EXCELLENT', text: 'ສະພາບດີເລີດ' },
  { value: 'GOOD', text: 'ສະພາບດີ' },
  { value: 'FAIR', text: 'ສະພາບພໍໃຊ້ໄດ້' },
  { value: 'POOR', text: 'ສະພາບບໍ່ດີ' },
  { value: 'UNUSABLE', text: 'ໃຊ້ການບໍ່ໄດ້' }
];

const auditStatusOptions = [
  { value: 'DRAFT', text: 'ຮ່າງ' },
  { value: 'COMPLETED', text: 'ສຳເລັດແລ້ວ' },
  { value: 'REVIEWED', text: 'ທົບທວນແລ້ວ' },
  { value: 'APPROVED', text: 'ອະນຸມັດແລ້ວ' }
];

const yesNoOptions = [
  { value: 'Y', text: 'ແມ່ນ' },
  { value: 'N', text: 'ບໍ່' }
];

// Number formatting functions
const formatNumberInput = (value: string): string => {
  if (!value || value === 'undefined' || value === 'null') return '';
  
  const stringValue = String(value);
  const numericValue = stringValue.replace(/[^\d.]/g, '');
  
  if (!numericValue || numericValue === 'NaN' || isNaN(parseFloat(numericValue))) {
    return '';
  }
  
  const parts = numericValue.split('.');
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return parts.join('.');
};

const parseFormattedNumber = (value: string): string => {
  if (!value || value === 'undefined' || value === 'null') return '';
  const cleaned = value.replace(/,/g, '');
  return isNaN(parseFloat(cleaned)) ? '' : cleaned;
};

const formattedBookValue = ref('');
const formattedAccumulatedDepreciation = ref('');
const formattedEstimatedValue = ref('');

const updateBookValue = (newValue: string) => {
  if (!newValue || newValue === 'NaN' || newValue === 'undefined') {
    mantanances.form_creat_mantenance.book_value = '';
    formattedBookValue.value = '';
    return;
  }
  
  const parsed = parseFormattedNumber(newValue);
  mantanances.form_creat_mantenance.book_value = parsed;
  formattedBookValue.value = formatNumberInput(newValue);
};

const updateAccumulatedDepreciation = (newValue: string) => {
  if (!newValue || newValue === 'NaN' || newValue === 'undefined') {
    mantanances.form_creat_mantenance.accumulated_depreciation = '';
    formattedAccumulatedDepreciation.value = '';
    return;
  }
  
  const parsed = parseFormattedNumber(newValue);
  mantanances.form_creat_mantenance.accumulated_depreciation = parsed;
  formattedAccumulatedDepreciation.value = formatNumberInput(newValue);
};

const updateEstimatedValue = (newValue: string) => {
  if (!newValue || newValue === 'NaN' || newValue === 'undefined') {
    mantanances.form_creat_mantenance.estimated_value = '';
    formattedEstimatedValue.value = '';
    return;
  }
  
  const parsed = parseFormattedNumber(newValue);
  mantanances.form_creat_mantenance.estimated_value = parsed;
  formattedEstimatedValue.value = formatNumberInput(newValue);
};

// Scanner Methods
const initializeScanner = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // Import ZXing library
    const { BrowserMultiFormatReader: Reader } = await import('@zxing/library');
    BrowserMultiFormatReader = Reader;
    codeReader = new BrowserMultiFormatReader();
    
    // Get available cameras
    await loadAvailableCameras();
    
    isReady.value = true;
    console.log('Scanner initialized successfully');
  } catch (err) {
    error.value = 'ບໍ່ສາມາດເລີ່ມຕົ້ນ scanner ໄດ້. ກະລຸນາກວດສອບ browser ແລະ camera.';
    console.error('ZXing initialization error:', err);
  } finally {
    isLoading.value = false;
  }
};

const loadAvailableCameras = async () => {
  try {
    if (!codeReader) return;
    
    const devices = await codeReader.listVideoInputDevices();
    availableCameras.value = devices.map((device: MediaDeviceInfo) => ({
      deviceId: device.deviceId,
      label: device.label || `Camera ${devices.indexOf(device) + 1}`
    }));
    
    console.log('Available cameras:', availableCameras.value.length);
  } catch (err) {
    console.error('Error loading cameras:', err);
  }
};

const startScanning = async () => {
  if (!codeReader || !videoRef.value) {
    error.value = 'Scanner ຍັງບໍ່ພ້ອມ';
    return;
  }

  try {
    error.value = '';
    isScanning.value = true;
    
    if (availableCameras.value.length === 0) {
      throw new Error('ບໍ່ພົບກ້ອງຖ່າຍຮູບ');
    }
    
    // Use selected camera device
    const selectedCamera = availableCameras.value[currentCameraIndex.value];
    console.log('Using camera:', selectedCamera.label);
    
    // Start continuous decoding
    await codeReader.decodeFromVideoDevice(
      selectedCamera.deviceId,
      videoRef.value,
      (result: any, scanError: any) => {
        if (result) {
          handleScanSuccess({ text: result.getText(), format: result.getBarcodeFormat() });
        }
        if (scanError && scanError.name !== 'NotFoundException') {
          console.error('Scanning error:', scanError);
        }
      }
    );
    
  } catch (err: any) {
    error.value = `ເກີດຂໍ້ຜິດພາດໃນການສະແກນ: ${err.message}`;
    isScanning.value = false;
    console.error('Scanning error:', err);
  }
};

const stopScanning = () => {
  if (codeReader) {
    codeReader.reset();
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  isScanning.value = false;
  console.log('Scanning stopped');
};

const switchCamera = async () => {
  if (availableCameras.value.length <= 1) return;
  
  stopScanning();
  currentCameraIndex.value = (currentCameraIndex.value + 1) % availableCameras.value.length;
  
  // Wait a bit before starting with new camera
  setTimeout(async () => {
    await startScanning();
  }, 500);
};

const formatBarcodeType = (format: string): string => {
  const formats: Record<string, string> = {
    'QR_CODE': 'QR Code',
    'CODE_128': 'Code 128',
    'CODE_39': 'Code 39',
    'EAN_13': 'EAN-13',
    'EAN_8': 'EAN-8',
    'UPC_A': 'UPC-A',
    'UPC_E': 'UPC-E',
    'DATA_MATRIX': 'Data Matrix',
    'PDF_417': 'PDF417',
    'AZTEC': 'Aztec'
  };
  return formats[format] || format;
};

const clearError = () => {
  error.value = '';
};

// Status management
const showStatus = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  statusMessage.value = message;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
};

// QR Scanner methods
const openScanner = async () => {
  showScanner.value = true;
  // Initialize and auto-start scanner when dialog opens
  if (!isReady.value) {
    await initializeScanner();
  }
  // Auto start scanning
  setTimeout(async () => {
    await startScanning();
  }, 500);
};

const closeScanner = () => {
  stopScanning();
  showScanner.value = false;
  scanResult.value = null;
  error.value = '';
};

const handleScanSuccess = async (data: { text: string; format: string }) => {
  console.log('ສະແກນສຳເລັດ:', data);
  
  scanResult.value = {
    text: data.text,
    format: data.format,
    timestamp: new Date()
  };
  
  searchBarcode.value = data.text;
  showStatus('✅ ສະແກນສຳເລັດ: ' + data.text, 'success');
  
  // Auto close scanner and search
  setTimeout(async () => {
    closeScanner();
    await dataSearch();
  }, 1500);
};

// Search functionality
const dataSearch = async () => {
  if (!searchBarcode.value.trim()) {
    showStatus('⚠️ ກະລຸນາໃສ່ລະຫັດບາໂຄດ', 'warning');
    return;
  }
  
  if (isSearching.value) return;
  
  isSearching.value = true;
  showStatus('🔍 ກຳລັງຄົ້ນຫາ...', 'info');
  
  try {
    faAssetStoreInstance.filterBarcode.request.asset_tag = searchBarcode.value;
    await faAssetStoreInstance.getDataBarcode();

    if (dataFasset.value.length > 0 && dataFasset.value[0]?.asset_list_id) {
      console.log('Found asset data:', dataFasset.value[0]);
      
      mantanances.form_creat_mantenance.asset_list_id = dataFasset.value[0].asset_list_id;
      
      // Update book value
      if (dataFasset.value[0]?.asset_value) {
        const bookValue = dataFasset.value[0].asset_value;
        const bookValueStr = String(bookValue);
        if (bookValueStr !== 'NaN' && bookValueStr !== 'undefined' && !isNaN(parseFloat(bookValueStr))) {
          mantanances.form_creat_mantenance.book_value = bookValueStr;
          formattedBookValue.value = formatNumberInput(bookValueStr);
        }
      }
      
      // Update accumulated depreciation
      if (dataFasset.value[0]?.asset_accu_dpca_value) {
        const accuValue = dataFasset.value[0].asset_accu_dpca_value;
        const accuValueStr = String(accuValue);
        if (accuValueStr !== 'NaN' && accuValueStr !== 'undefined' && !isNaN(parseFloat(accuValueStr))) {
          mantanances.form_creat_mantenance.accumulated_depreciation = accuValueStr;
          formattedAccumulatedDepreciation.value = formatNumberInput(accuValueStr);
        }
      }
      
      // Update estimated value
      if (dataFasset.value[0]?.asset_value_remain) {
        const estimatedValue = dataFasset.value[0].asset_value_remain;
        const estimatedValueStr = String(estimatedValue);
        if (estimatedValueStr !== 'NaN' && estimatedValueStr !== 'undefined' && !isNaN(parseFloat(estimatedValueStr))) {
          mantanances.form_creat_mantenance.estimated_value = estimatedValueStr;
          formattedEstimatedValue.value = formatNumberInput(estimatedValueStr);
        }
      }
      
      // Update location
      if (dataFasset.value[0]?.location_detail?.location_name_la) {
        mantanances.form_creat_mantenance.actual_location = dataFasset.value[0].location_detail.location_name_la;
      }
      
      // Calculate remaining useful life
      if (dataFasset.value[0]?.asset_useful_life && dataFasset.value[0]?.dpca_start_date) {
        const assetUsefulLife = parseInt(dataFasset.value[0].asset_useful_life);
        const dpcaStartDate = new Date(dataFasset.value[0].dpca_start_date);
        const currentDate = new Date();
        const yearsUsed = currentDate.getFullYear() - dpcaStartDate.getFullYear();
        const remainingLife = assetUsefulLife - yearsUsed;
        mantanances.form_creat_mantenance.remaining_useful_life = Math.max(0, remainingLife).toString();
      }
      
      showStatus('✅ ພົບຊັບສິນແລ້ວ!', 'success');
    } else {
      showStatus('❌ ບໍ່ພົບຊັບສິນ', 'error');
      console.log('No asset found for barcode:', searchBarcode.value);
    }
  } catch (error) {
    console.error("Error searching:", error);
    showStatus('❌ ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ', 'error');
  } finally {
    isSearching.value = false;
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

const formatCurrency = (value: any): string => {
  if (!value || isNaN(Number(value))) {
    return "ບໍ່ມີຂໍ້ມູນ";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value)) + " ກີບ";
};

const SubmitDataMentenance = async () => {
  if (!form.value) {
    showStatus('❌ ຟອມບໍ່ພ້ອມ', 'error');
    return;
  }

  const validation = await form.value.validate();
  
  if (!mantanances.form_creat_mantenance.asset_list_id) {
    showStatus('⚠️ ກະລຸນາເລືອກຊັບສິນກ່ອນບັນທຶກ (ສະແກນ Barcode)', 'warning');
    return;
  }
  
  if (validation.valid) {
    const cleanedData: any = {
      ...mantanances.form_creat_mantenance,
      asset_list_id: mantanances.form_creat_mantenance.asset_list_id,
      // Fix department_id NaN issue
      department_id: mantanances.form_creat_mantenance.department_id && 
        mantanances.form_creat_mantenance.department_id !== '' &&
        !isNaN(parseInt(mantanances.form_creat_mantenance.department_id)) ? 
        parseInt(mantanances.form_creat_mantenance.department_id) : null,
      audit_year: mantanances.form_creat_mantenance.audit_year ? 
        parseInt(mantanances.form_creat_mantenance.audit_year) : null,
      book_value: mantanances.form_creat_mantenance.book_value ? 
        parseFloat(parseFormattedNumber(mantanances.form_creat_mantenance.book_value)) : null,
      estimated_value: mantanances.form_creat_mantenance.estimated_value ? 
        parseFloat(parseFormattedNumber(mantanances.form_creat_mantenance.estimated_value)) : null,
      depreciation_rate: mantanances.form_creat_mantenance.depreciation_rate ? 
        parseFloat(mantanances.form_creat_mantenance.depreciation_rate) : null,
      accumulated_depreciation: mantanances.form_creat_mantenance.accumulated_depreciation ? 
        parseFloat(parseFormattedNumber(mantanances.form_creat_mantenance.accumulated_depreciation)) : null,
      remaining_useful_life: mantanances.form_creat_mantenance.remaining_useful_life ? 
        parseInt(mantanances.form_creat_mantenance.remaining_useful_life) : null,
      audit_date: mantanances.form_creat_mantenance.audit_date || null,
      follow_up_date: mantanances.form_creat_mantenance.follow_up_date || null,
      review_date: mantanances.form_creat_mantenance.review_date || null,
      approval_date: mantanances.form_creat_mantenance.approval_date || null,
      actual_location: mantanances.form_creat_mantenance.actual_location || null,
      audit_findings: mantanances.form_creat_mantenance.audit_findings || null,
      recommendations: mantanances.form_creat_mantenance.recommendations || null,
      remarks: mantanances.form_creat_mantenance.remarks || null,
      reviewer_name: mantanances.form_creat_mantenance.reviewer_name || null,
      approver_name: mantanances.form_creat_mantenance.approver_name || null,
    };
    
    // Clean null values and handle special cases
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === 'NaN' || 
          (typeof cleanedData[key] === 'number' && isNaN(cleanedData[key]))) {
        cleanedData[key] = null;
      }
    });
  
    // Remove photos_attached if it's causing issues - let server handle file uploads separately
    if (cleanedData.photos_attached === 'N' || cleanedData.photos_attached === 'Y') {
      delete cleanedData.photos_attached;
    }
    
    // Validate required fields
    if (!cleanedData.asset_list_id || cleanedData.asset_list_id === 'NaN' || cleanedData.asset_list_id === null) {
      showStatus('❌ ລະຫັດຊັບສິນບໍ່ຖືກຕ້ອງ', 'error');
      return;
    }
    
    if (!cleanedData.auditor_name) {
      showStatus('❌ ກະລຸນາເລືອກຜູ້ກວດສອບ', 'error');
      return;
    }
    
    if (!cleanedData.physical_status) {
      showStatus('❌ ກະລຸນາເລືອກສະຖານະກາຍະພາບ', 'error');
      return;
    }
    
    console.log('Cleaned data before sending:', cleanedData);
    
    try {
      showStatus('💾 ກຳລັງບັນທຶກ...', 'info');
      await mantanances.createMantenance(cleanedData);
      showStatus('✅ ບັນທຶກສຳເລັດ!', 'success');
    } catch (error) {
      console.error('Submit error:', error);
      showStatus('❌ ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error');
    }
  } else {
    showStatus('❌ ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
  }
};

const resetForm = () => {
  mantanances.$reset();
  searchBarcode.value = '';
  formattedBookValue.value = '';
  formattedAccumulatedDepreciation.value = '';
  formattedEstimatedValue.value = '';
  showStatus('🔄 ລິເຊັດຟອມສຳເລັດ', 'info');
};

// Cleanup on component unmount
onUnmounted(() => {
  stopScanning();
});

onMounted(() => {
  Dapremen.GetListData();
  employee.GetEmployee();
  const today = new Date().toISOString().split('T')[0];
  
  // Set default values
  mantanances.form_creat_mantenance.audit_year = new Date().getFullYear().toString();
  mantanances.form_creat_mantenance.audit_date = today;
  mantanances.form_creat_mantenance.audit_status = 'DRAFT';
  mantanances.form_creat_mantenance.location_verified = 'N';
  mantanances.form_creat_mantenance.serial_number_verified = 'N';
  mantanances.form_creat_mantenance.tag_number_verified = 'N';
  mantanances.form_creat_mantenance.insurance_coverage = 'N';
  mantanances.form_creat_mantenance.maintenance_required = 'N';
  mantanances.form_creat_mantenance.replacement_recommended = 'N';
  mantanances.form_creat_mantenance.disposal_recommended = 'N';
  mantanances.form_creat_mantenance.photos_attached = 'N';
  mantanances.form_creat_mantenance.documents_verified = 'N';
  mantanances.form_creat_mantenance.follow_up_required = 'N';
});

const title = "ບຳລູງຮັກສາຊັບສຶນ";
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchBarcode"
          label="ຄົນຫາຕາມເລກ Barcode"
          variant="outlined"
          density="compact"
          @keyup.enter="dataSearch"
          @paste="handlePaste"
          :loading="isSearching"
          placeholder="ພິມຫຼືສະແກນ Barcode..."
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="6" md="2">
        <v-btn
          @click="openScanner"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-qrcode-scan"
          size="large"
          class="mr-1"
        >
          📷 ສະແກນ
        </v-btn>
      </v-col>
      <v-col cols="6" md="2">
        <v-btn
          color="success"
          @click="dataSearch"
          :disabled="!searchBarcode.trim()"
          :loading="isSearching"
          size="large"
          class="mr-1"
        >
          🔍 ຄົ້ນຫາ
        </v-btn>
      </v-col>
    </v-row>

  
    <v-row v-if="statusMessage" class="mb-2">
      <v-col cols="12">
        <v-alert
          :type="statusType"
          variant="tonal"
          density="compact"
          dismissible
          @click:close="statusMessage = ''"
        >
          {{ statusMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- QR Scanner Dialog -->
    <v-dialog 
      v-model="showScanner" 
      max-width="800px" 
      persistent
      :fullscreen="$vuetify.display.xs"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-qrcode-scan</v-icon>
            <span class="text-h5">QR & Barcode Scanner</span>
          </div>
          <v-btn 
            icon 
            @click="closeScanner"
            variant="text"
            color="white"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-2">
          <!-- Scanner Status -->
          <div class="scanner-status-bar d-flex justify-center align-center pa-2 mb-2">
            <v-chip 
              :color="isScanning ? 'success' : 'warning'" 
              variant="flat"
              prepend-icon="mdi-circle"
            >
              {{ isScanning ? 'ກຳລັງສະແກນ...' : 'ພ້ອມສະແກນ' }}
            </v-chip>
          </div>

          <!-- Camera Video Element -->
          <div class="camera-wrapper">
            <video 
              ref="videoRef" 
              autoplay 
              playsinline 
              muted
              :class="{ 'camera-active': isScanning }"
            ></video>
            
            <!-- Overlay for scanning area -->
            <div v-if="isScanning" class="scan-overlay">
              <div class="scan-box">
                <div class="scan-corners">
                  <div class="corner top-left"></div>
                  <div class="corner top-right"></div>
                  <div class="corner bottom-left"></div>
                  <div class="corner bottom-right"></div>
                </div>
                <div class="scan-line"></div>
              </div>
              <p class="scan-instruction">ວາງ QR/Barcode ໃສ່ໃນກອບ</p>
            </div>
            
            <!-- Loading when initializing -->
            <div v-if="isLoading" class="camera-placeholder">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4">ກຳລັງເລີ່ມຕົ້ນ scanner...</p>
            </div>
            
            <!-- Placeholder when not scanning -->
            <div v-if="!isScanning && !isLoading" class="camera-placeholder">
              <v-icon size="64" color="primary">mdi-camera</v-icon>
              <p class="mt-4">ກຳລັງເລີ່ມ scanner...</p>
            </div>
          </div>

          <!-- Error Display -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            closable
            @click:close="clearError"
            class="mt-2"
          >
            <v-icon>mdi-alert</v-icon>
            {{ error }}
          </v-alert>

          <!-- Scan Result Display -->
          <v-card v-if="scanResult" variant="outlined" class="mt-2">
            <v-card-title class="text-success d-flex align-center">
              <v-icon class="mr-2">mdi-check-circle</v-icon>
              ຜົນການສະແກນ
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <strong>ປະເພດ:</strong> 
                  <v-chip color="success" size="small" class="ml-1">
                    {{ formatBarcodeType(scanResult.format) }}
                  </v-chip>
                </v-col>
                <v-col cols="12" md="8">
                  <strong>ຂໍ້ມູນ:</strong>
                  <div class="result-text mt-1">{{ scanResult.text }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
        
        <v-card-actions class="pa-4 justify-center">
          <v-btn 
            v-if="isScanning"
            color="warning"
            @click="stopScanning"
            prepend-icon="mdi-stop"
            size="large"
          >
            ຢຸດສະແກນ
          </v-btn>
          
          <v-btn 
            v-if="!isScanning && isReady"
            color="primary"
            @click="startScanning"
            :disabled="isLoading"
            prepend-icon="mdi-camera"
            size="large"
          >
            ເລີ່ມໃໝ່
          </v-btn>
          
          <v-btn 
            v-if="availableCameras.length > 1"
            color="info"
            @click="switchCamera"
            :disabled="isLoading"
            prepend-icon="mdi-camera-flip"
            variant="outlined"
            class="ml-2"
          >
            ສະຫຼັບກ້ອງ
          </v-btn>
          
          <v-btn 
            color="error" 
            variant="outlined"
            @click="closeScanner"
            prepend-icon="mdi-close"
            class="ml-2"
          >
            ປິດ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  
    <v-card flat style="border: solid 1px #64b5f6" class="mb-4">
      <v-card-title style="background-color: #64b5f6" class="py-2">
        ຂໍ້ມູນພື້ນຖານຊັບສິນ
      </v-card-title>
      <v-card-text class="py-2">
        <v-row dense>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ລະຫັດຊັບສິນ'"
              :text="dataFasset[0]?.asset_list_id || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າທັງໝົດ'"
              :text="formatCurrency(dataFasset[0]?.asset_value) || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ມູນຄ່າຊົບສົມບັດຄົງເຫຼືອ'"
              :text="formatCurrency(dataFasset[0]?.asset_value_remain) || 'ບໍ່ມີຂໍ້ມູນ'"
            />
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
            <GlobalCardTitle
              :title="'ມູນຄ່າຊົບສົມບັດສະສົມ'"
              :text="formatCurrency(dataFasset[0]?.asset_accu_dpca_value) || 'ບໍ່ມີຂໍ້ມູນ'"
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ສະຖານທີ່ຕັ້ງ'"
              :text="dataFasset[0]?.location_detail?.location_name_la || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ມື້ຊື້'"
              :text="dataFasset[0]?.asset_date || 'ບໍ່ມີຂໍ້ມູນ'"
            />
          </v-col>
          <v-col cols="12" md="3">
            <GlobalCardTitle
              :title="'ຜູ້ສະໜອງ'"
              :text="dataFasset[0]?.supplier_detail?.supplier_name || 'ບໍ່ມີຂໍ້ມູນ'"
            />
            <GlobalCardTitle
              :title="'ສະຖານະໃຊ້ງານ'"
              :text="dataFasset[0]?.asset_status_detail?.MC_name_la || 'ບໍ່ມີຂໍ້ມູນ'"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Single Form Card -->
    <v-form ref="form" v-model="isFormValid">
      <v-card style="border: 1px solid #bbdefb">
        <v-card-title style="background-color: #bbdefb" class="py-2">
          ຟອມບຳລຸງຮັກສາຊັບສິນ
        </v-card-title>
        <v-card-text class="py-2">
          <!-- Basic Info -->
          <v-row dense>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.audit_year"
                label="ປີກວດສອບ *"
                variant="outlined"
                density="compact"
                type="number"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.audit_period"
                label="ໄລຍະກວດສອບ *"
                :items="auditPeriodOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
                readonly
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.audit_date"
                label="ວັນທີກວດສອບ *"
                variant="outlined"
                density="compact"
                type="date"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-autocomplete
                v-model="mantanances.form_creat_mantenance.auditor_name"
                :items="employees"
                item-title="employee_name_la"
                item-value="employee_id"
                label="ຊື່ຜູ້ກວດສອບ *"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6" md="3">
              <v-autocomplete
                v-model="mantanances.form_creat_mantenance.department_id"
                :items="responsdevice"
                item-title="division_name_la"
                item-value="div_id"
                label="ພະແນກຮັບຜິດຊອບ"
                variant="outlined"
                density="compact"
              ></v-autocomplete>
            </v-col>
          </v-row>

          <!-- Status Fields -->
          <v-row dense>
            <v-col cols="6" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.physical_status"
                label="ສະຖານະກາຍະພາບ *"
                :items="physicalStatusOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="6" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.condition_status"
                label="ສະພາບໃຊ້ງານ"
                :items="conditionStatusOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.actual_location"
                label="ສະຖານທີ່ຕົວຈິງ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-select
                v-model="mantanances.form_creat_mantenance.audit_status"
                label="ສະຖານະກວດສອບ"
                :items="auditStatusOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Financial Fields -->
          <v-row dense>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="formattedBookValue"
                @input="updateBookValue"
                label="ມູນຄ່າຕາມບັນຊີ"
                variant="outlined"
                density="compact"
                placeholder="0"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="formattedEstimatedValue"
                @input="updateEstimatedValue"
                label="ມູນຄ່າປະເມີນ"
                variant="outlined"
                density="compact"
                placeholder="0"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.depreciation_rate"
                label="ອັດຕາຫຼຸ້ຍລາຄາ (%)"
                variant="outlined"
                density="compact"
                type="number"
                step="0.01"
                suffix="%"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field
                v-model="formattedAccumulatedDepreciation"
                @input="updateAccumulatedDepreciation"
                label="ຫຼຸ້ຍລາຄາສະສົມ"
                variant="outlined"
                density="compact"
                placeholder="0"
                suffix="ກີບ"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.remaining_useful_life"
                label="ອາຍຸການໃຊ້ເຫຼືອ (ປີ)"
                variant="outlined"
                density="compact"
                type="number"
                suffix="ປີ"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Yes/No Fields -->
          <v-row dense>
            <v-col cols="4" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.replacement_recommended"
                label="ແນະນຳປ່ຽນ"
                :items="yesNoOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="4" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.disposal_recommended"
                label="ແນະນຳຈຳໜ່າຍ"
                :items="yesNoOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="4" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.photos_attached"
                label="ມີຮູບພາບ"
                :items="yesNoOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="4" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.documents_verified"
                label="ຢືນຢັນເອກະສານ"
                :items="yesNoOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="4" md="2">
              <v-select
                v-model="mantanances.form_creat_mantenance.follow_up_required"
                label="ຕ້ອງຕິດຕາມ"
                :items="yesNoOptions"
                item-value="value"
                item-title="text"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="4" md="2" v-if="mantanances.form_creat_mantenance.follow_up_required === 'Y'">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.follow_up_date"
                label="ວັນທີຕິດຕາມ"
                variant="outlined"
                density="compact"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Review Fields (conditional) -->
          <v-row dense v-if="mantanances.form_creat_mantenance.audit_status !== 'DRAFT'">
            <v-col cols="6" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.reviewer_name"
                label="ຊື່ຜູ້ທົບທວນ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.review_date"
                label="ວັນທີທົບທວນ"
                variant="outlined"
                density="compact"
                type="date"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3" v-if="mantanances.form_creat_mantenance.audit_status === 'APPROVED'">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.approver_name"
                label="ຊື່ຜູ້ອະນຸມັດ"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3" v-if="mantanances.form_creat_mantenance.audit_status === 'APPROVED'">
              <v-text-field
                v-model="mantanances.form_creat_mantenance.approval_date"
                label="ວັນທີອະນຸມັດ"
                variant="outlined"
                density="compact"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Text Areas -->
          <v-row dense>
            <v-col cols="12" md="4">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.audit_findings"
                label="ຜົນການກວດສອບ"
                variant="outlined"
                density="compact"
                rows="3"
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="4">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.recommendations"
                label="ຂໍ້ແນະນຳ"
                variant="outlined"
                density="compact"
                rows="3"
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="4">
              <v-textarea
                v-model="mantanances.form_creat_mantenance.remarks"
                label="ໝາຍເຫດ"
                variant="outlined"
                density="compact"
                rows="3"
              ></v-textarea>
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
            💾 ບັນທຶກຂໍ້ມູນ
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="large"
            @click="resetForm"
            class="mx-2"
          >
            🔄 ລິເຊັດ
          </v-btn>
        </v-col>
      </v-row>

    </v-form>
  </div>
</template>
<style scoped>
.scanner-status-bar {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border: 1px solid #dee2e6;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 15px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-active {
  border: 3px solid #27ae60;
  box-shadow: 0 0 20px rgba(39, 174, 96, 0.4);
}

.camera-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.scan-box {
  position: relative;
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scan-corners {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #27ae60;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.scan-line {
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #27ae60, transparent);
  animation: scan 2s linear infinite;
}

.scan-instruction {
  margin-top: 30px;
  color: white;
  font-size: 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.result-text {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  margin: 4px 0;
  font-size: 14px;
}

@keyframes scan {
  0% { transform: translateY(-100px); }
  100% { transform: translateY(100px); }
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .camera-wrapper {
    height: 280px;
  }
  
  .scan-box {
    width: 200px;
    height: 200px;
  }
  
  .v-btn {
    min-height: 48px !important;
    min-width: 48px !important;
  }
  
  .v-text-field input {
    font-size: 16px !important;
  }
}

.v-dialog .v-card {
  overflow: visible;
}
</style>