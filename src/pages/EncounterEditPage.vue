<template>
  <v-container fluid>
    <v-row v-if="isLoading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="encounter">
      <DataCardGrid>
        <v-card
          class="mh-card"
          :class="{ 'mh-card--collapsed': profileCollapsed }"
          variant="outlined"
          rounded="lg"
          elevation="2"
          data-automation-id="encounter-detail-profile-section"
        >
          <v-toolbar
            color="primary"
            density="comfortable"
            class="mh-card__title-bar"
            flat
          >
            <v-toolbar-title class="mh-card__title" data-automation-id="encounter-detail-profile-section-title-display">
              <a
                :href="menteeProfileHref"
                class="text-white text-decoration-none"
                title="Open Profile"
                data-automation-id="encounter-detail-profile-link"
                @click.prevent="goToMenteeProfile"
              >
                {{ menteeTitleText }}
              </a>
              <span
                v-if="planCounts"
                class="encounter-detail-plan-counts ml-2"
                data-automation-id="encounter-detail-plan-counts"
              >
                (
                <v-tooltip text="Library" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps" class="cursor-pointer" title="Library" data-automation-id="encounter-detail-plan-count-library">{{ planCounts.library }}</span>
                  </template>
                </v-tooltip>,
                <v-tooltip text="Now" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps" class="cursor-pointer" title="Now" data-automation-id="encounter-detail-plan-count-now">{{ planCounts.now }}</span>
                  </template>
                </v-tooltip>,
                <v-tooltip text="Next" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps" class="cursor-pointer" title="Next" data-automation-id="encounter-detail-plan-count-next">{{ planCounts.next }}</span>
                  </template>
                </v-tooltip>
                )
              </span>
            </v-toolbar-title>

            <div class="mh-card__actions" data-automation-id="encounter-detail-profile-section-actions-display">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                size="small"
                title="Back to Mentee"
                data-automation-id="encounter-detail-back-button"
                @click="goBack"
              />
              <v-btn
                v-if="isEncounterActive"
                color="white"
                variant="text"
                icon="mdi-stop"
                size="small"
                class="ml-2"
                :loading="isFinishingEncounter"
                title="End Encounter"
                data-automation-id="encounter-detail-end-button"
                @click="handleFinishEncounter"
              />
            </div>

            <v-btn
              icon
              variant="text"
              size="small"
              data-automation-id="encounter-detail-profile-section-collapse-button"
              @click="profileCollapsed = !profileCollapsed"
            >
              <v-icon>{{ profileCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text v-show="!profileCollapsed" class="mh-card__body">
            <MarkdownField
              :model-value="notesText"
              label="Mentor Notes"
              :readonly="!isEncounterActive"
              data-automation-id="encounter-detail-mentor-notes-input"
              @update:model-value="handleNotesInput"
            />
          </v-card-text>
        </v-card>

        <MhCard
          title="Checklist"
          automation-id="encounter-detail-checklist-section"
        >
          <template #actions>
            <v-btn
              icon
              variant="text"
              size="small"
              data-automation-id="encounter-detail-checklist-toggle"
              @click="checklistCollapsed = !checklistCollapsed"
            >
              <v-icon>{{ checklistCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
            </v-btn>
          </template>

          <div v-show="!checklistCollapsed">
            <v-alert
              v-if="agendaItems.length === 0"
              type="info"
              variant="tonal"
              data-automation-id="encounter-detail-checklist-empty"
            >
              No checklist items for this encounter.
            </v-alert>
            <v-list v-else density="compact">
              <v-list-item
                v-for="(item, index) in agendaItems"
                :key="`${index}-${item.step}`"
                :data-automation-id="`encounter-detail-checklist-item-${index}`"
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="item.checked ?? false"
                    :disabled="!isEncounterActive || isUpdatingAgenda"
                    @update:model-value="toggleAgendaItem(index, $event)"
                  />
                </template>
                <v-list-item-title>{{ item.step }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </MhCard>

        <DataCard
          v-model:collapsed="encounterCollapsed"
          title="Encounter"
          name-field="tldr"
          :model="encounterCardModel"
          :on-save="updateEncounterField"
          automation-id="encounter-detail-encounter-section"
        >
          <EnumEditor
            field="status"
            enums="status"
            label="Status"
            :editable="false"
            automation-id="encounter-detail-status-select"
          />
          <SentenceEditor
            field="tldr"
            label="TLDR *"
            :rules="[rules.required, rules.sentencePattern]"
            hint="One-sentence summary, max 255 characters"
            :editable="isEncounterActive"
            class="mt-4"
            automation-id="encounter-detail-tldr-input"
          />
        </DataCard>

        <DataCard
          v-model:collapsed="summaryCollapsed"
          title="Summary"
          :model="encounterCardModel"
          :on-save="updateEncounterField"
          automation-id="encounter-detail-summary-section"
        >
          <MarkdownEditor
            field="summary"
            label="Summary"
            hint="Markdown is accepted"
            :rows="12"
            :editable="isEncounterActive"
            automation-id="encounter-detail-summary-input"
          />
        </DataCard>

        <DataCard
          v-model:collapsed="transcriptCollapsed"
          title="Transcript"
          :model="encounterCardModel"
          :on-save="updateEncounterField"
          automation-id="encounter-detail-transcript-section"
        >
          <MarkdownEditor
            field="transcript"
            label="Transcript"
            hint="Markdown is accepted"
            :rows="12"
            :editable="isEncounterActive"
            automation-id="encounter-detail-transcript-input"
          />
        </DataCard>
      </DataCardGrid>
    </template>

    <v-snackbar :model-value="showError as unknown as boolean" color="error" :timeout="5000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/api/client'
import { redirectToDiscoveryDashboard } from '@/composables/useDiscoveryRedirect'
import DataCardGrid from '@/components/DataCardGrid.vue'
import MarkdownField from '@/components/MarkdownField.vue'
import {
  DataCard,
  EnumEditor,
  MarkdownEditor,
  MhCard,
  SentenceEditor,
  formatDate,
  provideDataCardContext,
  useErrorHandler,
  validationRules,
} from '@mentor-forge/mentorhub_spa_utils'
import type { EncounterAgendaItem, EncounterUpdate, MenteeUpdate } from '@/api/types'

const routeLocation = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const encounterId = computed(() => routeLocation.params.id as string)

const profileCollapsed = ref(false)
const encounterCollapsed = ref(true)
const checklistCollapsed = ref(false)
const summaryCollapsed = ref(true)
const transcriptCollapsed = ref(false)

const { data: encounter, isLoading, error: queryError } = useQuery({
  queryKey: ['encounter', encounterId],
  queryFn: () => api.getEncounter(encounterId.value),
})

const isEncounterActive = computed(() => encounter.value?.status === 'active')

watch(
  () => isEncounterActive.value,
  (active) => {
    if (active) {
      profileCollapsed.value = false
      checklistCollapsed.value = false
      encounterCollapsed.value = true
      summaryCollapsed.value = true
      transcriptCollapsed.value = false
    } else {
      profileCollapsed.value = false
      checklistCollapsed.value = true
      encounterCollapsed.value = false
      summaryCollapsed.value = true
      transcriptCollapsed.value = true
    }
  },
  { immediate: true }
)

const menteeId = computed(() => encounter.value?.mentee_id ?? '')

const { data: mentee } = useQuery({
  queryKey: ['mentee', menteeId],
  queryFn: () => api.getMentee(menteeId.value),
  enabled: computed(() => Boolean(menteeId.value)),
})

const encounterDateDisplay = computed(() => {
  const date = encounter.value?.date || encounter.value?.created.at_time
  return date ? formatDate(date) : '—'
})

const menteeName = computed(() => {
  return (
    encounter.value?.mentee_name ||
    mentee.value?.name ||
    ((encounter.value as Record<string, unknown> | undefined)?.name as string) ||
    ''
  )
})

const menteeTitleText = computed(() => {
  if (menteeName.value) {
    return `${menteeName.value} — ${encounterDateDisplay.value}`
  }
  return encounterDateDisplay.value
})

const menteeProfileHref = computed(() => (menteeId.value ? `/mentee/${menteeId.value}` : '#'))

function goToMenteeProfile() {
  if (menteeId.value) {
    router.push(`/mentee/${menteeId.value}`)
  }
}

const planCounts = computed(() => mentee.value?.plan_counts)

const menteeCardModel = computed<Record<string, unknown>>(() => ({
  ...mentee.value,
}))

provideDataCardContext({
  model: () => menteeCardModel.value,
  onSave: (field, value) => updateMenteeField(field, value),
})

const encounterCardModel = computed<Record<string, unknown>>(() => ({
  ...encounter.value,
  date: encounter.value?.date || encounter.value?.created.at_time,
}))

const notesText = ref('')
watch(
  () => mentee.value?.notes,
  (val) => {
    notesText.value = val ?? ''
  },
  { immediate: true }
)

let notesDebounceTimer: ReturnType<typeof setTimeout> | null = null
function handleNotesInput(val: string) {
  notesText.value = val
  if (notesDebounceTimer) clearTimeout(notesDebounceTimer)
  notesDebounceTimer = setTimeout(() => {
    updateMenteeField('notes', val)
  }, 500)
}

const agendaItems = computed(() => encounter.value?.agenda ?? [])

const errorRef = ref<Error | null>(null)
watch(queryError, (err) => {
  errorRef.value = err
}, { immediate: true })

const { showError, errorMessage } = useErrorHandler(errorRef as any)

const rules = {
  required: validationRules.required,
  sentencePattern: validationRules.sentencePattern,
}

const { mutateAsync: updateMentee } = useMutation({
  mutationFn: (data: MenteeUpdate) => {
    const menteeDocId = mentee.value?._id
    if (!menteeDocId) {
      return Promise.reject(new Error('Mentee document not loaded'))
    }
    return api.updateMentee(menteeDocId, data)
  },
  onSuccess: () => {
    if (menteeId.value) {
      queryClient.invalidateQueries({ queryKey: ['mentee', menteeId.value] })
    }
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateMenteeField(field: string, value: unknown) {
  if (!isEncounterActive.value) return
  if (field !== 'notes') {
    throw new Error(`Unsupported mentee field: ${field}`)
  }
  await updateMentee({ notes: String(value ?? '') })
}

const { mutateAsync: updateEncounter, isPending: isUpdatingAgenda } = useMutation({
  mutationFn: (data: EncounterUpdate) => api.updateEncounter(encounterId.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['encounter', encounterId.value] })
    if (menteeId.value) {
      queryClient.invalidateQueries({ queryKey: ['mentee', menteeId.value] })
    }
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

async function updateEncounterField(field: string, value: unknown) {
  if (!isEncounterActive.value) return
  if (!['date', 'status', 'tldr', 'summary', 'transcript'].includes(field)) {
    throw new Error(`Unsupported encounter field: ${field}`)
  }
  await updateEncounter({ [field]: value } as EncounterUpdate)
}

async function toggleAgendaItem(index: number, checked: boolean | null) {
  if (!isEncounterActive.value) return
  const currentAgenda = encounter.value?.agenda ?? []
  const updatedAgenda: EncounterAgendaItem[] = currentAgenda.map((item, itemIndex) => {
    if (itemIndex !== index) return { ...item }
    return { ...item, checked: Boolean(checked) }
  })
  await updateEncounter({ agenda: updatedAgenda })
}

function goBack() {
  if (menteeId.value) {
    router.push(`/mentee/${menteeId.value}`)
    return
  }
  redirectToDiscoveryDashboard()
}

const { mutate: finishEncounterMutation, isPending: isFinishingEncounter } = useMutation({
  mutationFn: () => api.finishEncounter(encounterId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['encounter', encounterId.value] })
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    if (menteeId.value) {
      queryClient.invalidateQueries({ queryKey: ['mentee', menteeId.value] })
    }
    errorRef.value = null
  },
  onError: (error: Error) => {
    errorRef.value = error
  },
})

function handleFinishEncounter() {
  finishEncounterMutation()
}
</script>
