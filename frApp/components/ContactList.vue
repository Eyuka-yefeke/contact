<template>
  <v-card>
    <v-card-title>Contact List</v-card-title>
    <v-card-text>
      <v-list two-line>
        <v-list-item-group>
          <v-list-item
            class="hover-item"
            v-for="contact in sortedContacts"
            :key="contact.id"
            @click="selectContact(contact)"
          >
            <v-list-item-avatar>
              <v-avatar :color="getAvatarColor(contact.name)" size="40">
                <span class="initials">{{ getInitials(contact) }}</span>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="contact-name">{{ contact.name }}</v-list-item-title>
              <v-list-item-subtitle class="contact-sub">{{ contact.phone || '—' }}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="action-group">
              <div v-if="$vuetify && $vuetify.breakpoint.mdAndUp">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="primary" v-on="on" v-bind="attrs" @click.stop="$emit('edit', contact)" :aria-label="`Edit ${contact.name}`">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="error" v-on="on" v-bind="attrs" @click.stop="$emit('delete', contact)" :aria-label="`Delete ${contact.name}`">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </div>

              <!-- Small screens: collapse actions into a menu -->
              <div v-else>
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small v-on="on" v-bind="attrs" aria-label="More actions">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="$emit('edit', contact)">
                      <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('delete', contact)">
                      <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <div v-if="contacts.length === 0" class="no-contacts">No contacts available.</div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    contacts: {
      type: Array,
      required: true,
    },
  },
  computed: {
    sortedContacts() {
      return [...this.contacts].sort((a, b) => {
        const na = (a.name || '').toString().toLowerCase();
        const nb = (b.name || '').toString().toLowerCase();
        return na.localeCompare(nb);
      });
    },
  },
  methods: {
    selectContact(contact) {
      this.$emit('contact-selected', contact);
    },
    getInitials(contact) {
      const name = (contact && contact.name) ? contact.name.toString().trim() : '';
      if (!name) return '';
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    },
    getAvatarColor(name) {
      const palette = ['deep-purple lighten-4','indigo lighten-4','pink lighten-4','cyan lighten-4','amber lighten-4','green lighten-4','orange lighten-4','blue lighten-4'];
      if (!name) return palette[0];
      // simple hash to pick color
      let h = 0; for (let i=0;i<name.length;i++) h = (h<<5) - h + name.charCodeAt(i);
      const idx = Math.abs(h) % palette.length;
      return palette[idx];
    },
  },
};
</script>

<style scoped>
.contact-name { font-weight: 600; }
.contact-sub { color: rgba(0,0,0,0.6); }
.no-contacts { color: rgba(0,0,0,0.6); padding: 12px 0; }
.mr-2 { margin-right: 8px; }
.initials { font-weight: 700; color: rgba(0,0,0,0.75); }
.hover-item:hover { background: rgba(0,0,0,0.02); }
/* Ensure action buttons line up horizontally */
.action-group { display: flex; flex-direction: row; align-items: center; }
.action-group .v-btn { margin: 0 4px; }
.v-list-item { padding-right: 8px; }

/* Responsive tweaks */
@media (max-width: 600px) {
  .contact-name { font-size: 14px; }
  .contact-sub { font-size: 12px; }
}
</style>