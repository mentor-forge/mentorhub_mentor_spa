import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { redirectToDiscoveryDashboard } from './useDiscoveryRedirect'
import * as spaUtils from '@mentor-forge/mentorhub_spa_utils'

describe('useDiscoveryRedirect', () => {
  const originalLocation = window.location

  beforeEach(() => {
    delete (window as any).location
    window.location = {
      ...originalLocation,
      replace: vi.fn(),
    } as any
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('redirects to the discovery dashboard using window.location.replace', () => {
    const buildJourneyUrlSpy = vi.spyOn(spaUtils, 'buildJourneyUrl')
    redirectToDiscoveryDashboard()
    expect(buildJourneyUrlSpy).toHaveBeenCalledWith('discovery')
    expect(window.location.replace).toHaveBeenCalledWith(expect.stringContaining('/discovery/'))
  })
})
