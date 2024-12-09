<template>
  <TableComponent :data="rows" :columns="columns" :pageSize="10" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TableComponent from "./components/TableComponent.vue";
import data from "./data/data.json";
export default defineComponent({
  components: { TableComponent },
  setup() {
   
    const columns = [
      { label: "ID", key: "id" },
      { label: "Full Name", key: "first_name" },
      { label: "Order", key: "order_type" },
      { label: "Created Date", key: "submission_datetime" },
      { label: "Phone Number", key: "phone_number" },
      { label: "Status", key: "provider_message" },
    ];

    const rows = data;

    return { columns, rows };
  },
});
</script>
