describe('Create Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display creates list page', () => {
    cy.visit('/creates')
    cy.get('h1').contains('Creates').should('be.visible')
    cy.get('[data-automation-id="create-list-new-button"]').should('be.visible')
  })

  it('should navigate to new create page', () => {
    cy.visit('/creates')
    cy.get('[data-automation-id="create-list-new-button"]').click()
    cy.url().should('include', '/creates/new')
    cy.get('h1').contains('New Create').should('be.visible')
  })

  it('should create a new create document', () => {
    cy.visit('/creates/new')
    
    const timestamp = Date.now()
    const itemName = `test-create-${timestamp}`
    
    cy.get('[data-automation-id="create-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="create-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="create-new-status-input"]').type('active')
    cy.get('[data-automation-id="create-new-submit-button"]').click()
    
    // Should redirect to view page after creation
    cy.url().should('include', '/creates/')
    cy.url().should('not.include', '/creates/new')
    
    // Verify the create name is displayed on view page (in a text field, not h1)
    cy.get('input[readonly]').first().should('have.value', itemName)
  })

  it('should search for creates', () => {
    // First create a create with a unique name
    cy.visit('/creates/new')
    const timestamp = Date.now()
    const itemName = `search-test-create-${timestamp}`
    
    cy.get('[data-automation-id="create-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="create-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="create-new-status-input"]').type('active')
    cy.get('[data-automation-id="create-new-submit-button"]').click()
    cy.url().should('include', '/creates/')
    
    // Navigate to list page
    cy.visit('/creates')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the create
    cy.get('[data-automation-id="create-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the create
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all creates are shown again
    cy.get('[data-automation-id="create-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
