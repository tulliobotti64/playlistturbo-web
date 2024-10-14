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
          <div class="btn-fh">
            <div @click="favClick()">
              <div v-if="favorite && currentAudioName != ''">
                Favorite:
                <img src="@/assets/star-icon.jpg" width="30" height="30">
              </div>
              <div v-if="!favorite && currentAudioName != ''">
                Favorite:
                <img src="@/assets/star-g.jpg" width="30" height="30">
              </div>
            </div>
            <div v-if="currentAudioName != ''">
              <div @click="hideClick()">
                Hide:
                <img src="@/assets/hide-x.png" width="30" height="30">
              </div>
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
              <li class="liclass" v-for="(fact, index) in songList" :key="index"> <a href="#" @click="skipTo(index)">
                  {{ index + 1 }} - {{ fact.title }}, {{ fact.artist }}</a>
                <div v-if="fact.favorite">
                  <img class="starfav" src="@/assets/red-star.jpeg" width="20" height="20">
                </div>
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
            <button class="audio-bt" id="close-image" title="Previous track" @click="playPrev" type="button">
              <img src="@/assets/prev-track-grey.png" />
            </button>
            <button class="audio-bt" id="close-image" title="Next track" @click="playNext" type="button">
              <img src="@/assets/next-track-grey.png" />
            </button>
            <button v-if="listLen > 0" class="audio-bt" id="close-image" title="Shuffle list" @click="shufList"
              type="button">
              <img src="@/assets/shuffle-icon.png" />
            </button>
            <button v-if="listLen > 0" class="audio-bt" id="close-image" title="Clear list" @click="removeList"
              type="button">
              <img src="@/assets/trash.png" />
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
            <p>Search by:
              <input type="radio" id="Artist" name="search_by" value="artist" v-model="search_by">
              <label for="artist">Artist</label>
              <input type="radio" id="Album" name="search_by" value="album" v-model="search_by">
              <label for="album">Album</label>
              <input type="radio" id="Title" name="search_by" value="title" v-model="search_by">
              <label for="title">Title</label>
              <label>
                <input type="text" name="nameSearch" v-model="inpVal">
              </label>
              <input v-if="search_by == 'artist'" type="radio" id="Random" name="search_op" value="random"
                v-model="search_op">
              <label v-if="search_by == 'artist'" for="css">Random</label>
              <input v-if="search_by == 'artist'" type="radio" id="Sequential" name="search_op" value="sequential"
                v-model="search_op">
              <label v-if="search_by == 'artist'" for="javascript">Sequential</label>
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
            <input type="text" name="favArtist" v-model="inpFavArt">
          </p>
          <button type="submit">Submit</button>

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
    <div v-if="keycloak.authenticated">
      <p>Olá, {{ userProfile.username }}! Para sair, clique no botão abaixo.</p>
      <button @click="logout">Sair</button>
    </div>
    <div v-else>
      <h1>Você não está autenticado!</h1>
      <button @click="login">Entrar</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref } from 'vue';
import axios from 'axios';

