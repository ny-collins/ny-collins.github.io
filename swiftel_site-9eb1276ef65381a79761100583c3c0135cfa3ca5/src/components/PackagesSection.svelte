<script>
  import PackageCard from './PackageCard.svelte';
  import ScrollIndicator from './ScrollIndicator.svelte';

  export let homePackages = [];
  export let businessPackages = [];

  let activeTab = 'home';
  let wiggleTab = null; // This will hold the name of the tab to wiggle

  // This function now also handles the wiggle animation
  function handleClick(tab) {
    activeTab = tab;
    wiggleTab = tab;
    setTimeout(() => {
      wiggleTab = null;
    }, 400); // Reset the wiggle after 400ms
  }
</script>

<section class="py-20 lg:py-32 bg-bg overflow-hidden">
  <div class="container mx-auto px-6">
    <div class="text-center mb-12 max-w-2xl mx-auto">
      <h2 class="text-4xl lg:text-5xl font-extrabold">Find the Perfect Plan</h2>
      <p class="text-lg text-muted mt-4">
        Simple, transparent pricing for every need. No hidden fees, no data caps, just pure fibre.
      </p>
    </div>
  </div>

  <div class="flex justify-center mb-12">
    <div class="package-toggle-container">
      <button
        class="toggle-button"
        class:active={activeTab === 'home'}
        class:wiggle={wiggleTab === 'home'}
        on:click={() => handleClick('home')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>For Home</span>
      </button>

      <button
        class="toggle-button"
        class:active={activeTab === 'business'}
        class:wiggle={wiggleTab === 'business'}
        on:click={() => handleClick('business')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <span>For Business</span>
      </button>
    </div>
  </div>

  {#if activeTab === 'home'}
    <div>
      <div id="home-scroller" class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory px-6 md:container md:mx-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:px-6">
        {#each homePackages as pkg}
          <div class="package-item-home flex-shrink-0 w-[80%] max-w-sm md:w-auto md:max-w-none snap-center">
            <PackageCard {...pkg} />
          </div>
        {/each}
      </div>
      <div class="container mx-auto px-6 mt-8 md:hidden">
        <ScrollIndicator totalItems={homePackages.length} containerId="home-scroller" itemSelector=".package-item-home" />
      </div>
    </div>
  {/if}

  {#if activeTab === 'business'}
    <div>
      <div id="business-scroller" class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory px-6 md:container md:mx-auto md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:px-6">
        {#each businessPackages as pkg}
          <div class="package-item-business flex-shrink-0 w-[80%] max-w-sm md:w-auto md:max-w-none snap-center">
            <PackageCard {...pkg} />
          </div>
        {/each}
      </div>
      <div class="container mx-auto px-6 mt-8 md:hidden">
        <ScrollIndicator totalItems={businessPackages.length} containerId="business-scroller" itemSelector=".package-item-business" />
      </div>
    </div>
  {/if}
</section>