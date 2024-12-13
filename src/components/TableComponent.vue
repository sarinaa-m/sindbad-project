<template>
  <div class="table-container">
    <!-- Search Input -->
    <div class="flex items-center justify-between mb-5">
      <input
        v-model="searchValue"
        type="text"
        placeholder="Search (Full Name, Phone Number, Status)"
        class="search-input w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />
      <!-- Pagination Controls -->
      <div class="flex items-center">
        <button
          @click="goToPage(currentPage - 1)"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-l border-r"
          :class="{
            disabled: currentPage === 1,
          }">
          <
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-r"
          :class="{
            disabled: currentPage === totalPages,
          }">
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
            @click="toggleMultiSort(column.key)"
            class="sortable table-header"
            :class="['table-column-' + column.key]"
            scope="col">
            {{ column.label }}
            <span v-if="multiSort.some((s) => s.key === column.key)">
              {{ multiSort.findIndex((s) => s.key === column.key) + 1 }}
              {{
                multiSort?.find((s) => s.key === column.key)?.order === 'asc'
                  ? '▲'
                  : '▼'
              }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in paginatedData"
          :key="row.id">
          <td
            :data-label="column.label"
            v-for="column in columns"
            :key="column.key"
            class="table-item">
            {{ formatValue(row[column.key], column.key) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, watch, h, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { HeaderName, ProviderMessageType, StatusType } from '../enums';
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
      const multiSort = ref<{ key: string; order: 'asc' | 'desc' }[]>([]);
      const currentPage = ref<number>(
        parseInt(route?.query?.page as string) || 1,
      );
      onMounted(() => {
      // Initialize search value from query parameters
      if (route.query.search) {
        searchValue.value = route.query.search as string;
        searchValueDebounced.value = route.query.search as string;
      }

      // Initialize multi-sort from query parameters
      if (route.query.sort) {
        const sortParams = (route.query.sort as string).split(',');
        multiSort.value = sortParams.map((param) => {
          const [key, order] = param.split(':');
          return { key, order: order as 'asc' | 'desc' };
        });
      }
    });
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

      const toggleMultiSort = (key: string) => {
        const existingSortIndex = multiSort.value.findIndex(
          (sort) => sort.key === key,
        );

        if (existingSortIndex !== -1) {
          // Column is already sorted, toggle between ascending, descending, and removing the sort
          const existingSort = multiSort.value[existingSortIndex];
          if (existingSort.order === 'asc') {
            multiSort.value[existingSortIndex] = { key, order: 'desc' };
          } else {
            // Remove the sort rule completely
            multiSort.value.splice(existingSortIndex, 1);
          }
        } else {
          // Add a new sorting rule for the column
          multiSort.value.push({ key, order: 'asc' });
        }
        updateQueryParams();

      };
      watch(searchValueDebounced, () => {
        resetQuery();
      });

      const resetQuery = () => {
        router.replace({
          query: {
            ...route.query,
            page: null,
          },
        });
      };
      const updateQueryParams = () => {
      const sortParams = multiSort.value
        .map((sort) => `${sort.key}:${sort.order}`)
        .join(',');
      router.replace({
        query: {
          ...route.query,
          page: currentPage.value.toString(),
          search: searchValueDebounced.value,
          sort: sortParams,
        },
      });
    };
      const parseValue = (value: any) => {
        const date = Date.parse(value);
        if (!isNaN(date)) return date;

        const number = parseFloat(value.replace(/[^0-9.]/g, '')); // Handle phone numbers
        if (!isNaN(number)) return number;

        return value?.toString().toLowerCase() || ''; // Fallback for strings
      };
      const filteredAndSortedData = computed(() => {
        let filteredData = props.data;
        currentPage.value = 1;

        const searchColumns = [
          'first_name',
          'phone_number',
          'provider_message',
        ];
        // Filter rows based on the debounced search value
        if (searchValueDebounced.value) {
          const normalizedSearchValue = normalizeString(
            searchValueDebounced.value,
          );

          filteredData = filteredData.filter((row) => {
            return searchColumns.some((key) => {
              const value = row[key];
              if (typeof value === 'string') {
                const normalizedValue = normalizeString(value);
                return normalizedValue.includes(normalizedSearchValue);
              }
              return false;
            });
          });
        }

        // Sort rows if a sort key is set
        if (multiSort.value.length > 0) {
          filteredData = [...filteredData].sort((a, b) => {
            for (const { key, order } of multiSort.value) {
              const valA = parseValue(a[key]);
              const valB = parseValue(b[key]);
              const sortDirection = order === 'asc' ? 1 : -1;

              if (valA > valB) return sortDirection;
              if (valA < valB) return -sortDirection;
              // If values are equal, continue to the next sorting rule
            }
            return 0; // All specified sorting keys have equal values
          });
        }
        updateQueryParams();

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
          router.push({
            query: {
              ...route?.query,
              page: page.toString(),
            },
          });
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
      const formatValue = (value: any, key: string) => {
        if (key === HeaderName.SUBMISSION_DATE) {
          return dayjs(value).format('YYYY MMM D  HH:mm');
        } else if (key === HeaderName.STATUS) {
          if (ProviderMessageType.length > 0) {
            const status = ProviderMessageType.find(
              (status) => status.label === value,
            );
            switch (status?.value) {
              case StatusType.CANCELLED:
                return `Cancelled`;
              case StatusType.FAILED:
                return 'Failed';
              case StatusType.PENDING:
                return 'Pending';
              case StatusType.CONFIRMED:
                return 'Confirmed';
              case StatusType.OK:
                return 'Ok';
              case StatusType.PROCESSING:
                return 'Processing';
              case StatusType.REJECTED:
                return 'Rejected';
              case StatusType.RETRY:
                return 'Retry';
              case StatusType.SUCCESS:
                return 'Success';
              case StatusType.USER_CANCELLATION:
                return 'Cancelled By User';
              default:
            }
          }
        } else {
          return value;
        }
      };
      return {
        searchValue,
        searchValueDebounced,
        sortKey,
        sortOrder,
        multiSort,
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        formatValue,
        toggleMultiSort,
      };
    },
  });
</script>

<style scoped lang="scss">
  .table-container {
    margin: 20px;
    .search-input {
      margin-bottom: 10px;
      padding: 5px;
      width: 30%;
    }
    .disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .table {
      border: 1px solid #ccc;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      width: 100%;
      table-layout: fixed;
      margin-bottom: 20px;
      .table-header {
        background-color: var(--dark-blue);
        color: var(--white);
      }
      tr {
        border: 1px solid #ddd;
        padding: 0.35em;
        &:nth-child(odd) {
          background-color: #f8f8f8;
        }
      }
      th,
      td {
        padding: 0.625em;
        text-align: left;
      }
      th {
        font-size: 0.85em;
        letter-spacing: 0.1em;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .table-container {
      border: none;
      .search-input {
        width: 50%;
      }
      .table {
        border: 0;
        thead {
          border: none;
          clip: rect(0 0 0 0);
          height: 1px;
          margin: -1px;
          overflow: hidden;
          padding: 0;
          position: absolute;
          width: 1px;
        }
        tr {
          display: block;
          margin-bottom: 0.625em;
        }

        td {
          border-bottom: 1px solid #ddd;
          display: block;
          font-size: 0.8em;
          text-align: right;
          &::before {
            content: attr(data-label);
            float: left;
            font-weight: bold;
            text-transform: uppercase;
          }
          &:last-child {
            border-bottom: 0;
          }
        }
      }
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
