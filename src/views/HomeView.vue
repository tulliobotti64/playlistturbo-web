<template>
  <div class="wrapper">
    <div class="row">
      <div class="columntop-left">
        <img :src=image width="300" height="300">
        <div>
          Genre: {{ genre }} <p></p>
          Artist: {{ artist }} <p></p>
          Title: {{ currentAudioName }} <p></p>
          Album: {{ album }} <p></p>
          Year: {{ albumDate }} <p></p>
          Music number: {{ indexCnt }} / {{ listLen }}
          <div @click="favClick()">
            <div v-if="favorite && currentAudioName != ''">
              Favorite:
              <img src="../assets/star-icon.jpg" width="30" height="30">
            </div>
            <div v-if="!favorite && currentAudioName != ''">
              Favorite:
              <img src="../assets/star-g.jpg" width="30" height="30">
            </div>
          </div>
          <div v-if="currentAudioName != ''">
            <div @click="hideClick()">
              Hide:
              <img src="../assets/hide-x.png" width="30" height="30">
            </div>
          </div>
        </div>
      </div>
      <div class="columntop-middle">
        <p></p>
      </div>
      <div class="column-right">
        <div class="playlist-wrap">
          <table class="songlist" id="tableId">
            <nav class="listbody">
              <li v-for="(fact, index) in songList" :key="index"> <a href="#" @click="skipTo(index)">
                  {{ fact.title }}, {{ fact.artist }} </a>
                <!-- pode por o click dentro da tag a pra mudar de musica @click="getImage()" -->
              </li>
            </nav>
          </table>
        </div>

        <div class="audio-wrapper">
          <div class="audioplayer">
            <audio controls id="audioplayer" autoplay>
              <source v-if="currentUrl != ''" :src="currentUrl">
            </audio>
          </div>
          <div class="audio-buttons">
            <button class="audio-bt" id="close-image" @click="playPrev" type="button">
              <img src="@/assets/prev-track-grey.png" />
            </button>
            <button class="audio-bt" id="close-image" @click="playNext" type="button">
              <img src="@/assets/next-track-grey.png" />
            </button>
          </div>
        </div>

      </div>
    </div>
    <div class="searchform">
      <form @submit.prevent="registerAnswer">
        <fieldset>
          <legend>Search options:</legend>
          <div>
            <p>Enter title to search music:
              <label>
                <input type="text" name="nameSearch" v-model="inpVal">
              </label>
              <button type="submit">Submit</button>
            </p>
          </div>
          <p>Clear playlist on submit
            <input type="checkbox" id="checkbox" v-model="clearPl" />
          </p>
          <p>Limit songs:
            <input class="limitsong" type="number" v-model="limitSongs">
          </p>

          <p>Favorites:
            <input type="checkbox" id="checkbox-fav" v-model="favorCk" />
            Genre:
            <input type="text" name="favGenre" v-model="inpFavGen">
            Artist:
            <input type="text" name="favGenre" v-model="inpFavArt">
          </p>

          <div class="row">
            <div class="column">
              <Dropdown v-model="selectedGenre" :options="genreList" optionLabel="Name" placeholder="Select a Genre..."
                class="w-full md:w-14rem" />
            </div>
            <div class="column">
              <Dropdown v-model="selectedArtist" :options="artistList" optionLabel="Name"
                placeholder="Select an Artist..." class="w-full md:w-14rem" />
            </div>
            <div class="column">
              <Dropdown v-model="selectedAlbum" :options="albumList" optionLabel="Name" placeholder="Select an Album..."
                class="w-full md:w-14rem" />
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import axios from 'axios';

interface SongList {
  artist: string,
  album: string,
  title: string,
  songUrl: string,
  albumArtUri: string,
  genre: string,
}
interface GenreList {
  name: string,
  id: number,
}
interface ArtistList {
  name: string,
  id: number,
}
interface AlbumList {
  name: string,
  id: number,
}

