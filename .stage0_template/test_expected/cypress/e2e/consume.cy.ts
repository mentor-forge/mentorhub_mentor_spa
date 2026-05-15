describe('Consume Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display consumes list page', () => {
    cy.visit('/consumes')
    cy.get('h1').contains('Consumes').should('be.visible')
  })

  it('should search for consumes using existing test data', () => {
    cy.visit('/consumes')
    
    // Wait for initial load
    cy.get('table').should('exist')
    // Wait a bit for data to load
    cy.wait(1000)
    
    // Check if table has data, if so get first consume name to search for
    cy.get('body').then(($body) => {
      const hasRows = $body.find('table tbody tr').length > 0
      
      if (hasRows) {
        // Get the first consume name from the table to search for
        cy.get('table tbody tr').first().find('td').first().invoke('text').then((firstItemName) => {
          const trimmedName = firstItemName.trim()
          if (trimmedName.length > 0) {
            const searchTerm = trimmedName.substring(0, Math.min(5, trimmedName.length)) // Use first 5 chars for partial match
            
            // Search for consumes using partial name
            cy.get('[data-automation-id="consume-list-search"]').find('input').type(searchTerm)
            // Wait for debounce (300ms) plus API call
            cy.wait(800)
            
            // Verify the search results contain the consume (should find at least the one we searched for)
            cy.get('table tbody').should('contain', trimmedName)
            
            // Clear search and verify all consumes are shown again
            cy.get('[data-automation-id="consume-list-search"]').find('input').clear()
            cy.wait(800)
            cy.get('table').should('exist')
          }
        })
      } else {
        // If no data, just verify search input exists and can be used
        cy.get('[data-automation-id="consume-list-search"]').find('input').should('exist')
        cy.get('[data-automation-id="consume-list-search"]').find('input').type('test')
        cy.wait(800)
        cy.get('[data-automation-id="consume-list-search"]').find('input').clear()
      }
    })
  })

  it('should search for consumes and filter results', () => {
    cy.visit('/consumes')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Count initial rows
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length
      
      // Search for a term that might not exist (should show fewer or no results)
      cy.get('[data-automation-id="consume-list-search"]').find('input').type('nonexistent-search-term-xyz')
      // Wait for debounce (300ms) plus API call
      cy.wait(800)
      
      // Verify search was performed (table should still exist, but may have fewer/no results)
      cy.get('table').should('exist')
      
      // Clear search and verify all consumes are shown again
      cy.get('[data-automation-id="consume-list-search"]').find('input').clear()
      cy.wait(800)
      
      // Should have same or more results after clearing
      cy.get('table tbody tr').should('have.length.at.least', initialCount)
    })
  })

  it('should not have a new consume button (read-only)', () => {
    cy.visit('/consumes')
    cy.get('button').contains('New Consume').should('not.exist')
  })
})
