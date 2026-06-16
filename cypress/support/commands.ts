// Mentor SPA Cypress commands (extends spa_utils auth).

const defaultVisitPath = '/'

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

Cypress.Commands.add('loginAsMentor', (visitPath = defaultVisitPath) => {
  const mentorUser = Cypress.env('MENTOR_DASHBOARD_USER') as string
  seedAuthAndVisit(['mentor', 'admin'], visitPath, mentorUser)
})

/** Seed auth and land on a route without the default `/` → dashboard redirect. */
Cypress.Commands.add('loginAndVisit', (path: string, roles: string[] = ['admin']) => {
  seedAuthAndVisit(roles, path)
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
      /** Login as seeded mentor profile (default user: marti) for dashboard tests. */
      loginAsMentor(visitPath?: string): Chainable<void>
      /** Programmatic login then visit a path (skips `/` dashboard redirect). */
      loginAndVisit(path: string, roles?: string[]): Chainable<void>
      /** Open the temporary nav drawer and wait until it is active. */
      openNavDrawer(): Chainable<void>
      /** Close the temporary nav drawer. */
      closeNavDrawer(): Chainable<void>
    }
  }
}

export {}
