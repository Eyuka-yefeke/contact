<template>
  <v-app>
    <v-app-bar app color="indigo darken-2" dark elevate-on-scroll>
      <v-toolbar-title class="title">Contact Manager</v-toolbar-title>
      <v-spacer />
      <v-btn to="/" text>Home</v-btn>
      <v-btn to="/contact" text>Contact Us</v-btn>
    </v-app-bar>

    <v-main class="main-bg">
      <v-container fluid class="pa-6">
        <nuxt />
      </v-container>
    </v-main>

    <v-footer color="indigo darken-3" app>
      <v-col class="text-center white--text">© {{ new Date().getFullYear() }} Contact Manager</v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  // Layout script can go here if needed
};
</script>

<style scoped>
.title { font-weight: 700; letter-spacing: 0.4px; }
.main-bg { background: linear-gradient(180deg, #f6f8fb 0%, #ffffff 100%); min-height: calc(100vh - 64px); }
</style>