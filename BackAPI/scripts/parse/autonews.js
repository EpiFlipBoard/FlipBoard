import { readFileSync } from 'fs'
import { launch } from 'puppeteer'

export async function parseAutonews(htmlContent) {
  const html = htmlContent ?? readFileSync('rendered_page.html', 'utf-8')

  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'domcontentloaded' })

    const items = await page.evaluate(() => {
      const result = []
      const container = document.querySelector('.fil-info-content')
      if (!container) return result

      const seen = new Set()
      const anchors = Array.from(container.querySelectorAll('a'))
      for (const a of anchors) {
        const href = a.getAttribute('href') || ''
        const text = (a.textContent || '').trim()
        if (!href || !text) continue
        if (text.length < 6) continue

        let fullHref = href
        if (href.startsWith('/')) fullHref = 'https://www.autonews.fr' + href
        if (fullHref.startsWith('#') || fullHref.startsWith('javascript:')) continue

        if (!seen.has(fullHref)) {
          result.push({ title: text, url: fullHref, description: '', cover: '' })
          seen.add(fullHref)
        }
      }
      return result
    })

    return items
  } finally {
    await browser.close()
  }
}
