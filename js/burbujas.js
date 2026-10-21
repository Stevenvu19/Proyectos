document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("spring-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // 1. Configuración de Burbujas Realistas
    const bubbleCount = Math.floor((width * height) / 18000); // Mayor densidad para un efecto más envolvente
    const bubbles = [];

    class Bubble {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.radius = Math.random() * 8 + 2; // Variedad de tamaños (pequeñas y medianas)
            this.speedY = -(Math.random() * 1.5 + 0.6); // Velocidad de ascenso natural
            this.amplitude = Math.random() * 25 + 10; // Amplitud de la oscilación horizontal
            this.frequency = Math.random() * 0.03 + 0.01; // Frecuencia de oscilación
            this.angle = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.6 + 0.2; // Transparencias variadas
            this.wobbleSpeed = Math.random() * 0.05 + 0.02;
        }

        update() {
            this.y += this.speedY;
            this.angle += this.frequency;
            
            // Movimiento serpenteante natural de las burbujas al subir
            this.x += Math.sin(this.angle) * 0.8;

            // Si la burbuja sale por la parte superior, se reinicia abajo
            if (this.y < -20) {
                this.reset();
                this.y = height + Math.random() * 20;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // Cuerpo translúcido de la burbuja (degradado sutil para efecto realista)
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.3, 
                this.y - this.radius * 0.3, 
                this.radius * 0.1, 
                this.x, 
                this.y, 
                this.radius
            );
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(0.7, "rgba(135, 206, 250, 0.5)"); // Tinte azul agua sutil
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde brillante de la burbuja
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Reflejo de luz principal (Punto de brillo)
            ctx.beginPath();
            ctx.arc(
                this.x - this.radius * 0.35, 
                this.y - this.radius * 0.35, 
                this.radius * 0.25, 
                0, 
                Math.PI * 2
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fill();

            // Reflejo secundario más pequeño para mayor realismo volumétrico
            ctx.beginPath();
            ctx.arc(
                this.x + this.radius * 0.3, 
                this.y + this.radius * 0.2, 
                this.radius * 0.1, 
                0, 
                Math.PI * 2
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fill();

            ctx.restore();
        }
    }

    // Inicializar burbujas
    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(new Bubble());
    }

    // Bucle principal de animación optimizado
    function animate() {
        // Limpiar el canvas fotograma a fotograma
        ctx.clearRect(0, 0, width, height);

        // Actualizar y dibujar cada burbuja
        bubbles.forEach(b => {
            b.update();
            b.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});