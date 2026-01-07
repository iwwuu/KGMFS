class ComponentFileSystem extends HTMLElement {
    static instanceFS = null;
    connectedCallback() {
        if (ComponentFileSystem.instanceFS){
            console.error("ERROR: only one file system per document is allowed.")
            return;
        }
        const fileView = document.createElement("div");
        const directory = document.createElement("div");
        fileView.id = "file-view";
        directory.id = "directory";
        
        const title = document.createElement("h2");
        title.insertAdjacentHTML("afterbegin", "<a href='../'>&lt;-</a> " + this.getAttribute("data-title"));
        directory.appendChild(title);
        
        directory.insertAdjacentHTML("beforeend", `
            <div class="file-line">
                <h3><b>File Name</b></h3>
                <h3><b>Last Modified</b></h3>
            </div>
        `)
        directory.insertAdjacentHTML("beforeend", this.innerHTML);
        this.innerHTML = '';
        
        fileView.appendChild(directory)
        this.appendChild(fileView)

        if (directory.querySelector("mock-file[data-type='audioStream']") !== null) {
            const musicView = document.createElement("div");
            const playerFiles = document.createElement("div");
            
            musicView.id = "music-view";
            playerFiles.id = "playerfiles";
            playerFiles.style.display = "none";

            musicView.insertAdjacentHTML("afterbegin", `
                <div id="marquee-wrapper">
                    <h3 id="music-title"></h3>
                </div>
                <div class="controls">
                    <a id="backward" class="fas fa-backward"></a>
                    <a id="pause" class="fas fa-pause"></a>
                    <a id="play" class="fas fa-play"></a>
                    <a id="forward" class="fas fa-forward"></a>
                </div>
            `);
            
            this.appendChild(musicView);
            this.appendChild(playerFiles);
        }
        
        if (directory.querySelector("mock-file[data-type='image']") !== null) {
            const imageView = document.createElement("div");
            imageView.id = "image-view";

            imageView.insertAdjacentHTML("afterbegin", `
                <a class="left-delta">Δ</a>
                <div class="files-image-container">
                    <h3 id="image-title"></h3>
                    <img>
                    <div>
                        <a class="left-delta delta-small-screen">Δ</a>
                        <a class="right-delta delta-small-screen">Δ</a>
                    </div>
                </div>
                <a class="right-delta">Δ</a>
            `);
            
            this.appendChild(imageView);
        }
        ComponentFileSystem.instanceFS = this;
    }
}

class ComponentFile extends HTMLElement {
    connectedCallback() {
        if (!this.hasAttribute("data-name")){
            console.error("ERROR: data-name cannot be blank!", this.outerHTML)
            return;
        }
        if (!this.hasAttribute("data-content") && this.hasAttribute("data-type")){
            console.error("ERROR: file must contain appropriate data-content!", this.outerHTML)
            return;
        }

        const name = document.createElement("h3");
        name.textContent = this.getAttribute("data-name");

        const lastModified = document.createElement("h3");
        if (!this.hasAttribute("data-last-modified")) {
            lastModified.textContent = "01 JAN 1970 00:00"
        }
        else {
            lastModified.textContent = this.getAttribute("data-last-modified");
        }

        if (this.getAttribute("data-type") === "link"){
            this.addEventListener('click', function () {
                window.location.href = this.getAttribute("data-content");
            });
        }

        this.classList.add("file-line");
        this.appendChild(name);
        this.appendChild(lastModified);
    }
}

customElements.define("mock-file-system", ComponentFileSystem);
customElements.define("mock-file", ComponentFile);