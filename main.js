const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const cdWidth = cd.offsetWidth
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: 'Be Like That',
            singer: '3 Doors Down',
            path: './assets/music/3 Doors Down - Be Like That.mp3',
            image: './assets/img/3 doors down1.jpg'
        },
        {
            name: 'Here Without You',
            singer: '3 Doors Down',
            path: './assets/music/3 Doors Down - Here Without You.mp3',
            image: './assets/img/3 doors down2.jpg'
        },
        {
            name: 'Kryptonite',
            singer: '3 Doors Down',
            path: './assets/music/3 Doors Down - Kryptonite.mp3',
            image: './assets/img/3 doors down3.jpg'
        },
        {
            name: 'When Im Gone',
            singer: '3 Doors Down',
            path: './assets/music/3 Doors Down - When Im Gone.mp3',
            image: './assets/img/3 doors down4.jpg'
        },
        {
            name: 'Home',
            singer: '3 Doors Down',
            path: './assets/music/Daughtry - Home.mp3',
            image: './assets/img/3 doors down2.jpg'
        },
        {
            name: 'Angels or Demons',
            singer: '3 Doors Down',
            path: './assets/music/Dishwalla - Angels or Demons.mp3',
            image: './assets/img/3 doors down3.jpg'
        },
        {
            name: 'Iris',
            singer: '3 Doors Down',
            path: './assets/music/Goo Goo Dolls - Iris.mp3',
            image: './assets/img/3 doors down4.jpg'
        },
        {
            name: 'Hanging By A Moment',
            singer: '3 Doors Down',
            path: './assets/music/Lifehouse - Hanging By A Moment.mp3',
            image: './assets/img/3 doors down4.jpg'
        },
    ],
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return ` 
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause()

        document.onscroll = function() {
            const scrollTop = window.scrollY;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        playBtn.onclick = function(){
            if(app.isPlaying){
                audio.pause()
            }else{      
                audio.play()
            }
        }
        audio.onpause = function(){
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        audio.onplay = function(){
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = audio.currentTime / audio.duration * 100
                progress.value = progressPercent
            }
        }
        progress.oninput = function(e) {
            audio.pause();
            const seekTime = e.target.value * (audio.duration / 100);
            audio.currentTime = seekTime;
            progress.onmouseup = function(){             
                setTimeout(() => {
                    audio.play();
                }, 300);
            }
        }
        nextBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }
        prevBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.prevSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }
        randomBtn.onclick = function(e){
            app.isRandom = !app.isRandom
            randomBtn.classList.toggle('active', app.isRandom)
            app.setConfig('isRandom', app.isRandom)
        }
        repeatBtn.onclick = function(e){
            app.isRepeat = !app.isRepeat
            repeatBtn.classList.toggle('active', app.isRepeat)
            app.setConfig('isrepeat', app.isRepeat)
        }
        audio.onended = function(){  
            if(app.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    app.render()
                    audio.play();      
                }
                if(e.target.closest('.option')){

                }
            }
        }
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 200)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    
    start: function() {
        this.loadConfig()
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentSong()
        this.render()
        randomBtn.classList.toggle('active', app.isRandom)
        repeatBtn.classList.toggle('active', app.isRepeat)
    }
}
app.start();