<template>
  <div class="table-container">
    <!-- Search Input -->
    <input
      v-model="searchTerm"
      type="text"
      placeholder="Search..."
      class="search-input"
    />

    <!-- Table -->
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            @click="toggleSort(column.key)"
            class="sortable"
          >
            {{ column.label }}
            <span v-if="sortKey === column.key">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedData" :key="row.id">
          <td v-for="column in columns" :key="column.key">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

interface Column {
  label: string;
  key: string;
}

interface DataRow {
  [key: string]: string | number;
}

export default defineComponent({
  name: "TableComponent",
  props: {
    data: {
      type: Array as () => DataRow[],
      required: true,
    },
    columns: {
      type: Array as () => Column[],
      required: true,
    },
    pageSize: {
      type: Number,
      default: 5, // Default number of rows per page
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const searchTerm = ref<string>("");
    const sortKey = ref<string | null>(null);
    const sortOrder = ref<"asc" | "desc" | null>(null);

    // Read the current page from the URL query parameter, default to 1
    const currentPage = ref<number>(parseInt(route?.query?.page as string) || 1);

    // Watch for changes in the route query and update the page accordingly
    watch(
      () => route?.query?.page,
      (newPage) => {
        currentPage.value = parseInt(newPage as string) || 1;
      }
    );

    const toggleSort = (key: string) => {
      if (sortKey.value === key) {
        if (sortOrder.value === "asc") {
          sortOrder.value = "desc";
        } else if (sortOrder.value === "desc") {
          sortOrder.value = null;
          sortKey.value = null;
        } else {
          sortOrder.value = "asc";
        }
      } else {
        sortKey.value = key;
        sortOrder.value = "asc";
      }
    };

    const filteredAndSortedData = computed(() => {
      let filteredData = props.data;

      // Filter rows based on search term
      if (searchTerm.value) {
        filteredData = filteredData.filter((row) =>
          Object.values(row).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
          )
        );
      }

      // Sort rows if a sort key is set
      if (sortKey.value) {
        filteredData = [...filteredData].sort((a, b) => {
          const valA = a[sortKey.value as string];
          const valB = b[sortKey.value as string];

          if (valA === valB) return 0;

          const sortDirection = sortOrder.value === "asc" ? 1 : -1;
          return valA > valB ? sortDirection : -sortDirection;
        });
      }

      return filteredData;
    });

    const totalPages = computed(() =>
      Math.ceil(filteredAndSortedData.value.length / props.pageSize)
    );

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize;
      const end = start + props.pageSize;
      return filteredAndSortedData.value.slice(start, end);
    });

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        router.push({ query: { ...route?.query, page: page.toString() } });
      }
    };

    return {
      searchTerm,
      sortKey,
      sortOrder,
      currentPage,
      totalPages,
      paginatedData,
      toggleSort,
      goToPage,
    };
  },
});
</script>

<style scoped>
.table-container {
  margin: 20px;
}
.search-input {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
}
.table {
  border-collapse: collapse;
  border: 1px solid #ccc;
  margin: 0;
  padding: 0;
  width: 100%;
  table-layout: fixed;
}
.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.table th.sortable {
  cursor: pointer;
  user-select: none;
}
.table th.sortable:hover {
  background-color: #f1f1f1;
}
.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination button {
  padding: 5px 10px;
  cursor: pointer;
}
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}


table caption {
  font-size: 1.5em;
  margin: .5em 0 .75em;
}

table tr {
  
  /* border: 1px solid #ddd; */
  padding: .35em;
}



table th {
  font-size: .85em;
  letter-spacing: .1em;
  text-transform: uppercase;
}

@media screen and (max-width: 600px) {
  table {
    border: 0;
  }

  table caption {
    font-size: 1.3em;
  }
  
  table thead {
    border: none;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }
  
  table tr {
    /* border-bottom: 3px solid #ddd; */
    display: block;
    margin-bottom: .625em;
  }
  
  table td {
    border-bottom: 1px solid #ddd;
    display: block;
    font-size: .8em;
    text-align: right;
  }
  
  table td::before {
    /*
    * aria-label has no advantage, it won't be read inside a table
    content: attr(aria-label);
    */
    content: attr(data-label);
    float: left;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  /* table td:last-child {
    border-bottom: 0;
  } */
}



</style>
