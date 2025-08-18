<template>
  <div class="scanner-container">
    <div class="scanner-header">
      <h2>QR & Barcode Scanner</h2>
      <div class="scanner-status">
        <span :class="['status-indicator', { 'active': isScanning }]"></span>
        {{ isScanning ? 'ກຳລັງສະແກນ...' : 'ພ້ອມສະແກນ' }}
      </div>
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
      
      <!-- Placeholder when not scanning -->
      <div v-if="!isScanning" class="camera-placeholder">
        <div class="placeholder-icon">📱</div>
        <p>ກົດປຸ່ມເພື່ອເລີ່ມສະແກນ</p>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button 
        @click="startScanning" 
        :disabled="isScanning || !isReady"
        class="btn btn-primary"
      >
        <span class="btn-icon">📷</span>
        {{ isScanning ? 'ກຳລັງສະແກນ...' : 'ເລີ່ມສະແກນ' }}
      </button>
      
      <button 
        @click="stopScanning" 
        :disabled="!isScanning"
        class="btn btn-secondary"
      >
        <span class="btn-icon">⏹️</span>
        ຢຸດສະແກນ
      </button>
      
      <button 
        @click="switchCamera" 
        :disabled="isScanning || availableCameras.length <= 1"
        class="btn btn-tertiary"
        v-if="availableCameras.length > 1"
      >
        <span class="btn-icon">🔄</span>
        ສະຫຼັບກ້ອງ
      </button>
    </div>
    
    <!-- Results -->
    <div v-if="scanResult" class="result-container">
      <h3>ຜົນການສະແກນ:</h3>
      <div class="result-content">
        <div class="result-item">
          <strong>ປະເພດ:</strong> 
          <span class="result-format">{{ formatBarcodeType(scanResult.format) }}</span>
        </div>
        <div class="result-item">
          <strong>ຂໍ້ມູນ:</strong>
          <div class="result-text">{{ scanResult.text }}</div>
        </div>
        <div class="result-item">
          <strong>ເວລາ:</strong> 
          <span class="result-time">{{ formatTime(scanResult.timestamp) }}</span>
        </div>
      </div>
      <div class="result-actions">
        <button @click="copyToClipboard" class="action-btn copy-btn">
          📋 ສຳເນົາ
        </button>
        <button @click="clearResult" class="action-btn clear-btn">
          🗑️ ລົບ
        </button>
        <button v-if="isUrl(scanResult.text)" @click="openUrl" class="action-btn url-btn">
          🌐 ເປີດ Link
        </button>
      </div>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <strong>ເກີດຂໍ້ຜິດພາດ:</strong>
        <p>{{ error }}</p>
      </div>
      <button @click="clearError" class="error-close">✕</button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>ກຳລັງເລີ່ມຕົ້ນ scanner...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript declaration for ZXing
declare module '@zxing/library' {
  export class BrowserMultiFormatReader {
    constructor()
    listVideoInputDevices(): Promise<MediaDeviceInfo[]>
    decodeOnceFromVideoDevice(deviceId: string, videoElement: HTMLVideoElement): Promise<any>
    decodeFromVideoDevice(deviceId: string, videoElement: HTMLVideoElement, callback: (result: any, error?: any) => void): Promise<void>
    reset(): void
    stopContinuousDecode(): void
  }
  export enum BarcodeFormat {
    QR_CODE = 'QR_CODE',
    CODE_128 = 'CODE_128',
    CODE_39 = 'CODE_39',
    EAN_13 = 'EAN_13',
    UPC_A = 'UPC_A'
  }
}

// Interfaces
interface ScanResult {
  text: string
  format: string
  timestamp: Date
}

interface CameraDevice {
  deviceId: string
  label: string
}

// Reactive data
const videoRef = ref<HTMLVideoElement | null>(null)
const isScanning = ref(false)
const isLoading = ref(false)
const isReady = ref(false)
const scanResult = ref<ScanResult | null>(null)
const error = ref('')
const availableCameras = ref<CameraDevice[]>([])
const currentCameraIndex = ref(0)

// ZXing related
let BrowserMultiFormatReader: any = null
let codeReader: any = null
let stream: MediaStream | null = null

// Initialize ZXing library on client side
onMounted(async () => {
  if (process.client) {
    await initializeScanner()
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  stopScanning()
})

// Methods
const initializeScanner = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Import ZXing library
    const { BrowserMultiFormatReader: Reader } = await import('@zxing/library')
    BrowserMultiFormatReader = Reader
    codeReader = new BrowserMultiFormatReader()
    
    // Get available cameras
    await loadAvailableCameras()
    
    isReady.value = true
    console.log('Scanner initialized successfully')
  } catch (err) {
    error.value = 'ບໍ່ສາມາດເລີ່ມຕົ້ນ scanner ໄດ້. ກະລຸນາກວດສອບ browser ແລະ camera.'
    console.error('ZXing initialization error:', err)
  } finally {
    isLoading.value = false
  }
}

