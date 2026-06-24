describe('Plan Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display plans list page with cards', () => {
    cy.visit('/plans')
    cy.get('h1').contains('Plans').should('be.visible')
    cy.get('[data-automation-id="plan-list-new-button"]').should('be.visible')
  })

  it('should open new plan dialog and create a plan', () => {
    cy.visit('/plans')

    const timestamp = Date.now()
    const itemName = `test-plan-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-button"]').click()
    cy.get('[data-automation-id="plan-list-new-dialog"]').should('be.visible')
    cy.get('[data-automation-id="plan-list-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()

    cy.url().should('include', '/plans/')
    cy.url().should('not.include', '/plans/new')
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should still create a plan from the legacy new page route', () => {
    cy.visit('/plans/new')

    const timestamp = Date.now()
    const itemName = `legacy-plan-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Legacy route description')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()

    cy.url().should('include', '/plans/')
    cy.url().should('not.include', '/plans/new')
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should add and delete plan steps', () => {
    cy.visit('/plans/new')
    const timestamp = Date.now()
    const itemName = `steps-plan-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-submit-button"]').click()
    cy.url().should('include', '/plans/')

    cy.get('[data-automation-id="plan-edit-add-step-button"]').click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-input-0"]').type('First step')
    cy.get('[data-automation-id="plan-edit-step-input-0"]').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-add-step-button"]').click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-input-1"]').type('Second step')
    cy.get('[data-automation-id="plan-edit-step-input-1"]').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-step-item"]').should('have.length', 2)

    cy.get('[data-automation-id="plan-edit-delete-step-button"]').first().click()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-step-item"]').should('have.length', 1)
    cy.get('[data-automation-id="plan-edit-step-input-0"]').should('have.value', 'Second step')
  })

  it('should update a plan and show it on the card list', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-new-button"]').click()

    const timestamp = Date.now()
    const itemName = `test-plan-update-${timestamp}`
    const updatedName = `updated-plan-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()
    cy.url().should('include', '/plans/')

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
    cy.url().should('include', '/plans')

    cy.get('[data-automation-id="plan-list-search"]').find('input').type(updatedName)
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('contain', updatedName)

    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('exist')
  })

  it('should search for plans in the card list', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-new-button"]').click()

    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()
    cy.url().should('include', '/plans/')

    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-search"]').find('input').type(itemName)
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('contain', itemName)

    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="plan-list-card"]').should('exist')
  })
})
