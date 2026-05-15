describe('{{ item }} Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display {{item | lower}}s list page', () => {
    cy.visit('/{{item | lower}}s')
    cy.get('h1').contains('{{item}}s').should('be.visible')
    cy.get('[data-automation-id="{{item | lower}}-list-new-button"]').should('be.visible')
  })

  it('should navigate to new {{item | lower}} page', () => {
    cy.visit('/{{item | lower}}s')
    cy.get('[data-automation-id="{{item | lower}}-list-new-button"]').click()
    cy.url().should('include', '/{{item | lower}}s/new')
    cy.get('h1').contains('New {{item}}').should('be.visible')
  })

  it('should create a new {{item | lower}}', () => {
    cy.visit('/{{item | lower}}s/new')
    
    const timestamp = Date.now()
    const itemName = `test-{{item | lower}}-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="{{item | lower}}-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="{{item | lower}}-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="{{item | lower}}-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/{{item | lower}}s/')
    cy.url().should('not.include', '/{{item | lower}}s/new')
    
    // Verify the {{item | lower}} name is displayed on edit page
    cy.get('[data-automation-id="{{item | lower}}-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a {{item | lower}}', () => {
    // First create a {{item | lower}}
    cy.visit('/{{item | lower}}s/new')
    const timestamp = Date.now()
    const itemName = `test-{{item | lower}}-update-${timestamp}`
    const updatedName = `updated-{{item | lower}}-${timestamp}`
    
    cy.get('[data-automation-id="{{item | lower}}-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="{{item | lower}}-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="{{item | lower}}-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/{{item | lower}}s/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="{{item | lower}}-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="{{item | lower}}-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="{{item | lower}}-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="{{item | lower}}-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="{{item | lower}}-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="{{item | lower}}-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the {{item | lower}} appears with updated name
    cy.get('[data-automation-id="{{item | lower}}-edit-back-button"]').click()
    cy.url().should('include', '/{{item | lower}}s')
    
    // Search for the updated {{item | lower}}
    cy.get('[data-automation-id="{{item | lower}}-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the {{item | lower}} appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all {{item | lower}}s are shown again
    cy.get('[data-automation-id="{{item | lower}}-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for {{item | lower}}s', () => {
    // First create a {{item | lower}} with a unique name
    cy.visit('/{{item | lower}}s/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="{{item | lower}}-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="{{item | lower}}-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="{{item | lower}}-new-submit-button"]').click()
    cy.url().should('include', '/{{item | lower}}s/')
    
    // Navigate to list page
    cy.visit('/{{item | lower}}s')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the {{item | lower}}
    cy.get('[data-automation-id="{{item | lower}}-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the {{item | lower}}
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all {{item | lower}}s are shown again
    cy.get('[data-automation-id="{{item | lower}}-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})

