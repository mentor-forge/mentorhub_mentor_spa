describe('Plan Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  /** Plan list may use inline dialog (local) or navigate to /plans/new (container). */
  function createPlan(itemName: string) {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-new-button"]').click()

    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/plans/new')) {
        cy.get('[data-automation-id="plan-new-name-input"]').find('input').type(itemName)
        cy.get('[data-automation-id="plan-new-submit-button"]').click()
      } else {
        cy.get('[data-automation-id="plan-list-new-dialog"]').should('be.visible')
        cy.get('[data-automation-id="plan-list-new-name-input"]').find('input').type(itemName)
        cy.get('[data-automation-id="plan-list-new-submit-button"]').click()
      }
    })

    cy.url().should('match', /\/plans\/[a-f0-9]+$/)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input', { timeout: 15000 }).should('have.value', itemName)
  }

  function waitForPlanDetailReady() {
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input', { timeout: 15000 }).should('be.visible')
    cy.get('[data-automation-id="plan-edit-add-step-button"]', { timeout: 15000 }).should('be.visible')
  }

  it('should display plans list page with cards', () => {
    cy.visit('/plans')
    cy.get('h1').contains('Plans').should('be.visible')
    cy.get('[data-automation-id="plan-list-new-button"]').should('be.visible')
  })

  it('should open new plan dialog and create a plan', () => {
    const timestamp = Date.now()
    const itemName = `test-plan-${timestamp}`

    createPlan(itemName)
  })

  it('should display step count on plan cards', () => {
    const timestamp = Date.now()
    const itemName = `step-count-${timestamp}`

    createPlan(itemName)
    waitForPlanDetailReady()

    cy.get('[data-automation-id="plan-edit-add-step-button"]').click()
    cy.get('[data-automation-id="plan-edit-step-input-0"]').find('input, textarea').type('Only step')
    cy.get('[data-automation-id="plan-edit-step-input-0"]').find('input, textarea').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-back-button"]').click()
    cy.url().should('match', /\/plans\/?$/)

    cy.get('[data-automation-id="plan-list-search"]').find('input').type(itemName)
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').contains(itemName).within(() => {
      cy.get('[data-automation-id="plan-list-card-step-count"]').should('contain', '1 step')
    })
  })

  it('should navigate to plan detail when a card is clicked', () => {
    const timestamp = Date.now()
    const itemName = `card-nav-${timestamp}`

    createPlan(itemName)

    cy.get('[data-automation-id="plan-edit-back-button"]').click()
    cy.get('[data-automation-id="plan-list-search"]').find('input').type(itemName)
    cy.wait(800)

    cy.get('[data-automation-id="plan-list-card"]').contains(itemName).click()
    cy.url().should('match', /\/plans\/[a-f0-9]+$/)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should cancel new plan without creating a plan', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-new-button"]').click()

    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/plans/new')) {
        cy.get('[data-automation-id="plan-new-name-input"]').find('input').type('should-not-be-created')
        cy.get('[data-automation-id="plan-new-cancel-button"]').click()
      } else {
        cy.get('[data-automation-id="plan-list-new-dialog"]').should('be.visible')
        cy.get('[data-automation-id="plan-list-new-name-input"]').find('input').type('should-not-be-created')
        cy.get('[data-automation-id="plan-list-new-cancel-button"]').click()
        cy.get('[data-automation-id="plan-list-new-dialog"]').should('not.exist')
      }
    })

    cy.url().should('satisfy', (href: string) => href.includes('/plans') && !/\/plans\/[a-f0-9]+$/.test(href))
  })

  it('should still create a plan from the legacy new page route', () => {
    cy.visit('/plans/new')

    const timestamp = Date.now()
    const itemName = `legacy-plan-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').find('input').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').find('textarea').type('Legacy route description')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()

    cy.url().should('match', /\/plans\/[a-f0-9]+$/)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should add and delete plan steps', () => {
    const timestamp = Date.now()
    const itemName = `steps-plan-${timestamp}`

    createPlan(itemName)
    waitForPlanDetailReady()

    cy.get('[data-automation-id="plan-edit-add-step-button"]').click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-input-0"]').find('input, textarea').type('First step')
    cy.get('[data-automation-id="plan-edit-step-input-0"]').find('input, textarea').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-add-step-button"]').click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-input-1"]').find('input, textarea').type('Second step')
    cy.get('[data-automation-id="plan-edit-step-input-1"]').find('input, textarea').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-step-item"]').should('have.length', 2)

    cy.get('[data-automation-id="plan-edit-delete-step-button"]').first().click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-item"]').should('have.length', 1)
    cy.get('[data-automation-id="plan-edit-step-input-0"]').find('input, textarea').should('have.value', 'Second step')
  })

  it('should update a plan and show it on the card list', () => {
    const timestamp = Date.now()
    const itemName = `test-plan-update-${timestamp}`
    const updatedName = `updated-plan-${timestamp}`

    createPlan(itemName)

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-back-button"]').click()
    cy.url().should('match', /\/plans\/?$/)

    cy.get('[data-automation-id="plan-list-search"]').find('input').type(updatedName)
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('contain', updatedName)

    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('exist')
  })

  it('should search for plans in the card list', () => {
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`

    createPlan(itemName)

    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-search"]').find('input').type(itemName)
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('contain', itemName)

    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('exist')
  })
})
