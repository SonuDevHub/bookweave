import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EMAIL_TEMPLATE_DIR = path.resolve(__dirname, '../templates/emails')

const templateCache = new Map()

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

async function loadEmailTemplate(templateName) {
  if (process.env.NODE_ENV === 'production' && templateCache.has(templateName)) {
    return templateCache.get(templateName)
  }

  const filePath = path.join(EMAIL_TEMPLATE_DIR, `${templateName}.html`)
  const html = await fs.readFile(filePath, 'utf8')

  if (process.env.NODE_ENV === 'production') {
    templateCache.set(templateName, html)
  }

  return html
}

export async function renderEmailTemplate(templateName, data = {}) {
  const template = await loadEmailTemplate(templateName)

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(data, key)
      ? escapeHtml(data[key])
      : ''
  )
}
