<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="6">
        <h1 class="dash-brd">Dashboard</h1>
      </v-col>

      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="8">
            <v-text-field class="search-field" v-model="search" label="Search contacts" clearable color="red" outlined>
              <template v-slot:append-outer>
                <v-btn icon color="red" @click="searchNow" aria-label="Search">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="4" class="text-right">
            <v-card flat>
              <v-card-text>
                <div><strong>User:</strong> {{ currentUserName || '—' }}</div>
                <!-- <div><strong>ID:</strong> {{ currentUserId || '—' }}</div> -->
                <div class="mt-2">
                  <v-btn small text color="error" @click="logout">
                    <v-icon left>mdi-logout</v-icon>
                    Logout
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-btn color="primary" @click="showAddContactDialog = true" class="mb-3" dark>
      <v-icon left>mdi-account-plus</v-icon>
      Add Contact
    </v-btn>

    <contact-list
      :contacts="filteredContacts"
      @contact-selected="selectContact"
      @edit="editSelectedContact"
      @delete="confirmDelete"
    />
    
    <contact-details
      v-if="selectedContact"
      :contact="selectedContact"
      @edit="editSelectedContact"
      @delete="confirmDelete"
      @cancel="cancelView"
    />

    <v-dialog v-model="showAddContactDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ selectedContact ? 'Update Contact' : 'Add Contact' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitContact">
            <v-text-field v-model="contactForm.name" label="Name" required />
            <v-text-field v-model="contactForm.phone" :rules="phoneRules" label="Phone" required />
            <v-btn type="submit" color="primary">{{ selectedContact ? 'Update' : 'Submit' }}</v-btn>
            <v-btn @click="clearForm" color="grey" class="ml-2">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import ContactList from '~/components/ContactList.vue';
import ContactDetails from '~/components/ContactDetails.vue';
import gql from 'graphql-tag';

