function enable_Snow() {
        const snowflakes = [];
        let animationId = null;

        function createSnowflake() {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.textContent = '❄';
            
            const size = Math.random() * 0.6 + 0.4;
            const x = Math.random() * window.innerWidth;
            const duration = Math.random() * 25 + 35;
            const swaySpeed = Math.random() * 2 + 1;
            const swayAmount = Math.random() * 60 + 30;
            
            snowflake.style.fontSize = (size * 1.5) + 'em';
            snowflake.style.left = x + 'px';
            snowflake.style.top = '-30px';
            snowflake.style.opacity = size;
            
            document.body.appendChild(snowflake);
            
            snowflakes.push({
                element: snowflake,
                x: x,
                y: -30,
                vx: Math.sin(Math.random() * Math.PI * 2) * 0.2,
                vy: (window.innerHeight + 60) / (duration * 60),
                swaySpeed: swaySpeed,
                swayAmount: swayAmount,
                time: 0,
                duration: duration * 60,
                opacity: size,
                swayOffset: Math.random() * Math.PI * 2
            });
        }

        function animate() {
            for (let i = snowflakes.length - 1; i >= 0; i--) {
                const flake = snowflakes[i];
                flake.time++;
                
                if (flake.time > flake.duration) {
                    flake.element.remove();
                    snowflakes.splice(i, 1);
                    continue;
                }
                
                flake.y += flake.vy;
                flake.x += flake.vx + Math.sin(flake.time * flake.swaySpeed * 0.01 + flake.swayOffset) * 0.15;
                
                const fadeStart = flake.duration * 0.85;
                const fadeOpacity = flake.time > fadeStart ? 
                    flake.opacity * (1 - (flake.time - fadeStart) / (flake.duration - fadeStart)) : 
                    flake.opacity;
                
                flake.element.style.transform = `translate(${flake.x}px, ${flake.y}px)`;
                flake.element.style.opacity = fadeOpacity;
            }
            
            animationId = requestAnimationFrame(animate);
        }

        function startSnowing() {
            for (let i = 0; i < 80; i++) {
                createSnowflake();
            }
            animate();
            setInterval(createSnowflake, 200);
        }

        startSnowing();
}
