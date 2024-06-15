import EventManagerSingleton from '../../../src/UseCases/EventManagementComponent/EventManagerSingleton';
import { constants } from './constants';

import * as path from 'path';

import TokenCallingState from '../../../src/UseCases/TokenCallingComponent/TokenCallingState';
import TokenCallingStateManagerSingleton from '../../../src/UseCases/TokenCallingComponent/TokenCallingStateManagerSingleton';
import { readFile } from '../../../src/FrameworksAndDrivers/Frameworks/electronApp/helpers/storageHandler';
import PluginConfigElement from '../../../src/UseCases/PluginManagementComponent/PluginModule/PluginConfigElement';
import TokenCountStorageImplementation from '../../../src/FrameworksAndDrivers/Drivers/TokenCountStorageImplementation';

export default class AudioRingerSingleton {
  private static instance = new AudioRingerSingleton();

  private isPlaying: boolean;
  private tokenCallingStates: TokenCallingState[] = [];

  private constructor() {
    this.isPlaying = false;
  }

  public static getInstance() {
    return this.instance;
  }

  public isAudioPlaying() {
    return this.isPlaying;
  }

  public addToTokenCallingStates(tokenCallingState: TokenCallingState) {
    this.tokenCallingStates.push(tokenCallingState);
  }

  public async getCallingRange() {
    const configsJSON = await readFile(path.join(__dirname, '../pluginConfig.json'));
    const configs: PluginConfigElement[] = JSON.parse(configsJSON);
    let rangeConfig: PluginConfigElement = configs.find(config => config.name === 'Range');
    return rangeConfig.value;
  }

  public async getCallingTimeIntervalMS(){
    const configsJSON = await readFile(path.join(__dirname, '../pluginConfig.json'));
    const configs: PluginConfigElement[] = JSON.parse(configsJSON);
    let rangeConfig: PluginConfigElement = configs.find(config => config.name === 'IntervalMS');
    return rangeConfig.value;
  }

  public async getLastToken() {
    const lastToken = await TokenCountStorageImplementation.getLatestCustomerTokenCount();
    return lastToken;
  }

  public async getAudioTracksForTokenCallingState(tokenCallingState: TokenCallingState) {
    let tokenCategory: string = tokenCallingState.nextToken.tokenCategory;;
    let tokenNumber: number = tokenCallingState.nextToken.tokenNumber;;
    let tracks: string[] = [];
    let i = 0;

    const callingRange = parseInt(await this.getCallingRange() as string);
    const lastToken = await this.getLastToken();

    const defaultAudioFolder = path.join(__dirname, '../audios/audio_default');
    const nepaliAudioFolder = path.join(__dirname, '../audios/audio_nepali');

    tracks = [`${defaultAudioFolder}/dingdong.wav`];
    tracks.push(`${nepaliAudioFolder}/token_no.wav`);
    for (i = tokenNumber; i < tokenNumber + callingRange; i++) {
      let tokenNumber = i;
      const thousand = parseInt((tokenNumber / 1000).toString()) * 1000;
      tokenNumber = tokenNumber % 1000;
      const hundred = parseInt((tokenNumber / 100).toString()) * 100;
      tokenNumber = tokenNumber % 100;


      tokenCategory && tracks.push(`${nepaliAudioFolder}/${tokenCategory.toUpperCase()}.wav`);
      thousand && tracks.push(`${nepaliAudioFolder}/${thousand.toString()}.wav`);
      hundred && tracks.push(`${nepaliAudioFolder}/${hundred.toString()}.wav`);
      tokenNumber && tracks.push(`${nepaliAudioFolder}/${tokenNumber.toString()}.wav`);

      if (i == lastToken) {
        break;
      }
    }

    await TokenCountStorageImplementation.updateCurrentCount(i - 1);

    return tracks;
  }

  public async playAudioTrackForTokenCallingState(tokenCallingState: TokenCallingState) {
    const tracks = await this.getAudioTracksForTokenCallingState(tokenCallingState);
    const interval = parseInt(await this.getCallingTimeIntervalMS() as string);

    const audio = new Audio(tracks[0]);
    audio.src = tracks[0];
    audio.play();

    this.isPlaying = true;

    let index = 1;
    audio.onended = () => {

      if (index >= 2 && index < tracks.length) { // 2 because we transmit token number after dingdong and token_no sound
        const toPublish = {
          tokenNumber: (tokenCallingState.nextToken.tokenNumber + index - 2).toString(),
          tokenCategory: tokenCallingState.nextToken.tokenCategory,
          counter: tokenCallingState.operator.getCounter().toString()
        }

        EventManagerSingleton.getInstance().emit(constants.DMDPublish, toPublish);
        EventManagerSingleton.getInstance().emit(constants.SERIALTRANSFER, toPublish);
      }

      setTimeout(() => {
        if (index < tracks.length) {
          audio.src = tracks[index];
          audio.play();
          index++;
        } else {
          const operator = tokenCallingState.operator.getUserInfo().username;
          TokenCallingStateManagerSingleton.getInstance().removeStateLockerForOperatorCallingState(operator, constants.LOCKER_NAME);
          this.isPlaying = false;
          EventManagerSingleton.getInstance().emit(constants.START_AUDIO_PLAY);
        }
      }, interval)
    }
  }

  public async beginAudioPlay() {
    const tokenCallingStateToBePlayed = this.tokenCallingStates.shift();
    if (tokenCallingStateToBePlayed) {
      await this.playAudioTrackForTokenCallingState(tokenCallingStateToBePlayed);
    } else {
      return;
    }
  }
}



EventManagerSingleton.getInstance().on(constants.START_AUDIO_PLAY, async () => {
  if (AudioRingerSingleton.getInstance().isAudioPlaying()) {
    return;
  } else {
    await AudioRingerSingleton.getInstance().beginAudioPlay();
  }
});