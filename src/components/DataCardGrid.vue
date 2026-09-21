<template>
  <div class="data-card-grid" data-automation-id="data-card-grid">
    <slot />
  </div>
</template>

<style scoped>
.data-card-grid {
  display: grid;
  width: 100%;
  gap: 16px;
  align-items: stretch;
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 641px) {
  .data-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1920px) {
  .data-card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
