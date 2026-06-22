describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.loginAndVisit('/resources')
    cy.get('h1').contains('Resources').should('be.visible')
  })

  it('should open navigation drawer with simplified links', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-dashboard-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-resources-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-learning-paths-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-encounter-plans-link"]').should('be.visible')
    cy.contains('.v-navigation-drawer--active', 'RESOURCE DOMAIN').should('not.exist')
    cy.contains('.v-navigation-drawer--active', 'EVENT DOMAIN').should('not.exist')
  })

  it('should show dashboard as the first drawer item', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-dashboard-link"] .v-list-item-title')
      .should('contain', 'Dashboard')
  })

  it('should land on the mentor dashboard after login at /', () => {
    cy.loginAsMentor()
    cy.url().should('include', '/profiles')
    cy.get('[data-automation-id="profile-dashboard-heading"]')
      .should('be.visible')
      .and('contain', 'Dashboard')
    cy.get('table').should('not.exist')
  })

  it('should navigate to the dashboard from drawer', () => {
    cy.loginAsMentor('/resources')
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-dashboard-link"]').click()
    cy.url().should('include', '/profiles')
    cy.get('[data-automation-id="profile-dashboard-heading"]')
      .should('be.visible')
      .and('contain', 'Dashboard')
  })

  it('should navigate to resources from drawer', () => {
    cy.loginAsMentor('/profiles')
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-resources-link"]').click()
    cy.url().should('include', '/resources')
    cy.get('h1').contains('Resources').should('be.visible')
  })

  it('should navigate to learning paths from drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-learning-paths-link"]').click()
    cy.url().should('include', '/paths')
    cy.get('h1').contains('Paths').should('be.visible')
  })

  it('should navigate to encounter plans from drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-encounter-plans-link"]').click()
    cy.url().should('include', '/plans')
    cy.get('h1').contains('Plans').should('be.visible')
  })

  it('should have admin and logout at bottom of drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should close drawer after navigation', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-learning-paths-link"]').click()
    cy.url().should('include', '/paths')

    cy.get('.v-navigation-drawer', { timeout: 5000 })
      .should('not.have.class', 'v-navigation-drawer--active')
  })
})
