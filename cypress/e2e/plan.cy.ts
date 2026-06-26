describe('Plan Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display plans list page as card dashboard', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-heading"]').should('be.visible').and('contain', 'Plans')
    cy.get('[data-automation-id="plan-list-new-button"]').should('be.visible')
    cy.get('table').should('not.exist')
    cy.get('[data-automation-id="plan-list-search"]').should('not.exist')
  })

  it('should create a new plan via dialog and open edit page', () => {
    cy.visit('/plans')

    const timestamp = Date.now()
    const itemName = `test-plan-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-button"]').click()
    cy.get('[data-automation-id="plan-list-new-name-input"]').find('input').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()

    cy.url().should('include', '/plans/')
    cy.url().should('not.include', '/plans/new')

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a plan from edit page', () => {
    cy.visit('/plans')

    const timestamp = Date.now()
    const itemName = `test-plan-update-${timestamp}`
    const updatedName = `updated-plan-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-button"]').click()
    cy.get('[data-automation-id="plan-list-new-name-input"]').find('input').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()

    cy.url().should('include', '/plans/')
    cy.url().should('not.include', '/plans/new')

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', updatedName)

    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-back-button"]').click()
    cy.url().should('include', '/plans')

    cy.get('[data-automation-id="plan-list-card"]').contains(updatedName).should('be.visible')
  })

  it('should navigate to plan edit when clicking a card', () => {
    cy.visit('/plans')

    cy.get('[data-automation-id="plan-list-card"]').first().click()
    cy.url().should('match', /\/plans\/[a-f0-9]{24}$/)
    cy.get('[data-automation-id="plan-edit-name-input"]').should('be.visible')
  })
})
