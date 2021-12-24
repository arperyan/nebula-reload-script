<script lang="ts">
    export let id: string;
    export let label: string;
    export let value: string | number;
</script>

<div class="select-control">
    <label for={id}>{label}</label>
    <select {id} on:blur on:change bind:value>
        <slot />
    </select>
</div>

<style>
    select {
        display: block;
        width: 100%;
        font: inherit;
        border: none;
        border-bottom: 2px solid var(--primary, red);
        border-radius: 3px 3px 0 0;
        background: var(--background, #fff);
        padding: 8px;
        transition: border-color 0.1s ease-out;
    }
    select:focus {
        border-color: var(--border);
        outline: none;
    }
    label {
        display: flex;
        /* margin-bottom: 0.5rem; */
        width: 100%;
        font-size: 0.8rem;
    }
    .select-control {
        padding: 0.5rem 1rem;
        width: 15rem;
        /* margin: 0.25rem 0; */
    }
</style>
