<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" offset-sm="3">
        <v-card>
          <v-card-title>Logging out...</v-card-title>
          <v-card-text>
            <div v-if="message">{{ message }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return { message: 'Signing out...' };
  },
  async mounted() {
    try {
      // Call backend to clear server-side cookie
      await this.$axios.post('http://localhost:5053/api/auth/logout');
    } catch (e) {
      // ignore errors
    }

    // Clear localStorage token
    try { localStorage.removeItem('token'); } catch (e) {}

    // client-side cookie not used (server sets HttpOnly cookie)

    this.message = 'Signed out';
    this.$router.push('/');
  }
};
</script>

<style scoped>
</style>
