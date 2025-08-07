// composables/useBarcode.ts
import JsBarcode from 'jsbarcode'

export const useBarcode = () => {
  // ຟັງຊັນສ້າງ barcode ໃສ່ element
  const generateBarcode = (element: HTMLElement | string, value: string, options = {}) => {
    const defaultOptions = {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 12,
      margin: 10,
      background: "#ffffff",
      lineColor: "#000000",
      ...options
    }
    
    try {
      JsBarcode(element, value, defaultOptions)
    } catch (error) {
      console.error('Error generating barcode:', error)
    }
  }

  // ຟັງຊັນສ້າງ barcode ເປັນ base64 image
  const generateBarcodeBase64 = (value: string, options = {}) => {
    const canvas = document.createElement('canvas')
    const defaultOptions = {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 12,
      margin: 10,
      background: "#ffffff",
      lineColor: "#000000",
      ...options
    }
    
    try {
      JsBarcode(canvas, value, defaultOptions)
      return canvas.toDataURL()
    } catch (error) {
      console.error('Error generating barcode base64:', error)
      return ''
    }
  }

  // ຟັງຊັນສ້າງ barcode ເປັນ SVG string
  const generateBarcodeSVG = (value: string, options = {}) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    const defaultOptions = {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 12,
      margin: 10,
      background: "#ffffff",
      lineColor: "#000000",
      ...options
    }
    
    try {
      JsBarcode(svg, value, defaultOptions)
      return svg.outerHTML
    } catch (error) {
      console.error('Error generating barcode SVG:', error)
      return ''
    }
  }

  return {
    generateBarcode,
    generateBarcodeBase64,
    generateBarcodeSVG
  }
}