// Cypress E2E support file — auth via spa_utils (JWT + localStorage, no login UI).

import { registerAuthCommands } from '@mentor-forge/mentorhub_spa_utils/cypress/registerAuthCommands'
import './commands'

registerAuthCommands({ visitPath: '/' })

export {}