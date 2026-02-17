export default class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }

  create() {
    this.add.text(300, 200, "Mini Battleground", {
      fontSize: "40px",
      fill: "#ffffff"
    });

    const loginBtn = this.add.text(350, 350, "ENTER GAME", {
      fontSize: "30px",
      fill: "#00ff00",
      backgroundColor: "#222",
      padding: 10
    }).setInteractive();

    loginBtn.on("pointerdown", () => {
      this.scene.start("LobbyScene");
    });
  }
}
