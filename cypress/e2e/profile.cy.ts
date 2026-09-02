describe('Profile Edit Page', () => {
  beforeEach(() => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })
  })

  it('should show Profile, Notes, and Encounters sections on ProfileEditPage', () => {
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
    const focus = `Cypress focus ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-notes-focus-input"]').find('input').clear().type(focus).blur()
    cy.get('[data-automation-id="profile-edit-notes-focus-input"]').find('input').should('have.value', focus)
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
