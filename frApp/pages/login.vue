<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" offset-sm="3">
          <login-form @logged-in="onLoggedIn" />
          <div class="auth-links">
            <v-btn text color="primary" @click="$router.push('/register')">Register</v-btn>
          </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LoginForm from '~/components/LoginForm.vue';

export default {
  components: {
    LoginForm,
  },
  methods: {
    onLoggedIn() {
      this.$router.push('/dashboard'); // Navigate if logged in
    },
  },
};
</script>

<style scoped>
.auth-links {
  margin-top: 1rem;
  text-align: center;
}
</style>