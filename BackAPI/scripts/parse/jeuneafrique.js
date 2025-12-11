import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { launch } from 'puppeteer'

export async function parseJeuneAfrique(htmlContent) {
  const browser = await launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' })
  
  const items = await page.evaluate(() => {
    const result = []
    const container = document.querySelector('.hub-main__sidebar')
    if (!container) return result

    const seen = new Set()
    const anchors = Array.from(container.querySelectorAll('a'))
    for (const a of anchors) {
      const href = a.getAttribute('href') || ''
      const text = (a.textContent || '').trim()
      if (!href || !text) continue
      if (text.length < 3) continue
      let fullHref = href
      if (href.startsWith('/')) fullHref = 'https://www.jeuneafrique.com' + href
      if (fullHref.startsWith('#') || fullHref.startsWith('javascript:')) continue
      if (!seen.has(fullHref)) {
        result.push({ title: text, url: fullHref })
        seen.add(fullHref)
      }
    }
    return result
  })

  await browser.close()
  return items;
}

