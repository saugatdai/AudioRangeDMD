import * as path from 'path';

import { ipcRenderer } from 'electron';

import './Helpers/mqttInit';
import './Helpers/mqttClient';
import './Helpers/RegisterSerialPorts';
import './Helpers/serialPortInit';

import { Plugin } from './interfaces';
import { callNextAudioPipeline, callAgainPipeline, bypassPipeline, randomCallPipeline, tokenForwardPipeline } from './PipelineExecutors';

ipcRenderer.invoke("CreateNewWindow", {
  height: 400,
  width: 600,
  webPreferences: {
    preload: path.join(__dirname, '/Helpers/preload.js')
  }
}, path.join(__dirname, '/Helpers/index.html'), false);

const AudioRingerPlugin: Plugin = {
  eventHandlers: [],
  pipelineExecutors: [callNextAudioPipeline, callAgainPipeline, bypassPipeline, randomCallPipeline, tokenForwardPipeline],
  priority: 10000,
};

export default AudioRingerPlugin;