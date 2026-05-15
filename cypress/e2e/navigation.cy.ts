describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.login()
  })
{#- Target for "navigate away" tests: first create domain, or first consume when there are no creates. #}
{%- if service.data_domains.creates | length > 0 %}
{%- set nav_cross_item = service.data_domains.creates[0] %}
{%- elif service.data_domains.consumes | length > 0 %}
{%- set nav_cross_item = service.data_domains.consumes[0] %}
{%- elif service.data_domains.controls | length > 1 %}
{%- set nav_cross_item = service.data_domains.controls[1] %}
{%- else %}
{%- set nav_cross_item = service.data_domains.controls[0] %}
{%- endif %}

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Check that drawer is visible with domain sections
    {%- for item in service.data_domains.controls %}
    cy.contains('{{ item | upper }} DOMAIN').should('be.exist')
    {%- endfor %}
    {%- for item in service.data_domains.creates %}
    cy.contains('{{ item | upper }} DOMAIN').should('be.exist')
    {%- endfor %}
    {%- for item in service.data_domains.consumes %}
    cy.contains('{{ item | upper }} DOMAIN').should('be.exist')
    {%- endfor %}
  })

  {%- for item in service.data_domains.controls %}
  it('should have all {{ item | lower }} domain links in drawer', () => {
    cy.visit('/{{ item | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-{{ item | lower }}s-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-{{ item | lower }}s-new-link"]').scrollIntoView().should('be.visible')
  })
  {%- endfor %}
  {%- for item in service.data_domains.creates %}
  it('should have all {{ item | lower }} domain links in drawer', () => {
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-{{ item | lower }}s-list-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-{{ item | lower }}s-new-link"]').scrollIntoView().should('be.visible')
  })
  {%- endfor %}
  {%- for item in service.data_domains.consumes %}
  it('should have {{ item | lower }} domain link in drawer', () => {
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-{{ item | lower }}s-list-link"]').scrollIntoView().should('be.visible')
  })
  {%- endfor %}

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Admin and Logout should be visible in the drawer
    cy.get('[data-automation-id="nav-admin-link"]').scrollIntoView().should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').scrollIntoView().should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-{{ nav_cross_item | lower }}s-list-link"]').scrollIntoView().click()
    cy.url().should('include', '/{{ nav_cross_item | lower }}s')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/{{ service.data_domains.controls[0] | lower }}s')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-{{ nav_cross_item | lower }}s-list-link"]').scrollIntoView().click()
    
    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('{{ service.data_domains.controls[0] | upper }} DOMAIN').should('not.be.visible')
  })
})
