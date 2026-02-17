export default class MatchScene extends Phaser.Scene {
  constructor() {
    super("MatchScene");
  }

  create() {
    this.add.text(300, 200, "Match Started", {
      fontSize: "40px",
      fill: "#ffffff"
    });

    this.add.text(250, 300, "Aircraft Jump System Coming Next 🚀", {
      fontSize: "25px",
      fill: "#ffff00"
    });
  }
}
