describe('Resource Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display resources list page', () => {
    cy.visit('/resources')
    cy.get('h1').contains('Resources').should('be.visible')
    cy.get('[data-automation-id="resource-list-new-button"]').should('be.visible')
  })

  it('should navigate to new resource page', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="resource-list-new-button"]').click()
    cy.url().should('include', '/resources/new')
    cy.get('h1').contains('New Resource').should('be.visible')
  })

  it('should create a new resource', () => {
    cy.visit('/resources/new')
    
    const timestamp = Date.now()
    const itemName = `test-resource-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="resource-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="resource-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="resource-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/resources/')
    cy.url().should('not.include', '/resources/new')
    
    // Verify the resource name is displayed on edit page
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a resource', () => {
    // First create a resource
    cy.visit('/resources/new')
    const timestamp = Date.now()
    const itemName = `test-resource-update-${timestamp}`
    const updatedName = `updated-resource-${timestamp}`
    
    cy.get('[data-automation-id="resource-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="resource-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="resource-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/resources/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="resource-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="resource-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="resource-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the resource appears with updated name
    cy.get('[data-automation-id="resource-edit-back-button"]').click()
    cy.url().should('include', '/resources')
    
    // Search for the updated resource
    cy.get('[data-automation-id="resource-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the resource appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all resources are shown again
    cy.get('[data-automation-id="resource-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for resources', () => {
    // First create a resource with a unique name
    cy.visit('/resources/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="resource-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="resource-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="resource-new-submit-button"]').click()
    cy.url().should('include', '/resources/')
    
    // Navigate to list page
    cy.visit('/resources')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the resource
    cy.get('[data-automation-id="resource-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the resource
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all resources are shown again
    cy.get('[data-automation-id="resource-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