interface SongList {
  artist: string,
  album: string,
  title: string,
  songUrl: string,
  albumArtUri: string,
  genre: string,
  favorite: string,
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
      userProfile: {
        username: '',
      },
      myData: ref([]),
      apiUrl: 'http://pltapi.local.tebecloud.com/api',
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
      indexCnt: 0,
      listLen: 0,
      search_by: 'artist',
      search_op: 'random'
    }
  },
  beforeMount() {
    this.fetchGenre()
  },
  mounted() {
    this.getStorage()
  },
  methods: {
    removeList() {
      localStorage.removeItem('myList')
      localStorage.removeItem('myIndex')
      this.songList = []
      this.listLen = 0
      this.image = ''
      this.album = ''
      this.artist = ''
      this.genre = ''
      this.albumDate = 0
      this.currentAudioName = ''
      this.indexCnt = 0
      location.reload()
    },
    saveStorage() {
      localStorage.setItem('myList', JSON.stringify(this.songList));
      this.listLen = this.songList.length
      localStorage.setItem('myIndex', JSON.stringify(this.currentPlayIndex));
    },
    getStorage() {
      if (localStorage.getItem('myList')) {
        this.songList = JSON.parse(localStorage.getItem('myList') as any)
        this.listLen = this.songList.length
        this.currentPlayIndex = JSON.parse(localStorage.getItem('myIndex') as any)
        this.loadSongInfo(this.currentPlayIndex)
      }
      const audio = document.getElementById("audioplayer") as HTMLAudioElement
      audio.addEventListener("ended", this.playNext)

      audio.onerror = function () {
        alert("**Can't open audio ! Verify lan connection.")
      }

    },
    playNext() {
      this.currentPlayIndex = this.currentPlayIndex + 1;
      this.skipTo(this.currentPlayIndex);
    },

    skipTo(index) {
      this.currentPlayIndex = index;

      const audio = document.getElementById("audioplayer") as HTMLAudioElement
      audio.src = this.songList[this.currentPlayIndex].songUrl;
      this.loadSongInfo(index)

    },
    loadSongInfo(index) {
      this.currentAudioName = this.songList[index].title
      this.currentUrl = this.songList[index].songUrl
      this.image = this.songList[index].albumArtUri;
      this.album = this.songList[index].album;
      this.artist = this.songList[index].artist;
      this.genre = this.songList[index].genre;
      this.id = this.songList[index].id;
      this.favorite = this.songList[index].favorite;
      this.albumDate = this.songList[index].albumDate;
      this.indexCnt = index + 1;
      localStorage.setItem('myIndex', JSON.stringify(this.currentPlayIndex));
    },
    playPrev() {
      this.currentPlayIndex = this.currentPlayIndex - 1;
      this.skipTo(this.currentPlayIndex);
    },
    async fetchSongs(searchWord) {
      this.sw = this.apiUrl + '/songs/' + searchWord + "?limit=" + this.limitSongs + "&gethide=false"
      try {
        const songsResponse = await axios.get<SongList[]>(this.sw);
        if (songsResponse.data) {
          if (this.clearPl) {
            this.songList = songsResponse.data
          } else {
            this.songList1 = songsResponse.data
            this.songList = this.songList.concat(this.songList1)
          }
          this.saveStorage()
        } else {
          alert("No result for this selection! " + searchWord)
        }
      } catch (err) {
        console.log(err);
        alert("Error fetchSongs, see log")
      }
    },
    async fetchGenre() {
      this.sw = this.apiUrl + '/songs/genres'
      try {
        const genreResponse = await axios.get<GenreList[]>(this.sw);
        if (genreResponse.data) {
          this.genreList = genreResponse.data
        } else {
          alert('No genres found.');
        }
      } catch (err) {
        console.log(err);
        alert("Error reading genres.")
      }
    },
    async fetchArtist(genre) {
      this.sw = this.apiUrl + '/songs/artistbygenre/' + genre
      try {
        const artistResponse = await axios.get<ArtistList[]>(this.sw);
        if (artistResponse.data) {
          this.artistList = artistResponse.data
        } else {
          alert('No artist found with genre: ' + genre);
        }
      } catch (err) {
        console.log(err);
        alert("Error reading artists.")
      }
    },
    async fetchAlbum(artist) {
      try {
        this.sw = this.apiUrl + '/songs/albumbyartist/' + artist
        const albumResponse = await axios.get<AlbumList[]>(this.sw);
        if (albumResponse.data) {
          this.albumList = albumResponse.data
        } else {
          alert('No albums found with artist: ' + artist);
        }
      } catch (err) {
        console.log(err);
        alert("Error reading albums.")
      }
    },
    async fetchSongsByAlbum(album) {
      if (album != undefined) {
        try {
          this.sw = this.apiUrl + '/songs/songsbyalbum/' + album + "?limit=" + this.limitSongs
          const albumResponse = await axios.get<AlbumList[]>(this.sw);
          if (albumResponse.data) {
            if (this.clearPl) {
              this.songList = albumResponse.data
            } else {
              this.songList1 = albumResponse.data
              this.songList = this.songList.concat(this.songList1)
            }
            this.saveStorage()
            this.inpVal = '';
          } else {
            alert('No albums found with artist: ' + album);
          }
        } catch (err) {
          console.log(err);
          alert("Error reading songs by albums.")
        }
      }
    },
    async fetchSongsByArtist(artist, option) {
      this.sw = this.apiUrl + '/songs/songsbyartist?artist=' + artist + "&option=" + option + "&limit=" + this.limitSongs
      try {
        const artistResponse = await axios.get<AlbumList[]>(this.sw);
        if (artistResponse.data) {
          if (this.clearPl) {
            this.songList = artistResponse.data
          } else {
            this.songList1 = artistResponse.data
            this.songList = this.songList.concat(this.songList1)
          }
          this.saveStorage()
          this.inpVal = '';
        } else {
          alert('No songs found with artist: ' + artist);
        }
      } catch (err) {
        console.log(err);
        alert("Error reading songs by artists.")
      }
    },
    registerAnswer() {
      if (this.favorCk) {
        this.getFavorites(this.inpFavGen, this.inpFavArt)
        return
      }

      if (this.inpVal && this.search_by == "album") {
        this.fetchSongsByAlbum(this.inpVal)
        return
      }

      if (this.inpVal && this.search_by == "artist") {
        this.fetchSongsByArtist(this.inpVal, this.search_op)
        return
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
    },
    async favClick() {
      try {
        this.sw = this.apiUrl + '/songs/favorite?id=' + this.songList[this.currentPlayIndex].id
        this.favorite = !this.favorite
      } catch (err) {
        console.log(err);
        alert("Error reading favorites.")
      }
      try {
        const res = await axios.put(this.sw)
      } catch (err) {
        console.log(err);
        alert("Error setting favorite song.")
      }
    },
    async hideClick() {
      this.sw = this.apiUrl + '/songs/hide/' + this.songList[this.currentPlayIndex].id
      try {
        const res = await axios.put(this.sw)
        this.songList.splice(this.currentPlayIndex, 1)
        this.currentPlayIndex = this.currentPlayIndex - 1
        this.listLen = this.listLen - 1
        this.playNext()
      } catch (err) {
        console.log(err);
        alert("Error hiding song.")
      }
    },
    async getFavorites(genre, artist) {
      this.sw = this.apiUrl + '/songs/favorites'
      const myBody = { genre: this.inpFavGen, artist: this.inpFavArt }
      const myBodyString = JSON.stringify(myBody)

      try {
        const songsResponse = await axios.post<SongList[]>(
          this.sw, myBodyString);
        if (this.clearPl) {
          this.songList = songsResponse.data
        } else {
          this.songList1 = songsResponse.data
          this.songList = this.songList.concat(this.songList1)
        }
        this.inpFavArt = ''
        this.inpFavGen = ''
        this.favorCk = false
        this.saveStorage()
      } catch (err) {
        console.log(err);
        alert("Error: getting favorites.")
      }
    },
    shufList() {
      let array = this.songList
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      this.songList = array;
      this.saveStorage()
    },
    logout() {
      this.$keycloak.logout();
    },
    login() {
      this.$keycloak.login();
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
  },
  computed: {
    keycloak() {
      return this.$keycloak;
    },
  },
  created() {
    if (this.keycloak.authenticated) {
      this.keycloak.loadUserProfile().then(profile => {
        this.userProfile = profile;
      });
    }
  },
})
</script>

<style>
li {
  border: 1px solid rgb(58, 57, 57);
  display: grid;
  grid-template-columns: 90% 10%;
  gap: 10px;
}

.liclass {
  margin-left: 5px;
}

.btn-fh {
  margin-top: 10px;
  width: 150px;
  padding-left: 5px;
  border: 2px solid rgb(135, 136, 135);
  display: flex;
  align-items: center;
}

.limitsong {
  width: 50px;
}

.searchform {
  padding-top: 10px;
}

.starfav {
  margin-top: 5px;
}

.songlist {
  border: 1px solid white;
  border-collapse: collapse;
}

table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
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

.audio-bt:hover {
  border: 1px solid #888;
  background-color: #ddd;
}

#close-image img {
  display: block;
  padding: 2px;
  height: 30px;
  width: 30px;
}
</style>