export type NebulaChart = {
    context?: () => {};
    field: (string) => NebulaField;
    getRegisteredTypes?: () => {};
    render: ({}) => NebulaRender;
    selections: () => NebulaSelect;
    _DO_NOY_USE?: any;
};

export type NebulaRender = {
    destroy: () => {};
    id?: string;
    convertTo?: (type: string) => void;
    _DO_NOT_USE__?: {};
};

type NebulaSelect = {
    mount: (element: HTMLDivElement) => {};
};

type NebulaField = {
    mount: (element: HTMLDivElement) => {};
};

export type QlikStruc = {
    app: EngineAPI.IApp;
    allFields: string[];
};
