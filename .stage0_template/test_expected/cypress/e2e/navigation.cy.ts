describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Check that drawer is visible with domain sections
    cy.contains('CONTROL DOMAIN').should('be.exist')
    cy.contains('CREATE DOMAIN').should('be.exist')
    cy.contains('CONSUME DOMAIN').should('be.exist')
  })
  it('should have all control domain links in drawer', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-controls-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-controls-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have all create domain links in drawer', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-creates-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-creates-new-link"]').scrollIntoView().should('be.visible')
  })
  it('should have consume domain link in drawer', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-consumes-list-link"]').scrollIntoView().should('be.visible')
  })

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Admin and Logout should be visible in the drawer
    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-creates-list-link"]').scrollIntoView().click()
    cy.url().should('include', '/creates')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/controls')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-creates-list-link"]').scrollIntoView().click()
    
    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('CONTROL DOMAIN').should('not.be.visible')
  })
})