describe('Plan Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display plans list page', () => {
    cy.visit('/plans')
    cy.get('h1').contains('Plans').should('be.visible')
    cy.get('[data-automation-id="plan-list-new-button"]').should('be.visible')
  })

  it('should navigate to new plan page', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="plan-list-new-button"]').click()
    cy.url().should('include', '/plans/new')
    cy.get('h1').contains('New Plan').should('be.visible')
  })

  it('should create a new plan', () => {
    cy.visit('/plans/new')
    
    const timestamp = Date.now()
    const itemName = `test-plan-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/plans/')
    cy.url().should('not.include', '/plans/new')
    
    // Verify the plan name is displayed on edit page
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a plan', () => {
    // First create a plan
    cy.visit('/plans/new')
    const timestamp = Date.now()
    const itemName = `test-plan-update-${timestamp}`
    const updatedName = `updated-plan-${timestamp}`
    
    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/plans/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="plan-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="plan-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="plan-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the plan appears with updated name
    cy.get('[data-automation-id="plan-edit-back-button"]').click()
    cy.url().should('include', '/plans')
    
    // Search for the updated plan
    cy.get('[data-automation-id="plan-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the plan appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all plans are shown again
    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for plans', () => {
    // First create a plan with a unique name
    cy.visit('/plans/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="plan-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="plan-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="plan-new-submit-button"]').click()
    cy.url().should('include', '/plans/')
    
    // Navigate to list page
    cy.visit('/plans')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the plan
    cy.get('[data-automation-id="plan-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the plan
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all plans are shown again
    cy.get('[data-automation-id="plan-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
