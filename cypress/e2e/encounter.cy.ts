describe('Encounter Domain', () => {
  beforeEach(() => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })
  })

  it('should create an encounter from ProfileEditPage plan dialog', () => {
    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-dialog"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()

    cy.url().should('match', /\/mentor\/encounter\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="encounter-detail-heading"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-profile-section"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-checklist-section"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-profile-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="encounter-detail-checklist-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="encounter-detail-date-input"]').find('input[type="date"]').should('exist')
    cy.get('[data-automation-id="encounter-detail-status-select"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').should('exist')
  })

  it('should update encounter TLDR on detail page', () => {
    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
    cy.url().should('match', /\/mentor\/encounter\/[0-9a-fA-F]{24}$/)

    const tldr = `Cypress encounter ${Date.now()}`
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').clear().type(tldr)
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').blur()
    cy.wait(1000)
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').should('have.value', tldr)
  })

  it('should open encounter detail from profile encounters list and go back', () => {
    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
    cy.url().should('match', /\/mentor\/encounter\/[0-9a-fA-F]{24}$/)

    cy.get('[data-automation-id="encounter-detail-back-button"]').click()
    cy.url().should('match', /\/mentor\/mentee\/[0-9a-fA-F]{24}$/)

    cy.get('[data-automation-id="profile-edit-encounter-item"]').first().click()
    cy.url().should('match', /\/mentor\/encounter\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="encounter-detail-heading"]').should('be.visible')
  })
})
