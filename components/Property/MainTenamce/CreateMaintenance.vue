<script setup lang="ts">
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
const isScanning = ref(false);
const manualCode = ref('');
const quickInput = ref('');
const statusMessage = ref('');
const statusType = ref<'success' | 'error' | 'warning' | 'info'>('info');
const videoRef = ref<HTMLVideoElement>();
const showManualInput = ref(false);
const flashEnabled = ref(false);
const hasMultipleCameras = ref(false);
const currentCamera = ref('environment');
let stream: MediaStream | null = null;

// Computed properties
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

// Status management - Fixed
const showStatus = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  statusMessage.value = message;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
};

// Quick input processing - Fixed
const processQuickInput = async () => {
  if (!quickInput.value?.trim()) {
    showStatus('⚠️ ກະລຸນາໃສ່ລະຫັດບາໂຄດ', 'warning');
    return;
  }
  
  searchBarcode.value = quickInput.value.trim();
  quickInput.value = '';
  await dataSearch();
};

// Manual input processing - Fixed
const processManualCode = async () => {
  if (!manualCode.value.trim()) {
    showStatus('❌ ກະລຸນາໃສ່ລະຫັດບາໂຄດ', 'error');
    return;
  }
  
  showStatus('✅ ຮັບລະຫັດແລ້ວ: ' + manualCode.value, 'success');
  searchBarcode.value = manualCode.value.trim();
  closeScanner();
  
  setTimeout(async () => {
    await dataSearch();
  }, 500);
};

// Camera functions - Fixed for Safari iOS
const requestCameraDirectly = async () => {
  showStatus('🔓 ກຳລັງຂໍອະນຸຍາດໃຊ້ກ້ອງ...', 'info');
  
  // Check for basic browser support
  if (typeof navigator === 'undefined') {
    showStatus('❌ Navigator ບໍ່ມີໃນ browser ນີ້', 'error');
    return;
  }
  
  // Check for HTTPS (required for camera on iOS)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    showStatus('🔒 ຕ້ອງການ HTTPS ເພື່ອໃຊ້ກ້ອງ', 'error');
    setTimeout(() => {
      showStatus('💡 ໃຊ້ການພິມລະຫັດແທນ', 'info');
    }, 2000);
    return;
  }
  
  // Check for MediaDevices API
  if (!navigator.mediaDevices) {
    showStatus('❌ Browser ນີ້ບໍ່ຮອງຮັບ MediaDevices', 'error');
    setTimeout(() => {
      showStatus('💡 ໃຊ້ການພິມລະຫັດແທນ', 'info');
    }, 2000);
    return;
  }
  
  // Check for getUserMedia
  if (!navigator.mediaDevices.getUserMedia) {
    showStatus('❌ Browser ນີ້ບໍ່ຮອງຮັບ getUserMedia', 'error');
    setTimeout(() => {
      showStatus('💡 ໃຊ້ການພິມລະຫັດແທນ', 'info');
    }, 2000);
    return;
  }
  
  try {
    // Test camera permission
    const testStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    
    // Stop test stream immediately
    testStream.getTracks().forEach(track => track.stop());
    
    showStatus('✅ ໄດ້ຮັບອະນຸຍາດແລ້ວ - ສາມາດໃຊ້ການສະແກນໄດ້', 'success');
    
    // Check for multiple cameras
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      hasMultipleCameras.value = videoDevices.length > 1;
    } catch (enumError) {
      console.warn('Cannot enumerate devices:', enumError);
      hasMultipleCameras.value = false;
    }
    
  } catch (error) {
    console.error('Permission error:', error);
    handleCameraPermissionError(error);
  }
};

const handleCameraPermissionError = (error: any) => {
  let errorMessage = '❌ ບໍ່ໄດ້ຮັບອະນຸຍາດໃຊ້ກ້ອງ';
  let suggestion = 'ໃຊ້ການພິມລະຫັດແທນ';
  
  if (error.name === 'NotAllowedError') {
    errorMessage = '🚫 ຜູ້ໃຊ້ປະຕິເສດການໃຊ້ກ້ອງ';
    suggestion = 'ໃຫ້ອະນຸຍາດໃນການຕັ້ງຄ່າ browser ແລ້ວລອງໃໝ່';
  } else if (error.name === 'NotFoundError') {
    errorMessage = '📷 ບໍ່ພົບກ້ອງໃນອຸປະກອນນີ້';
  } else if (error.name === 'NotReadableError') {
    errorMessage = '⚠️ ກ້ອງຖືກໃຊ້ງານໂດຍແອັບອື່ນ';
    suggestion = 'ປິດແອັບອື່ນທີ່ໃຊ້ກ້ອງ';
  } else if (error.name === 'NotSupportedError') {
    errorMessage = '🔒 ຕ້ອງການ HTTPS';
    suggestion = 'ເປີດໃນ https:// ຫຼື localhost';
  } else if (error.name === 'SecurityError') {
    errorMessage = '🔐 ບັນຫາຄວາມປອດໄພ';
    suggestion = 'ຕ້ອງການ HTTPS ແລະອະນຸຍາດຂອງຜູ້ໃຊ້';
  }
  
  showStatus(errorMessage, 'error');
  setTimeout(() => {
    showStatus(`💡 ${suggestion}`, 'info');
  }, 2000);
};