const loadAvailableCameras = async () => {
  try {
    if (!codeReader) return
    
    const devices = await codeReader.listVideoInputDevices()
    availableCameras.value = devices.map((device: MediaDeviceInfo) => ({
      deviceId: device.deviceId,
      label: device.label || `Camera ${devices.indexOf(device) + 1}`
    }))
    
    console.log('Available cameras:', availableCameras.value.length)
  } catch (err) {
    console.error('Error loading cameras:', err)
  }
}

const startScanning = async () => {
  if (!codeReader || !videoRef.value) {
    error.value = 'Scanner ຍັງບໍ່ພ້ອມ'
    return
  }

  try {
    error.value = ''
    isScanning.value = true
    
    if (availableCameras.value.length === 0) {
      throw new Error('ບໍ່ພົບກ້ອງຖ່າຍຮູບ')
    }
    
    // Use selected camera device
    const selectedCamera = availableCameras.value[currentCameraIndex.value]
    console.log('Using camera:', selectedCamera.label)
    
    // Start continuous decoding
    await codeReader.decodeFromVideoDevice(
      selectedCamera.deviceId,
      videoRef.value,
      (result: any, error: any) => {
        if (result) {
          handleScanSuccess(result)
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('Scanning error:', error)
        }
      }
    )
    
  } catch (err: any) {
    error.value = `ເກີດຂໍ້ຜິດພາດໃນການສະແກນ: ${err.message}`
    isScanning.value = false
    console.error('Scanning error:', err)
  }
}

const stopScanning = () => {
  if (codeReader) {
    codeReader.reset()
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  isScanning.value = false
  console.log('Scanning stopped')
}

const switchCamera = async () => {
  if (availableCameras.value.length <= 1) return
  
  stopScanning()
  currentCameraIndex.value = (currentCameraIndex.value + 1) % availableCameras.value.length
  
  // Wait a bit before starting with new camera
  setTimeout(() => {
    if (!isScanning.value) {
      startScanning()
    }
  }, 500)
}

const handleScanSuccess = (result: any) => {
  const scannedText = result.getText()
  const scannedFormat = result.getBarcodeFormat()
  
  console.log('Scan successful:', scannedText, scannedFormat)
  
  scanResult.value = {
    text: scannedText,
    format: scannedFormat,
    timestamp: new Date()
  }
  
  // Stop scanning after successful scan (optional)
  if (props.autoStop) {
    stopScanning()
  }
  
  // Emit event
  emit('scan-success', {
    text: scannedText,
    format: scannedFormat
  })
}

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
  }
  return formats[format] || format
}

const formatTime = (date: Date): string => {
  return date.toLocaleString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const isUrl = (text: string): boolean => {
  try {
    new URL(text)
    return true
  } catch {
    return text.startsWith('http://') || text.startsWith('https://')
  }
}

const copyToClipboard = async () => {
  if (!scanResult.value) return
  
  try {
    await navigator.clipboard.writeText(scanResult.value.text)
    console.log('ສຳເນົາສຳເລັດ!')
    // You might want to show a toast notification here
  } catch (err) {
    console.error('ສຳເນົາລົ້ມເຫຼວ:', err)
  }
}

const openUrl = () => {
  if (scanResult.value && isUrl(scanResult.value.text)) {
    window.open(scanResult.value.text, '_blank')
  }
}

const clearResult = () => {
  scanResult.value = null
}

const clearError = () => {
  error.value = ''
}

// Props
interface Props {
  autoStop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoStop: true
})

// Emits
const emit = defineEmits<{
  'scan-success': [data: { text: string; format: string }]
}>()
</script>

<style scoped>
.scanner-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans Lao', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.scanner-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.scanner-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #95a5a6;
  transition: background-color 0.3s ease;
}

.status-indicator.active {
  background-color: #27ae60;
  animation: pulse 1.5s infinite;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  height: 350px;
  margin: 20px auto;
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
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
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

@keyframes scan {
  0% { transform: translateY(-100px); }
  100% { transform: translateY(100px); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 25px 0;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-tertiary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-icon {
  font-size: 18px;
}

.result-container {
  margin-top: 25px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #27ae60;
}

.result-container h3 {
  margin: 0 0 15px 0;
  color: #27ae60;
  font-size: 20px;
  font-weight: 600;
}

.result-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.result-format {
  display: inline-block;
  background: #27ae60;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.result-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  margin: 8px 0;
  font-size: 14px;
}

.result-time {
  color: #7f8c8d;
  font-size: 13px;
}

.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.copy-btn {
  background: #3498db;
  color: white;
}

.copy-btn:hover {
  background: #2980b9;
}

.clear-btn {
  background: #95a5a6;
  color: white;
}

.clear-btn:hover {
  background: #7f8c8d;
}

.url-btn {
  background: #e67e22;
  color: white;
}

.url-btn:hover {
  background: #d35400;
}

.error-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 15px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 10px;
  color: #c53030;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-content strong {
  display: block;
  margin-bottom: 5px;
}

.error-close {
  background: none;
  border: none;
  color: #c53030;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.error-close:hover {
  background-color: rgba(197, 48, 48, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .scanner-container {
    padding: 15px;
    margin: 10px;
  }
  
  .scanner-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .camera-wrapper {
    height: 280px;
  }
  
  .scan-box {
    width: 200px;
    height: 200px;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>