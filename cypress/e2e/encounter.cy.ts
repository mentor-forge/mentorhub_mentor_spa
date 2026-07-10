describe('Encounter Domain', () => {
  beforeEach(() => {
    cy.loginAsMentor('/profiles')
  })

  it('should create an encounter from ProfileEditPage plan dialog', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-dialog"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()

    cy.url().should('match', /\/encounters\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="encounter-detail-heading"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-profile-section"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-checklist-section"]').should('be.visible')
    cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('be.visible')
  })

  it('should update encounter TLDR on detail page', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
    cy.url().should('match', /\/encounters\/[0-9a-fA-F]{24}$/)

    const tldr = `Cypress encounter ${Date.now()}`
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').clear().type(tldr)
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').blur()
    cy.wait(1000)
    cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').should('have.value', tldr)
  })

  it('should open encounter detail from profile encounters list', () => {
    cy.get('[data-automation-id="profile-dashboard-card"]', { timeout: 10000 })
      .first()
      .click()

    cy.get('[data-automation-id="profile-edit-new-encounter-button"]').click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-item"]').first().click()
    cy.get('[data-automation-id="profile-edit-new-encounter-plan-submit-button"]').click()
    cy.url().should('match', /\/encounters\/[0-9a-fA-F]{24}$/)

    cy.get('[data-automation-id="encounter-detail-back-button"]').click()
    cy.url().should('match', /\/profiles\/[0-9a-fA-F]{24}$/)

    cy.get('[data-automation-id="profile-edit-encounter-item"]').first().click()
    cy.url().should('match', /\/encounters\/[0-9a-fA-F]{24}$/)
    cy.get('[data-automation-id="encounter-detail-heading"]').should('be.visible')
  })

  it('should not expose a standalone encounters list route', () => {
    cy.visit('/encounters', { failOnStatusCode: false })
    cy.url().should('not.match', /\/encounters$/)
  })
})
