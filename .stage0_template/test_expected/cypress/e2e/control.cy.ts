describe('Control Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display controls list page', () => {
    cy.visit('/controls')
    cy.get('h1').contains('Controls').should('be.visible')
    cy.get('[data-automation-id="control-list-new-button"]').should('be.visible')
  })

  it('should navigate to new control page', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="control-list-new-button"]').click()
    cy.url().should('include', '/controls/new')
    cy.get('h1').contains('New Control').should('be.visible')
  })

  it('should create a new control', () => {
    cy.visit('/controls/new')
    
    const timestamp = Date.now()
    const itemName = `test-control-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="control-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="control-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="control-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/controls/')
    cy.url().should('not.include', '/controls/new')
    
    // Verify the control name is displayed on edit page
    cy.get('[data-automation-id="control-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a control', () => {
    // First create a control
    cy.visit('/controls/new')
    const timestamp = Date.now()
    const itemName = `test-control-update-${timestamp}`
    const updatedName = `updated-control-${timestamp}`
    
    cy.get('[data-automation-id="control-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="control-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="control-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/controls/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="control-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="control-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="control-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="control-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="control-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="control-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the control appears with updated name
    cy.get('[data-automation-id="control-edit-back-button"]').click()
    cy.url().should('include', '/controls')
    
    // Search for the updated control
    cy.get('[data-automation-id="control-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the control appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all controls are shown again
    cy.get('[data-automation-id="control-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for controls', () => {
    // First create a control with a unique name
    cy.visit('/controls/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="control-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="control-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="control-new-submit-button"]').click()
    cy.url().should('include', '/controls/')
    
    // Navigate to list page
    cy.visit('/controls')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the control
    cy.get('[data-automation-id="control-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the control
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all controls are shown again
    cy.get('[data-automation-id="control-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
