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

    // Event.name is an API enum (arrived | completed | fail | login | logout)
    const eventName = 'login'

    cy.get('[data-automation-id="event-new-name-input"]').type(eventName)
    cy.get('[data-automation-id="event-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="event-new-submit-button"]').click()

    cy.url().should('include', '/events/')
    cy.url().should('not.include', '/events/new')

    cy.get('input[readonly]').first().should('have.value', eventName)
  })

  it('should search for events', () => {
    const eventName = 'arrived'
    const uniqueDescription = `cypress-search-${Date.now()}`

    cy.visit('/events/new')
    cy.get('[data-automation-id="event-new-name-input"]').type(eventName)
    cy.get('[data-automation-id="event-new-description-input"]').type(uniqueDescription)
    cy.get('[data-automation-id="event-new-submit-button"]').click()
    cy.url().should('not.include', '/events/new')

    cy.visit('/events')
    cy.get('table').should('exist')

    cy.get('[data-automation-id="event-list-search"]').find('input').type(eventName)
    cy.wait(800)

    cy.get('table tbody').should('contain', eventName)
    cy.get('table tbody').should('contain', uniqueDescription)

    cy.get('[data-automation-id="event-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