const openScanner = async () => {
  showScanner.value = true;
  showManualInput.value = false;
  showStatus('📷 ກຳລັງເປີດກ້ອງ...', 'info');
  
  // Check environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    showStatus('❌ ບໍ່ສາມາດໃຊ້ກ້ອງໄດ້ໃນສະພາບແວດລ້ອມນີ້', 'error');
    showManualInput.value = true;
    return;
  }
  
  // Check HTTPS requirement
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    showStatus('🔒 ຕ້ອງການ HTTPS ເພື່ອໃຊ້ກ້ອງ', 'error');
    showManualInput.value = true;
    return;
  }
  
  // Check MediaDevices support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showStatus('❌ Browser ນີ້ບໍ່ຮອງຮັບກ້ອງ', 'error');
    showManualInput.value = true;
    return;
  }
  
  try {
    const constraints = {
      video: { 
        facingMode: currentCamera.value,
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 30, max: 30 }
      }
    };
    
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    await nextTick();
    
    if (videoRef.value && stream) {
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute('playsinline', 'true');
      videoRef.value.setAttribute('webkit-playsinline', 'true');
      videoRef.value.setAttribute('muted', 'true');
      videoRef.value.muted = true;
      videoRef.value.autoplay = true;
      
      try {
        await videoRef.value.play();
        isScanning.value = true;
        showStatus('✅ ກ້ອງພ້ອມໃຊ້ງານ', 'success');
      } catch (playError) {
        console.error('Video play error:', playError);
        showStatus('⚠️ ກ້ອງເປີດແລ້ວແຕ່ບໍ່ສາມາດສະແດງໄດ້', 'warning');
        showManualInput.value = true;
      }
    }
    
  } catch (error) {
    console.error('Camera error:', error);
    handleCameraError(error);
  }
};

const handleCameraError = (error: any) => {
  let errorMessage = '❌ ບໍ່ສາມາດເປີດກ້ອງໄດ້';
  
  if (error.name === 'NotAllowedError') {
    errorMessage = '🚫 ບໍ່ໄດ້ຮັບອະນຸຍາດໃຊ້ກ້ອງ';
  } else if (error.name === 'NotFoundError') {
    errorMessage = '📷 ບໍ່ພົບກ້ອງໃນອຸປະກອນນີ້';
  } else if (error.name === 'NotReadableError') {
    errorMessage = '⚠️ ກ້ອງຖືກໃຊ້ງານໂດຍແອັບອື່ນ';
  } else if (error.name === 'NotSupportedError') {
    errorMessage = '🔒 ຕ້ອງການ HTTPS';
  }
  
  showStatus(errorMessage, 'error');
  showManualInput.value = true;
};

const toggleFlash = async () => {
  if (!stream) return;
  
  try {
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    
    if (capabilities.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled.value }]
      });
      flashEnabled.value = !flashEnabled.value;
      showStatus(flashEnabled.value ? '🔦 ເປີດໄຟແລ້ວ' : '🔦 ປິດໄຟແລ້ວ', 'info');
    } else {
      showStatus('❌ ອຸປະກອນນີ້ບໍ່ມີໄຟ', 'warning');
    }
  } catch (error) {
    console.error('Flash error:', error);
    showStatus('❌ ບໍ່ສາມາດຄວບຄຸມໄຟໄດ້', 'error');
  }
};

const switchCamera = async () => {
  if (!hasMultipleCameras.value) return;
  
  currentCamera.value = currentCamera.value === 'environment' ? 'user' : 'environment';
  
  if (isScanning.value) {
    closeScanner();
    setTimeout(() => {
      openScanner();
    }, 100);
  }
};

