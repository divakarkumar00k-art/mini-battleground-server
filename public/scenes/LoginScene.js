class LoginScene extends Phaser.Scene {
    constructor() {
        super("LoginScene");
    }

    create() {

        // Background
        this.add.rectangle(640, 360, 1280, 720, 0x0d1b0f);

        // Animated fog particles
        const particles = this.add.particles(0xffffff);
        particles.createEmitter({
            x: { min: 0, max: 1280 },
            y: 0,
            lifespan: 6000,
            speedY: { min: 20, max: 40 },
            scale: { start: 0.2, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });

        // Title
        this.add.text(100, 100, "MINI BATTLEGROUND", {
            fontSize: "48px",
            fill: "#00ff88",
            fontStyle: "bold"
        });

        this.add.text(100, 170, "Survive. Shoot. Win.", {
            fontSize: "22px",
            fill: "#ffffff"
        });

        // Glass panel
        this.add.rectangle(900, 360, 400, 400, 0x000000, 0.6)
            .setStrokeStyle(2, 0x00ff88);

        // Username Input (HTML element)
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter Username";
        input.maxLength = 12;
        input.style.position = "absolute";
        input.style.left = "800px";
        input.style.top = "300px";
        input.style.width = "200px";
        input.style.height = "40px";
        input.style.fontSize = "18px";
        document.body.appendChild(input);

        // Login Button
        const loginBtn = this.add.text(880, 380, "LOGIN", {
            fontSize: "28px",
            backgroundColor: "#00aa66",
            padding: 10
        }).setInteractive();

        loginBtn.on("pointerdown", () => {
            if (input.value.trim() !== "") {
                localStorage.setItem("username", input.value.trim());
                document.body.removeChild(input);
                this.scene.start("LobbyScene");
            }
        });

        // Guest Button
        const guestBtn = this.add.text(850, 450, "Play as Guest", {
            fontSize: "20px",
            fill: "#ffffff"
        }).setInteractive();

        guestBtn.on("pointerdown", () => {
            const randomID = "Guest_" + Math.floor(Math.random() * 9999);
            localStorage.setItem("username", randomID);
            document.body.removeChild(input);
            this.scene.start("LobbyScene");
        });

        // Help Icon
        const help = this.add.text(1200, 20, "❓", {
            fontSize: "28px"
        }).setInteractive();

        help.on("pointerdown", () => {
            alert("Developer:\nmr.divakr00 (Instagram)");
        });

    }
}
