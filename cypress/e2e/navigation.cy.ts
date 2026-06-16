describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.loginAndVisit('/resources')
    cy.get('h1').contains('Resources').should('be.visible')
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.openNavDrawer()

    cy.contains('.v-navigation-drawer--active', 'RESOURCE DOMAIN').should('be.visible')
    cy.contains('.v-navigation-drawer--active', 'PATH DOMAIN').should('be.visible')
    cy.contains('.v-navigation-drawer--active', 'PLAN DOMAIN').should('be.visible')
    cy.contains('.v-navigation-drawer--active', 'ENCOUNTER DOMAIN').should('be.visible')
    cy.contains('.v-navigation-drawer--active', 'EVENT DOMAIN').should('be.visible')
    cy.get('[data-automation-id="nav-profiles-list-link"]')
      .scrollIntoView()
      .find('.v-list-item-title')
      .should('contain', 'Dashboard')
  })

  it('should have all resource domain links in drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-resources-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-resources-new-link"]').should('be.visible')
  })

  it('should have all path domain links in drawer', () => {
    cy.visit('/paths')
    cy.get('h1').contains('Paths').should('be.visible')
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-paths-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-paths-new-link"]').should('be.visible')
  })

  it('should have all plan domain links in drawer', () => {
    cy.visit('/plans')
    cy.get('h1').contains('Plans').should('be.visible')
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-plans-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-plans-new-link"]').should('be.visible')
  })

  it('should have all encounter domain links in drawer', () => {
    cy.visit('/encounters')
    cy.get('h1').contains('Encounters').should('be.visible')
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-encounters-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-encounters-new-link"]').should('be.visible')
  })

  it('should have all event domain links in drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-events-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-events-new-link"]').should('be.visible')
  })

  it('should have dashboard link in drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-profiles-list-link"]')
      .scrollIntoView()
      .should('be.visible')
    cy.get('[data-automation-id="nav-profiles-list-link"] .v-list-item-title')
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

    cy.get('[data-automation-id="nav-profiles-list-link"]').scrollIntoView().click()
    cy.url().should('include', '/profiles')
    cy.get('[data-automation-id="profile-dashboard-heading"]')
      .should('be.visible')
      .and('contain', 'Dashboard')
  })

  it('should have admin and logout at bottom of drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-events-list-link"]').click()
    cy.url().should('include', '/events')
    cy.get('h1').contains('Events').should('be.visible')
  })

  it('should close drawer after navigation', () => {
    cy.openNavDrawer()

    cy.get('[data-automation-id="nav-events-list-link"]').click()
    cy.url().should('include', '/events')

    cy.get('.v-navigation-drawer', { timeout: 5000 })
      .should('not.have.class', 'v-navigation-drawer--active')
  })
})
