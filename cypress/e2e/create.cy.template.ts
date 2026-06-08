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

  it('should create a new {{item | lower}} document', () => {
    cy.visit('/{{item | lower}}s/new')
    
    const timestamp = Date.now()
    const itemName = `test-{{item | lower}}-${timestamp}`
    
    cy.get('[data-automation-id="{{item | lower}}-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="{{item | lower}}-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="{{item | lower}}-new-status-input"]').type('active')
    cy.get('[data-automation-id="{{item | lower}}-new-submit-button"]').click()
    
    // Should redirect to view page after creation
    cy.url().should('include', '/{{item | lower}}s/')
    cy.url().should('not.include', '/{{item | lower}}s/new')
    
    // Verify the {{item | lower}} name is displayed on view page (in a text field, not h1)
    cy.get('input[readonly]').first().should('have.value', itemName)
  })

  it('should search for {{item | lower}}s', () => {
    // First create a {{item | lower}} with a unique name
    cy.visit('/{{item | lower}}s/new')
    const timestamp = Date.now()
    const itemName = `search-test-{{item | lower}}-${timestamp}`
    
    cy.get('[data-automation-id="{{item | lower}}-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="{{item | lower}}-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="{{item | lower}}-new-status-input"]').type('active')
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

