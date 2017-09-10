import path from 'path';

import chill from '../../package';
import * as map from '../services/map';
import * as socket from '../services/socket';

/**
 * Initialize the monitor and start monitoring configured services.
 */
export default async function init(configFile) {
  process.stdout.write(`Starting chill ${chill.version}\n`);

  try {
    const { resolve } = await import ('../config/config');

    // Config file for chill could be added using environment variables too.
    configFile = configFile || process.env.CHILL_CONFIG || path.resolve('chill.yml');

    const config = resolve(configFile);
    const { 'default': Monitor } = await import('./Monitor');
    const eventListener = await import('./eventListener');

    eventListener.listen();
    if (config.socket.enabled) {
      socket.start();
    } else {
      config.services.forEach(serviceConfig => {
        let service = new Monitor(serviceConfig);

        service.start();
        map.set(service.cname, service);
      });
    }

  } catch (err) {
    process.stderr.write('An error occurred: \n' + err);
  }
}
