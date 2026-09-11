describe('Profile Edit Page', () => {
  beforeEach(() => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })
  })

  it('should show Name and Encounters cards, and hide Breadcrumbs for mentor role', () => {
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('have.class', 'mh-card')

    // Minimal Profile data and editable mentee inputs in Name card
    cy.get('[data-automation-id="profile-edit-goals-display"]').should('exist')
    cy.get('[data-automation-id="profile-edit-interests-display"]').should('exist')
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').should('exist')
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').should('exist')

    // Breadcrumbs card must not be visible to mentor without admin role
    cy.get('[data-automation-id="profile-edit-breadcrumbs-section"]').should('not.exist')
  })

  it('should show Breadcrumbs card when user has admin role', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.login(['mentor', 'admin'], `/mentor/mentee/${profileId}`)
      cy.get('[data-automation-id="profile-edit-breadcrumbs-section"]').should('be.visible')
      cy.get('[data-automation-id="profile-edit-status-display"]').should('exist')
      cy.get('[data-automation-id="profile-edit-created-breadcrumb"]').should('exist')
      cy.get('[data-automation-id="profile-edit-saved-breadcrumb"]').should('exist')
    })
  })

  it('should have a mailto link when mentee has an email address', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-automation-id="profile-edit-mentee-mailto-link"]').length > 0) {
        cy.get('[data-automation-id="profile-edit-mentee-mailto-link"]')
          .should('have.attr', 'href')
          .and('match', /^mailto:/)
      }
    })
  })

  it('should update mentee summary and notes fields', () => {
    const summary = `Cypress summary ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').find('input').clear().type(summary).blur()
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').find('input').should('have.value', summary)

    const notes = `Cypress notes ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').find('textarea').clear().type(notes).blur()
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').find('textarea').should('have.value', notes)
  })

  it('should create encounter from ProfileEditPage plan dialog', () => {
    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-dialog"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
    cy.url().should('match', /\/mentor\/encounter\/[0-9a-fA-F]{24}$/)
  })

  it('should have a Back to Dashboard link pointing to Discovery', () => {
    cy.get('[data-automation-id="profile-edit-dashboard-link"]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /:8080\/discovery\/$/)
  })

  it('should not have a new profile button (read-only)', () => {
    cy.get('button').contains('New Profile').should('not.exist')
  })

  it('should not show a Properties button on ProfileEditPage', () => {
    cy.get('button').contains('Properties').should('not.exist')
  })
})