export default defineComponent({
  name: 'SongList',
  data() {
    return {
      apiUrl: 'http://192.168.32.136:8080/api',
      songList: [] as SongList[],
      songList1: [] as SongList[],
      fetchingSongs: false,
      searchByAlbum: false,
      currentAudioName: '',
      currentUrl: '',
      currentPlayIndex: 0,
      image: '',
      album: '',
      artist: '',
      genre: '',
      id: '',
      favorite: '',
      albumDate: '',
      inpVal: '',
      sw: '',
      inpValSubmitted: 'Not submitted yet',
      clearPl: false,
      selectedGenre: "",
      genreList: [] as GenreList[],
      artistList: [] as ArtistList[],
      selectedArtist: "",
      albumList: [] as AlbumList[],
      selectedAlbum: "",
      limitSongs: 50,
      inpFavArt: "",
      inpFavGen: "",
      favorCk: false,
      songToPLay: 0,
      setupListeners: false,
      isPlaying: false,
      indexCnt: 0,
      listLen: 0
    }
  },
  beforeMount() {
    this.fetchGenre()
  },
  methods: {
    playNext() {
      this.currentPlayIndex = this.currentPlayIndex + 1;
      this.skipTo(this.currentPlayIndex);
      const audio = document.getElementById("audioplayer") as HTMLAudioElement
      audio.src = this.songList[this.currentPlayIndex].songUrl;
      this.isPlaying = true
    },
    skipTo(index) {
      if (this.isPlaying) {
        const audio = document.getElementById("audioplayer") as HTMLAudioElement
        audio.src = this.songList[index].songUrl;
      }
      this.currentAudioName = this.songList[index].title
      this.currentUrl = this.songList[index].songUrl
      this.currentPlayIndex = index;

      this.image = this.songList[index].albumArtUri;
      this.album = this.songList[index].album;
      this.artist = this.songList[index].artist;
      this.genre = this.songList[index].genre;
      this.id = this.songList[index].id;
      this.favorite = this.songList[index].favorite;
      this.albumDate = this.songList[index].albumDate;
      this.indexCnt = index + 1;
    },
    playPrev() {
      this.currentPlayIndex = this.currentPlayIndex - 1;
      this.skipTo(this.currentPlayIndex);
      const audio = document.getElementById("audioplayer") as HTMLAudioElement
      audio.src = this.songList[this.currentPlayIndex].songUrl;
    },
    async fetchSongs(searchWord) {
      this.sw = this.apiUrl + '/songs/' + searchWord + "?limit=" + this.limitSongs + "&gethide=false"
      try {
        const songsResponse = await axios.get<SongList[]>(this.sw);
        if (songsResponse.data == null) {
          alert("No result for this selection!")
        } else {

          if (this.clearPl) {
            this.songList = songsResponse.data
          } else {
            this.songList1 = songsResponse.data
            this.songList = this.songList.concat(this.songList1)
          }
          this.listLen = this.songList.length
        }
      } catch (err) {
        console.log(err);
        alert("Error fetchSongs, see log")
      }
    },
    async fetchGenre() {
      this.sw = this.apiUrl + '/songs/genres'
      const genreResponse = await axios.get<GenreList[]>(this.sw);
      this.genreList = genreResponse.data
    },
    async fetchArtist(genre) {
      this.sw = this.apiUrl + '/songs/artistbygenre/' + genre
      const artistResponse = await axios.get<ArtistList[]>(this.sw);
      this.artistList = artistResponse.data
    },
    async fetchAlbum(artist) {
      this.sw = this.apiUrl + '/songs/albumbyartist/' + artist
      const albumResponse = await axios.get<AlbumList[]>(this.sw);
      this.albumList = albumResponse.data
    },
    async fetchSongsByAlbum(album) {
      if (album != undefined) {
        this.sw = this.apiUrl + '/songs/songsbyalbum/' + album + "?limit=" + this.limitSongs
        const albumResponse = await axios.get<AlbumList[]>(this.sw);
        if (this.clearPl) {
          this.songList = albumResponse.data
        } else {
          this.songList1 = albumResponse.data
          this.songList = this.songList.concat(this.songList1)
        }
      }
    },
    registerAnswer() {
      if (this.favorCk) {
        this.getFavorites(this.inpFavGen, this.inpFavArt)
      }
      if (this.inpVal) {
        this.inpValSubmitted = this.inpVal;
        this.inpVal = '';
        this.fetchSongs(this.inpValSubmitted)
      } else if (this.searchByAlbum) {
        this.searchByAlbum = false
        this.fetchSongsByAlbum(this.selectedAlbum.Name)
        this.selectedAlbum = '';
      }
      if (!this.once) {
        this.once = true
        console.log('addevente-added');

        const audio = document.getElementById("audioplayer") as HTMLAudioElement
        audio.addEventListener("ended", this.playNext)
      }
    },
    async favClick() {
      this.sw = this.apiUrl + '/songs/favorite?id=' + this.songList[this.currentPlayIndex].id
      this.favorite = !this.favorite
      const res = await axios.put(this.sw)
    },
    async hideClick() {
      try {
        this.sw = this.apiUrl + '/songs/hide/' + this.songList[this.currentPlayIndex].id
        const res = await axios.put(this.sw)
        this.songList.splice(this.currentPlayIndex, 1)
        this.currentPlayIndex = this.currentPlayIndex - 1
        this.listLen = this.listLen - 1
        this.playNext()
      } catch (err) {
        console.log(err);
        alert("Error hiding song!")
      }
    },
    async getFavorites(genre, artist) {
      this.sw = this.apiUrl + '/songs/favorites'
      const myBody = { genre: this.inpFavGen, artist: this.inpFavArt }
      const myBodyString = JSON.stringify(myBody)

      const songsResponse = await axios.post<SongList[]>(
        this.sw, myBodyString);
      if (this.clearPl) {
        this.songList = songsResponse.data
      } else {
        this.songList1 = songsResponse.data
        this.songList = this.songList.concat(this.songList1)
      }
    }
  },
  watch: {
    selectedGenre: function (val, oldVal) {
      this.fetchArtist(val.ID)
    },
    selectedArtist: function (val, oldVal) {
      this.fetchAlbum(val.Name)
    },
    selectedAlbum: function (val, oldVal) {
      this.searchByAlbum = true;
    },
  }
})
</script>

