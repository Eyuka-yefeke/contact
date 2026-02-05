<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" offset-sm="3">
        <v-card>
          <v-card-title>Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-text-field v-model="username" label="Username" required />
              <v-text-field v-model="password" label="Password" type="password" required />
              <v-btn type="submit" color="primary">Register</v-btn>
              <div v-if="message" class="message">{{ message }}</div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      message: '',
    };
  },
  methods: {
    async register() {
      try {
        const resp = await this.$axios.post('http://localhost:5053/api/auth/register', {
          username: this.username,
          password: this.password,
        });
        if (resp.status === 201) {
          this.message = 'Registration successful — please login';
          this.$router.push('/');
        } else {
          this.message = 'Registration failed';
        }
      } catch (err) {
        console.error('Register error', err.response?.data || err.message || err);
        this.message = err.response?.data?.error || 'Registration failed';
      }
    }
  }
};
</script>

<style scoped>
.message { margin-top: 1rem; color: green; }
</style>
