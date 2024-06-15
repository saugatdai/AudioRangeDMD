import EventManagerSingleton from '../../src/UseCases/EventManagementComponent/EventManagerSingleton';
import PipelineExecutor from '../../src/UseCases/PluginManagementComponent/PluginModule/PipelineExecutor';
import PipelineTypes from '../../src/UseCases/PluginManagementComponent/PluginModule/PipelineTypes';
import Feature from '../../src/UseCases/TokenCallingComponent/Feature';
import TokenCallingState from '../../src/UseCases/TokenCallingComponent/TokenCallingState';
import AudioRingerSingleton from './Helpers/preload';
import { constants } from './Helpers/constants';
import TokenCallingStateManagerSingleton from '../../src/UseCases/TokenCallingComponent/TokenCallingStateManagerSingleton';


const audioRing: Feature = {
  runFeature(tokenCallingState: TokenCallingState) {
    if (tokenCallingState.endOfQueue) {
      return
    } else {
      const operator = tokenCallingState.operator.getUserInfo().username;
      TokenCallingStateManagerSingleton.getInstance().addStateLockerForOperatorCallingState(operator, constants.LOCKER_NAME);
      AudioRingerSingleton.getInstance().addToTokenCallingStates(tokenCallingState);
      EventManagerSingleton.getInstance().emit(constants.START_AUDIO_PLAY);
    }
  },
  goToNextFeature: true
};

class PipelineExecutorClass implements PipelineExecutor {
  public features: Feature[] = [];
  public pipelineType: PipelineTypes;
  constructor(pipelineType: PipelineTypes) {
    this.pipelineType = pipelineType;
  }

  public addFeature(feature: Feature): void {
    this.features.push(feature);
  }
}

const callNextAudioPipeline = new PipelineExecutorClass(PipelineTypes.CALL_NEXT_TOKEN);
const callAgainPipeline = new PipelineExecutorClass(PipelineTypes.CALL_AGAIN_TOKEN);
const bypassPipeline = new PipelineExecutorClass(PipelineTypes.BYPASS_TOKEN);
const randomCallPipeline = new PipelineExecutorClass(PipelineTypes.RANDOM_CALL);
const tokenForwardPipeline = new PipelineExecutorClass(PipelineTypes.FORWARD_TOKEN);

callNextAudioPipeline.addFeature(audioRing);
callAgainPipeline.addFeature(audioRing);
bypassPipeline.addFeature(audioRing);
randomCallPipeline.addFeature(audioRing);
tokenForwardPipeline.addFeature(audioRing);

export { callNextAudioPipeline, callAgainPipeline, bypassPipeline, randomCallPipeline, tokenForwardPipeline };