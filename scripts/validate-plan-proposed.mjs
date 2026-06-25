/**
 * Playwright validation of plan.cy.ts.proposed against production preview (8394).
 * Run: node scripts/validate-plan-proposed.mjs
 */
import jwt from 'jsonwebtoken'
import { chromium } from 'playwright'

const BASE = process.env.SPA_URL ?? 'http://127.0.0.1:8394'
const JWT_SECRET = process.env.JWT_SECRET ?? 'local-dev-jwt-secret-fixed'

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`)
}

const exp = Math.floor(Date.now() / 1000) + 86400
const token = jwt.sign(
  { sub: 'marti', iss: 'dev-idp', aud: 'dev-api', roles: ['mentor', 'admin'], exp },
  JWT_SECRET,
  { algorithm: 'HS256' },
)
const expiresAt = new Date(exp * 1000).toISOString()

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

await page.addInitScript(({ token, expiresAt, roles }) => {
  localStorage.setItem('access_token', token)
  localStorage.setItem('token_expires_at', expiresAt)
  localStorage.setItem('user_roles', JSON.stringify(roles))
}, { token, expiresAt, roles: ['mentor', 'admin'] })

const planName = `create-${Date.now()}`
const searchName = `search-${Date.now()}`
const stepName = `step-count-${Date.now()}`
const stepsName = `steps-${Date.now()}`
const updateName = `update-${Date.now()}`
const updatedName = `updated-${Date.now()}`

try {
  // List as card grid
  await page.goto(`${BASE}/plans`, { waitUntil: 'networkidle' })
  const hasTable = await page.locator('table').count()
  const hasNewBtn = await page.locator('[data-automation-id="plan-list-new-button"]').count()
  record('card grid list page', hasTable === 0 && hasNewBtn === 1)

  // Create via dialog
  await page.click('[data-automation-id="plan-list-new-button"]')
  const dialogVisible = await page.locator('[data-automation-id="plan-list-new-dialog"]').isVisible()
  if (!dialogVisible) throw new Error('dialog not visible')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill(planName)
  await page.click('[data-automation-id="plan-list-new-submit-button"]')
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  const nameVal = await page.locator('[data-automation-id="plan-edit-name-input"] input').inputValue()
  record('create via dialog', nameVal === planName)

  // Cancel dialog
  await page.goto(`${BASE}/plans`)
  await page.click('[data-automation-id="plan-list-new-button"]')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill('cancel-test')
  await page.click('[data-automation-id="plan-list-new-cancel-button"]')
  await page.waitForTimeout(300)
  const cancelOk = page.url().match(/\/plans\/?$/) && !(await page.locator('[data-automation-id="plan-list-new-dialog"]').isVisible())
  record('cancel dialog', cancelOk)

  // Search + card click
  await page.click('[data-automation-id="plan-list-new-button"]')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill(searchName)
  await page.click('[data-automation-id="plan-list-new-submit-button"]')
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  await page.click('[data-automation-id="plan-edit-back-button"]')
  await page.waitForURL(/\/plans\/?$/)
  await page.locator('[data-automation-id="plan-list-search"] input').fill(searchName)
  await page.waitForTimeout(800)
  await page.locator('[data-automation-id="plan-list-card"]').filter({ hasText: searchName }).click()
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  record('search and card navigation', (await page.locator('[data-automation-id="plan-edit-name-input"] input').inputValue()) === searchName)

  // Step count on card
  await page.goto(`${BASE}/plans`, { waitUntil: 'networkidle' })
  await page.click('[data-automation-id="plan-list-new-button"]')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill(stepName)
  await page.click('[data-automation-id="plan-list-new-submit-button"]')
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  await page.click('[data-automation-id="plan-edit-add-step-button"]')
  await page.waitForTimeout(500)
  await page.locator('[data-automation-id="plan-edit-step-input-0"] input').fill('Only step')
  await page.locator('[data-automation-id="plan-edit-step-input-0"] input').blur()
  await page.waitForTimeout(1000)
  await page.click('[data-automation-id="plan-edit-back-button"]')
  await page.locator('[data-automation-id="plan-list-search"] input').fill(stepName)
  await page.waitForTimeout(800)
  const chip = await page.locator('[data-automation-id="plan-list-card"]').filter({ hasText: stepName }).locator('[data-automation-id="plan-list-card-step-count"]').textContent()
  record('step count on card', chip?.includes('1 step') ?? false, chip ?? '')

  // Add/delete steps
  await page.goto(`${BASE}/plans`, { waitUntil: 'networkidle' })
  await page.click('[data-automation-id="plan-list-new-button"]')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill(stepsName)
  await page.click('[data-automation-id="plan-list-new-submit-button"]')
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  await page.click('[data-automation-id="plan-edit-add-step-button"]')
  await page.waitForTimeout(500)
  await page.locator('[data-automation-id="plan-edit-step-input-0"] input').fill('First step')
  await page.locator('[data-automation-id="plan-edit-step-input-0"] input').blur()
  await page.waitForTimeout(1000)
  await page.click('[data-automation-id="plan-edit-add-step-button"]')
  await page.waitForTimeout(500)
  await page.locator('[data-automation-id="plan-edit-step-input-1"] input').fill('Second step')
  await page.locator('[data-automation-id="plan-edit-step-input-1"] input').blur()
  await page.waitForTimeout(1000)
  const count2 = await page.locator('[data-automation-id="plan-edit-step-item"]').count()
  await page.locator('[data-automation-id="plan-edit-delete-step-button"]').first().click()
  await page.waitForTimeout(1000)
  const count1 = await page.locator('[data-automation-id="plan-edit-step-item"]').count()
  record('add and delete steps', count2 === 2 && count1 === 1, `items ${count2}->${count1}`)

  // Update metadata
  await page.goto(`${BASE}/plans`, { waitUntil: 'networkidle' })
  await page.click('[data-automation-id="plan-list-new-button"]')
  await page.locator('[data-automation-id="plan-list-new-name-input"] input').fill(updateName)
  await page.click('[data-automation-id="plan-list-new-submit-button"]')
  await page.waitForURL(/\/plans\/[0-9a-fA-F]{24}$/)
  await page.locator('[data-automation-id="plan-edit-name-input"] input').fill(updatedName)
  await page.locator('[data-automation-id="plan-edit-name-input"] input').blur()
  await page.waitForTimeout(1000)
  await page.locator('[data-automation-id="plan-edit-description-input"] textarea').fill('Updated description')
  await page.locator('[data-automation-id="plan-edit-description-input"] textarea').blur()
  await page.waitForTimeout(1000)
  await page.click('[data-automation-id="plan-edit-back-button"]')
  await page.locator('[data-automation-id="plan-list-search"] input').fill(updatedName)
  await page.waitForTimeout(800)
  const cardText = await page.locator('[data-automation-id="plan-list-card"]').filter({ hasText: updatedName }).textContent()
  record('update metadata on card', cardText?.includes('Updated description') ?? false)

} catch (err) {
  record('unexpected error', false, err.message)
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log('\n--- Summary ---')
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
