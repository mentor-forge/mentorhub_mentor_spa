describe('Path Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display paths list page', () => {
    cy.visit('/paths')
    cy.get('h1').contains('Paths').should('be.visible')
    cy.get('[data-automation-id="path-list-new-button"]').should('be.visible')
  })

  it('should navigate to new path page', () => {
    cy.visit('/paths')
    cy.get('[data-automation-id="path-list-new-button"]').click()
    cy.url().should('include', '/paths/new')
    cy.get('h1').contains('New Path').should('be.visible')
  })

  it('should create a new path', () => {
    cy.visit('/paths/new')
    
    const timestamp = Date.now()
    const itemName = `test-path-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="path-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="path-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="path-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/paths/')
    cy.url().should('not.include', '/paths/new')
    
    // Verify the path name is displayed on edit page
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a path', () => {
    // First create a path
    cy.visit('/paths/new')
    const timestamp = Date.now()
    const itemName = `test-path-update-${timestamp}`
    const updatedName = `updated-path-${timestamp}`
    
    cy.get('[data-automation-id="path-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="path-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="path-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/paths/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="path-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="path-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="path-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="path-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the path appears with updated name
    cy.get('[data-automation-id="path-edit-back-button"]').click()
    cy.url().should('include', '/paths')
    
    // Search for the updated path
    cy.get('[data-automation-id="path-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the path appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all paths are shown again
    cy.get('[data-automation-id="path-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for paths', () => {
    // First create a path with a unique name
    cy.visit('/paths/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="path-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="path-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="path-new-submit-button"]').click()
    cy.url().should('include', '/paths/')
    
    // Navigate to list page
    cy.visit('/paths')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the path
    cy.get('[data-automation-id="path-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the path
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all paths are shown again
    cy.get('[data-automation-id="path-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
