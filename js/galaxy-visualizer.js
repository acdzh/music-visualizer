/// Copyright(C), 2018, weak_ptr <weak_ptr@163.com>
/// Open source and released under GPL-v3 license.
///
/// Author: weak_ptr <weak_ptr@163.com>
/// Date: 2018年11月5日 18点49分
///
/// Brief:
///        漂亮的星空背景，随音乐律动。
///


/**
 * Music player with galaxy visualizer
 *
 * @brief
 */
class GalaxyVisualizer {
    /**
     * constructor
     * @param audioPlayer
     */
    constructor(audioPlayer) {
        this.audioAnalyser = audioPlayer.audioAnalyser;
        this.maxOrbit = null;
    }
	

	
	

	
	
    /**
     * get random integer between min and max.
     * @param min
     * @param max
     * @returns {*}
     */
    static random(min, max) {
        if (arguments.length < 2) {
            max = min;
            min = 0;
        }

        if (min > max) {
            const hold = max;
            max = min;
            min = hold;
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * configure visualizer and canvas context.
     * @param id
     * @param frequencyQuantity
     */
    setupVisualizer(id, frequencyQuantity) {
        this.visualizerCanvasId = id;
        this.visualizerCanvas = document.getElementById(this.visualizerCanvasId);
        this.visualizerCanvasContext = this.visualizerCanvas.getContext('2d');
        this.visualizerFrequencyQuantity = frequencyQuantity;

        // make sure analyser can always output enough energy data for visualizer.
        // if double times quantity higher than audio source sample rate this maybe take some errors.
        // be careful.
        if (this.visualizerFrequencyQuantity > this.audioAnalyser.fftSize / 2) {
            this.audioAnalyser.fftSize = this.visualizerFrequencyQuantity * 2;
        }

        // orbit configuration
        const longerAxis = Math.max(this.visualizerCanvas.width, this.visualizerCanvas.height);
        const diameter = Math.round(Math.sqrt(longerAxis * longerAxis + longerAxis * longerAxis));
        this.maxOrbit = diameter / 2;

        // create stars
        this.starByFreq = {};

        for (let freq = 0; freq < this.visualizerFrequencyQuantity; freq++) {
            const num = GalaxyVisualizer.random(1, 2);
            const stars = [];

            for (let i = 0; i < num; i++) {
                const orbit = GalaxyVisualizer.random(this.maxOrbit);
                const star = new GalaxyVisualizer.Star(orbit);
                star.speed = Math.random() / 1000;
                star.timePassed = GalaxyVisualizer.random(0, 1000);
                star.radius = GalaxyVisualizer.random(30, 60) * orbit / this.maxOrbit;
                stars.push(star);
            }

            this.starByFreq[freq] = stars;
        }

        requestAnimationFrame(this.renderVisualizer.bind(this));
    }

    renderVisualizer() {
        requestAnimationFrame(this.renderVisualizer.bind(this));
        const energyArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        this.audioAnalyser.getByteFrequencyData(energyArray);

        this.visualizerCanvasContext.fillStyle = 'hsla(' + 198 + ', 64%, 6%, 1)';
        this.visualizerCanvasContext.fillRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);

        for (let freq = 0; freq < this.visualizerFrequencyQuantity; freq++) {
            const energy = energyArray[freq];
            for (const star of this.starByFreq[freq]) {
                star.draw(this.visualizerCanvasContext, energy + 100 * star.orbit / this.maxOrbit);
                star.move(energy + 100 * star.orbit / this.maxOrbit)
            }
        }
    }
}

GalaxyVisualizer.Star =
    /**
     * GalaxyVisualizerStar, twinkle with energy change.
     */
    class {
        constructor(orbit) {
            this.radius = 15;
            this.speed = 0;
            this.orbit = orbit;
            this.position = {x: 0, y: 0};

            this.timePassed = 0;
            this.scaleLevel = 0.5;
        }

        static energyToGradient(energy, gradient) {
            const HSLA_BASE = {hue: 230, saturation: 61, lightness: 1, alpha: 1};
            const HSLA_RATE = {hue: 0, saturation: 0.0001, lightness: 0.2, alpha: 0.0001};
            const HSLA_MAXIMUM = {hue: 255, saturation: 75, lightness: 45, alpha: 1};

            const calculateResult = {
                hue: Math.min(HSLA_BASE.hue + HSLA_RATE.hue * energy, HSLA_MAXIMUM.hue),
                saturation: Math.min(HSLA_BASE.saturation + HSLA_RATE.saturation * energy, HSLA_MAXIMUM.saturation),
                lightness: Math.min(HSLA_BASE.lightness + HSLA_RATE.lightness * energy, HSLA_MAXIMUM.lightness),
                alpha: Math.min(HSLA_BASE.alpha + HSLA_RATE.alpha * energy, HSLA_MAXIMUM.alpha),
            };

            const hsla = new HSLA(calculateResult.hue, calculateResult.saturation, calculateResult.lightness, calculateResult.alpha);

            gradient.addColorStop(0.01, '#fff');
            gradient.addColorStop(0.1, hsla.toString());
            hsla.lightness *= 0.8;
            hsla.alpha = 0.3;
            gradient.addColorStop(Math.max(hsla.lightness / 100, 0.1), hsla.toString());
            gradient.addColorStop(1, 'transparent');
        }

        draw(ctx, energy) {
            // 基于原点位置重新计算绘制坐标
            const ZERO = {x: ctx.canvas.width / 2, y: ctx.canvas.height / 2};
				
            // 确定缩放后大小
			const RadiusRateMax = 0.003
			const RadiusRateMin = 0.0015
			const RadiusRateRandom = Math.random()*(RadiusRateMax - RadiusRateMin)
			
            const dstRadius = this.radius * (this.scaleLevel + energy * RadiusRateRandom);
            const dstPosX = ZERO.x + this.position.x;
            const dstPosY = ZERO.y + this.position.y;

            // 确定渐变色
            const gradient = ctx.createRadialGradient(dstPosX, dstPosY, 0, dstPosX, dstPosY, dstRadius);
            GalaxyVisualizer.Star.energyToGradient(energy, gradient);

            // 绘制
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(dstPosX, dstPosY, dstRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        move(energy) {
            this.position.x = Math.cos(this.timePassed) * this.orbit;
            this.position.y = Math.sin(this.timePassed) * this.orbit / 2;
            this.timePassed += (energy / 100) * this.speed;
        }
    };
