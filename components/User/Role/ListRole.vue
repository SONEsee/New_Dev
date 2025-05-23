<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="books.length < 11"
      :items="books"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-small"
              start
            ></v-icon>

            ຈັດການສິດເຂົ້ານຳໃຊ້ລະບົບ
          </v-toolbar-title>

          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="ແອັດເມນູ"
            border
            @click="add"
          ></v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.title="{ value }">
        <v-chip :text="value" label> </v-chip>
      </template>
      <template v-slot:item.author="{ value }">
        <v-chip>
          <template v-slot:prepend>
            <v-checkbox-btn :ripple="false"></v-checkbox-btn>
          </template>
        </v-chip>
      </template>
      <template v-slot:item.genre="{ value }">
        <v-chip>
          <template v-slot:prepend>
            <v-checkbox-btn :ripple="false"></v-checkbox-btn>
          </template>
        </v-chip>
      </template>
      <template v-slot:item.year="{ value }">
        <v-chip>
          <template v-slot:prepend>
            <v-checkbox-btn :ripple="false"></v-checkbox-btn>
          </template>
        </v-chip>
      </template>
      <template v-slot:item.pages="{ value }">
        <v-chip>
          <template v-slot:prepend>
            <v-checkbox-btn :ripple="false"></v-checkbox-btn>
          </template>
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item.id)"
          ></v-icon>

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.id)"
          ></v-icon>
        </div>
      </template>

      <template v-slot:no-data>
        <v-btn
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text="Reset data"
          variant="text"
          border
          @click="reset"
        ></v-btn>
      </template>
    </v-data-table>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card
      :subtitle="`${isEditing ? 'Update' : 'Create'} your favorite book`"
      :title="`${isEditing ? 'Edit' : 'Add'} a Book`"
    >
      <template v-slot:text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="record.title" label="Title"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="record.author" label="Author"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="record.genre"
              :items="['Fiction', 'Dystopian', 'Non-Fiction', 'Sci-Fi']"
              label="Genre"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="record.year"
              :max="adapter.getYear(adapter.date())"
              :min="1"
              label="Year"
            ></v-number-input>
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="record.pages"
              :min="1"
              label="Pages"
            ></v-number-input>
          </v-col>
        </v-row>
      </template>

      <v-divider></v-divider>

      <v-card-actions class="bg-surface-light">
        <v-btn text="Cancel" variant="plain" @click="dialog = false"></v-btn>

        <v-spacer></v-spacer>

        <v-btn text="Save" @click="save"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { onMounted, ref, shallowRef } from "vue";
import { useDate } from "vuetify";

export default {
  data() {
    const adapter = useDate();
    return {
      adapter,
      DEFAULT_RECORD: {
        title: "",
        author: "",
        genre: "",
        year: adapter.getYear(adapter.date()),
        pages: 1,
      },
      books: [],
      record: {
        title: "",
        author: "",
        genre: "",
        year: adapter.getYear(adapter.date()),
        pages: 1,
      },
      dialog: false,
      isEditing: false,
      headers: [
        { title: "ລຳດັບ", key: "title", align: "start" },
        { title: "super admin", key: "author" },
        { title: "admin", key: "genre" },
        { title: "user", key: "year", align: "end" },
        { title: "mini user", key: "pages", align: "end" },
        { title: "Actions", key: "actions", align: "end", sortable: false },
      ],
    };
  },
  mounted() {
    this.reset();
  },
  methods: {
    add() {
      this.isEditing = false;
      this.record = { ...this.DEFAULT_RECORD };
      this.dialog = true;
    },
    edit(id) {
      this.isEditing = true;
      const found = this.books.find((book) => book.id === id);
      this.record = { ...found };
      this.dialog = true;
    },
    remove(id) {
      const index = this.books.findIndex((book) => book.id === id);
      this.books.splice(index, 1);
    },
    save() {
      if (this.isEditing) {
        const index = this.books.findIndex(
          (book) => book.id === this.record.id
        );
        this.books[index] = { ...this.record };
      } else {
        this.record.id = this.books.length + 1;
        this.books.push({ ...this.record });
      }
      this.dialog = false;
    },
    reset() {
      this.dialog = false;
      this.record = { ...this.DEFAULT_RECORD };
      this.books = [
        {
          id: 1,
          title: "ໂມດູນບັນຊີ",
          author: "Harper Lee",
          genre: "Fiction",
          year: 1960,
          pages: 281,
        },
        {
          id: 2,
          title: "ໂມດູນຊັບສົມບັດຄົງທີ່",
          author: "George Orwell",
          genre: "Dystopian",
          year: 1949,
          pages: 328,
        },
        {
          id: 3,
          title: "ໂມດູນເງິນກູ້ຢືມ",
          author: "F. Scott Fitzgerald",
          genre: "Fiction",
          year: 1925,
          pages: 180,
        },
        {
          id: 4,
          title: "ໂມດູນຫຼັກຊັບຄ້ຳປະກັນ",
          author: "Yuval Noah Harari",
          genre: "Non-Fiction",
          year: 2011,
          pages: 443,
        },
        {
          id: 5,
          title: "ໂມດູນພັນທະບັນ",
          author: "Frank Herbert",
          genre: "Sci-Fi",
          year: 1965,
          pages: 412,
        },
      ];
    },
  },
};
</script>
