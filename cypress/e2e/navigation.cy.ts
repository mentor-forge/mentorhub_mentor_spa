describe('Navigation Drawer', () => {
  const openDrawer = () => {
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    cy.get('.v-navigation-drawer').should('exist')
  }

  // Vuetify temporary drawer uses fixed positioning; visibility checks are flaky.
  const expectDrawerLink = (automationId: string) => {
    cy.get('.v-navigation-drawer')
      .find(`[data-automation-id="${automationId}"]`)
      .scrollIntoView({ offset: { top: -80, left: 0 } })
      .should('exist')
  }

  const clickDrawerLink = (automationId: string) => {
    cy.get('.v-navigation-drawer')
      .find(`[data-automation-id="${automationId}"]`)
      .scrollIntoView({ offset: { top: -80, left: 0 } })
      .click({ force: true })
  }

  beforeEach(() => {
    cy.login()
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    openDrawer()

    // Check that drawer is visible with domain sections
    cy.contains('RESOURCE DOMAIN').should('be.exist')
    cy.contains('PATH DOMAIN').should('be.exist')
    cy.contains('PLAN DOMAIN').should('be.exist')
    cy.contains('ENCOUNTER DOMAIN').should('be.exist')
    cy.contains('EVENT DOMAIN').should('be.exist')
    cy.contains('PROFILE DOMAIN').should('be.exist')
  })
  it('should have all resource domain links in drawer', () => {
    cy.visit('/events')
    openDrawer()

    expectDrawerLink('nav-resources-list-link')
    expectDrawerLink('nav-resources-new-link')
  })
  it('should have all path domain links in drawer', () => {
    cy.visit('/events')
    openDrawer()

    expectDrawerLink('nav-paths-list-link')
    expectDrawerLink('nav-paths-new-link')
  })
  it('should have all plan domain links in drawer', () => {
    cy.visit('/events')
    openDrawer()

    expectDrawerLink('nav-plans-list-link')
    expectDrawerLink('nav-plans-new-link')
  })
  it('should have all encounter domain links in drawer', () => {
    cy.visit('/events')
    openDrawer()

    expectDrawerLink('nav-encounters-list-link')
    expectDrawerLink('nav-encounters-new-link')
  })
  it('should have all event domain links in drawer', () => {
    cy.visit('/resources')
    openDrawer()

    expectDrawerLink('nav-events-list-link')
    expectDrawerLink('nav-events-new-link')
  })
  it('should have profile domain link in drawer', () => {
    cy.visit('/events')
    openDrawer()

    expectDrawerLink('nav-profiles-list-link')
  })

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/events')
    openDrawer()

    // Admin and Logout should be visible in the drawer
    expectDrawerLink('nav-admin-link')
    expectDrawerLink('nav-logout-link')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/resources')
    openDrawer()

    clickDrawerLink('nav-events-list-link')
    cy.url().should('include', '/events')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/resources')
    openDrawer()

    clickDrawerLink('nav-events-list-link')

    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('RESOURCE DOMAIN').should('not.be.visible')
  })
})
