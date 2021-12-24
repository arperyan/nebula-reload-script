<script lang="ts">
    import { onMount, createEventDispatcher, tick } from "svelte";

    import Svelecte from "Svelecte";

    const dispatcher = createEventDispatcher();

    export let field: EngineAPI.INxCellRows[];
    export let fieldName: string;

    type OptionList = {
        id: number;
        value: string;
    }[];

    let selectedDimension: string[] = ["A"];
    let options: OptionList;
    let qlikFields: EngineAPI.INxCell[] = [];
    let labelAsValue = false;

    let selection = [];

    onMount(() => {
        field.forEach(([key]) => qlikFields.push(key));
        options = qlikFields.map((opt: any, i: number) => {
            let rObj = { id: i, value: "" };
            rObj.id = i;
            rObj.value = opt.qText;
            return rObj;
        });
        console.log(options);
    });

    const changeSelect = async () => {
        await tick();
        console.log({ selection, selectedDimension });
        const selected: string[] = selection.map((v) => v.value);
        console.log(selected);
        dispatcher("fieldSelect", { name: fieldName, value: selected });
    };
</script>

<div class="select">
    <h3>{fieldName}</h3>
    <Svelecte
        {options}
        {labelAsValue}
        on:change={changeSelect}
        bind:readSelection={selection}
        bind:value={selectedDimension}
        multiple
        clearable
        placeholder="Select {fieldName}"
    />
</div>

<style>
    .select {
        width: 20rem;
        height: 2rem;
    }
    h3 {
        padding-bottom: 0.5rem;
    }
</style>
