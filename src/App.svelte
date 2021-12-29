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
    import { onMount, tick } from "svelte";
    import NebulaFilter from "./lib/components/NebulaFilter.svelte";

    let qlikInstance: EngineAPI.IApp;
    let nebulaInstance: NebulaChart;
    let dim1: EngineAPI.IGenericListLayout;
    let reload = false;

    const qlik: QlikEnterpriseConnection = new QlikEnterpriseConnection(config.host, config.virtualProxy, enigma, schema);

    onMount(async () => {
        console.log("Open");
        qlikInstance = await qlik.connectFilterApp(config.appId);
        await tick();
        dim1 = await qlik.getAppFields("Dim1");
    });

    const templateReload = async (ev) => {
        reload = false;

        await qlik.closeSession();
        console.log("Session Closed");

        const templateApp = await qlik.reloadTempApp(ev.detail.value, config.tmpAppId);
        console.log(templateApp);
        const nebulaComponent = new NebulaCharts(templateApp);

        nebulaInstance = await nebulaComponent.chart();

        reload = true;
    };
</script>

<main>
    {#if !dim1}
        <Spinnner />
    {:else}
        <NebulaFilter field={dim1.qListObject.qDataPages[0].qMatrix} fieldName={"Dim1"} on:reloadApp={templateReload} />
        {#if reload}
            <div>
                <NebulaSelection nebula={nebulaInstance} />
                <NebulaBar nebula={nebulaInstance} />
            </div>
        {/if}
    {/if}
</main>

<style>
    @import "../global.css";
    :root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }
    main {
        padding: 1em;
        width: 100%;

        display: flex;
        flex-direction: column;
        gap: 5rem;
    }
</style>
