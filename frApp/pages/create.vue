<template>
  <v-container>
    <h1>Add Contact</h1>
    <contact-form @submitted="addContact" />
  </v-container>
</template>

<script>
import ContactForm from '~/components/ContactForm.vue';

export default {
  components: {
    ContactForm,
  },
  methods: {
    addContact(data) {
      this.$store.dispatch('addContact', data); // Pass data to store
      this.$router.push('/dashboard'); // Redirect back to dashboard
    },
  },
};
</script>