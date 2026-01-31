import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { injectFontStyles } from "../utils/inject-font-styles"

const TestWidget = () => {
  useEffect(() => {
    injectFontStyles()
  }, [])

  // Нічого не рендеримо - тільки інжектуємо CSS
  return null
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default TestWidget
