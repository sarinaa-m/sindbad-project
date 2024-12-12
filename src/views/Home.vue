<template>
  <TableComponent :data="rows" :columns="columns" :page-size="10" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TableComponent from '../components/TableComponent.vue';
import Data from '../../data/data.json';

export default defineComponent({
  name: 'Home',
  components: {
    TableComponent,
  },
  setup() {
    const columns = [
      { label: 'ID', key: 'id' },
      { label: 'Full Name', key: 'first_name' },
      { label: 'Order', key: 'order_type' },
      { label: 'Submission Date', key: 'submission_datetime' },
      { label: 'Phone Number', key: 'phone_number' },
      { label: 'Status', key: 'provider_message' },
    ];

    const rows = Data.data;

    return { columns, rows };
  },
});
</script>

<style scoped>
/* Add any styles specific to the Home view here */
</style>