<style>
.limitsong {
  width: 50px;
}

.searchform {
  padding-top: 10px;
}

.songlist {
  border: 1px solid white;
  border-collapse: collapse;
}

.playlist-wrap {
  background-color: #222;
}

.playlist-wrap li {
  margin: 0 0 0 3em;
  padding: .25em 0 .25em .5em;
  list-style: decimal outside;
}

.playlist-wrap li.sel {
  background-color: #333;
}

.playlist-wrap li:hover {
  background-color: #444;

}

.listbody {
  height: 300px;
  width: 500px;
  overflow: hidden;
  overflow-y: scroll;
}

.columntop-left {
  flex: 35%;
}

.columntop-middle {
  flex: 10%;
  padding-left: 40px;
}

.columntop-right {
  flex: 55%;
}

.column {
  float: left;
  width: 33.33%;
}

/* Clear floats after the columns */
.row {
  padding-top: 200px;
  display: flex;
}

legend {
  background-color: gray;
  color: white;
  padding: 5px 10px;
}

fieldset {
  height: 400px;
  width: 850px;
}

.w-full {
  color: white;
}

.audio-wrapper {
  display: flex;
  align-items: center;
}

.audio-buttons {
  border-radius: 30px;
  margin-top: 10px;
  background-color: white;
  width: 65%;
  height: 75%;
}

.audioplayer {
  padding-top: 10px;
  justify-items: left;
}

.audio-bt {
  border: 0px;
  padding: 0;
  margin: 10px;
  vertical-align: top;
  width: 10%;
  height: 75%;
}

#close-image img {
  display: block;
  padding: 2px;
  height: 30px;
  width: 30px;
}
</style>