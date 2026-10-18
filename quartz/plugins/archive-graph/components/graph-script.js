export default `
(function () {
  var roots = [];
  var simulations = [];
  var palette = ["#d9636c", "#b58bd4", "#75b5a8", "#d2a75b", "#6f9fc4", "#cf8293", "#9ca86e", "#8e91d0"];

  function loadD3() {
    if (window.d3) return Promise.resolve(window.d3);
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-archive-graph-d3]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(window.d3); }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";
      script.crossOrigin = "anonymous";
      script.dataset.archiveGraphD3 = "true";
      script.onload = function () { resolve(window.d3); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function modelFor(index, scope, includeCollections) {
    function isCollection(slug) { return slug.endsWith(".base"); }
    function sectionOf(slug) { return slug.split("/")[0] || "root"; }
    var pages = Object.keys(index).map(function (key) { return index[key]; }).filter(function (page) {
      return page && typeof page.slug === "string" &&
        (includeCollections || !isCollection(page.slug)) &&
        (!scope || sectionOf(page.slug) === scope);
    });
    var nodes = pages.map(function (page) {
      return { id: page.slug, title: page.title || page.slug, section: sectionOf(page.slug) };
    });
    var nodeIds = new Set(nodes.map(function (node) { return node.id; }));
    var seen = new Set();
    var links = [];
    pages.forEach(function (page) {
      (page.links || []).forEach(function (target) {
        if (!nodeIds.has(target) || target === page.slug) return;
        var source = page.slug < target ? page.slug : target;
        var destination = page.slug < target ? target : page.slug;
        var key = source + "\\u0000" + destination;
        if (seen.has(key)) return;
        seen.add(key);
        links.push({ source: source, target: destination });
      });
    });
    return { nodes: nodes, links: links };
  }

  function localNeighborhood(model, centerId) {
    var adjacent = new Map();
    model.nodes.forEach(function (node) { adjacent.set(node.id, new Set()); });
    model.links.forEach(function (link) {
      adjacent.get(link.source).add(link.target);
      adjacent.get(link.target).add(link.source);
    });
    if (!adjacent.has(centerId)) return { nodes: [], links: [] };
    var included = new Set([centerId]);
    (adjacent.get(centerId) || new Set()).forEach(function (id) { included.add(id); });
    return {
      nodes: model.nodes.filter(function (node) { return included.has(node.id); }),
      links: model.links.filter(function (link) {
        return included.has(link.source) && included.has(link.target);
      })
    };
  }

  function limitLocal(model, centerId, limit) {
    if (model.nodes.length <= limit) return model;
    var scores = new Map();
    model.links.forEach(function (link) {
      if (link.source === centerId) scores.set(link.target, (scores.get(link.target) || 0) + 1);
      if (link.target === centerId) scores.set(link.source, (scores.get(link.source) || 0) + 1);
    });
    var ranked = Array.from(scores.entries()).sort(function (a, b) {
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    var included = new Set([centerId]);
    ranked.slice(0, limit - 1).forEach(function (entry) { included.add(entry[0]); });
    return {
      nodes: model.nodes.filter(function (node) { return included.has(node.id); }),
      links: model.links.filter(function (link) {
        return included.has(link.source) && included.has(link.target);
      })
    };
  }

  function searchModel(model, query) {
    var term = query.trim().toLocaleLowerCase();
    if (!term) return model;
    var matches = new Set();
    model.nodes.forEach(function (node) {
      if (node.title.toLocaleLowerCase().indexOf(term) !== -1 ||
          node.id.toLocaleLowerCase().indexOf(term) !== -1) matches.add(node.id);
    });
    var included = new Set(matches);
    model.links.forEach(function (link) {
      if (matches.has(link.source)) included.add(link.target);
      if (matches.has(link.target)) included.add(link.source);
    });
    return {
      nodes: model.nodes.filter(function (node) { return included.has(node.id); }),
      links: model.links.filter(function (link) {
        return included.has(link.source) && included.has(link.target);
      }),
      matches: matches
    };
  }

  function hashColor(section) {
    var hash = 0;
    for (var i = 0; i < section.length; i++) hash = (hash * 31 + section.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  }

  function initRoot(root) {
    if (roots.indexOf(root) !== -1) return;
    roots.push(root);
    var localHost = root.querySelector(".archive-graph-local");
    var dialog = root.querySelector(".archive-graph-dialog");
    var globalHost = root.querySelector(".archive-graph-global");
    var scopeSelect = root.querySelector(".archive-graph-scope");
    var collectionToggle = root.querySelector(".archive-graph-collections");
    var searchInput = root.querySelector(".archive-graph-search");
    var count = root.querySelector(".archive-graph-count");
    var legend = root.querySelector(".archive-graph-legend");
    var status = root.querySelector(".archive-graph-status");
    var openButton = root.querySelector(".archive-graph-open");
    var currentSlug = root.dataset.currentSlug || "";
    var basePath = resolveBasePath(currentSlug);
    var indexUrl = basePath + "/static/contentIndex.json";
    var indexPromise;

    function resolveBasePath(slug) {
      var pagePath = decodeURIComponent(window.location.pathname)
        .replace(/\\.html$/, "")
        .replace(/\\/+$/, "");
      var candidates = [slug, slug.replace(/\\/index$/, ""), slug.replace(/\\.base$/, "")];
      if (slug === "index") candidates.push("");
      for (var i = 0; i < candidates.length; i++) {
        var suffix = candidates[i] ? "/" + candidates[i] : "";
        if (pagePath.endsWith(suffix)) {
          return pagePath.slice(0, pagePath.length - suffix.length);
        }
      }
      return "";
    }

    function getIndex() {
      if (!indexPromise) {
        indexPromise = fetch(indexUrl).then(function (response) {
          if (!response.ok) throw new Error("Content index request failed: " + response.status);
          return response.json();
        });
      }
      return indexPromise;
    }

    function reportError(message, error) {
      console.error("[Archive Graph] " + message, error || "");
      status.textContent = message;
    }

    function fillScopes(index) {
      var sections = Array.from(new Set(Object.keys(index).map(function (key) {
        return (index[key].slug || key).split("/")[0];
      }))).filter(function (section) { return section && section !== "index"; }).sort();
      sections.forEach(function (section) {
        var option = document.createElement("option");
        option.value = section;
        option.textContent = section.replace(/-/g, " ");
        scopeSelect.appendChild(option);
      });
      while (legend.firstChild) legend.removeChild(legend.firstChild);
      sections.forEach(function (section) {
        var item = document.createElement("span");
        item.className = "archive-graph-legend-item";
        var swatch = document.createElement("span");
        swatch.className = "archive-graph-legend-swatch";
        swatch.style.backgroundColor = hashColor(section);
        var label = document.createElement("span");
        label.textContent = section.replace(/-/g, " ");
        item.appendChild(swatch);
        item.appendChild(label);
        legend.appendChild(item);
      });
    }

    function stopSimulations() {
      simulations.forEach(function (simulation) { simulation.stop(); });
      simulations = [];
    }

    function goTo(slug) {
      window.location.href = basePath.replace(/\\/$/, "") + "/" +
        slug.split("/").map(encodeURIComponent).join("/");
    }

    function draw(host, model, options) {
      while (host.firstChild) host.removeChild(host.firstChild);
      if (!model.nodes.length) {
        var empty = document.createElement("p");
        empty.className = "archive-graph-empty";
        empty.textContent = options.emptyMessage || "No pages match these graph settings.";
        host.appendChild(empty);
        return;
      }

      var d3 = window.d3;
      var width = Math.max(host.clientWidth, 240);
      var height = Math.max(host.clientHeight, options.minHeight || 240);
      var svg = d3.select(host).append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("role", "img")
        .attr("aria-label", options.ariaLabel || "Archive page connections");
      var viewport = svg.append("g");
      var edgeLayer = viewport.append("g");
      var nodeLayer = viewport.append("g");
      var adjacent = new Map(model.nodes.map(function (node) { return [node.id, new Set()]; }));
      model.links.forEach(function (link) {
        adjacent.get(link.source).add(link.target);
        adjacent.get(link.target).add(link.source);
      });
      var edges = edgeLayer.selectAll("line").data(model.links).join("line")
        .attr("stroke", "var(--graph-edge, #62626e)")
        .attr("stroke-opacity", 0.22)
        .attr("stroke-width", 1);
      var nodes = nodeLayer.selectAll("g").data(model.nodes, function (node) { return node.id; }).join("g")
        .attr("class", "archive-graph-node")
        .attr("tabindex", 0)
        .attr("role", "link")
        .attr("aria-label", function (node) { return node.title; })
        .on("pointerenter", function (_, node) { focusNode(node.id); })
        .on("pointerleave", function () { focusNode(options.centerId || null); })
        .on("focus", function (_, node) { focusNode(node.id); })
        .on("blur", function () { focusNode(options.centerId || null); })
        .on("click", function (event, node) {
          event.stopPropagation();
          goTo(node.id);
        })
        .on("keydown", function (event, node) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goTo(node.id);
          }
        });
      nodes.append("circle")
        .attr("r", function (node) { return node.id === options.centerId ? 7 : 4; })
        .attr("fill", function (node) { return hashColor(node.section); });
      nodes.append("title").text(function (node) { return node.title + " (" + node.section + ")"; });
      nodes.append("text")
        .attr("class", "archive-graph-label")
        .attr("x", 9)
        .attr("y", 4)
        .text(function (node) { return node.title; })
        .attr("display", function (node) {
          return options.matches && options.matches.has(node.id) ? null : "none";
        });

      function focusNode(id) {
        var nearby = id ? adjacent.get(id) || new Set() : new Set();
        nodes.attr("opacity", function (node) {
          if (!id) return 0.88;
          return node.id === id || nearby.has(node.id) ? 1 : 0.12;
        });
        nodes.select("text").attr("display", function (node) {
          return node.id === id || (options.matches && options.matches.has(node.id)) ? null : "none";
        });
        edges.attr("stroke-opacity", function (edge) {
          if (!id) return 0.22;
          return edge.source.id === id || edge.target.id === id ? 0.82 : 0.05;
        });
      }

      if (options.centerId) focusNode(options.centerId);
      svg.call(d3.zoom().scaleExtent([0.35, 6]).on("zoom", function (event) {
        viewport.attr("transform", event.transform);
      }));
      var simulation = d3.forceSimulation(model.nodes)
        .force("link", d3.forceLink(model.links).id(function (node) { return node.id; })
          .distance(options.linkDistance || 42).strength(0.18))
        .force("charge", d3.forceManyBody().strength(options.charge || -34))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(7))
        .on("tick", function () {
          edges
            .attr("x1", function (edge) { return edge.source.x; })
            .attr("y1", function (edge) { return edge.source.y; })
            .attr("x2", function (edge) { return edge.target.x; })
            .attr("y2", function (edge) { return edge.target.y; });
          nodes.attr("transform", function (node) {
            return "translate(" + node.x + "," + node.y + ")";
          });
        });
      simulations.push(simulation);
    }

    function renderGlobal() {
      stopSimulations();
      getIndex().then(function (index) {
        var model = modelFor(index, scopeSelect.value, collectionToggle.checked);
        var filtered = searchModel(model, searchInput.value);
        count.textContent = filtered.nodes.length + " pages · " + filtered.links.length + " connections";
        draw(globalHost, filtered, {
          minHeight: 480,
          centerId: currentSlug,
          matches: filtered.matches,
          ariaLabel: "Scoped archive connections"
        });
      }).catch(function (error) {
        reportError("The archive graph could not load. Check the connection and try again.", error);
      });
    }

    function renderLocal(index) {
      var currentIsCollection = currentSlug.endsWith(".base");
      var model = modelFor(index, "", currentIsCollection);
      var neighborhood = localNeighborhood(model, currentSlug);
      var limited = limitLocal(neighborhood, currentSlug, 45);
      var caption = root.querySelector(".archive-graph-local-count");
      caption.textContent = neighborhood.nodes.length > limited.nodes.length
        ? "Showing " + limited.nodes.length + " of " + neighborhood.nodes.length + " nearby pages"
        : neighborhood.nodes.length + " nearby " + (neighborhood.nodes.length === 1 ? "page" : "pages");
      draw(localHost, limited, {
        minHeight: 240,
        centerId: currentSlug,
        linkDistance: 28,
        charge: -28,
        emptyMessage: currentIsCollection
          ? "This generated collection page has no indexed links."
          : "No linked pages in this section yet.",
        ariaLabel: "Pages connected to " + (root.dataset.currentTitle || "this page")
      });
    }

    root.querySelector(".archive-graph-open").addEventListener("click", function () {
      if (!dialog.open) dialog.showModal();
      renderGlobal();
    });
    root.querySelector(".archive-graph-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("close", stopSimulations);
    scopeSelect.addEventListener("change", renderGlobal);
    collectionToggle.addEventListener("change", renderGlobal);
    var searchTimer;
    searchInput.addEventListener("input", function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(renderGlobal, 180);
    });

    Promise.all([loadD3(), getIndex()]).then(function (results) {
      var index = results[1];
      fillScopes(index);
      renderLocal(index);
      openButton.disabled = false;
      openButton.textContent = "Explore archive graph";
    }).catch(function (error) {
      reportError("The archive graph could not initialize. Check the connection and try again.", error);
    });
  }

  function init() {
    document.querySelectorAll(".archive-graph").forEach(initRoot);
  }
  init();
  document.addEventListener("nav", init);
})();
`
