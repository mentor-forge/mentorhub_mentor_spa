// Mentor SPA Cypress commands (extends spa_utils auth).
// Base `cy.login` comes from registerAuthCommands in e2e.ts.

const defaultVisitPath = '/mentor/paths/new'

/** Seed JWT via shared spa_utils task, then visit a path (optional `sub` claim). */
function seedAuthAndVisit(
  roles: string[],
  visitPath: string,
  sub?: string,
): void {
  const secret = Cypress.env('JWT_SECRET') as string

  cy.task<{ token: string; expiresAt: string }>('signCypressJwt', {
    roles,
    secret,
    sub,
  }).then(({ token, expiresAt }) => {
    cy.visit(visitPath, {
      onBeforeLoad(win) {
        win.localStorage.setItem('access_token', token)
        win.localStorage.setItem('token_expires_at', expiresAt)
        win.localStorage.setItem('user_roles', JSON.stringify(roles))
      },
    })
  })

  cy.url({ timeout: 10000 }).should('not.include', '/login')
  cy.wait(300)
}

/** Login as seeded mentor profile (default user: marti) for dashboard tests. */
Cypress.Commands.add('loginAsMentor', (visitPath = defaultVisitPath) => {
  const mentorUser = Cypress.env('MENTOR_DASHBOARD_USER') as string
  seedAuthAndVisit(['mentor', 'admin'], visitPath, mentorUser)
})

/** Programmatic login then visit a path (skips `/` dashboard redirect). */
Cypress.Commands.add('loginAndVisit', (path: string, roles: string[] = ['admin']) => {
  seedAuthAndVisit(roles, path)
})

/** Fetch first mentee profile id for the seeded mentor. */
Cypress.Commands.add('mentorMenteeProfileId', () => {
  const mentorUser = Cypress.env('MENTOR_DASHBOARD_USER') as string
  const secret = Cypress.env('JWT_SECRET') as string

  return cy
    .task<{ token: string; expiresAt: string }>('signCypressJwt', {
      roles: ['mentor', 'admin'],
      secret,
      sub: mentorUser,
    })
    .then(({ token }) => {
      return cy
        .request({
          method: 'GET',
          url: '/mentor/api/profile',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.be.an('array')
          if (!response.body.length || !response.body[0]._id) {
            throw new Error(`Seeded mentor '${mentorUser}' has no mentees returned from GET /mentor/api/profile`)
          }
          return response.body[0]._id as string
        })
    })
})

Cypress.Commands.add('openNavDrawer', () => {
  cy.get('[data-automation-id="nav-drawer-toggle"]')
    .should('be.visible')
    .click({ force: true })
  cy.get('.v-navigation-drawer.v-navigation-drawer--active', { timeout: 5000 })
    .should('exist')
  cy.get('.v-navigation-drawer--active .v-list', { timeout: 5000 })
    .should('be.visible')
})

Cypress.Commands.add('closeNavDrawer', () => {
  cy.get('[data-automation-id="nav-drawer-toggle"]')
    .should('be.visible')
    .click({ force: true })
  cy.get('.v-navigation-drawer', { timeout: 5000 })
    .should('not.have.class', 'v-navigation-drawer--active')
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsMentor(visitPath?: string): Chainable<void>
      loginAndVisit(path: string, roles?: string[]): Chainable<void>
      mentorMenteeProfileId(): Chainable<string>
      openNavDrawer(): Chainable<void>
      closeNavDrawer(): Chainable<void>
    }
  }
}

export {}
