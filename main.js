const featuredDiv = document.querySelector('#featuredgame');
const allGamesDiv = document.querySelector('#allgamessection');

function renderFeaturedGame() {
    const featuredGame = games.find(game => game.name === featuredGameName);
    if (!featuredGame) return;

    featuredDiv.innerHTML =
            `<a href="${featuredGameName}/index.html">
                <img src="${featuredGameName}/media/thumbnail.png" alt="${featuredGame.title} Thumbnail" class="gamethumb"/>
            </a>
            <div class="gamedetails">
                <h3 class="gametitle">${featuredGame.title}</h3>
                <p class="gamedesc">${featuredGame.description}</p>
            </div>`

    
}

function renderAllGames() {
    games.forEach(game => {
        allGamesDiv.innerHTML += `
            <div class="gameitem">
                <a href="${game.name}/index.html">
                    <img src="${game.name}/media/thumbnail.png" alt="${game.title} Thumbnail" class="gamethumb"/>
                    <span class="gametitle">${game.title}</span>
                </a>
            </div>
        `;
    });
}

renderAllGames();

renderFeaturedGame();
