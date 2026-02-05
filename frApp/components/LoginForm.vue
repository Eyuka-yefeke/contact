<template>
  <v-card class="auth-card" elevation="6">
    <v-card-title class="headline">Welcome back</v-card-title>
    <v-card-text>
      <!-- <div class="subtle">Sign in to access your contacts</div> -->
      <v-form @submit.prevent="login">
        <v-text-field dense v-model="username" label="Username" required />
        <v-text-field dense v-model="password" label="Password" type="password" required />
        <v-row class="mt-4" align="center">
          <v-col>
            <v-btn type="submit" color="indigo" dark block>Login</v-btn>
          </v-col>
        </v-row>
        <div v-if="errorMessage" class="error mt-2">{{ errorMessage }}</div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      try {
        const resp = await this.$axios.post('http://localhost:5053/api/auth/login', {
          username: this.username,
          password: this.password,
        });
        const token = resp.data?.token || resp.data?.accessToken || resp.data?.jwt || resp.data?.data?.token;
        if (!token) {
          this.errorMessage = resp.data?.error || resp.data?.message || 'No token returned';
          return;
        }
        localStorage.setItem('token', token);
        if (this.$axios && typeof this.$axios.setToken === 'function') {
          this.$axios.setToken(token, 'Bearer');
        } else if (this.$axios) {
          this.$axios.defaults = this.$axios.defaults || {};
          this.$axios.defaults.headers = this.$axios.defaults.headers || {};
          this.$axios.defaults.headers.common = this.$axios.defaults.headers.common || {};
          this.$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        this.$emit('logged-in');
      } catch (err) {
        console.error('Login failed', err.response?.data || err.message || err);
        this.errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed';
      }
    },
  },
};
</script>

<style scoped>
.error {
  color: rgb(28, 1, 1);
}
.auth-card { max-width: 420px; 
  margin: auto;
  margin-top: 220px;
   border-radius: 12px; }
.subtle { color: rgba(0,0,0,0.6); margin-bottom: 8px; }
</style>
