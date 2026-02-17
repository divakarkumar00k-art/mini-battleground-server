const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    scene: [LoginScene, LobbyScene, MatchScene]
};

const game = new Phaser.Game(config);
