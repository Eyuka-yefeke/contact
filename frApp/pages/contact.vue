<template>
  <v-container>
    <h1>Contact Us</h1>
    <contact-form @submitted="handleFormSubmit" />
  </v-container>
</template>

<script>
import ContactForm from '~/components/ContactForm.vue'; // Import the ContactForm component

export default {
  components: {
    ContactForm,
  },
  methods: {
    handleFormSubmit(data) {
      // Here you would handle form submission (e.g., save to database)
      console.log('Form data:', data);
      alert('Contact submitted successfully!');
    },
  },
};
</script>