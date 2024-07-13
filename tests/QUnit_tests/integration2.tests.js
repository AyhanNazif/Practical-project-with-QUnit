const baseUrl = "http://localhost:3030/";

QUnit.config.reorder = false;

let user = {

    email : "",
    password : "123456"
}

let token = "";
let userId = "";

let game = {

    title: "",
    category: "",
    maxLevel: "71",
    imageUrl: "./images/ZombieLang.png",
    summary: ""
}

let gameId = "";
let createdGameId = "";

let addComment = {
    gameId: "",
    comment: ""
}

QUnit.module("user functionalities", () => {

    QUnit.test("registration", async (assert) => {

        let path = "users/register";
        let random = Math.floor(Math.random() * 1000);
        let email = `user${random}@abv.bg`;
    
        user.email = email;
    
        let response = await fetch(baseUrl + path, {
    
            method : 'POST',
            headers : {
                'content-type' : 'application/json'
            },
            body : JSON.stringify(user)
        });
    
        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "Response should be OK");
        assert.ok(json.hasOwnProperty("email"), "email exist");
        assert.ok(json.email, user.email, "Email is correct");
        assert.ok(json.hasOwnProperty("password"), "Password exist");
        assert.ok(json.password, user.password, "Password is correct");
        assert.ok(json.hasOwnProperty("accessToken"), "accessToken exist");
        assert.ok(json.hasOwnProperty("_id"), "id exist");

        token = json.accessToken;
        userId = json._id;
        sessionStorage.setItem("game-user", JSON.stringify(user));
    });

    QUnit.test("user login", async (assert) => {

        let path = "users/login";
        let response = await fetch(baseUrl + path, {

            method : "POST",
            headers : {
                'content-type' : 'application/json'
            },
            body : JSON.stringify(user)
        });

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "Response for login should be OK");
        assert.ok(json.hasOwnProperty("email"), "email exist");
        assert.ok(json.email, user.email, "Email is correct");
        assert.ok(json.hasOwnProperty("password"), "Password exist");
        assert.ok(json.password, user.password, "Password is correct");
        assert.ok(json.hasOwnProperty("accessToken"), "accessToken exist");
        assert.ok(json.hasOwnProperty("_id"), "id exist");
        assert.ok(typeof json['_id'], 'string');

        token = json.accessToken;
        userId = json._id;
        sessionStorage.setItem("game-user", JSON.stringify(user));
    });

});

QUnit.module("game functionalities", () => {

    QUnit.test("Get all games", async(assert) => {

        let path = "data/games";
        let queryParams = "?sortBy=_createdOn%20desc";

        let response = await fetch(baseUrl + path + queryParams);

        let getAllGames = await response.json();

        assert.ok(response.ok, "Response for get all games should be OK");
        assert.ok(Array.isArray(getAllGames), "json should be array");

        for(let game of getAllGames){

            assert.ok(game.hasOwnProperty("title"), "title exist");
            assert.ok(game.hasOwnProperty("category"), "category exist");
            assert.ok(game.hasOwnProperty("summary"), "summary exist");
            assert.equal(typeof game.title, "string", "type of title is string");
            assert.equal(typeof game.category, "string", "type of category is string");
            assert.equal(typeof game.summary, "string", "type of summary is string");
        }
    });

    QUnit.test("Add game", async(assert) => {

        let path = "data/games";

        game.title = "Random2 title";
        game.category = "Some category";
        game.summary = "Some summary";

        let response = await fetch(baseUrl + path, {

            method: "POST",
            headers: {
                'content-type': 'application/json',
                'X-Authorization': token,
            },
            body: JSON.stringify(game)
        });

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "game is added");
        assert.equal(json.title, game.title);
        assert.equal(json.summary, game.summary);
        assert.equal(json.category, game.category);
        assert.equal(json.maxLevel, game.maxLevel);

        gameId = json._id;
    });

    QUnit.test("Get last created game", async(assert) => {

        let path = "data/games/";

        let response = await fetch(baseUrl + path + gameId);

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "last created game is given");
        assert.equal(json.title, game.title);
        assert.equal(json.summary, game.summary);
        assert.equal(json.category, game.category);
        assert.equal(json.maxLevel, game.maxLevel);
    });

    QUnit.test("Edit last created game", async(assert) => {

        let path = "data/games/";
        game.title = "ALAbala title";

        let response = await fetch(baseUrl + path + gameId, {

            method: "PUT",
            headers: {
                'content-type': 'application/json',
                'X-Authorization': token
            },

            body: JSON.stringify(game)
        });

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "last created game is edited");
        assert.equal(json.title, game.title);
        assert.equal(json.summary, game.summary);
        assert.equal(json.category, game.category);
        assert.equal(json.maxLevel, game.maxLevel);
        assert.equal(json._ownerId, userId);

    });

    QUnit.test("Delete last created game", async(assert) => {

        let path = "data/games/";

        let response = await fetch(baseUrl + path + gameId, {

            method: "DELETE",
            headers: {
                'content-type': 'application/json',
                'X-Authorization': token
            },

            body: JSON.stringify(game)
        });

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok, "last created game is deleted");
    });

});

QUnit.module("Comments functionalities", () => {

    QUnit.test("Get comments for created game", async(assert) => {

        let path = "data/games";

        game.title = "Test game";
        game.category = "Test category";
        game.summary = "Test summary";

        let response = await fetch(baseUrl + path, {

            method: "POST",
            headers: {
                'content-type': 'application/json',
                'X-Authorization': token
            },
            body: JSON.stringify(game)
        });

        let json = await response.json();
        console.log(json);
        
        createdGameId = json._id;

        let commentPath = "data/comments";
        let queryParam = `?where=gameId%3D%22${createdGameId}%22`;
        
        let commentRequest = await fetch(baseUrl + commentPath + queryParam);

        let jsonComment = await commentRequest.json();
        console.log(jsonComment);

        assert.ok(commentRequest.ok,"Comment request should be OK");
        assert.ok(Array.isArray(jsonComment),"result should be array");
        assert.ok(jsonComment.length === 0);
    });

    QUnit.test("Add comment", async(assert) => {

        let path = "data/comments";

        addComment.gameId = createdGameId;
        addComment.comment = "Example comment";

        let response = await fetch(baseUrl + path, {

            method: "POST",
            headers: {
                'content-type': 'application/json',
                'X-Authorization': token
            },
            body: JSON.stringify(addComment)
        });

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok,"Comment added");
        assert.equal(json.comment,addComment.comment);
        assert.equal(json.gameId, addComment.gameId);
        assert.equal(json._ownerId, userId);
    });

    QUnit.test("Comments for specific game", async(assert) => {

        let path = "data/comments";
        let queryParam = `?where=gameId%3D%22${createdGameId}%22`;

        let response = await fetch(baseUrl + path + queryParam);

        let json = await response.json();
        console.log(json);

        assert.ok(response.ok,"get comments");
        assert.ok(json[0].comment, addComment.comment);
        assert.ok(json[0].gameId, addComment.gameId);
    });
});