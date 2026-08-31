describe('Plan Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new plan via /mentor/plans/new and open edit page', () => {
    cy.visitPrefixed('/mentor/plans/new')

    const timestamp = Date.now()
    const itemName = `test-plan-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Test description for plan')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()

    cy.url().should('match', /\/mentor\/plans\/[a-f0-9]{24}$/)
    cy.url().should('not.include', '/mentor/plans/new')

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a plan from edit page and have a Browse Plans link to Discovery', () => {
    cy.visitPrefixed('/mentor/plans/new')

    const timestamp = Date.now()
    const itemName = `test-plan-update-${timestamp}`
    const updatedName = `updated-plan-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()

    cy.url().should('match', /\/mentor\/plans\/[a-f0-9]{24}$/)

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', updatedName)

    cy.get('[data-automation-id="plan-edit-description-input"]').find('input').clear().type('Updated description')
    cy.get('[data-automation-id="plan-edit-description-input"]').find('input').blur()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-status-select"]').click()
    cy.get('.v-overlay--active .v-list-item').contains('Soft Delete Indicator').click()
    cy.wait(1000)

    cy.get('[data-automation-id="plan-edit-browse-plans-link"]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /:8080\/discovery\/plans$/)

    cy.reload()
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', updatedName)
    cy.get('[data-automation-id="plan-edit-description-input"]').find('input').should('have.value', 'Updated description')
  })

  it('should manage checklist steps on edit page', () => {
    cy.visitPrefixed('/mentor/plans/new')

    const timestamp = Date.now()
    const itemName = `test-plan-steps-${timestamp}`

    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-submit-button"]').click()

    cy.url().should('match', /\/mentor\/plans\/[a-f0-9]{24}$/)

    cy.get('[data-automation-id="plan-edit-checklist-section"]')
      .should('be.visible')
      .and('have.class', 'mh-card')

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
