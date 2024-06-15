import path from 'path';
import { ReadlineParser, SerialPort } from 'serialport';

import { readFile } from "../../../src/FrameworksAndDrivers/Frameworks/electronApp/helpers/storageHandler";
import EventManagerSingleton from '../../../src/UseCases/EventManagementComponent/EventManagerSingleton';
import PluginConfigElement from '../../../src/UseCases/PluginManagementComponent/PluginModule/PluginConfigElement';
import { constants } from './constants';

type TokenData = {
    tokenNumber: string,
    tokenCategory: string,
    counter: string
}
let serialPort: SerialPort;

EventManagerSingleton.getInstance().on(constants.SERIALTRANSFER, (data: TokenData) => {
    console.log("Transfering Serial Data as well...");
    const transferString = `<${data.tokenCategory?data.tokenCategory:'!'},${data.tokenNumber},${data.counter}>`;
    serialPort.write(transferString);
});

const initializePort = async () => {
    const configsJSON = await readFile(path.join(__dirname, '../pluginConfig.json'));
    const configs: PluginConfigElement[] = JSON.parse(configsJSON);
    let serialConfig: PluginConfigElement;

    if (serialConfig = configs.find(config => config.name === constants.SERIALPORTOPTNAME)) {
        if (serialConfig.value.length !== 0) {
            const serialPortPath = serialConfig.value as string;

            serialPort = new SerialPort({
                baudRate: 115200,
                path: serialPortPath
            }, (error) => {
                if (error) {
                    return console.log('Error : ', error.message);
                }
            });

            serialPort.on('error', (error) => {
                console.log('Error : ', error.message);
            });

            const lineStream = serialPort.pipe(new ReadlineParser())
            lineStream.on('data',(data)=>{
                console.log(data);
            })
            serialPort.on('open', () => {
                console.log('Serial Port Opened....');
            });

            serialPort.open();

        } else {
            console.log('Serial Config element found but value not set');
        }
    } else {
        console.log('No serial config element found..');
    }
}

initializePort();

export { serialPort };