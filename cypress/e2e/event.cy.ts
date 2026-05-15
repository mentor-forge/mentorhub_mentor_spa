describe('Event Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display events list page', () => {
    cy.visit('/events')
    cy.get('h1').contains('Events').should('be.visible')
    cy.get('[data-automation-id="event-list-new-button"]').should('be.visible')
  })

  it('should navigate to new event page', () => {
    cy.visit('/events')
    cy.get('[data-automation-id="event-list-new-button"]').click()
    cy.url().should('include', '/events/new')
    cy.get('h1').contains('New Event').should('be.visible')
  })

  it('should create a new event document', () => {
    cy.visit('/events/new')
    
    const timestamp = Date.now()
    const itemName = `test-event-${timestamp}`
    
    cy.get('[data-automation-id="event-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="event-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="event-new-status-input"]').type('active')
    cy.get('[data-automation-id="event-new-submit-button"]').click()
    
    // Should redirect to view page after creation
    cy.url().should('include', '/events/')
    cy.url().should('not.include', '/events/new')
    
    // Verify the event name is displayed on view page (in a text field, not h1)
    cy.get('input[readonly]').first().should('have.value', itemName)
  })

  it('should search for events', () => {
    // First create a event with a unique name
    cy.visit('/events/new')
    const timestamp = Date.now()
    const itemName = `search-test-event-${timestamp}`
    
    cy.get('[data-automation-id="event-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="event-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="event-new-status-input"]').type('active')
    cy.get('[data-automation-id="event-new-submit-button"]').click()
    cy.url().should('include', '/events/')
    
    // Navigate to list page
    cy.visit('/events')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the event
    cy.get('[data-automation-id="event-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the event
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all events are shown again
    cy.get('[data-automation-id="event-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
