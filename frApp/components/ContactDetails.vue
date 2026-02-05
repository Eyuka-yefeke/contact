<template>
  <v-card>
    <v-card-title>{{ contact.name }}</v-card-title>
    <v-card-subtitle>{{ contact.phone }}</v-card-subtitle>
    <v-card-text>
      <p>Some additional details about the contact can go here.</p>
      <div class="actions">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small color="orange" v-on="on" v-bind="attrs" @click="$emit('edit', contact)" :aria-label="`Edit ${contact.name}`">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Edit</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small color="error" v-on="on" v-bind="attrs" @click="$emit('delete', contact)" :aria-label="`Delete ${contact.name}`">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small color="grey" v-on="on" v-bind="attrs" @click="$emit('cancel')" aria-label="Cancel">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
          <span>Cancel</span>
        </v-tooltip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    contact: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.actions { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
.actions .v-btn { min-width: 72px; }
</style>