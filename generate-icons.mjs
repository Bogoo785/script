import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  const svg = await readFile('public/script-icon.svg', 'utf8')
  for (const size of [180, 192, 512]) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`)
    await page.screenshot({ path: size === 180 ? 'public/apple-touch-icon.png' : `public/script-icon-${size}.png` })
  }
} finally { await browser.close() }
