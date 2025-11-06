<script>
  import { onMount } from 'svelte';

  export let totalItems = 0;
  export let containerId = '';
  export let itemSelector = '';

  let activeIndex = 0;
  let items = [];
  let container;

  onMount(() => {
    container = document.getElementById(containerId);
    if (!container) return;

    items = Array.from(container.querySelectorAll(itemSelector));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = items.indexOf(entry.target);
          activeIndex = index;
        }
      });
    }, {
      root: container,
      threshold: 0.6
    });

    items.forEach(item => observer.observe(item));
  });

  function scrollToIndex(index) {
    if (items[index]) {
      items[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }
</script>

<div class="indicator-container">
  {#each Array(totalItems) as _, i}
    <button
      on:click={() => scrollToIndex(i)}
      class="indicator-dot"
      class:active={activeIndex === i}
      aria-label={`Go to item ${i + 1}`}
    ></button>
  {/each}
</div>