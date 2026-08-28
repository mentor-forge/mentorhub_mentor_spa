describe('Resource Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should create a new resource', () => {
    cy.visit('/mentor/resources/new')
    
    const timestamp = Date.now()
    const itemName = `test-resource-${timestamp}`
    
    cy.get('[data-automation-id="resource-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="resource-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="resource-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/mentor/resources/')
    cy.url().should('not.include', '/mentor/resources/new')
    
    // Verify the resource name is displayed on edit page
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a resource and have a Browse Resources link to Discovery', () => {
    // First create a resource
    cy.visit('/mentor/resources/new')
    const timestamp = Date.now()
    const itemName = `test-resource-update-${timestamp}`
    const updatedName = `updated-resource-${timestamp}`
    
    cy.get('[data-automation-id="resource-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="resource-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="resource-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/mentor/resources/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').blur()
    cy.wait(1000)
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="resource-edit-description-input"]').find('input').clear().type('Updated description')
    cy.get('[data-automation-id="resource-edit-description-input"]').find('input').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="resource-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Verify browse link points to Discovery
    cy.get('[data-automation-id="resource-edit-browse-resources-link"]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /:8080\/discovery\/resources$/)
    
    // Verify persistence on reload
    cy.reload()
    cy.get('[data-automation-id="resource-edit-name-input"]').find('input').should('have.value', updatedName)
    cy.get('[data-automation-id="resource-edit-description-input"]').find('input').should('have.value', 'Updated description')
  })
})
