import { Application, IBoot } from 'egg';
import * as merge from 'lodash.merge';
import Apollo, { IApolloConfig } from './app/lib/apollo';

export default class FooBoot implements IBoot {
    private app: Application & {apollo?: Apollo};

    constructor(app: Application & {apollo?: Apollo}) {
        this.app = app;
    }

    configWillLoad() {
        const app = this.app;

        const config: IApolloConfig = app.config.apollo;
        if (config.mountAgent === false) {
            return;
        }
        if (config.init_on_start === false) {
            return;
        }

        if (!app.apollo) {
            app.apollo = new Apollo(app.config.apollo, app);
            app.apollo.init();
            try {
                const apolloConfig = app.apollo.generateAoplloConfig();
                app.apollo.saveConfig2JsonFile(apolloConfig);
                merge(app.config, apolloConfig);
                // 插件优先启动，agent和app（worker）都未启动，故也接收不到消息。
                app.apollo.emit('config.loaded', apolloConfig);
                return;
            } catch (error) {
                app.logger.warn('[egg-zzc-apolloclient] agent error', {
                    extras: {
                        error,
                    }
                });
            }

        }
    }

    async willReady() {
        const config: IApolloConfig = this.app.config.apollo;
        if (config.mountAgent === false) {
            return;
        }
        if (config.watch) {
            this.app.apollo.startNotification();
        }
    }
}
