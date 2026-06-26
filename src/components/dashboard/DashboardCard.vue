<template>
  <v-card
    hover
    class="dashboard-card h-100"
    :data-automation-id="automationId"
    @click="$emit('click')"
  >
    <v-card-title>
      <slot name="title" />
    </v-card-title>

    <v-card-text>
      <slot />
    </v-card-text>

    <v-card-text v-if="$slots.footer" class="pt-0">
      <slot name="footer" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  automationId: string
}>()

defineEmits<{
  click: []
}>()
</script>
