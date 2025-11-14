class ParticleLogo {
  constructor() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    const header = document.querySelector('.frame');
    if (!header) {
      console.error('Header (.frame) not found!');
      return;
    }

    if (typeof THREE === 'undefined') {
      console.error('THREE.js not loaded!');
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 160 / 130, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    this.particles = [];
    this.textPositions = [];
    this.isFormed = false;
    this.logoImage = null;

    this.setupRenderer();
    this.getLogoPositions();
    this.animate();
  }

  setupRenderer() {
    this.renderer.setSize(160, 130);
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.z = 20;

    const header = document.querySelector('.frame');
    const canvas = this.renderer.domElement;

    canvas.style.position = 'absolute';
    canvas.style.top = '4px';
    canvas.style.left = '8px';
    canvas.style.cursor = 'pointer';
    canvas.style.zIndex = '10';
    canvas.style.border = 'none';
    canvas.style.backgroundColor = 'transparent';
    canvas.style.width = '160px';
    canvas.style.height = '130px';
    canvas.style.pointerEvents = 'auto';

    header.appendChild(canvas);

    // Create image element for final state
    this.createImageElement();

    canvas.addEventListener('click', (e) => {
      this.toggle();
    });
  }

  createImageElement() {
    this.logoImage = document.createElement('img');
    this.logoImage.src = './img/LOGO-192X192-removebg-preview.png';
    this.logoImage.style.position = 'absolute';
    this.logoImage.style.top = '4px';
    this.logoImage.style.left = '8px';
    this.logoImage.style.width = '160px';
    this.logoImage.style.height = '130px';
    this.logoImage.style.cursor = 'pointer';
    this.logoImage.style.zIndex = '11';
    this.logoImage.style.display = 'none';
    this.logoImage.style.pointerEvents = 'auto';

    const header = document.querySelector('.frame');
    header.appendChild(this.logoImage);

    this.logoImage.addEventListener('click', () => {
      this.toggle();
    });
  }

  createParticles() {
    if (this.textPositions.length === 0) {
      return;
    }

    const geometry = new THREE.BufferGeometry();

    // Custom shader material for individual particle movement
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute float aRandom;
        
        void main() {
          vec3 pos = position;
          
          // Individual random Z movement for each particle
          pos.z += sin(uTime * 2.0 + aRandom * 10.0) * 30.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uSize;
        }
      `,
      fragmentShader: `
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          if (distanceToCenter > 0.5) discard;
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
        }
      `,
      transparent: true,
    });

    const positions = new Float32Array(this.textPositions.length * 3);
    const randoms = new Float32Array(this.textPositions.length);

    for (let i = 0; i < this.textPositions.length; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.random() * 4;

      randoms[i] = Math.random();

      this.particles.push({
        currentX: positions[i * 3],
        currentY: positions[i * 3 + 1],
        currentZ: positions[i * 3 + 2],
        targetX: this.textPositions[i].x,
        targetY: this.textPositions[i].y,
        targetZ: 0,
        randomX: positions[i * 3],
        randomY: positions[i * 3 + 1],
        randomZ: positions[i * 3 + 2],
        randomSeed: Math.random() * 5,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  getLogoPositions() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 130;

    const img = new Image();
    img.onload = () => {
      this.textPositions = [];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let y = 0; y < canvas.height; y += 2.0) {
        for (let x = 0; x < canvas.width; x += 2.0) {
          const index = (y * canvas.width + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const alpha = pixels[index + 3];

          if (alpha > 100 && r + g + b > 400) {
            this.textPositions.push({
              x: (x - canvas.width / 2) * 0.12,
              y: (canvas.height / 2 - y) * 0.12,
            });
          }
        }
      }

      this.createParticles();
    };

    img.onerror = () => {
      console.error('Failed to load logo image');
    };

    img.src = './img/LOGO-192X192-removebg-preview.png';
  }

  toggle() {
    this.isFormed = !this.isFormed;

    if (this.isFormed) {
      // Scattered → Image (skip particle logo formation)
      this.showImage();
    } else {
      // Image → Scattered particles
      this.scatterParticles();
    }
  }

  showImage() {
    // Hide particles and show actual image
    if (this.points) {
      this.points.visible = false;
    }
    this.logoImage.style.display = 'block';
  }

  scatterParticles() {
    // Hide image and show particles
    this.logoImage.style.display = 'none';
    if (this.points) {
      this.points.visible = true;
    }

    if (typeof gsap === 'undefined') {
      this.particles.forEach((particle, i) => {
        particle.currentX = particle.randomX;
        particle.currentY = particle.randomY;
      });
    } else {
      this.particles.forEach((particle, i) => {
        gsap.to(particle, {
          currentX: particle.randomX,
          currentY: particle.randomY,
          duration: 1.5,
          ease: 'power2.out',
          delay: Math.random() * 0.3,
        });
      });
    }
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());

    if (this.points && this.particles.length > 0) {
      const time = Date.now() * 0.001;

      if (this.points.material.uniforms) {
        this.points.material.uniforms.uTime.value = time;
      }

      const positions = this.points.geometry.attributes.position.array;

      this.particles.forEach((particle, i) => {
        if (!this.isFormed) {
          particle.currentZ =
            particle.randomZ + Math.sin(time * 2 + particle.randomSeed) * 2;
        }

        positions[i * 3] = particle.currentX;
        positions[i * 3 + 1] = particle.currentY;
        positions[i * 3 + 2] = particle.currentZ;
      });

      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }
}

export { ParticleLogo };
