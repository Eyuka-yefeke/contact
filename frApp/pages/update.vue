<template>
  <v-container>
    <h1>Update Contact</h1>
    <contact-form @submitted="updateContact" :existingContact="existingContact" />
  </v-container>
</template>

<script>
import ContactForm from '~/components/ContactForm.vue';

export default {
  components: {
    ContactForm,
  },
  data() {
    return {
      existingContact: {
        id: null,
        name: '',
        phone: '',
      },
    };
  },
  mounted() {
    const contactId = this.$route.query.id;

    // Fetch the contact from the contacts list using the ID (mocked here)
    const contacts = [
      { id: 1, name: 'John Doe', phone: '123-456-7890' },
      { id: 2, name: 'Jane Doe', phone: '234-567-8901' },
      { id: 3, name: 'James Smith', phone: '345-678-9012' },
    ];
    const contact = contacts.find(contact => contact.id == contactId);
    if (contact) {
      this.existingContact = contact;
    }
  },
  methods: {
    updateContact(data) {
      // Assuming data has an id
      this.$store.dispatch('updateContact', { ...data, id: this.existingContact.id });
      this.$router.push('/dashboard'); // Redirect back to dashboard
    },
  },
};
</script>