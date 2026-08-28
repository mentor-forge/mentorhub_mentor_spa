import { buildJourneyUrl } from '@mentor-forge/mentorhub_spa_utils'

export function redirectToDiscoveryDashboard(): void {
  window.location.replace(buildJourneyUrl('discovery'))
}
