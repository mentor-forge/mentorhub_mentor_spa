export function validatePlanSelection(planId: string): string | null {
  if (!planId) {
    return 'Select a plan to continue.'
  }
  return null
}
