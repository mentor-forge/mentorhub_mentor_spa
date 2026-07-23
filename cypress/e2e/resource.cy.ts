describe('Resource Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display resources list page', () => {
    cy.visit('/resources')
    cy.get('h1').contains('Resources').should('be.visible')
    cy.get('[data-automation-id="resource-list-new-button"]').should('be.visible')
    cy.get('[data-automation-id="resource-list-grid"]').should('be.visible')
    cy.get('table').should('not.exist')
  })

  it('should navigate to new resource page', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="resource-list-new-button"]').click()
    cy.url().should('include', '/resources/new')
    cy.get('h1').contains('New Resource').should('be.visible')
  })

  it('should load additional resource cards with offset paging', () => {
    let requestCount = 0
    const firstPage = Array.from({ length: 20 }, (_, index) => ({
      _id: `${index + 1}`.padStart(24, '0'),
      name: `resource-${index + 1}`,
      description: `Resource description ${index + 1}`,
    }))
    const secondPage = [{
      _id: '000000000000000000000021',
      name: 'resource-21',
      description: 'Resource description 21',
    }]

    cy.intercept('GET', '/api/resource*', (request) => {
      requestCount += 1
      expect(request.headers.offset).to.equal(requestCount === 1 ? '0' : '20')
      expect(request.headers.size).to.equal('20')
      request.reply({
        body: requestCount === 1 ? firstPage : secondPage,
        headers: { 'X-Pagination-Returned': requestCount === 1 ? '20' : '1' },
      })
    }).as('getResources')

    cy.visit('/resources')
    cy.wait('@getResources')
    cy.get('[data-automation-id="resource-list-grid"] .mh-card').should('have.length', 20)
    cy.get('[data-automation-id="resource-list-load-more"]').click()
    cy.wait('@getResources')
    cy.get('[data-automation-id="resource-list-grid"] .mh-card').should('have.length', 21)
    cy.get('[data-automation-id="resource-list-grid"]').should('contain', 'Resource description 21')
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
    cy.get('[data-automation-id="resource-list-grid"]').should('contain', updatedName)
    
    // Clear search and verify all resources are shown again
    cy.get('[data-automation-id="resource-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="resource-list-grid"]').should('exist')
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
    cy.get('[data-automation-id="resource-list-grid"]').should('exist')
    
    // Search for the resource
    cy.get('[data-automation-id="resource-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the resource
    cy.get('[data-automation-id="resource-list-grid"]').should('contain', itemName)
    
    // Clear search and verify all resources are shown again
    cy.get('[data-automation-id="resource-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('[data-automation-id="resource-list-grid"]').should('exist')
  })
})
