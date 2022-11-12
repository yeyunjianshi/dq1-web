export default class AudioManager {
  private _bgmAudio?: Audio
  private _meAudio?: Audio
  private _seAudio?: Audio

  private _volume = 100
  private _bgmVolume = 100
  private _sfxVolume = 100

  private resource: IResource

  constructor(resource: IResource) {
    this.resource = resource
  }

  private setAudioVolume(type: 'bgm' | 'me' | 'se') {
    if (type === 'bgm' && this._bgmAudio)
      this._bgmAudio.volume = (this._bgmVolume * this._volume) / 10000
    else if (type === 'me' && this._meAudio)
      this._meAudio.volume = (this._sfxVolume * this._volume) / 10000
    else if (type === 'se' && this._seAudio)
      this._seAudio.volume = (this._sfxVolume * this._volume) / 10000
  }

  playBGM(bgm?: string, reset = true, loop = true) {
    if (!bgm) return

    this.pauseBGM()
    const audio = this.resource.getAudio(bgm)
    if (audio) {
      this._bgmAudio = audio
      if (reset) this._bgmAudio.currentTime = 0
      this.setAudioVolume('bgm')
      this._bgmAudio.loop = loop
      this._bgmAudio.play()
    }
  }

  replayBGM() {
    this.setAudioVolume('bgm')
    this.replay(this._bgmAudio)
  }

  pauseBGM() {
    this.pause(this._bgmAudio)
  }

  playME(me?: string) {
    if (!me) return

    const audio = this.resource.getAudio(me)
    if (audio) {
      this._meAudio = audio
      this._meAudio.currentTime = 0
      this.setAudioVolume('me')
      this._meAudio.loop = false
      this._meAudio.play()
    }
  }

  playSE(se?: string) {
    if (!se) return

    const audio = this.resource.getAudio(se)
    if (audio) {
      this._seAudio = audio
      this.setAudioVolume('se')
      this._seAudio.currentTime = 0
      this._seAudio.loop = false
      this._seAudio.play()
    }
  }

  replay(audio?: Audio) {
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
  }

  pause(audio?: Audio) {
    if (audio) {
      audio.pause()
    }
  }

  public set volume(val: number) {
    this._volume = val
    this.setAudioVolume('bgm')
    this.setAudioVolume('me')
    this.setAudioVolume('se')
  }

  public get volume() {
    return this._volume
  }

  public set bgmVolume(val: number) {
    this._bgmVolume = val
    this.setAudioVolume('bgm')
  }

  public get bgmVolume() {
    return this._bgmVolume
  }

  public set sfxVolume(val: number) {
    this._sfxVolume = val
    this.setAudioVolume('se')
    this.setAudioVolume('me')
  }

  public get sfxVolume() {
    return this._sfxVolume
  }
}