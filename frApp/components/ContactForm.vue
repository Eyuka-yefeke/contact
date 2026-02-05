<template>
  <v-card>
    <v-card-title>{{ existingContact.id ? 'Update Contact' : 'Create a New Contact' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitForm">
        <v-text-field v-model="name" label="Name" required />
        <v-text-field v-model="phone" label="Phone" required />
        <v-btn type="submit" color="primary">{{ existingContact.id ? 'Update' : 'Submit' }}</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    existingContact: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        phone: '',
      }),
    },
  },
  data() {
    return {
      name: this.existingContact.name,
      phone: this.existingContact.phone,
    };
  },
  methods: {
    submitForm() {
      const contactData = {
        name: this.name,
        phone: this.phone,
      };
      this.$emit('submitted', contactData); // Emit event with contact data
      this.name = ''; // Reset form
      this.phone = '';
    },
  },
  watch: {
    existingContact: {
      immediate: true,
      handler(newValue) {
        this.name = newValue.name;
        this.phone = newValue.phone;
      },
    },
  },
};
</script>

<style scoped>
/* Add styles for this component here */
</style>