<script>
  import { slide } from 'svelte/transition';

  export let name = '';
  export let speed = '';
  export let price = '';
  export let description = '';
  export let features = [];
  export let isFeatured = false;

  let expanded = false;

  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class={`
  relative flex flex-col text-center p-6 md:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 h-full
  ${isFeatured 
    ? 'bg-card border-primary shadow-2xl shadow-primary/20 transform lg:scale-105' 
    : 'bg-card/50 border-DEFAULT'}
`}>
  
  {#if isFeatured}
    <div class="absolute top-0 right-4 lg:right-6 bg-primary text-white font-bold text-xs md:text-sm px-3 py-1 rounded-b-lg">
      Best Value
    </div>
  {/if}

  <h3 class="text-2xl lg:text-3xl font-bold">{name}</h3>
  
  <div class="my-4 lg:my-6">
    <span class="text-5xl lg:text-6xl font-extrabold text-accent leading-none">{speed}</span>
    <span class="text-lg lg:text-xl font-medium text-muted"> Mbps</span>
  </div>
  
  <p class="text-lg lg:text-xl text-[rgb(var(--color-text))]">
    Ksh. {price}<span class="text-muted text-base">/month</span>
  </p>

  <p class="text-muted mt-4 flex-grow text-sm md:text-base min-h-[5rem]">
    {description}
  </p>
  
  <button 
    on:click={toggleExpand} 
    class="mx-auto my-4 text-muted hover:text-primary transition-colors"
    aria-label={expanded ? 'Collapse details' : 'Expand details'}
  >
    <svg 
      class="w-6 h-6 transition-transform duration-300"
      class:rotate-180={expanded}
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  </button>

  {#if expanded}
    <div class="border-t-2 border-DEFAULT pt-6 text-left" transition:slide={{ duration: 300 }}>
      <ul class="space-y-3">
        {#each features as feature}
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clip-rule="evenodd" />
            </svg>
            <span class="text-muted text-sm">{feature}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="mt-8">
    <a href="/contact" class={`
      block w-full text-center font-bold py-3 px-6 rounded-lg transition-colors
      ${isFeatured 
        ? 'bg-primary hover:bg-primary-dark text-white' 
        : 'bg-border hover:bg-primary text-[rgb(var(--color-text))]'}
    `}>
      Order Now
    </a>
  </div>
</div>