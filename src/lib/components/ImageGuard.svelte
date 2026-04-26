<!--
  Transparent overlay that intercepts right-click, long-press and drag
  to prevent casual image saving. Place inside a position:relative container.
-->
<div
	class="image-guard"
	aria-hidden="true"
	oncontextmenu={(e) => e.preventDefault()}
	ondragstart={(e) => e.preventDefault()}
></div>

<style>
	.image-guard {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: transparent;
	}
</style>
