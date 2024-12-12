<template>
  <div class="table-container">
    <!-- Search Input -->
    <div class="flex items-center justify-between mb-5">
      <input
        v-model="searchValue"
        type="text"
        placeholder="Search (Full Name, Phone Number, Status)"
        class="search-input w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
      />
      <!-- Pagination Controls -->
      <div class="flex items-center">
        <button
          @click="goToPage(currentPage - 1)"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-l border-r"
          :class="{ disabled: currentPage === 1 }"
        >
          <
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-r"
          :class="{ disabled: currentPage === totalPages }"
        >
          >
        </button>
        <span class="mx-3"> {{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div>

    <!-- Table -->
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            @click="
              column.key === 'submission_datetime'
                ? toggleSort(column.key)
                : null
            "
            class="sortable table-header"
            :class="['table-column-' + column.key]"
            scope="col"
          >
            {{ column.label }}
            <span v-if="column.key === 'submission_datetime'">
              {{
                sortKey === 'submission_datetime'
                  ? sortOrder === 'asc'
                    ? '▲'
                    : '▼'
                  : ''
              }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedData" :key="row.id">
          <td
            :data-label="column.label"
            v-for="column in columns"
            :key="column.key"
            class="table-item"
          >
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Column {
  label: string;
  key: string;
}

interface DataRow {
  [key: string]: string | number;
}

export default defineComponent({
  name: 'TableComponent',
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

    const searchValue = ref<string>('');
    const searchValueDebounced = ref<string>('');
    const sortKey = ref<string | null>(null);
    const sortOrder = ref<'asc' | 'desc' | null>(null);

    const currentPage = ref<number>(
      parseInt(route?.query?.page as string) || 1,
    );

    watch(
      () => route?.query?.page,
      (newPage) => {
        currentPage.value = parseInt(newPage as string) || 1;
      },
    );

    // Debouncing logic using setTimeout
    let debounceTimeout: ReturnType<typeof setTimeout>;

    const debouncedSearch = (newSearchValue: string) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        searchValueDebounced.value = newSearchValue;
      }, 500);
    };

    watch(searchValue, (newSearchValue) => {
      debouncedSearch(newSearchValue);
    });

    const toggleSort = (key: string) => {
      if (sortKey.value === key) {
        if (sortOrder.value === 'asc') {
          sortOrder.value = 'desc';
        } else if (sortOrder.value === 'desc') {
          sortOrder.value = null;
          sortKey.value = null;
        } else {
          sortOrder.value = 'asc';
        }
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };
    watch(searchValueDebounced, () => {
      resetQuery();
    });

    const resetQuery = () => {
      router.replace({ query: { ...route.query, page: null } });
    };
    const filteredAndSortedData = computed(() => {
      let filteredData = props.data;
      currentPage.value = 1;

      const searchColumns = ['first_name', 'phone_number', 'provider_message'];
      // Filter rows based on the debounced search term
      if (searchValueDebounced.value) {
        const normalizedSearchValue = normalizeString(
          searchValueDebounced.value,
        );

        filteredData = filteredData.filter((row) => {
          return searchColumns.some((key) => {
            const value = row[key];
            debugger;
            if (typeof value === 'string') {
              const normalizedValue = normalizeString(value);
              return normalizedValue.includes(normalizedSearchValue);
            }
            return false;
          });
        });
      }

      // Sort rows if a sort key is set
      if (sortKey.value === 'submission_datetime') {
        filteredData = [...filteredData].sort((a, b) => {
          const valA = new Date(a[sortKey.value as string]);
          const valB = new Date(b[sortKey.value as string]);

          if (valA === valB) return 0;

          const sortDirection = sortOrder.value === 'asc' ? 1 : -1;
          return valA > valB ? sortDirection : -sortDirection;
        });
      }

      return filteredData;
    });

    const totalPages = computed(() =>
      Math.ceil(filteredAndSortedData.value.length / props.pageSize),
    );

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize;
      const end = start + props.pageSize;
      return filteredAndSortedData?.value?.slice(start, end);
    });

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        router.push({ query: { ...route?.query, page: page.toString() } });
      }
    };

    // Normalize string for case insensitive search
    function normalizeString(str: any) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '')
        .replace(/[!@#$%^&*(),.?":{}|<>\-+]/g, '');
    }

    return {
      searchValue,
      searchValueDebounced,
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
  width: 30%;
}
.table {
  border: 1px solid #ccc;
  border-collapse: collapse;
  margin: 0;
  padding: 0;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 20px;
}
.table-header {
  background-color: var(--dark-blue);
  color: var(--white);
}
.table tr {
  border: 1px solid #ddd;
  padding: 0.35em;
}
.table tr:nth-child(odd) {
  background-color: #f8f8f8;
}

.table th,
.table td {
  padding: 0.625em;
  text-align: left;
}

.table th {
  font-size: 0.85em;
  letter-spacing: 0.1em;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media screen and (max-width: 768px) {
  .table {
    border: 0;
  }

  .table thead {
    border: none;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .table tr {
    border-bottom: 3px solid #ddd;
    display: block;
    margin-bottom: 0.625em;
  }

  .table td {
    border-bottom: 1px solid #ddd;
    display: block;
    font-size: 0.8em;
    text-align: right;
  }

  .table td::before {
    content: attr(data-label);
    float: left;
    font-weight: bold;
    text-transform: uppercase;
  }

  .table td:last-child {
    border-bottom: 0;
  }
}
@media screen and (min-width: 769px) {
  .table .table-item {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
