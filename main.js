import "./file-components.js"
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let cur_song;
let isPlayerReady = false;
let isPaused = false;
window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('playerfiles', {
        height: '600',
        width: '600',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    isPlayerReady = true;
    play.style.display = "none";
    play.addEventListener('click', () => {
        player.playVideo();
    });
    pause.addEventListener('click', () => {
        player.pauseVideo();
    });
}

function onPlayerStateChange(event) {
    const musicTitle = document.getElementById("music-title");
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    const forward = document.getElementById("forward");
    
    musicTitle.textContent = cur_song;
    if (cur_song.length > 25) {
        musicTitle.classList.add("scrolling-left");
    }
    else {
        musicTitle.classList.remove("scrolling-left")
    }

    switch (event.data) {
        case YT.PlayerState.PLAYING:
            play.style.display = "none";
            pause.style.display = "inline-block";
            break;
        case YT.PlayerState.PAUSED:
            pause.style.display = "none";
            play.style.display = "inline-block";
            document.querySelector(".scrolling-left").style.animationPlayState = "paused"
            isPaused = true;
            break;
        case YT.PlayerState.BUFFERING:
            pause.style.display = "none";
            play.style.display = "inline-block";
            if (!isPaused){
                musicTitle.textContent = "LOADING...";
                musicTitle.classList.remove("scrolling-left")
            }
            break;
        case YT.PlayerState.ENDED:
            forward.click();
            break;
        default:
            pause.style.display = "none";
            play.style.display = "inline-block";
            musicTitle.textContent = "ERROR, CANNOT PLAYBACK SONG";
            break;
    }

    if (isPaused && event.data !== YT.PlayerState.PAUSED) {
        isPaused = false;
        document.querySelector(".scrolling-left").style.animationPlayState = "running"
    }
}

let index;

function isDocumentReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

isDocumentReady(() => {
    let images = []
    let music = []
    let music_ids = []
    let image_src = []
    
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    const forward = document.getElementById("forward");
    const backward = document.getElementById("backward");

    const musicTitle = document.getElementById("music-title");
    const imageTitle = document.getElementById("image-title");
    const marqueeWrapper = document.getElementById("marquee-wrapper");
    
    const image = document.querySelector("img");

    const fileView = document.getElementById("file-view");
    const imageView = document.getElementById("image-view");
    const musicView = document.getElementById("music-view");

     const findIndex = (name, array) => {
        for (let index = 0; index < array.length; index++) {
            if (!array[index].localeCompare(name))
                return index;
        }
        return -1;
    }

    function replaceMusic(name) {
        player.stopVideo()
        let videoId = music_ids[name];

        while (!isPlayerReady);
        if (videoId !== null) {
            player.loadVideoById(videoId, 0);
            musicTitle.textContent = "LOADING...";
            musicTitle.classList.remove("scrolling-left")
            cur_song = name;
            
            player.setVolume(100);
            player.setPlaybackRate(1);
            player.playVideo();
        }
    }

    function replaceImage(name, transition = true) {
        imageTitle.textContent = name;
        if (transition) {
            image.style.opacity = 0;
            setTimeout(function () {
                image.removeAttribute('src');
                image.style.display = '';
                setTimeout(function () {
                    image.setAttribute("src", image_src[name]);
                    image.style.opacity = 1;
                }, 20)
            }, 400)
        }
        else {
            image.setAttribute("src", image_src[name]);
        }
    }

    document.querySelectorAll("mock-file").forEach((item) => {
        let name = item.getAttribute("data-name")?.replace(/\p{Emoji_Presentation}/gu, '');
        let content = item.getAttribute('data-content');
        if (item.getAttribute("data-type") === "audioStream") {
            music.push(name);
            music_ids[name] = content;

            item.addEventListener('click', () => {
                history.pushState({file: name, type: "music"}, name, "#"+name);
                replaceMusic(name, false);
                fileView.style.opacity = 0;
                fileView.style.animation = "fadein 400ms";
                setTimeout(function () {
                    musicView.style.display = "flex";
                    musicView.style.opacity = 1;
                    fileView.style.display = "none";
                }, 400)
            });
        }
        else if (item.getAttribute("data-type") === "image") {
            images.push(name);
            image_src[name] = content;
            let img = new Image();
            img.src = content;

            item.addEventListener('click', () => {
                history.pushState({"file": name, "type": "image"}, name, "#"+name);
                replaceImage(name, false);
                fileView.style.opacity = 0;
                fileView.style.animation = "fadein 400ms";
                setTimeout(function () {
                    imageView.style.display = "flex";
                    imageView.style.opacity = 1;
                    fileView.style.display = "none";
                }, 400)
            });
        }
    });

    if (images.length < 2) {
        document.querySelectorAll(".left-delta, .right-delta").forEach((item) => {
            item.style.display = "none";
        })
    } else {
        document.querySelectorAll(".left-delta, .right-delta").forEach((item) => {
            if (item.classList.contains("left-delta")) {
                item.addEventListener('click', () => {
                    let name = imageTitle.textContent?.replace(/\p{Emoji_Presentation}/gu, '');
                    index = findIndex(name, images);
                    
                    if (index == 0)
                        index = images.length - 1;
                    else index--;
                    history.replaceState({file: images[index], type: "image", transition: true}, images[index], "#"+images[index]);
                    replaceImage(images[index]);
                })
            }
            else {
                item.addEventListener('click', () => {
                    let name = imageTitle.textContent?.replace(/\p{Emoji_Presentation}/gu, '');
                    index = findIndex(name, images);

                    if (index == images.length - 1)
                        index = 0;
                    else index++;
                    history.replaceState({file: images[index], type: "image", transition: true}, images[index], "#"+images[index]);
                    replaceImage(images[index]);
                })
            }
        })
    }

    if (backward) {
        backward.addEventListener('click', () => {
            let name = cur_song
            index = findIndex(name, music);

            if (index == 0)
                index = music.length - 1;
            else index--;
            history.replaceState({file: music[index], type: "music", transition: true}, music[index], "#"+music[index]);
            replaceMusic(music[index]);
        })
    }

    if (forward) {
        forward.addEventListener('click', () => {
            let name = cur_song
            index = findIndex(name, music);
            
            if (index == music.length - 1)
                index = 0;
            else index++;
            history.replaceState({file: music[index], type: "music", transition: true}, music[index], "#"+music[index]);
            replaceMusic(music[index]);
        })
    }

    if (imageTitle) {
        imageTitle.addEventListener('click', () => {
            history.back();
            imageView.style.opacity = 0;
            setTimeout(function () {
                fileView.style.display = "flex";
                fileView.style.opacity = 1;
                imageView.style.display = "none";
            }, 400)
        });
    }

    
    if (marqueeWrapper) {
        marqueeWrapper.addEventListener('click', () => {
            history.back();
            musicView.style.opacity = 0;
            play.style.display = "none";
            pause.style.display = "inline-block";
            player.pauseVideo();
            setTimeout(function () {
                fileView.style.display = "flex";
                fileView.style.opacity = 1;
                musicView.style.display = "none";
            }, 400)
        });
        
        marqueeWrapper.addEventListener("mouseenter", () => { 
            if (!isPaused) {
                document.querySelector(".scrolling-left").style.animationPlayState = "paused"
            }
        });
        marqueeWrapper.addEventListener("mouseleave", () => { 
            if (!isPaused) {
                document.querySelector(".scrolling-left").style.animationPlayState = "running"
            }
        });
    }

    window.addEventListener("popstate", (event) => {
        if (event.state) {
            const name = event.state["file"];
            if (event.state["type"] == "music"){
                replaceMusic(name, false);
                fileView.style.opacity = 0;
                fileView.style.animation = "fadein 400ms";
                setTimeout(function () {
                    musicView.style.display = "flex";
                    musicView.style.opacity = 1;
                    fileView.style.display = "none";
                }, 400)
            }
            else if (event.state["type"] == "image"){
                replaceImage(name, false);
                fileView.style.opacity = 0;
                fileView.style.animation = "fadein 400ms";
                setTimeout(function () {
                    imageView.style.display = "flex";
                    imageView.style.opacity = 1;
                    fileView.style.display = "none";
                }, 400)
            }
        } else {
            if (marqueeWrapper) {
                musicView.style.opacity = 0;
                play.style.display = "none";
                pause.style.display = "inline-block";
                player.pauseVideo();
            }
            if (imageTitle) {
                imageView.style.opacity = 0;
            }
            setTimeout(function () {
                fileView.style.display = "flex";
                fileView.style.opacity = 1;
                if (musicView) musicView.style.display = "none";
                if (imageView) imageView.style.display = "none";
            }, 400)
        }
    })
});