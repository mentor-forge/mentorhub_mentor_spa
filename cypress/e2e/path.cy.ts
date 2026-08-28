describe('Path Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new path', () => {
    cy.visit('/mentor/paths/new')
    
    const timestamp = Date.now()
    const itemName = `test-path-${timestamp}`
    
    cy.get('[data-automation-id="path-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="path-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="path-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/mentor/paths/')
    cy.url().should('not.include', '/mentor/paths/new')
    
    // Verify the path name is displayed on edit page
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a path and have a Browse Paths link to Discovery', () => {
    // First create a path
    cy.visit('/mentor/paths/new')
    const timestamp = Date.now()
    const itemName = `test-path-update-${timestamp}`
    const updatedName = `updated-path-${timestamp}`
    
    cy.get('[data-automation-id="path-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="path-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="path-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/mentor/paths/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').blur()
    cy.wait(1000)
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="path-edit-description-input"]').find('input').clear().type('Updated description')
    cy.get('[data-automation-id="path-edit-description-input"]').find('input').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="path-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Verify browse link points to Discovery
    cy.get('[data-automation-id="path-edit-browse-paths-link"]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /:8080\/discovery\/paths$/)
    
    // Verify persistence on reload
    cy.reload()
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').should('have.value', updatedName)
    cy.get('[data-automation-id="path-edit-description-input"]').find('input').should('have.value', 'Updated description')
  })
})
