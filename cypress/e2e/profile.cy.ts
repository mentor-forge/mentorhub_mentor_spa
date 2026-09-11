describe('Profile Edit Page', () => {
  beforeEach(() => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })
  })

  it('should show Name and Encounters cards, and hide Breadcrumbs for mentor role', () => {
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('have.class', 'mh-card')
    cy.get('[data-automation-id="profile-edit-profile-section"]').should('contain.text', 'Mentee:')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-encounters-section"]').should('have.class', 'mh-card')

    // Minimal Profile data and editable mentee inputs in Name card
    cy.get('[data-automation-id="profile-edit-goals-display"]').should('exist')
    cy.get('[data-automation-id="profile-edit-interests-display"]').should('exist')
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').should('exist')
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').should('exist')

    // Breadcrumbs card must not be visible to mentor without admin role
    cy.get('[data-automation-id="profile-edit-breadcrumbs-section"]').should('not.exist')
  })

  it('should show Breadcrumbs card when user has admin role', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`, ['mentor', 'admin'])
      cy.get('[data-automation-id="profile-edit-breadcrumbs-section"]').should('be.visible')
      cy.get('[data-automation-id="profile-edit-status-display"]').should('exist')
      cy.get('[data-automation-id="profile-edit-created-breadcrumb"]').should('exist')
      cy.get('[data-automation-id="profile-edit-saved-breadcrumb"]').should('exist')
    })
  })

  it('should have a mailto link when mentee has an email address', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-automation-id="profile-edit-mentee-mailto-link"]').length > 0) {
        cy.get('[data-automation-id="profile-edit-mentee-mailto-link"]')
          .should('have.attr', 'href')
          .and('match', /^mailto:/)
      }
    })
  })

  it('should have a link on the Mentee card title that links to /customer/profile/:id', () => {
    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
      cy.get('[data-automation-id="profile-edit-customer-profile-link"]')
        .should('be.visible')
        .and('have.attr', 'href')
        .and('match', new RegExp(`/customer/profile/${profileId}$`))
    })
  })

  it('should display completed encounters in Encounters card with date linking to detail page', () => {
    cy.intercept('GET', '**/api/profile/*', (req) => {
      req.continue((res) => {
        if (res.body) {
          res.body.encounters = [
            {
              _id: '67a000000000000000000010',
              mentor_id: 'mentor-1',
              mentee_id: res.body.profile?._id,
              status: 'complete',
              date: '2026-08-15',
              tldr: 'Completed milestone review',
            },
            {
              _id: '67a000000000000000000011',
              mentor_id: 'mentor-1',
              mentee_id: res.body.profile?._id,
              status: 'scheduled',
              date: '2026-08-20',
              tldr: 'Future scheduled encounter',
            },
          ]
        }
      })
    })

    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })

    cy.get('[data-automation-id="profile-edit-encounters-list"]').should('be.visible')
    cy.get('[data-automation-id="profile-edit-encounter-item"]').should('have.length', 1)
    cy.get('[data-automation-id="profile-edit-encounter-item"]').first().should('contain.text', 'Completed milestone review')
    cy.get('[data-automation-id="profile-edit-encounter-date-link"]')
      .should('have.attr', 'href', '/mentor/encounter/67a000000000000000000010')
  })

  it('should update mentee summary and notes fields', () => {
    const summary = `Cypress summary ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').find('input').clear().type(summary).blur()
    cy.get('[data-automation-id="profile-edit-mentee-summary-input"]').find('input').should('have.value', summary)

    const notes = `Cypress notes ${Date.now()}`
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').find('textarea').clear().type(notes).blur()
    cy.get('[data-automation-id="profile-edit-mentee-notes-input"]').find('textarea').should('have.value', notes)
  })

  it('should open and cancel schedule encounters dialog', () => {
    cy.get('[data-automation-id="profile-edit-schedule-encounters-button"]').click()
    cy.get('[data-automation-id="profile-edit-schedule-encounters-dialog"]').should('be.visible')
    cy.get('[data-automation-id="schedule-encounters-cancel-button"]').click()
    cy.get('[data-automation-id="profile-edit-schedule-encounters-dialog"]').should('not.exist')
  })

  it('should open and submit schedule encounters dialog', () => {
    cy.intercept('POST', '**/api/encounter/schedule').as('scheduleEncounters')
    cy.get('[data-automation-id="profile-edit-schedule-encounters-button"]').click()
    cy.get('[data-automation-id="profile-edit-schedule-encounters-dialog"]').should('be.visible')
    cy.get('[data-automation-id="schedule-encounters-submit-button"]').should('not.be.disabled').click()
    cy.wait('@scheduleEncounters')
    cy.get('[data-automation-id="profile-edit-schedule-encounters-dialog"]').should('not.exist')
  })

  it('should show Start Encounter button when next scheduled encounter is today, and navigate on click', () => {
    const d = new Date()
    const todayStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    cy.intercept('GET', '**/api/profile/*', (req) => {
      req.continue((res) => {
        if (res.body) {
          res.body.encounters = [
            {
              _id: '67a000000000000000000001',
              mentor_id: 'mentor-1',
              mentee_id: res.body.profile?._id,
              status: 'scheduled',
              date: todayStr,
            },
          ]
        }
      })
    })

    cy.intercept('POST', '**/api/encounter/*/start', {
      statusCode: 200,
      body: {
        _id: '67a000000000000000000001',
        status: 'active',
      },
    }).as('startEncounter')

    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })

    cy.get('[data-automation-id="profile-edit-start-encounter-button"]').should('be.visible').click()
    cy.wait('@startEncounter')
    cy.url().should('match', /\/mentor\/encounter\/67a000000000000000000001$/)
  })

  it('should not show Start Encounter button when next scheduled encounter is in future', () => {
    cy.intercept('GET', '**/api/profile/*', (req) => {
      req.continue((res) => {
        if (res.body) {
          res.body.encounters = [
            {
              _id: '67a000000000000000000002',
              mentor_id: 'mentor-1',
              mentee_id: res.body.profile?._id,
              status: 'scheduled',
              date: '2099-01-01',
            },
          ]
        }
      })
    })

    cy.mentorMenteeProfileId().then((profileId) => {
      cy.loginAsMentor(`/mentor/mentee/${profileId}`)
    })

    cy.get('[data-automation-id="profile-edit-start-encounter-button"]').should('not.exist')
  })

  it('should have a Back to Dashboard link pointing to Discovery', () => {
    cy.get('[data-automation-id="profile-edit-dashboard-link"]')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /:8080\/discovery\/$/)
  })

  it('should not have a new profile button (read-only)', () => {
    cy.get('button').contains('New Profile').should('not.exist')
  })

  it('should not show a Properties button on ProfileEditPage', () => {
    cy.get('button').contains('Properties').should('not.exist')
  })
})
