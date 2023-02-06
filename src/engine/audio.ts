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
    if (!bgm) {
      this.pauseBGM()
      return
    }

    const audio = this.resource.getAudio(bgm)
    if (audio) {
      if (!reset && audio !== this._bgmAudio && !audio.paused) return

      this.pause(this._bgmAudio)
      this._bgmAudio = audio
      this._bgmAudio.currentTime = 0
      this.setAudioVolume('bgm')
      this._bgmAudio.loop = loop
      this._bgmAudio.play()
    }
  }

  replayBGM(reset = true) {
    this.setAudioVolume('bgm')
    this.replay(this._bgmAudio, reset)
  }

  pauseBGM() {
    this.pause(this._bgmAudio)
  }

  playME(me?: string, reset = true, loop = false) {
    if (!me) {
      this.pauseME()
      return
    }

    const audio = this.resource.getAudio(me)
    if (audio) {
      if (!reset && audio === this._meAudio && !audio.paused) return

      this.pause(this._meAudio)
      this._meAudio = audio
      this._meAudio.currentTime = 0
      this.setAudioVolume('me')
      this._meAudio.loop = loop
      this._meAudio.play()
    }
  }

  pauseME() {
    this.pause(this._meAudio)
  }

  playSE(se?: string, reset = true, loop = false) {
    if (!se) {
      this.pauseSE()
      return
    }

    const audio = this.resource.getAudio(se)
    if (audio) {
      if (!reset && audio === this._seAudio && !audio.paused) return

      this.pause(this._seAudio)
      this._seAudio = audio
      this.setAudioVolume('se')
      this._seAudio.currentTime = 0
      this._seAudio.loop = loop
      this._seAudio.play()
    }
  }

  pauseSE() {
    this.pause(this._seAudio)
  }

  replay(audio?: Audio, reset = true) {
    if (audio) {
      if (reset) audio.currentTime = 0
      audio.play()
    }
  }

  pause(audio?: Audio) {
    if (audio) {
      audio.pause()
    }
  }

  public get BGMAudio() {
    return this._bgmAudio
  }

  public get MEAudio() {
    return this._meAudio
  }

  public get SEAudio() {
    return this._seAudio
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
