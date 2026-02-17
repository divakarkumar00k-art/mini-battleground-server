import LoginScene from "./scenes/LoginScene.js";
import LobbyScene from "./scenes/LobbyScene.js";
import MatchScene from "./scenes/MatchScene.js";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [LoginScene, LobbyScene, MatchScene]
};

new Phaser.Game(config);
