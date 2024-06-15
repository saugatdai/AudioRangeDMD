import * as path from 'path';

import { SerialPort } from "serialport";
import { readFile, writeFile } from "../../../src/FrameworksAndDrivers/Frameworks/electronApp/helpers/storageHandler";
import PluginConfigElement from '../../../src/UseCases/PluginManagementComponent/PluginModule/PluginConfigElement';
import { constants } from './constants';

SerialPort.list().then(async portInfos => {
    const validPorts = portInfos.filter(portInfo => portInfo.pnpId);
    console.log(validPorts);
    if (validPorts.length) {
        const configsJSON = await readFile(path.join(__dirname, '../pluginConfig.json'));
        let configs: PluginConfigElement[] = JSON.parse(configsJSON);

        const serialPortSettingsExists = configs.find(config => config.name === constants.SERIALPORTOPTNAME);

        if (serialPortSettingsExists) {
            const serialPortConfig = configs.find(config => config.name === constants.SERIALPORTOPTNAME);
            const serialPorts = serialPortConfig.choiceOptions;

            let allPortsInList: boolean = true;

            // validPorts.forEach(validPort => {
            //     allPortsInList = serialPorts.some(serialPort => validPort.path === serialPort);
            // });

            for(let i=0; i<validPorts.length; i++){
                if(!serialPorts.some(serialPort => serialPort === validPorts[i].path)){
                    console.log(validPorts[i].path + 'Is Not in list');
                    allPortsInList = false;
                }
            }

            if (!allPortsInList) {
                console.log('Refreshing Serial Ports list');
                configs = configs.filter(config => config.name !== constants.SERIALPORTOPTNAME);
                const pluginConfigElement: PluginConfigElement = {
                    name: constants.SERIALPORTOPTNAME,
                    configType: 'select',
                    value: serialPortConfig.value,
                    choiceOptions: validPorts.map(validPort => validPort.path)
                }

                configs.push(pluginConfigElement);
                await writeFile(path.join(__dirname, '../pluginConfig.json'), JSON.stringify(configs));
            }else{
                console.log('No Newly Identified serial ports...');
            }

        } else {
            const pluginConfigElement: PluginConfigElement = {
                name: constants.SERIALPORTOPTNAME,
                configType: 'select',
                value: '',
                choiceOptions: validPorts.map(validPort => validPort.path)
            }

            configs.push(pluginConfigElement);
            await writeFile(path.join(__dirname, '../pluginConfig.json'), JSON.stringify(configs));
        }
    }
});