const toggleManualInput = () => {
  showManualInput.value = !showManualInput.value;
  if (showManualInput.value) {
    isScanning.value = false;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    showStatus('⌨️ ພິມລະຫັດບາໂຄດ', 'info');
    
    nextTick(() => {
      const input = document.querySelector('#manual-barcode-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  } else {
    openScanner();
  }
};

const openManualInput = () => {
  showScanner.value = true;
  showManualInput.value = true;
  isScanning.value = false;
  manualCode.value = '';
  showStatus('⌨️ ພິມລະຫັດບາໂຄດ', 'info');
  
  setTimeout(() => {
    const input = document.querySelector('#manual-barcode-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }, 300);
};

const closeScanner = () => {
  isScanning.value = false;
  showScanner.value = false;
  showManualInput.value = false;
  manualCode.value = '';
  statusMessage.value = '';
  flashEnabled.value = false;
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

// Debug function - Enhanced for iOS Safari
const showDebugInfo = () => {
  const debugInfo = {
    'Environment': {
      'Protocol': location.protocol,
      'Hostname': location.hostname,
      'Is HTTPS': location.protocol === 'https:',
      'Is Localhost': location.hostname === 'localhost',
      'User Agent': navigator.userAgent,
      'Platform': navigator.platform || 'Unknown'
    },
    'Browser Support': {
      'Navigator': typeof navigator !== 'undefined',
      'MediaDevices': !!navigator?.mediaDevices,
      'getUserMedia': !!navigator?.mediaDevices?.getUserMedia,
      'enumerateDevices': !!navigator?.mediaDevices?.enumerateDevices,
      'Screen Orientation': !!screen?.orientation,
      'Device Motion': !!window.DeviceMotionEvent
    },
    'Current State': {
      'Scanner Open': showScanner.value,
      'Scanning': isScanning.value,
      'Manual Input': showManualInput.value,
      'Stream Active': !!stream,
      'Search Barcode': searchBarcode.value,
      'Flash Enabled': flashEnabled.value
    },
    'Camera Info': {
      'Multiple Cameras': hasMultipleCameras.value,
      'Current Camera': currentCamera.value,
      'Video Element': !!videoRef.value,
      'Video Source': videoRef.value?.srcObject ? 'Set' : 'Not Set'
    },
    'Form Data': {
      'Asset ID': mantanances?.form_creat_mantenance?.asset_list_id || 'None',
      'Book Value': formattedBookValue.value || 'None',
      'Form Valid': isFormValid.value
    }
  };
  
  console.log('🔧 Complete Debug Info:', debugInfo);
  
  // Create readable summary for alert
  const summary = `
📱 Browser: ${navigator.userAgent.split(')')[0]})
🔒 HTTPS: ${location.protocol === 'https:' ? 'Yes' : 'No'}
📷 Camera Support: ${!!navigator?.mediaDevices?.getUserMedia ? 'Yes' : 'No'}
🎯 Current Mode: ${showScanner.value ? (isScanning.value ? 'Scanning' : 'Manual') : 'Search'}
`;
  
  alert('Debug info logged to console. Summary:' + summary);
  
  // Also show status
  const supportLevel = !!navigator?.mediaDevices?.getUserMedia ? 'ຮອງຮັບ' : 'ບໍ່ຮອງຮັບ';
  showStatus(`🔧 Camera: ${supportLevel}, HTTPS: ${location.protocol === 'https:' ? 'Yes' : 'No'}`, 'info');
};

// Main search function - Fixed
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
      
      // Update book value with NaN protection
      if (dataFasset.value[0]?.asset_value) {
        const bookValue = dataFasset.value[0].asset_value;
        const bookValueStr = String(bookValue);
        if (bookValueStr !== 'NaN' && bookValueStr !== 'undefined' && !isNaN(parseFloat(bookValueStr))) {
          mantanances.form_creat_mantenance.book_value = bookValueStr;
          formattedBookValue.value = formatNumberInput(bookValueStr);
        }
      }
      
      
      if (dataFasset.value[0]?.asset_accu_dpca_value) {
        const accuValue = dataFasset.value[0].asset_accu_dpca_value;
        const accuValueStr = String(accuValue);
        if (accuValueStr !== 'NaN' && accuValueStr !== 'undefined' && !isNaN(parseFloat(accuValueStr))) {
          mantanances.form_creat_mantenance.accumulated_depreciation = accuValueStr;
          formattedAccumulatedDepreciation.value = formatNumberInput(accuValueStr);
        }
      }
      
     
      if (dataFasset.value[0]?.asset_value_remain) {
        const estimatedValue = dataFasset.value[0].asset_value_remain;
        const estimatedValueStr = String(estimatedValue);
        if (estimatedValueStr !== 'NaN' && estimatedValueStr !== 'undefined' && !isNaN(parseFloat(estimatedValueStr))) {
          mantanances.form_creat_mantenance.estimated_value = estimatedValueStr;
          formattedEstimatedValue.value = formatNumberInput(estimatedValueStr);
        }
      }
      
    
      if (dataFasset.value[0]?.location_detail?.location_name_la) {
        mantanances.form_creat_mantenance.actual_location = dataFasset.value[0].location_detail.location_name_la;
      }
      
  
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
    // Use showStatus instead of CallSwal
    showStatus('⚠️ ກະລຸນາເລືອກຊັບສິນກ່ອນບັນທຶກ (ສະແກນ Barcode)', 'warning');
    return;
  }
  
  if (validation.valid) {
    const cleanedData: any = {
      ...mantanances.form_creat_mantenance,
      asset_list_id: mantanances.form_creat_mantenance.asset_list_id,
      department_id: mantanances.form_creat_mantenance.department_id ? 
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
    //   photos_attached: mantanances.form_creat_mantenance.photos_attached || 'N',
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
    
   
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    });
    
    if (!cleanedData.asset_list_id || cleanedData.asset_list_id === 'NaN' || isNaN(cleanedData.asset_list_id)) {
      showStatus('❌ ລະຫັດຊັບສິນບໍ່ຖືກຕ້ອງ', 'error');
      return;
    }
    
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

onMounted(() => {
  Dapremen.GetListData();
  employee.GetEmployee();
  const today = new Date().toISOString().split('T')[0];
  
  
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
//   mantanances.form_creat_mantenance.photos_attached = 'N';
  mantanances.form_creat_mantenance.documents_verified = 'N';
  mantanances.form_creat_mantenance.follow_up_required = 'N';
});

onUnmounted(() => {
  closeScanner();
});

const title = "ບຳລູງຮັກສາຊັບສຶນ";
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <!-- Enhanced Search Section -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
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
          @click="requestCameraDirectly"
          color="orange"
          variant="outlined"
          prepend-icon="mdi-camera-account"
          size="large"
          class="mr-1"
        >
          🔓 ຂໍອະນຸຍາດ
        </v-btn>
      </v-col>
      <v-col cols="6" md="2">
        <v-btn
          @click="openScanner"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-barcode-scan"
          :disabled="isScanning"
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
      <v-col cols="6" md="3">
        <v-btn
          @click="showDebugInfo"
          color="info"
          variant="outlined"
          prepend-icon="mdi-bug"
          size="small"
          class="mr-1"
        >
          🔧 ກວດສອບ
        </v-btn>
        
        <v-btn
          @click="openManualInput"
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-keyboard"
          size="small"
        >
          ⌨️ ພິມ
        </v-btn>
      </v-col>
    </v-row>

    <!-- Status Message Display -->
    <v-row v-if="statusMessage && !showScanner" class="mb-2">
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

    <!-- Barcode Scanner Modal -->
    <v-dialog 
      v-model="showScanner" 
      :fullscreen="$vuetify.display.mobile"
      :max-width="$vuetify.display.mobile ? '100%' : '600px'" 
      persistent
    >
      <v-card :class="$vuetify.display.mobile ? 'mobile-scanner' : ''">
        <v-card-title class="d-flex justify-space-between align-center pa-2">
          <span class="text-h6">📱 ສະແກນບາໂຄດ</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeScanner"
            size="small"
          ></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <!-- Camera Preview - Mobile Optimized -->
          <div 
            v-if="!showManualInput"
            class="camera-container" 
            :style="{
              position: 'relative', 
              height: $vuetify.display.mobile ? '60vh' : '400px', 
              background: '#000',
              minHeight: '300px'
            }"
          >
            <video
              ref="videoRef"
              :style="{
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }"
              autoplay
              muted
              playsinline
              webkit-playsinline
            ></video>
            
            <!-- Enhanced Scanning Overlay for Mobile -->
            <div 
              v-if="isScanning"
              :style="{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                border: '3px solid #ff5722', 
                width: $vuetify.display.mobile ? '80%' : '250px',
                height: $vuetify.display.mobile ? '120px' : '100px',
                maxWidth: '300px',
                background: 'rgba(255, 87, 34, 0.1)',
                borderRadius: '8px',
                animation: 'pulse 2s infinite'
              }"
            >
              <div 
                :style="{
                  position: 'absolute', 
                  top: '-30px', 
                  left: '0', 
                  color: '#ff5722', 
                  fontSize: $vuetify.display.mobile ? '16px' : '14px',
                  fontWeight: 'bold',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }"
              >
                📷 ວາງບາໂຄດໃນກອບນີ້
              </div>
              
              <!-- Scanning line animation -->
              <div 
                :style="{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #ff5722, transparent)',
                  animation: 'scan-line 2s linear infinite'
                }"
              ></div>
            </div>
            
            <!-- Mobile-friendly Control Buttons -->
            <div 
              :style="{
                position: 'absolute', 
                bottom: '15px', 
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px'
              }"
            >
              <!-- Flash/Torch Button -->
              <v-btn
                v-if="$vuetify.display.mobile && isScanning"
                @click="toggleFlash"
                size="large"
                color="white"
                variant="outlined"
                icon="mdi-flashlight"
                :class="flashEnabled ? 'flash-on' : ''"
              ></v-btn>
              
              <!-- Manual Input Toggle -->
              <v-btn
                @click="toggleManualInput"
                size="large"
                color="white"
                variant="outlined"
                :prepend-icon="showManualInput ? 'mdi-camera' : 'mdi-keyboard'"
              >
                {{ showManualInput ? 'ສະແກນ' : 'ພິມ' }}
              </v-btn>
              
              <!-- Camera Switch Button -->
              <v-btn
                v-if="$vuetify.display.mobile && hasMultipleCameras && isScanning"
                @click="switchCamera"
                size="large"
                color="white"
                variant="outlined"
                icon="mdi-camera-flip"
              ></v-btn>
            </div>
            
            <!-- Mobile Instructions -->
            <div 
              v-if="$vuetify.display.mobile && isScanning"
              :style="{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                textAlign: 'center',
                maxWidth: '90%'
              }"
            >
              💡 ເຄື່ອນໄຫວມືຖືໃກ້ຫຼືໄກບາໂຄດເພື່ອໂຟກັສ
            </div>
          </div>
          
          <!-- Enhanced Manual Input -->
          <div v-if="showManualInput" class="pa-4">
            <v-text-field
              id="manual-barcode-input"
              v-model="manualCode"
              label="🔢 ພິມບາໂຄດດ້ວຍມື"
              variant="outlined"
              density="comfortable"
              @keyup.enter="processManualCode"
              autofocus
              clearable
              :style="{ fontSize: $vuetify.display.mobile ? '18px' : '14px' }"
            >
              <template #prepend-inner>
                <v-icon>mdi-barcode</v-icon>
              </template>
              <template #append>
                <v-btn
                  @click="processManualCode"
                  color="primary"
                  :size="$vuetify.display.mobile ? 'default' : 'small'"
                  :disabled="!manualCode.trim()"
                  variant="flat"
                >
                  ✓ ຢືນຢັນ
                </v-btn>
              </template>
            </v-text-field>
          </div>
          
          <!-- Enhanced Status Messages -->
          <div v-if="statusMessage" class="pa-4">
            <v-alert
              :type="statusType"
              variant="tonal"
              :density="$vuetify.display.mobile ? 'comfortable' : 'compact'"
              :style="{ fontSize: $vuetify.display.mobile ? '16px' : '14px' }"
            >
              <template #prepend>
                <v-icon 
                  :icon="statusType === 'success' ? 'mdi-check-circle' : 
                        statusType === 'error' ? 'mdi-alert-circle' : 
                        statusType === 'warning' ? 'mdi-alert' : 'mdi-information'"
                ></v-icon>
              </template>
              {{ statusMessage }}
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions v-if="!$vuetify.display.mobile" class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="closeScanner" variant="outlined" size="large">
            ❌ ປິດ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Asset Information Card -->
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

<style scoped>
.camera-container {
  border-radius: 8px;
  overflow: hidden;
  touch-action: manipulation;
}

.v-dialog .v-card {
  overflow: visible;
}

.mobile-scanner {
  height: 100vh;
  border-radius: 0 !important;
}

.flash-on {
  background-color: #ffd700 !important;
  color: #000 !important;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .camera-container {
    border-radius: 0;
  }
  
  .mobile-scanner .v-card-text {
    padding: 0 !important;
  }
  
  .v-btn {
    min-height: 48px !important;
    min-width: 48px !important;
  }
  
  .v-text-field input {
    font-size: 16px !important;
  }
}

/* Scanning animations */
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes scan-line {
  0% { transform: translateY(0); }
  100% { transform: translateY(100px); }
}

/* Prevent video from being selectable */
video {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
}

/* Ensure proper fullscreen display on mobile */
@media screen and (max-device-width: 768px) {
  .v-dialog--fullscreen {
    margin: 0 !important;
    max-height: 100vh !important;
    max-width: 100vw !important;
  }
}
</style>