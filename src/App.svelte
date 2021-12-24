<script lang="ts">
    import enigma from "enigma.js";
    import schema from "enigma.js/schemas/12.67.2.json";
    import { QlikEnterpriseConnection } from "./lib/util/qlik-enterprise-connection";
    import { config } from "./config";
    import { NebulaCharts } from "./lib/util/nebulaCharts";
    import NebulaBar from "./lib/components/NebulaBar.svelte";
    import Spinnner from "./lib/ui/spinnner.svelte";
    import type { NebulaChart, QlikStruc, NebulaRender } from "./types";
    import NebulaSelection from "./lib/components/NebulaSelection.svelte";
    import { tick } from "svelte";
    import NebulaFilter from "./lib/components/NebulaFilter.svelte";

    let qlikInstance: EngineAPI.IApp;
    let dim1: EngineAPI.IGenericListLayout;

    const qlik: QlikEnterpriseConnection = new QlikEnterpriseConnection(config.host, config.virtualProxy, enigma, schema);

    const establishConnection = async (): Promise<NebulaChart> => {
        qlikInstance = await qlik.connectAndOpenDoc(config.appId);
        await qlik.reloadScript();
        tick();
        dim1 = await qlik.getAppFields("Dim1");
        const nebulaComponent = new NebulaCharts(qlik.app);

        return nebulaComponent.chart();
    };

    const updateField = async (ev) => {
        console.log(ev);
        await qlik.userScript(ev.detail.value);
    };
</script>

<main>
    {#await establishConnection()}
        <Spinnner />
    {:then nebulaInstance}
        <NebulaSelection nebula={nebulaInstance} />
        <NebulaBar nebula={nebulaInstance} />
        <NebulaFilter field={dim1.qListObject.qDataPages[0].qMatrix} fieldName={"Dim1"} on:fieldSelect={updateField} />
    {/await}
</main>

<style>
    @import "../global.css";
    :root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }
    main {
        padding: 1em;
        margin: 0 auto;
    }
</style>
