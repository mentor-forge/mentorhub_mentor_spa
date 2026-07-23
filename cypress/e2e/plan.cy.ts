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
    cy.get('[data-automation-id="plan-list-grid"]').should('be.visible')
    cy.get('[data-automation-id="plan-list-card"]').first().within(() => {
      cy.get('.mh-card__title').should('not.be.empty')
      cy.get('.mh-card__body').should('not.be.empty')
      cy.get('.v-chip').should('not.exist')
    })
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

  it('should navigate to plan edit from a card action', () => {
    cy.visit('/plans')

    cy.get('[data-automation-id="plan-list-card-open-button"]').first().click()
    cy.url().should('match', /\/plans\/[a-f0-9]{24}$/)
    cy.get('[data-automation-id="plan-edit-fields-section"]').should('be.visible')
    cy.get('[data-automation-id="plan-edit-name-input"]').should('be.visible')
  })

  it('should manage checklist steps on edit page', () => {
    cy.visit('/plans')

    const timestamp = Date.now()
    const itemName = `test-plan-steps-${timestamp}`

    cy.get('[data-automation-id="plan-list-new-button"]').click()
    cy.get('[data-automation-id="plan-list-new-name-input"]').find('input').type(itemName)
    cy.get('[data-automation-id="plan-list-new-submit-button"]').click()

    cy.get('[data-automation-id="plan-edit-checklist-section"]').should('be.visible')

    cy.get('[data-automation-id="plan-edit-checklist-add-input"]').find('input').type('Step one')
    cy.get('[data-automation-id="plan-edit-checklist-add-button"]').click()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-checklist-step-list"]').should('be.visible')
    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').should('have.value', 'Step one')

    cy.get('[data-automation-id="plan-edit-checklist-add-input"]').find('input').type('Step two')
    cy.get('[data-automation-id="plan-edit-checklist-add-button"]').click()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-checklist-step-2-input"]').find('input').should('have.value', 'Step two')

    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').clear().type('Step one edited')
    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').blur()
    cy.wait(1000)
    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').should('have.value', 'Step one edited')

    const dataTransfer = new DataTransfer()
    cy.get('[data-automation-id="plan-edit-checklist-step-2-drag-handle"]')
      .trigger('dragstart', { dataTransfer })
    cy.get('[data-automation-id="plan-edit-checklist-step-1-drag-handle"]')
      .parents('.plan-checklist-todo-row')
      .first()
      .trigger('dragover', { dataTransfer })
      .trigger('drop', { dataTransfer })
    cy.get('[data-automation-id="plan-edit-checklist-step-2-drag-handle"]')
      .trigger('dragend', { dataTransfer })
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').should('have.value', 'Step two')
    cy.get('[data-automation-id="plan-edit-checklist-step-2-input"]').find('input').should('have.value', 'Step one edited')

    cy.get('[data-automation-id="plan-edit-checklist-step-2-delete-button"]').click()
    cy.wait(1000)

    cy.reload()
    cy.get('[data-automation-id="plan-edit-checklist-step-1-input"]').find('input').should('have.value', 'Step two')
    cy.get('[data-automation-id="plan-edit-checklist-step-2-input"]').should('not.exist')
  })
})
