describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Check that drawer is visible with domain sections
    cy.contains('RESOURCE DOMAIN').should('be.exist')
    cy.contains('PATH DOMAIN').should('be.exist')
    cy.contains('PLAN DOMAIN').should('be.exist')
    cy.contains('ENCOUNTER DOMAIN').should('be.exist')
    cy.contains('EVENT DOMAIN').should('be.exist')
    cy.contains('PROFILE DOMAIN').should('be.exist')
  })
  it('should have all resource domain links in drawer', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-resources-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-resources-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all path domain links in drawer', () => {
    cy.visit('/paths')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-paths-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-paths-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all plan domain links in drawer', () => {
    cy.visit('/plans')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-plans-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-plans-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all encounter domain links in drawer', () => {
    cy.visit('/encounters')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-encounters-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-encounters-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all event domain links in drawer', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-events-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have profile domain link in drawer', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-profiles-list-link"]').scrollIntoView().should('be.visible')
  })

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Admin and Logout should be visible in the drawer
    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().click()
    cy.url().should('include', '/events')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/resources')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').scrollIntoView().click()
    
    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('RESOURCE DOMAIN').should('not.be.visible')
  })
})