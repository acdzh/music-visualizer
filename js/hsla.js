class HSLA {
    constructor(hue = 0, saturation = 0, lightness = 0, alpha = 0) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
        this.alpha = alpha;
    }

    toString() {
        return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`
    }
}