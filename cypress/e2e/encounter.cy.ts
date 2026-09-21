describe('Encounter Domain', () => {
  it('should show active encounter editable fields and End Encounter button', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.createTestEncounter(profileId, 'active').then((encounterId) => {
        cy.loginAsMentor(`/mentor/encounter/${encounterId}`)

        cy.get('[data-automation-id="encounter-detail-profile-link"]').should('be.visible')
        cy.get('[data-automation-id="encounter-detail-profile-section"]').should('be.visible')
        cy.get('[data-automation-id="encounter-detail-checklist-section"]').should('be.visible')
        cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('be.visible')
        cy.get('[data-automation-id="encounter-detail-profile-section"]').should('have.class', 'mh-card')
        cy.get('[data-automation-id="encounter-detail-checklist-section"]').should('have.class', 'mh-card')
        cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('have.class', 'mh-card')

        // First card title bar displays mentee name before date-time
        cy.get('[data-automation-id="encounter-detail-profile-link"]')
          .invoke('text')
          .should('match', /.+ — ./)

        // Mentee card does not contain profile goals
        cy.get('[data-automation-id="encounter-detail-profile-goals"]').should('not.exist')

        // Encounter card is collapsed on page load for an active encounter
        cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('have.class', 'mh-card--collapsed')

        // Transcript card is open by default for an active encounter
        cy.get('[data-automation-id="encounter-detail-transcript-section"]')
          .should('be.visible')
          .and('not.have.class', 'mh-card--collapsed')

        // End Encounter and Back buttons visible inside Mentee card title bar
        cy.get('[data-automation-id="encounter-detail-profile-section"]')
          .find('[data-automation-id="encounter-detail-end-button"]')
          .should('be.visible')
          .and('have.attr', 'title', 'End Encounter')
          .and('contain.html', 'mdi-stop')
        cy.get('[data-automation-id="encounter-detail-profile-section"]')
          .find('[data-automation-id="encounter-detail-back-button"]')
          .should('be.visible')

        // Plan counts badge tooltips if present
        cy.get('body').then(($body) => {
          if ($body.find('[data-automation-id="encounter-detail-plan-counts"]').length > 0) {
            cy.get('[data-automation-id="encounter-detail-plan-count-library"]').should('have.attr', 'title', 'Library')
            cy.get('[data-automation-id="encounter-detail-plan-count-now"]').should('have.attr', 'title', 'Now')
            cy.get('[data-automation-id="encounter-detail-plan-count-next"]').should('have.attr', 'title', 'Next')
          }
        })

        // Status is read-only; encounter date is in Mentee card title bar, not in Encounter card
        cy.get('[data-automation-id^="encounter-detail-date-input"]').should('not.exist')
        cy.get('[data-automation-id^="encounter-detail-status-select"]').should('exist')

        // Active encounter: TLDR, Summary, and Checklist are editable
        cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').should('exist').and('not.be.disabled')
        cy.get('[data-automation-id="encounter-detail-summary-input"]').find('textarea').should('exist').and('not.be.disabled')
        cy.get('[data-automation-id="encounter-detail-checklist-section"]')
          .find('input[type="checkbox"]')
          .each(($cb) => {
            cy.wrap($cb).should('not.be.disabled')
          })
      })
    })
  })

  it('should update encounter TLDR on active detail page', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.createTestEncounter(profileId, 'active').then((encounterId) => {
        cy.loginAsMentor(`/mentor/encounter/${encounterId}`)

        // Expand encounter section since it is collapsed by default for active encounters
        cy.get('[data-automation-id="encounter-detail-encounter-section-collapse-button"]').click()
        cy.get('[data-automation-id="encounter-detail-encounter-section"]').should('not.have.class', 'mh-card--collapsed')

        const tldr = `Cypress encounter ${Date.now()}`
        cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').clear().type(tldr)
        cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').blur()
        cy.wait(1000)
        cy.get('[data-automation-id="encounter-detail-tldr-input"]').find('input').should('have.value', tldr)
      })
    })
  })

  it('should finish active encounter when End Encounter button is clicked and appear in mentee encounters list', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.createTestEncounter(profileId, 'active').then((encounterId) => {
        cy.loginAsMentor(`/mentor/encounter/${encounterId}`)

        cy.intercept('POST', '**/api/encounter/*/finish').as('finishEncounter')
        cy.get('[data-automation-id="encounter-detail-end-button"]').should('be.visible').click()
        cy.wait('@finishEncounter')

        // End Encounter button should disappear after finish
        cy.get('[data-automation-id="encounter-detail-end-button"]').should('not.exist')

        // Checkboxes should become disabled
        cy.get('[data-automation-id="encounter-detail-checklist-section"]')
          .find('input[type="checkbox"]')
          .each(($cb) => {
            cy.wrap($cb).should('be.disabled')
          })

        // Return to mentee profile page and verify encounter appears in completed encounters list
        cy.get('[data-automation-id="encounter-detail-back-button"]').click()
        cy.url().should('match', new RegExp(`/mentor/mentee/${profileId}$`))
        cy.get('[data-automation-id="profile-edit-encounters-list"]').should('be.visible')
        cy.get(`[data-automation-id="profile-edit-encounter-date-link"][href*="${encounterId}"]`).should('exist')
      })
    })
  })

  it('should render complete encounter as read-only with disabled checkboxes and no End Encounter button', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.createTestEncounter(profileId, 'complete').then((encounterId) => {
        cy.loginAsMentor(`/mentor/encounter/${encounterId}`)

        cy.get('[data-automation-id="encounter-detail-end-button"]').should('not.exist')
        cy.get('[data-automation-id="encounter-detail-checklist-section"]')
          .find('input[type="checkbox"]')
          .each(($cb) => {
            cy.wrap($cb).should('be.disabled')
          })

        // Mentor Notes is rendered in read-only mode as markdown
        cy.get('[data-automation-id="encounter-detail-mentor-notes-input"]')
          .find('[data-automation-id="markdown-field-display"]')
          .should('exist')
      })
    })
  })

  it('should open encounter detail and navigate back to mentee profile', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.createTestEncounter(profileId, 'active').then((encounterId) => {
        cy.loginAsMentor(`/mentor/encounter/${encounterId}`)

        cy.get('[data-automation-id="encounter-detail-back-button"]').click()
        cy.url().should('match', new RegExp(`/mentor/mentee/${profileId}$`))
      })
    })
  })
})
