import { Application, IBoot } from 'egg';
import * as merge from 'lodash.merge';
import Apollo, { IApolloConfig } from './app/lib/apollo';
import * as path from 'path';
import * as fileUtil from './lib/file';

export default class FooBoot implements IBoot {
    private app: Application & {apollo?: Apollo};

    constructor(app: Application & {apollo?: Apollo}) {
        this.app = app;
    }

    configWillLoad() {
        const app = this.app;

        const config: IApolloConfig = app.config.apollo;
        if (config.mountApp === false && config.mountAgent === true) {
            // 设置了仅agent监听，app（worker）不监听时，从本地文件中读取Apollo配置。
            try {
                const baseDir = this.app.config.baseDir;
                const tempDirpath = path.resolve(baseDir, fileUtil.tempDirpath);
                const tempApolloFilePath = path.resolve(tempDirpath, fileUtil.tempApolloConfigFileName);
                let apolloConfig = fileUtil.readFileSync(tempApolloFilePath);
                merge(app.config, apolloConfig);
            } catch (error) {
                app.logger.warn('[egg-zzc-apolloclient] app 读文件 .temp/apollo_config.json error', {
                    extras: {
                        error,
                    }
                });
            }
            return;
        }
        if (config.mountApp === false) {
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
                merge(app.config, apolloConfig);
                app.apollo.emit('config.loaded');
                return;
            } catch (error) {
                app.logger.warn('[egg-zzc-apolloclient] app error', {
                    extras: {
                        error,
                    }
                });
            }

        }
    }

    async willReady() {
        const config: IApolloConfig = this.app.config.apollo;
        if (config.mountApp === false) {
            return;
        }
        if (config.watch) {
            this.app.apollo.startNotification();
        }
    }
}
