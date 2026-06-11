<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="main">
      <div class="app">
        <!-- Key by path so views remount (re-fetch) when only a route param
             changes — e.g. switching APIs or projects from the sidebar. -->
        <RouterView :key="$route.fullPath" />
      </div>
    </main>
  </div>
</template>
