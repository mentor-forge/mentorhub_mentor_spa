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
    cy.get('[data-automation-id="profile-dashboard-grid"]').should('be.visible')
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .should('have.length.at.least', 1)

    cy.get('[data-automation-id="profile-dashboard-card"]').first().within(() => {
      cy.get('.mh-card__title').should('not.be.empty')
      cy.get('.mh-card__body').should('not.be.empty')
      cy.get('.v-chip').should('not.exist')
      cy.contains('Last encounter').should('not.exist')
    })
  })

  it('should navigate to ProfileEditPage from a card action', () => {
    cy.get('[data-automation-id="profile-dashboard-card-open-button"]', { timeout: 10000 })
      .first()
      .click()

    cy.url().should('match', /\/profiles\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="profile-edit-heading"]').should('be.visible')
    cy.contains('h1', 'View Profile').should('not.exist')
  })

  it('should show Profile, Notes, and Encounters sections on ProfileEditPage', () => {
    cy.get('[data-automation-id="profile-dashboard-card-open-button"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('[data-automation-id="profile-edit-profile-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-notes-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="profile-edit-notes-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="profile-edit-profile-section-collapse-button"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-notes-section-collapse-button"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-profile-name-display"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-notes-focus-input"]').find('input').should('exist')
  })

  it('should update typed mentor notes fields on ProfileEditPage', () => {
    cy.get('[data-automation-id="profile-dashboard-card-open-button"]', { timeout: 10000 })
      .first()
      .click()

    const focus = `Cypress focus ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-notes-focus-input"]').find('input').clear().type(focus).blur()
    cy.get('[data-automation-id="profile-edit-notes-focus-input"]').find('input').should('have.value', focus)
  })

  it('should create encounter from ProfileEditPage plan dialog', () => {
    cy.get('[data-automation-id="profile-dashboard-card-open-button"]', { timeout: 10000 })
      .first()
      .click()

    cy.url().should('match', /\/profiles\/[0-9a-fA-F]{24}$/).then((profileUrl) => {
      const profileId = profileUrl.match(/\/profiles\/([0-9a-fA-F]{24})$/)?.[1]
      expect(profileId).to.match(/^[0-9a-fA-F]{24}$/)

      cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
      cy.get('[data-automation-id="profile-edit-new-encounter-plan-dialog"]').should('be.visible')
      cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
      cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
      cy.url().should('match', /\/encounters\/[0-9a-fA-F]{24}$/)
      cy.url().should('not.include', '/encounters/new')
    })
  })

  it('should not have a new profile button (read-only)', () => {
    cy.get('button').contains('New Profile').should('not.exist')
  })

  it('should not show a Properties button on dashboard or ProfileEditPage', () => {
    cy.get('button').contains('Properties').should('not.exist')

    cy.get('[data-automation-id="profile-dashboard-card-open-button"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('button').contains('Properties').should('not.exist')
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
