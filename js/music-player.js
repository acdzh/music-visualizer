/// Copyright(C), 2018, weak_ptr <weak_ptr@163.com>
/// Open source and released under GPL-v3 License.
///
/// Author: weak_ptr <weak_ptr@163.com>
/// Date: 2018年11月5日 02点21分
///
/// Brief:
///
/// 简单的播放器模块，特色是可以自定义的 Visualizer.
///
/// Special thanks for Amarillys <719862760@qq.com>
/// His github homepage: https://github.com/Amarillys
/// Check it out.

/**
 * Music Player
 *
 * @brief Basic music player based on AudioContext standard.
 *        Support visualizer by inherit and implement renderVisualizer method.
 */
class MusicPlayer {

    constructor() {
        this.CompatibleAudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new this.CompatibleAudioContext;
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioBufferSourceNode = null;
        this.audioMediaElementSourceNode = null;
    }

    stop() {
        if (this.audioBufferSourceNode) {
            this.audioBufferSourceNode.stop();
        }

        if (this.audioMediaElementSourceNode) {
            this.audioMediaElementSourceNode.disconnect();
        }
    }

    loadFromFile(audioFile) {
        const audioElement = document.createElement('audio');
        const fileReader = new FileReader();
        const self = this;
        fileReader.onload = async function (e) {
            self.audioContext.decodeAudioData(e.target.result, function (decodedBuffer) {

                // stop previous play
                self.stop();

                self.audioBufferSourceNode = self.audioContext.createBufferSource();
                self.audioBufferSourceNode.connect(self.audioAnalyser);
                self.audioAnalyser.connect(self.audioContext.destination);
                self.audioBufferSourceNode.buffer = decodedBuffer;
                self.audioBufferSourceNode.start(0);
            })
        };
        fileReader.readAsArrayBuffer(audioFile);
    }

    loadFromMediaElement(id) {
        this.stop();
        let el = typeof id === 'string' ? document.getElementById(id) : id;

        this.audioMediaElementSourceNode = this.audioContext.createMediaElementSource(el);
        this.audioMediaElementSourceNode.connect(this.audioAnalyser);
        this.audioAnalyser.connect(this.audioContext.destination);
    }
}
