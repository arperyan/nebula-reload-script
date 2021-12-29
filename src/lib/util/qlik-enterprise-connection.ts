export class QlikEnterpriseConnection {
    session: enigmaJS.ISession;
    global: EngineAPI.IGlobal;
    filterApp: EngineAPI.IApp;
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

    async connectFilterApp(appId: string): Promise<EngineAPI.IApp> {
        if (!appId) throw new Error(`Qlik Enterprise: "appId" is required`);
        await this.prepare(appId);
        this.session = this.enigma.create(this.enigmaConfig);
        const filterGlobal: EngineAPI.IGlobal = await this.session.open();
        this.filterApp = await filterGlobal.openDoc(appId);
        return this.filterApp;
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

    async reloadTempApp(value: string[], id: string) {
        this.global = await this.connect();

        let tmpApp = await this.global.createSessionAppFromApp(id);

        const getScript = await tmpApp.getScript();

        const script = getScript.replace("${newValue}", this.createQlikMatch(value));

        await tmpApp.setScript(script);
        const result = await tmpApp.doReload();
        console.log("result", result);
        return tmpApp;
    }
    async closeSession() {
        await this.session.close();
    }
    private createQlikMatch(value): string {
        let res = value.reduce((previousValue, currentValue) => previousValue.concat(currentValue), "");
        return res.split("").join("','");
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

        let obj = await this.filterApp.createSessionObject(props);
        let objLayout = await obj.getLayout();
        this.filterApp.destroyObject(obj.id);
        console.log(objLayout);

        return objLayout;
    }
}
