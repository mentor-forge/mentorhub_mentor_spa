describe('Encounter Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display encounters list page', () => {
    cy.visit('/encounters')
    cy.get('h1').contains('Encounters').should('be.visible')
    cy.get('[data-automation-id="encounter-list-new-button"]').should('be.visible')
  })

  it('should navigate to new encounter page', () => {
    cy.visit('/encounters')
    cy.get('[data-automation-id="encounter-list-new-button"]').click()
    cy.url().should('include', '/encounters/new')
    cy.get('h1').contains('New Encounter').should('be.visible')
  })

  it('should create a new encounter', () => {
    cy.visit('/encounters/new')
    
    const timestamp = Date.now()
    const itemName = `test-encounter-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="encounter-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="encounter-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="encounter-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/encounters/')
    cy.url().should('not.include', '/encounters/new')
    
    // Verify the encounter name is displayed on edit page
    cy.get('[data-automation-id="encounter-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a encounter', () => {
    // First create a encounter
    cy.visit('/encounters/new')
    const timestamp = Date.now()
    const itemName = `test-encounter-update-${timestamp}`
    const updatedName = `updated-encounter-${timestamp}`
    
    cy.get('[data-automation-id="encounter-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="encounter-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="encounter-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/encounters/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="encounter-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="encounter-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="encounter-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="encounter-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="encounter-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="encounter-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the encounter appears with updated name
    cy.get('[data-automation-id="encounter-edit-back-button"]').click()
    cy.url().should('include', '/encounters')
    
    // Search for the updated encounter
    cy.get('[data-automation-id="encounter-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the encounter appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all encounters are shown again
    cy.get('[data-automation-id="encounter-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for encounters', () => {
    // First create a encounter with a unique name
    cy.visit('/encounters/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="encounter-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="encounter-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="encounter-new-submit-button"]').click()
    cy.url().should('include', '/encounters/')
    
    // Navigate to list page
    cy.visit('/encounters')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the encounter
    cy.get('[data-automation-id="encounter-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the encounter
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all encounters are shown again
    cy.get('[data-automation-id="encounter-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
