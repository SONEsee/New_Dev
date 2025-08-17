<template>
  <div class="scanner-container">
    <h2>Barcode Scanner</h2>
    
    <!-- Camera Video Element -->
    <div class="camera-wrapper">
      <video 
        ref="videoRef" 
        autoplay 
        playsinline 
        :class="{ 'camera-active': isScanning }"
      ></video>
      
      <!-- Overlay for scanning area -->
      <div v-if="isScanning" class="scan-overlay">
        <div class="scan-box"></div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button 
        @click="startScanning" 
        :disabled="isScanning"
        class="btn btn-primary"
      >
        {{ isScanning ? 'Scanning...' : 'Start Scan' }}
      </button>
      
      <button 
        @click="stopScanning" 
        :disabled="!isScanning"
        class="btn btn-secondary"
      >
        Stop Scan
      </button>
    </div>
    
    <!-- Results -->
    <div v-if="scanResult" class="result">
      <h3>Scan Result:</h3>
      <div class="result-content">
        <p><strong>Format:</strong> {{ scanResult.format }}</p>
        <p><strong>Text:</strong> {{ scanResult.text }}</p>
      </div>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Import ZXing library (client-side only)
let BrowserMultiFormatReader = null

const videoRef = ref(null)
const isScanning = ref(false)
const scanResult = ref(null)
const error = ref('')
let codeReader = null
let stream = null

// Initialize ZXing library on client side
onMounted(async () => {
  if (process.client) {
    try {
      const { BrowserMultiFormatReader: Reader } = await import('@zxing/library')
      BrowserMultiFormatReader = Reader
      codeReader = new BrowserMultiFormatReader()
    } catch (err) {
      error.value = 'Failed to load barcode scanner library'
      console.error('ZXing import error:', err)
    }
  }
})

// Start scanning function
const startScanning = async () => {
  if (!BrowserMultiFormatReader || !codeReader) {
    error.value = 'Scanner not initialized'
    return
  }

  try {
    error.value = ''
    isScanning.value = true
    
    // Get video devices
    const videoInputDevices = await codeReader.listVideoInputDevices()
    
    if (videoInputDevices.length === 0) {
      throw new Error('No camera devices found')
    }
    
    // Use the first camera device (usually back camera on mobile)
    const selectedDeviceId = videoInputDevices[0].deviceId
    
    // Start decoding from video device
    const result = await codeReader.decodeOnceFromVideoDevice(
      selectedDeviceId,
      videoRef.value
    )
    
    if (result) {
      scanResult.value = {
        text: result.getText(),
        format: result.getBarcodeFormat()
      }
      stopScanning()
    }
    
  } catch (err) {
    error.value = `Scanning error: ${err.message}`
    isScanning.value = false
    console.error('Scanning error:', err)
  }
}

// Stop scanning function
const stopScanning = () => {
  if (codeReader) {
    codeReader.reset()
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  isScanning.value = false
}

// Cleanup on component unmount
onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
}

video {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.camera-active {
  border: 3px solid #4CAF50;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scan-box {
  width: 200px;
  height: 200px;
  border: 2px solid #4CAF50;
  border-radius: 10px;
  background: rgba(76, 175, 80, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.controls {
  text-align: center;
  margin: 20px 0;
}

.btn {
  padding: 12px 24px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: #f44336;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #da190b;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #e8f5e8;
  border: 1px solid #4CAF50;
  border-radius: 5px;
}

.result h3 {
  margin: 0 0 10px 0;
  color: #2e7d32;
}

.result-content p {
  margin: 5px 0;
  word-break: break-all;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 5px;
  color: #c62828;
}
</style>