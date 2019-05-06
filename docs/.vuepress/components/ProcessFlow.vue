<template>
  <div class="process-flow">
    <div class="definition">
      <slot/>
    </div>
    <div class="flow"></div>
  </div>
</template>

<script lang="ts">
let mermaidInitialized;

async function paint(ctx) {
  let mermaid;
  if (!mermaidInitialized) {
    mermaid = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      flowchart: { useMaxWidth: true, htmlLabels: true }
    });
    mermaidInitialized = mermaid;
  } else {
    mermaid = mermaidInitialized;
  }
  const id =
    "mermaid-" +
    Math.random()
      .toString(36)
      .substr(2, 10);
  const defn = ctx.$el.querySelector(".definition").innerText;
  const target = ctx.$el.querySelector(".flow");
  const insertSvg = function(svgCode, bindFunctions) {
    target.innerHTML = svgCode;
    bindFunctions(target);
  };
  try {
    const graph = mermaid.mermaidAPI.render(id, defn, insertSvg);
    ctx.$el.querySelector(".flow").innerHTML = graph;
    // ctx.$el.querySelector(".flow svg").classList.add("medium-zoom-image");
  } catch (e) {
    ctx.$el.querySelector(
      ".flow"
    ).innerHTML = `<p><span class="error-text">Error loading the mermaid process flow!</span> The configuration was:<br/>&nbsp;<br/>${defn}<P/>Try plugging this into the <a href="https://mermaidjs.github.io/mermaid-live-editor">Mermaid Live Editor</a> to debug</p><p>The exact error reported was:<br/>&nbsp<br/>${
      e.message
    }</p>`;
    console.group("mermaid error");
    console.log("Definition was:", defn);
    console.log();

    console.log(e.stack);
    console.groupEnd();
  }
}

export default {
  mounted() {
    paint(this);
  },
  updated() {
    paint(this);
  }
};
</script>

<style >
.process-flow .definition {
  display: none;
}
.error-text {
  color: red;
}
</style>
