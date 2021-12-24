import { script, newScript } from "./script";

export class QlikEnterpriseConnection {
    session: enigmaJS.ISession;
    global: EngineAPI.IGlobal;
    app: EngineAPI.IApp;

    private enigmaConfig: enigmaJS.IConfig;
    private enigma: IEnigmaClass;
    private schema: { [k: string]: any };
    private host: string;
    private virtualProxy: string;

    constructor(host: string, virtualProxy: string, enigma: IEnigmaClass, schema: any) {
        if (!enigma) throw new Error(`Qlik Enterprise: "enigma" is required`);
        if (!schema) throw new Error(`Qlik Enterprise: "schema" is required`);

        this.enigma = enigma;
        this.schema = schema;
        this.host = host;
        this.virtualProxy = virtualProxy;
    }

    async connect(): Promise<EngineAPI.IGlobal> {
        await this.prepare();
        this.session = this.enigma.create(this.enigmaConfig);
        this.global = await this.session.open();
        return this.global;
    }

    async connectAndOpenDoc(appId: string): Promise<EngineAPI.IApp> {
        if (!appId) throw new Error(`Qlik Enterprise: "appId" is required`);
        await this.prepare(appId);
        this.session = this.enigma.create(this.enigmaConfig);
        this.global = await this.session.open();
        this.app = await this.global.openDoc(appId);
        return this.app;
    }

    private async prepare(appId?: string): Promise<void> {
        const docId = appId ? appId : "engineData";

        const eUrl = this.host.startsWith("http") ? this.host.replace(/^https?:\/\//, "wss://").replace(/^http?:\/\//, "ws://") : `wss:${this.host}`;
        const vp = this.virtualProxy ? `${this.virtualProxy}/` : "/";
        this.enigmaConfig = {
            Promise: Promise,
            schema: this.schema,
            url: `${eUrl}${vp}app/${docId}`,
        };
    }
    async reloadScript() {
        await this.app.setScript(newScript());
        const result = await this.app.doReload();

        console.log("result", result);
    }
    async userScript(value) {
        if (value) {
            const qScript = script(value);
            await this.app.setScript(qScript);
            const result = await this.app.doReload();
            //await this.app.doSave();
            console.log("result", result);
        }
    }
    async getAppFields(name): Promise<any> {
        let props = {
            qInfo: {
                qType: "filters",
            },
            qListObjectDef: {
                qDef: {
                    qFieldDefs: [name],
                },
                qInitialDataFetch: [
                    {
                        qTop: 0,
                        qLeft: 0,
                        qWidth: 1,
                        qHeight: 100,
                    },
                ],
            },
        };

        let obj = await this.app.createSessionObject(props);
        let objLayout = await obj.getLayout();
        this.app.destroyObject(obj.id);
        console.log(objLayout);

        return objLayout;
    }
}
