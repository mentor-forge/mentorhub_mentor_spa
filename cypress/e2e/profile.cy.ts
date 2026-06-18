describe('Mentor Dashboard', () => {
  beforeEach(() => {
    cy.loginAsMentor('/profiles')
  })

  it('should display the dashboard heading', () => {
    cy.get('[data-automation-id="profile-dashboard-heading"]')
      .should('be.visible')
      .and('contain', 'Dashboard')
  })

  it('should show mentee cards from GET /api/profile', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .should('have.length.at.least', 1)

    cy.get('[data-automation-id="profile-dashboard-card"]').first().within(() => {
      cy.get('.v-card-title').should('not.be.empty')
      cy.contains('.v-chip', 'Library:').should('be.visible')
      cy.contains('.v-chip', 'Now:').should('be.visible')
      cy.contains('.v-chip', 'Next:').should('be.visible')
    })
  })

  it('should navigate to a mentee profile when a card is clicked', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .first()
      .click()

    cy.url().should('match', /\/profiles\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="mentee-section-heading"]').should('be.visible')
    cy.get('[data-automation-id="mentee-properties-button"]').should('be.visible')
  })

  it('should open properties from the mentee section only', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('[data-automation-id="mentee-properties-button"]').click()
    cy.url().should('match', /\/profiles\/[0-9a-fA-F]{24}\/properties$/)
    cy.get('[data-automation-id="profile-properties-summary"]').should('be.visible')
  })

  it('should not have a new profile button (read-only)', () => {
    cy.get('button').contains('New Profile').should('not.exist')
  })
})

describe('Mentor Dashboard (unassigned mentor)', () => {
  it('should show empty state when the mentor has no mentees', () => {
    cy.login(['admin'])
    cy.visit('/profiles')

    cy.get('[data-automation-id="profile-dashboard-heading"]').should('be.visible')
    cy.get('[data-automation-id="profile-dashboard-empty"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'No mentees are assigned to you yet.')
  })
})
