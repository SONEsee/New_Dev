import { BrowserMultiFormatReader } from '@zxing/library'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      barcodeReader: BrowserMultiFormatReader
    }
  }
})