export default {
  middleware: 'auth',
  components: {
    ContactList,
    ContactDetails,
  },
  data() {
    return {
      contacts: [], 
      search: '',
      debouncedSearch: '',
      _searchTimer: null,
      selectedContact: null,
      showAddContactDialog: false,
      contactForm: {
        id: null,
        name: '',
        phone: '',
      },
      currentUserId: null,
      
      phoneRules: [
        v => !!v || 'Phone is required',
        v => (v || '').toString().trim().length >= 10 || 'Phone must be at least 10 characters',
        v => (v || '').toString().trim().length <= 30 || 'Phone must be at most 30 characters',
        v => /^\+?[0-9\-().\s]+$/.test(v || '') || 'Invalid phone format (digits, spaces, - . () allowed, optional leading +)'
      ],
      currentUserName: null,
      rawToken: null,
      showFullToken: false,
    };
  },
  
  watch: {
    search(newVal) {
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.debouncedSearch = (newVal || '').toString().trim().toLowerCase();
      }, 300);
    }
  },
  computed: {
    filteredContacts() {
      const q = this.debouncedSearch || '';
      if (!q) return this.contacts;
      return this.contacts.filter(c => {
        const name = (c.name || '').toString().toLowerCase();
        const phone = (c.phone || '').toString().toLowerCase();
        return name.includes(q) || phone.includes(q);
      });
    },
  },
  methods: {
    // Decode JWT stored in localStorage to extract Hasura user id and username
    parseToken() {
      try {
        let token = null;
        if (process.browser) token = localStorage.getItem('token');
        if (!token && this.$cookies && typeof this.$cookies.get === 'function') token = this.$cookies.get('apollo-token');
        if (!token && this.$apolloHelpers && typeof this.$apolloHelpers.getToken === 'function') token = this.$apolloHelpers.getToken();
        console.debug('parseToken: raw token sources', {
          localStorage: process.browser ? !!localStorage.getItem('token') : null,
          cookie: this.$cookies && typeof this.$cookies.get === 'function' ? !!this.$cookies.get('apollo-token') : null,
          apolloHelpers: this.$apolloHelpers && typeof this.$apolloHelpers.getToken === 'function' ? !!this.$apolloHelpers.getToken() : null,
        });
        if (!token) return null;
        // strip possible "Bearer " prefix
        if (typeof token === 'string' && token.startsWith('Bearer ')) token = token.slice(7);
        // strip surrounding quotes if present
        if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const claims = payload['https://hasura.io/jwt/claims'] || {};
          const id = claims['x-hasura-user-id'] || null;
          const username = claims['x-hasura-user-name'] || payload.username || null;
          if (!id) {
            console.warn('Token parsed but no x-hasura-user-id claim found', claims);
            return null;
          }
          return { id: id, username };
        } catch (innerErr) {
          console.error('parseToken: token present but failed to decode/parse', innerErr, { tokenPreview: (''+token).slice(0,20) });
          return null;
        }
      } catch (e) {
        console.error('Error parsing token for user info', e);
        return null;
      }
    },

    // Return raw token string (no Bearer prefix or surrounding quotes)
    getRawToken() {
      try {
        let token = null;
        if (process.browser) token = localStorage.getItem('token');
        if (!token && this.$cookies && typeof this.$cookies.get === 'function') token = this.$cookies.get('apollo-token');
        if (!token && this.$apolloHelpers && typeof this.$apolloHelpers.getToken === 'function') token = this.$apolloHelpers.getToken();
        if (!token) return null;
        if (typeof token === 'string' && token.startsWith('Bearer ')) token = token.slice(7);
        if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
        return token;
      } catch (e) {
        console.error('getRawToken error', e);
        return null;
      }
    },

      searchNow() {
        if (this._searchTimer) {
          clearTimeout(this._searchTimer);
          this._searchTimer = null;
        }
        this.debouncedSearch = (this.search || '').toString().trim().toLowerCase();
      },

      isPhoneValid(phone) {
        if (!phone) return false;
        const s = phone.toString().trim();
        if (s.length < 7 || s.length > 30) return false;
        // allow optional leading + then digits, spaces, dashes, dots, parentheses
        return /^\+?[0-9\-().\s]+$/.test(s);
      },

    async fetchContacts() {
      const crt_id = this.currentUserId;
      if (!crt_id) {
        this.contacts = [];
        return;
      }

      const GET_CONTACTS = gql`query GetContacts($crt_id: uuid!) {
        contacts(where: {crt_id: {_eq: $crt_id}}, order_by: {created_at: desc}) { id name phone crt_id crt_name created_at }
      }`;
      try {
        const resp = await this.$apollo.query({
          query: GET_CONTACTS,
          variables: { crt_id: crt_id },
          fetchPolicy: 'network-only',
        });
        this.contacts = resp.data.contacts || [];
      } catch (err) {
        console.error('Fetch contacts error', err);
        this.contacts = [];
      }
    },
    logout() {
      try {
        if (process.browser) localStorage.removeItem('token');
      } catch (e) {}
      try {
        if (this.$cookies && typeof this.$cookies.remove === 'function') this.$cookies.remove('apollo-token');
      } catch (e) {}
      // redirect to login
      this.$router.push('/login');
    },
    selectContact(contact) {
      this.selectedContact = contact;
    },

    editSelectedContact(contact) {
      this.selectedContact = contact;
      this.contactForm = { ...contact }; // Copy selected contact details to contact form
      this.showAddContactDialog = true; // Show the dialog for editing
    },

    confirmDelete(contact) {
      const confirm = window.confirm(`Are you sure you want to delete contact: ${contact.name}?`);
      if (confirm) {
        this.contacts = this.contacts.filter(c => c.id !== contact.id);
        this.selectedContact = null; // Reset selected contact
      }
    },

    async submitContact() {
      if (!this.contactForm.name || !this.contactForm.phone) return;
      // validate phone client-side before sending to Hasura
      if (!this.isPhoneValid(this.contactForm.phone)) {
        return alert('Please enter a valid phone number (check format and length).');
      }
      const crt_id = this.currentUserId;
      if (!crt_id) return alert('Unable to determine current user');

      // INSERT
      if (!this.selectedContact) {
        const INSERT = gql`mutation InsertContact($name: String!, $phone: bpchar!) {
          insert_contacts_one(object: { name: $name, phone: $phone }) { id name phone crt_id crt_name created_at }
        }`;
        try {
          const resp = await this.$apollo.mutate({ mutation: INSERT, variables: { name: this.contactForm.name, phone: this.contactForm.phone } });
          const newContact = resp.data.insert_contacts_one;
          if (newContact) this.contacts.unshift(newContact);
        } catch (err) {
          console.error('Insert contact error', err);
          alert('Failed to add contact');
        }
      } else {
        // UPDATE
        const UPDATE = gql`mutation UpdateContact($id: Int!, $name: String!, $phone: bpchar!) {
          update_contacts_by_pk(pk_columns: { id: $id }, _set: { name: $name, phone: $phone }) { id name phone crt_id }
        }`;
        try {
          const resp = await this.$apollo.mutate({ mutation: UPDATE, variables: { id: this.contactForm.id, name: this.contactForm.name, phone: this.contactForm.phone } });
          const updated = resp.data.update_contacts_by_pk;
          if (updated) {
            const idx = this.contacts.findIndex(c => c.id === updated.id);
            if (idx !== -1) this.contacts.splice(idx, 1, updated);
          }
        } catch (err) {
          console.error('Update contact error', err);
          alert('Failed to update contact');
        }
      }

      this.clearForm(); // Reset form and close dialog
    },
    
    clearForm() {
      this.contactForm = { id: null, name: '', phone: '' };
      this.selectedContact = null;
      this.showAddContactDialog = false; // Close the dialog
    },

    cancelView() {
      this.selectedContact = null; // Clear the selected contact
    },

    async confirmDelete(contact) {
      const ok = window.confirm(`Are you sure you want to delete contact: ${contact.name}?`);
      if (!ok) return;

      try {
        const DEL = gql`mutation DeleteContact($id: Int!) {
          delete_contacts_by_pk(id: $id) { id }
        }`;
        await this.$apollo.mutate({ mutation: DEL, variables: { id: contact.id } });
        this.contacts = this.contacts.filter(c => c.id !== contact.id);
        this.selectedContact = null;
      } catch (err) {
        console.error('Delete contact error', err);
        alert('Failed to delete contact');
      }
    },
  },

  async mounted() {
    const info = this.parseToken();
    if (info) {
      this.currentUserId = info.id;
      this.currentUserName = info.username;
    }
    // set raw token for debugging and log it
    this.rawToken = this.getRawToken();
    console.debug('dashboard: rawToken', this.rawToken);
    await this.fetchContacts();
  },
};
</script>

<style scoped>
.dash-brd {
  color: #390d0d;
  border: transparent;
  padding: 10px;
  margin-bottom: 10px;
}

.search-field{
  height: 52px;
  width: 300px;
  background-color: rgb(49, 34, 15);
  color: #000;
}
.search-field input,
.search-field .v-input__slot input,
.search-field .v-field__input input {
  color: #000 !important;
  caret-color: #000 !important;
}
.search-field input::placeholder {
  color: rgba(0,0,0,0.38) !important;
}
.search-field .v-label,
.search-field label {
  color: rgba(0,0,0,0.6) !important;
}
</style>

<style scoped>
/* Add component-specific styles here */
</style>