<template>
  <div class="importform">
    <h1>This the Import page</h1>
    <form @submit.prevent="submitImport">
      <p>Specify the full path folder:
        <label>
          <input type="text" name="path" size="50" v-model="inputPath">
        </label>
      </p>
      <p>Folder recursive:
        <input type="checkbox" id="checkbox" v-model="inputRecursive" />
      </p>
      <p>Set genre from path:
        <input type="checkbox" id="checkbox" v-model="inputGenre" />
      </p>
      <input type="radio" id="mp3" value="mp3" v-model="inputExtension" />
      <label for="mp3">mp3</label>

      <input type="radio" id="flac" value="flac" v-model="inputExtension" />
      <label for="flac">flac</label>
      <p></p>
      <input type="radio" id="folder" value="folder" v-model="inputGenreArtistAlbum" />
      <label for="folder">folder</label>

      <input type="radio" id="mp3tag" value="mp3tag" v-model="inputGenreArtistAlbum" />
      <label for="mp3tag">mp3tag</label>
      <p></p>
      <button type="submit">Submit</button>
      <div v-if="isLoading">
        <div class="spinner-grow" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-if="showImpResult">
        Total imported songs: {{ imported.SongQty }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios, { formToJSON } from 'axios';

interface ImportedResult {
  Message: string
  ArtistQty: number
  AlbumQty: number
  SongQty: number
  StartTime: Date
  EndTime: Date
  Duration: string
}

export default defineComponent({
  name: 'ImportView',
  data() {
    return {
      apiUrl: 'http://192.168.32.136:8080/api',
      inputPath: '',
      inputRecursive: false,
      inputGenre: false,
      inputExtension: 'mp3',
      inputGenreArtistAlbum: 'folder',
      imported: Object as unknown as ImportedResult,
      showImpResult: false,
      isLoading: false
    }
  },
  methods: {
    async submitImport() {
      if (this.inputPath === '') {
        alert('Folder path must be informed');
      }
      const impBody = { path: this.inputPath, recursive: this.inputRecursive, songExtension: this.inputExtension, genreFromPath: this.inputGenre, genreArtistAlbum: this.inputGenreArtistAlbum }
      const impBodyString = JSON.stringify(impBody)

      this.sw = this.apiUrl + '/songs/import'
      this.isLoading = true

      axios
        .post<ImportedResult>(this.sw, impBodyString)
        .then((response) => {
          this.imported = response.data
          this.showImpResult = true
          this.isLoading = false
        })
        .catch((error) => {
          if (error.response) {
            // client received an error response (5xx, 4xx)
            alert('Error: ' + error.response.data)
          } else if (error.request) {
            // client never received a response, or request never left
            alert('Error:' + error.message)
          } else {
            console.log('Error', error.message);
          }
          this.isLoading = false
        })

    },
  },
})
</script>

<style>
.importform {
  margin-top: 80px
}
</style>
