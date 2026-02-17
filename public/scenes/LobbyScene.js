export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  create() {
    this.add.text(300, 200, "Lobby", {
      fontSize: "40px",
      fill: "#ffffff"
    });

    const startBtn = this.add.text(350, 350, "START MATCH", {
      fontSize: "30px",
      fill: "#ff0000",
      backgroundColor: "#222",
      padding: 10
    }).setInteractive();

    startBtn.on("pointerdown", () => {
      this.scene.start("MatchScene");
    });
  }
}
