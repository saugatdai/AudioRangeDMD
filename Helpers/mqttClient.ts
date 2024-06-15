import mqtt from 'mqtt';
import EventManagerSingleton from '../../../src/UseCases/EventManagementComponent/EventManagerSingleton';
import { constants } from './constants';

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
    clientId: "dmdPlugin",
    username: "saugatdai",
    password: "NamahShivaya:-)"
});

EventManagerSingleton.getInstance().on(constants.DMDPublish, (payload) => {
    console.log(payload);
    client.publish("dmd", JSON.stringify(payload));
});

