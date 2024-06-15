import EventHandler from "../../src/UseCases/PluginManagementComponent/PluginModule/EventHandler";
import PipelineExecutor from "../../src/UseCases/PluginManagementComponent/PluginModule/PipelineExecutor";
import BypassTokenStrategy from "../../src/UseCases/TokenCallingComponent/BypassTokenModule/BypassTokenStrategy";
import CallAgainStrategy from "../../src/UseCases/TokenCallingComponent/CallAgainModule/CallAgainStrategy";
import NextTokenStrategy from "../../src/UseCases/TokenCallingComponent/NextTokenModule/NextTokenStrategy";
import RandomTokenCallStrategy from "../../src/UseCases/TokenCallingComponent/RandomTokenCallModule/RandomTokenCallStrategy";
import TokenForwardStrategy from "../../src/UseCases/TokenCallingComponent/TokenForwardModule/TokenForwardStrategy";

export interface Plugin {
  eventHandlers: EventHandler[];
  pipelineExecutors: PipelineExecutor[];
  priority: number;
  callAgainStrategy?: CallAgainStrategy;
  bypassStrategy?: BypassTokenStrategy;
  nextTokenStrategy?: NextTokenStrategy;
  randomCallStrategy?: RandomTokenCallStrategy;
  tokenForwardStrategy?: TokenForwardStrategy;
}