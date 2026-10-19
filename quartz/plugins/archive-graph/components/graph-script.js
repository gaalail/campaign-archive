export default `
(function () {
  var instances = [];
  var palette = ["#d9636c", "#b58bd4", "#75b5a8", "#d2a75b", "#6f9fc4", "#cf8293", "#9ca86e", "#8e91d0", "#bd8d62", "#6ba7a0", "#be759f", "#849dca"];

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

  function isCollection(slug) { return slug.endsWith(".base"); }

  function areaOf(slug) {
    var parts = slug.split("/");
    parts.pop();
    return parts.join("/") || slug;
  }

  function readable(value) {
    return value.split("/").map(function (part) {
      return part.replace(/-/g, " ");
    }).join(" / ");
  }

  function pagesFrom(index, includeCollections) {
    return Object.keys(index).map(function (key) { return index[key]; }).filter(function (page) {
      return page && typeof page.slug === "string" &&
        (includeCollections || !isCollection(page.slug));
    });
  }

  function edgesFrom(pages) {
    var pageIds = new Set(pages.map(function (page) { return page.slug; }));
    var seen = new Set();
    var edges = [];
    pages.forEach(function (page) {
      (page.links || []).forEach(function (target) {
        if (!pageIds.has(target) || target === page.slug) return;
        var source = page.slug < target ? page.slug : target;
        var destination = page.slug < target ? target : page.slug;
        var key = source + "\\u0000" + destination;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ source: source, target: destination });
      });
    });
    return edges;
  }

  function titleForArea(area, pageBySlug) {
    var indexPage = pageBySlug.get(area + "/index") || pageBySlug.get(area);
    return indexPage && indexPage.title || readable(area);
  }

  function areaMap(index, includeCollections) {
    var pages = pagesFrom(index, includeCollections);
    var pageBySlug = new Map(pages.map(function (page) { return [page.slug, page]; }));
    var areas = new Map();
    pages.forEach(function (page) {
      var id = areaOf(page.slug);
      if (!areas.has(id)) {
        areas.set(id, {
          id: id,
          title: titleForArea(id, pageBySlug),
          section: id.split("/")[0] || "root",
          pageCount: 0,
          kind: "area"
        });
      }
      areas.get(id).pageCount++;
    });

    var edgeCounts = new Map();
    var seenPageEdges = new Set();
    edgesFrom(pages).forEach(function (edge) {
      var sourceArea = areaOf(edge.source);
      var targetArea = areaOf(edge.target);
      if (sourceArea === targetArea) return;
      var sourcePage = edge.source < edge.target ? edge.source : edge.target;
      var targetPage = edge.source < edge.target ? edge.target : edge.source;
      var pageKey = sourcePage + "\\u0000" + targetPage;
      if (seenPageEdges.has(pageKey)) return;
      seenPageEdges.add(pageKey);
      var source = sourceArea < targetArea ? sourceArea : targetArea;
      var target = sourceArea < targetArea ? targetArea : sourceArea;
      var key = source + "\\u0000" + target;
      edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
    });

    return {
      nodes: Array.from(areas.values()),
      links: Array.from(edgeCounts.entries()).map(function (entry) {
        var endpoints = entry[0].split("\\u0000");
        return { source: endpoints[0], target: endpoints[1], count: entry[1] };
      })
    };
  }

  function detailModel(index, area, includeCollections) {
    var pages = pagesFrom(index, includeCollections);
    var pageIds = new Set(pages.map(function (page) { return page.slug; }));
    var areaPages = pages.filter(function (page) {
      return areaOf(page.slug) === area;
    });
    var areaIds = new Set(areaPages.map(function (page) { return page.slug; }));
    var externalPages = new Map();
    var externalLinks = new Map();
    var seenCrossLinks = new Set();
    pages.forEach(function (page) {
      (page.links || []).forEach(function (target) {
        if (!pageIds.has(target) || target === page.slug) return;
        var pageIsInArea = areaIds.has(page.slug);
        var targetIsInArea = areaIds.has(target);
        if (pageIsInArea === targetIsInArea) return;
        var first = page.slug < target ? page.slug : target;
        var second = page.slug < target ? target : page.slug;
        var pagePair = first + "\\u0000" + second;
        if (seenCrossLinks.has(pagePair)) return;
        seenCrossLinks.add(pagePair);

        var areaPage = pageIsInArea ? page.slug : target;
        var externalSlug = pageIsInArea ? target : page.slug;
        var externalArea = areaOf(externalSlug);
        if (!externalPages.has(externalArea)) externalPages.set(externalArea, new Set());
        externalPages.get(externalArea).add(externalSlug);
        var groupKey = areaPage + "\\u0000" + externalArea;
        if (!externalLinks.has(groupKey)) externalLinks.set(groupKey, new Set());
        externalLinks.get(groupKey).add(externalSlug);
      });
    });
    var pageBySlug = new Map(pages.map(function (page) { return [page.slug, page]; }));
    var contextNodes = Array.from(externalPages.entries()).map(function (entry) {
      var externalArea = entry[0];
      return {
        id: "@area:" + externalArea,
        title: titleForArea(externalArea, pageBySlug),
        section: externalArea.split("/")[0] || "root",
        area: externalArea,
        contextOnly: true,
        kind: "area",
        pageCount: entry[1].size
      };
    });
    var contextLinks = Array.from(externalLinks.entries()).map(function (entry) {
      var endpoints = entry[0].split("\\u0000");
      return {
        source: endpoints[0],
        target: "@area:" + endpoints[1],
        count: entry[1].size
      };
    });
    return {
      nodes: areaPages.map(function (page) {
        return {
          id: page.slug,
          title: page.title || page.slug,
          section: page.slug.split("/")[0] || "root",
          area: areaOf(page.slug),
          contextOnly: false,
          kind: "page"
        };
      }).concat(contextNodes),
      links: edgesFrom(areaPages).concat(contextLinks),
      contextPageCount: Array.from(externalPages.values()).reduce(function (total, pagesInArea) {
        return total + pagesInArea.size;
      }, 0),
      contextAreaCount: externalPages.size,
      crossAreaConnectionCount: seenCrossLinks.size
    };
  }

  function pageModel(index, includeCollections) {
    var pages = pagesFrom(index, includeCollections);
    return {
      nodes: pages.map(function (page) {
        return {
          id: page.slug,
          title: page.title || page.slug,
          section: page.slug.split("/")[0] || "root",
          area: areaOf(page.slug),
          contextOnly: false,
          kind: "page"
        };
      }),
      links: edgesFrom(pages)
    };
  }

  function neighborhood(model, centerId) {
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

  function neighborhoodModel(index, centerId, includeCollections, maxIndividualNeighbors) {
    var fullModel = pageModel(index, includeCollections);
    var nearby = neighborhood(fullModel, centerId);
    if (!nearby.nodes.length || nearby.nodes.length - 1 <= maxIndividualNeighbors) return nearby;

    var center = nearby.nodes.find(function (node) { return node.id === centerId; });
    if (!center) return nearby;
    var neighbors = nearby.nodes.filter(function (node) { return node.id !== centerId; });
    var neighborsByArea = new Map();
    neighbors.forEach(function (node) {
      if (!neighborsByArea.has(node.area)) neighborsByArea.set(node.area, []);
      neighborsByArea.get(node.area).push(node);
    });
    var pageBySlug = new Map(pagesFrom(index, includeCollections).map(function (page) {
      return [page.slug, page];
    }));
    var contextNodes = Array.from(neighborsByArea.entries()).map(function (entry) {
      return {
        id: "@area:" + entry[0],
        title: titleForArea(entry[0], pageBySlug),
        section: entry[0].split("/")[0] || "root",
        area: entry[0],
        contextOnly: true,
        kind: "area",
        pageCount: entry[1].length
      };
    });
    var contextLinks = Array.from(neighborsByArea.entries()).map(function (entry) {
      return { source: centerId, target: "@area:" + entry[0], count: entry[1].length };
    });
    return {
      nodes: [center].concat(contextNodes),
      links: contextLinks,
      contextPageCount: neighbors.length,
      contextAreaCount: neighborsByArea.size,
      collapsed: true
    };
  }

  function hashColor(section) {
    var hash = 0;
    for (var i = 0; i < section.length; i++) hash = (hash * 31 + section.charCodeAt(i)) | 0;
    return "hsl(" + (Math.abs(hash) % 360) + " 48% 58%)";
  }

  function endpointId(endpoint) {
    return typeof endpoint === "object" ? endpoint.id : endpoint;
  }

  function initRoot(root) {
    var localHost = root.querySelector(".archive-graph-local");
    var dialog = root.querySelector(".archive-graph-dialog");
    var globalHost = root.querySelector(".archive-graph-global");
    var areaSelect = root.querySelector(".archive-graph-area");
    var collectionToggle = root.querySelector(".archive-graph-collections");
    var searchInput = root.querySelector(".archive-graph-search");
    var matchesSelect = root.querySelector(".archive-graph-matches");
    var searchOpen = root.querySelector(".archive-graph-search-open");
    var overviewButton = root.querySelector(".archive-graph-overview");
    var count = root.querySelector(".archive-graph-count");
    var legend = root.querySelector(".archive-graph-legend");
    var status = root.querySelector(".archive-graph-status");
    var openButton = root.querySelector(".archive-graph-open");
    var currentSlug = root.dataset.currentSlug || "";
    var currentArea = areaOf(currentSlug);
    var basePath = resolveBasePath(currentSlug);
    var indexUrl = basePath + "/static/contentIndex.json";
    var indexPromise;
    var localSimulation;
    var globalSimulation;
    var renderTimer;
    var disposed = false;

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

    function stopGlobalSimulation() {
      if (globalSimulation) globalSimulation.stop();
      globalSimulation = null;
    }

    function stopLocalSimulation() {
      if (localSimulation) localSimulation.stop();
      localSimulation = null;
    }

    function stopSimulations() {
      stopGlobalSimulation();
      stopLocalSimulation();
    }

    function clearLegend() {
      while (legend.firstChild) legend.removeChild(legend.firstChild);
    }

    function fillLegend(sections) {
      clearLegend();
      sections.forEach(function (section) {
        var item = document.createElement("span");
        item.className = "archive-graph-legend-item";
        var swatch = document.createElement("span");
        swatch.className = "archive-graph-legend-swatch";
        swatch.style.backgroundColor = hashColor(section);
        var label = document.createElement("span");
        label.textContent = readable(section);
        item.appendChild(swatch);
        item.appendChild(label);
        legend.appendChild(item);
      });
    }

    function fillAreas(index, preferredArea) {
      var currentValue = preferredArea || areaSelect.value;
      var model = areaMap(index, collectionToggle.checked);
      while (areaSelect.firstChild) areaSelect.removeChild(areaSelect.firstChild);
      var overviewOption = document.createElement("option");
      overviewOption.value = "";
      overviewOption.textContent = "Archive map";
      areaSelect.appendChild(overviewOption);
      model.nodes.sort(function (a, b) { return a.title.localeCompare(b.title); }).forEach(function (area) {
        var option = document.createElement("option");
        option.value = area.id;
        option.textContent = area.title + " (" + area.pageCount + ")";
        areaSelect.appendChild(option);
      });
      areaSelect.value = model.nodes.some(function (area) { return area.id === currentValue; })
        ? currentValue
        : "";
      var sections = Array.from(new Set(model.nodes.map(function (area) { return area.section; })))
        .sort(function (a, b) { return a.localeCompare(b); });
      fillLegend(sections);
      return model;
    }

    function draw(host, model, options) {
      while (host.firstChild) host.removeChild(host.firstChild);
      if (!model.nodes.length) {
        var empty = document.createElement("p");
        empty.className = "archive-graph-empty";
        empty.textContent = options.emptyMessage || "No pages match these graph settings.";
        host.appendChild(empty);
        return null;
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
      function clusterFor(node) {
        if (!options.overview) return node.area || node.section;
        var path = node.id.split("/");
        return path.length > 1 ? path.slice(0, 2).join("/") : node.section;
      }
      var clusterKeys = Array.from(new Set(model.nodes.map(function (node) {
        return clusterFor(node);
      }))).sort(function (a, b) { return a.localeCompare(b); });
      var columns = Math.max(1, Math.ceil(Math.sqrt(clusterKeys.length * width / height)));
      var rows = Math.max(1, Math.ceil(clusterKeys.length / columns));
      var centers = new Map();
      clusterKeys.forEach(function (key, index) {
        centers.set(key, {
          x: width * ((index % columns) + 0.5) / columns,
          y: height * (Math.floor(index / columns) + 0.5) / rows
        });
      });
      var indexes = new Map();
      model.nodes.forEach(function (node) {
        var key = clusterFor(node);
        var center = centers.get(key);
        var index = indexes.get(key) || 0;
        indexes.set(key, index + 1);
        var angle = index * 2.399963229728653;
        var radius = 5 + Math.sqrt(index) * (options.overview ? 7 : 5);
        node.x = center.x + Math.cos(angle) * radius;
        node.y = center.y + Math.sin(angle) * radius;
      });
      var labelIds = new Set();
      if (options.overview) {
        var largestBySection = new Map();
        model.nodes.slice().sort(function (a, b) {
          return b.pageCount - a.pageCount || a.title.localeCompare(b.title);
        }).forEach(function (node) {
          if (!largestBySection.has(node.section)) largestBySection.set(node.section, node);
        });
        largestBySection.forEach(function (node) { labelIds.add(node.id); });
      }
      if (options.centerId) labelIds.add(options.centerId);
      if (options.matches) options.matches.forEach(function (id) { labelIds.add(id); });

      var edges = edgeLayer.selectAll("line").data(model.links).join("line")
        .attr("stroke", "var(--graph-edge, #62626e)")
        .attr("pointer-events", "none")
        .attr("stroke-opacity", function (edge) {
          return options.overview || edge.count
            ? Math.min(0.72, 0.2 + Math.log2((edge.count || 1) + 1) * 0.08)
            : 0.28;
        })
        .attr("stroke-width", function (edge) {
          return options.overview || edge.count
            ? Math.min(5, 1 + Math.log2((edge.count || 1) + 1) * 0.65)
            : 1;
        });
      var nodes = nodeLayer.selectAll("g").data(model.nodes, function (node) { return node.id; }).join("g")
        .attr("class", function (node) {
          return "archive-graph-node" + (node.contextOnly ? " archive-graph-context" : "");
        })
        .attr("tabindex", 0)
        .attr("role", function (node) { return node.kind === "area" ? "button" : "link"; })
        .attr("aria-label", function (node) {
          if (node.kind === "area") {
            return "Open " + node.title + ", " + node.pageCount +
              (node.pageCount === 1 ? " page" : " pages");
          }
          return node.title + (node.contextOnly ? ", linked from this area" : "");
        })
        .on("pointerenter", function (_, node) { focusNode(node.id); })
        .on("pointerleave", function () { focusNode(options.centerId || null); })
        .on("focus", function (_, node) { focusNode(node.id); })
        .on("blur", function () { focusNode(options.centerId || null); })
        .on("click", function (event, node) {
          event.stopPropagation();
          if (node.kind === "area") {
            if (options.onAreaSelect) options.onAreaSelect(node.area || node.id);
          } else {
            goTo(node.id);
          }
        })
        .on("keydown", function (event, node) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (node.kind === "area") {
              if (options.onAreaSelect) options.onAreaSelect(node.area || node.id);
            } else {
              goTo(node.id);
            }
          }
        });
      function nodeRadius(node) {
        if (node.kind === "area") return 7 + Math.sqrt(node.pageCount) * 1.1;
        return node.id === options.centerId ? 7 : node.contextOnly ? 3.5 : 4.5;
      }
      nodes.append("circle")
        .attr("class", "archive-graph-hit-area")
        .attr("r", function (node) { return nodeRadius(node) + 9; })
        .attr("fill", "transparent")
        .attr("pointer-events", "all");
      nodes.append("circle")
        .attr("r", nodeRadius)
        .attr("fill", function (node) { return hashColor(node.section); })
        .attr("stroke", function (node) { return node.contextOnly ? "var(--darkgray)" : "none"; })
        .attr("stroke-dasharray", function (node) { return node.contextOnly ? "2 2" : null; });
      nodes.append("title").text(function (node) {
        return node.kind === "area"
          ? node.title + " (" + node.pageCount + (node.pageCount === 1 ? " page)" : " pages)")
          : node.title + " (" + readable(node.area) + ")" + (node.contextOnly ? " · linked context" : "");
      });
      nodes.append("text")
        .attr("class", "archive-graph-label")
        .attr("x", 9)
        .attr("y", 4)
        .text(function (node) { return node.title; })
        .attr("pointer-events", "none")
        .attr("display", function (node) {
          return labelIds.has(node.id) ? null : "none";
        })
        .attr("text-anchor", function (node) { return node.x > width / 2 ? "end" : "start"; })
        .attr("x", function (node) { return node.x > width / 2 ? -9 : 9; });

      function focusNode(id) {
        var nearby = id ? adjacent.get(id) || new Set() : new Set();
        nodes.attr("opacity", function (node) {
          if (!id) return node.contextOnly ? 0.7 : 0.92;
          return node.id === id || nearby.has(node.id) ? 1 : 0.13;
        });
        nodes.select("text").attr("display", function (node) {
          return labelIds.has(node.id) || node.id === id ? null : "none";
        });
        edges.attr("stroke-opacity", function (edge) {
          if (!id) return options.overview || edge.count
            ? Math.min(0.72, 0.2 + Math.log2((edge.count || 1) + 1) * 0.08)
            : 0.28;
          return endpointId(edge.source) === id || endpointId(edge.target) === id ? 0.88 : 0.04;
        });
      }

      var adjacent = new Map(model.nodes.map(function (node) { return [node.id, new Set()]; }));
      model.links.forEach(function (link) {
        adjacent.get(endpointId(link.source)).add(endpointId(link.target));
        adjacent.get(endpointId(link.target)).add(endpointId(link.source));
      });
      if (options.centerId) focusNode(options.centerId);
      svg.call(d3.zoom().scaleExtent([0.35, 6]).on("zoom", function (event) {
        viewport.attr("transform", event.transform);
      }));
      return d3.forceSimulation(model.nodes)
        .force("link", d3.forceLink(model.links).id(function (node) { return node.id; })
          .distance(options.linkDistance || 70).strength(options.overview ? 0.16 : 0.18))
        .force("charge", d3.forceManyBody().strength(options.overview ? -95 : -34))
        .force("x", d3.forceX(function (node) {
          return centers.get(clusterFor(node)).x;
        }).strength(options.overview ? 0.24 : 0.28))
        .force("y", d3.forceY(function (node) {
          return centers.get(clusterFor(node)).y;
        }).strength(options.overview ? 0.24 : 0.28))
        .force("collide", d3.forceCollide(function (node) {
          return node.kind === "area" ? 9 + Math.sqrt(node.pageCount) * 1.1 : 8;
        }))
        .force("bounds", function () {
          model.nodes.forEach(function (node) {
            var radius = node.kind === "area" ? 10 + Math.sqrt(node.pageCount) * 1.1 : 8;
            var minX = radius;
            var maxX = width - radius;
            var minY = radius;
            var maxY = height - radius;
            if (node.x < minX) {
              node.x = minX;
              node.vx = Math.max(0, node.vx);
            } else if (node.x > maxX) {
              node.x = maxX;
              node.vx = Math.min(0, node.vx);
            }
            if (node.y < minY) {
              node.y = minY;
              node.vy = Math.max(0, node.vy);
            } else if (node.y > maxY) {
              node.y = maxY;
              node.vy = Math.min(0, node.vy);
            }
          });
        })
        .on("tick", function () {
          edges
            .attr("x1", function (edge) { return edge.source.x; })
            .attr("y1", function (edge) { return edge.source.y; })
            .attr("x2", function (edge) { return edge.target.x; })
            .attr("y2", function (edge) { return edge.target.y; });
          nodes.attr("transform", function (node) {
            return "translate(" + node.x + "," + node.y + ")";
          });
          nodes.select("text")
            .attr("text-anchor", function (node) { return node.x > width / 2 ? "end" : "start"; })
            .attr("x", function (node) { return node.x > width / 2 ? -9 : 9; });
        });
    }

    function goTo(slug) {
      window.location.href = basePath.replace(/\\/$/, "") + "/" +
        slug.split("/").map(encodeURIComponent).join("/");
    }

    function renderLocal(index) {
      stopLocalSimulation();
      var local = neighborhoodModel(index, currentSlug, currentSlug.endsWith(".base"), 45);
      var caption = root.querySelector(".archive-graph-local-count");
      caption.textContent = local.collapsed
        ? local.contextPageCount + " linked pages summarized across " + local.contextAreaCount + " areas"
        : Math.max(0, local.nodes.length - 1) + " nearby " +
          (local.nodes.length === 2 ? "page" : "pages");
      localSimulation = draw(localHost, local, {
        minHeight: 240,
        centerId: currentSlug,
        linkDistance: 32,
        onAreaSelect: function (areaId) {
          if (!dialog.open) dialog.showModal();
          selectedPage = "";
          areaSelect.value = areaId;
          renderGlobal();
        },
        emptyMessage: currentSlug.endsWith(".base")
          ? "This generated collection page has no indexed links."
          : "No linked pages in this section yet.",
        ariaLabel: "Pages connected to " + (root.dataset.currentTitle || "this page")
      });
    }

    function fillMatches(index) {
      var query = searchInput.value.trim().toLocaleLowerCase();
      while (matchesSelect.firstChild) matchesSelect.removeChild(matchesSelect.firstChild);
      var prompt = document.createElement("option");
      prompt.value = "";
      prompt.textContent = query ? "Select a matching page" : "Enter a search";
      matchesSelect.appendChild(prompt);
      var matches = query
        ? pagesFrom(index, collectionToggle.checked).filter(function (page) {
            return (page.title || page.slug).toLocaleLowerCase().indexOf(query) !== -1 ||
              page.slug.toLocaleLowerCase().indexOf(query) !== -1;
          }).sort(function (a, b) {
            return (a.title || a.slug).localeCompare(b.title || b.slug) || a.slug.localeCompare(b.slug);
          })
        : [];
      matches.slice(0, 100).forEach(function (page) {
        var option = document.createElement("option");
        option.value = page.slug;
        option.textContent = (page.title || page.slug) + " — " + page.slug;
        matchesSelect.appendChild(option);
      });
      matchesSelect.disabled = matches.length === 0;
      searchOpen.disabled = true;
      count.textContent = query
        ? matches.length + " matching " + (matches.length === 1 ? "page" : "pages") +
          (matches.length > 100 ? " (first 100 shown)" : "")
        : "";
    }

    function renderGlobal() {
      stopGlobalSimulation();
      getIndex().then(function (index) {
        if (disposed || !dialog.open) return;
        var area = areaSelect.value;
        if (selectedPage) {
          var model = pageModel(index, collectionToggle.checked);
          if (!model.nodes.some(function (node) { return node.id === selectedPage; })) {
            selectedPage = "";
            areaSelect.value = "";
            return renderGlobal();
          }
          var nearby = neighborhoodModel(index, selectedPage, collectionToggle.checked, 60);
          var selected = model.nodes.find(function (node) { return node.id === selectedPage; });
          count.textContent = nearby.collapsed
            ? "Around " + (selected && selected.title || selectedPage) + ": " +
              nearby.contextPageCount + " linked pages summarized across " +
              nearby.contextAreaCount + " areas."
            : "Around " + (selected && selected.title || selectedPage) + ": " +
              nearby.nodes.length + " pages · " + nearby.links.length + " connections";
          globalSimulation = draw(globalHost, nearby, {
            minHeight: 300,
            centerId: selectedPage,
            matches: new Set([selectedPage]),
            onAreaSelect: function (areaId) {
              selectedPage = "";
              areaSelect.value = areaId;
              renderGlobal();
            },
            ariaLabel: "Pages linked to " + (selected && selected.title || selectedPage)
          });
          return;
        }

        if (area) {
          var detail = detailModel(index, area, collectionToggle.checked);
          var activeCount = detail.nodes.filter(function (node) { return !node.contextOnly; }).length;
          var internalLinks = detail.links.filter(function (edge) { return !edge.count; }).length;
          var areaTitle = titleForArea(area, new Map(pagesFrom(index, collectionToggle.checked).map(function (page) {
            return [page.slug, page];
          })));
          count.textContent = areaTitle + ": " + activeCount + " pages · " + internalLinks +
            " internal connections · " + detail.crossAreaConnectionCount +
            " cross-area page links; " + detail.contextPageCount + " linked pages summarized in " +
            detail.contextAreaCount + " areas.";
          globalSimulation = draw(globalHost, detail, {
            minHeight: 300,
            centerId: selectedPage || (detail.nodes.some(function (node) { return node.id === currentSlug; })
              ? currentSlug
              : null),
            onAreaSelect: function (areaId) {
              areaSelect.value = areaId;
              renderGlobal();
            },
            ariaLabel: areaTitle + " pages and their cross-area links"
          });
          return;
        }

        var map = areaMap(index, collectionToggle.checked);
        count.textContent = map.nodes.length + " content areas · " + map.links.length +
          " cross-area connections. Circle size shows page count; line weight shows linked pages.";
        globalSimulation = draw(globalHost, map, {
          minHeight: 300,
          overview: true,
          centerId: null,
          onAreaSelect: function (areaId) {
            selectedPage = "";
            areaSelect.value = areaId;
            renderGlobal();
          },
          ariaLabel: "Archive map showing connections between content areas"
        });
      }).catch(function (error) {
        reportError("The archive graph could not load. Check the connection and try again.", error);
      });
    }

    var selectedPage = "";

    root.querySelector(".archive-graph-open").addEventListener("click", function () {
      if (!dialog.open) dialog.showModal();
      renderGlobal();
    });
    root.querySelector(".archive-graph-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("close", stopGlobalSimulation);
    areaSelect.addEventListener("change", function () {
      selectedPage = "";
      renderGlobal();
    });
    collectionToggle.addEventListener("change", function () {
      getIndex().then(function (index) {
        fillAreas(index, areaSelect.value);
        fillMatches(index);
        renderGlobal();
      }).catch(function (error) {
        reportError("The archive graph could not load. Check the connection and try again.", error);
      });
    });
    searchInput.addEventListener("input", function () {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(function () {
        getIndex().then(fillMatches).catch(function (error) {
          reportError("Pages could not be searched. Check the connection and try again.", error);
        });
      }, 150);
    });
    matchesSelect.addEventListener("change", function () {
      searchOpen.disabled = !matchesSelect.value;
    });
    searchOpen.addEventListener("click", function () {
      if (!matchesSelect.value) return;
      selectedPage = matchesSelect.value;
      areaSelect.value = "";
      renderGlobal();
    });
    overviewButton.addEventListener("click", function () {
      selectedPage = "";
      areaSelect.value = "";
      searchInput.value = "";
      getIndex().then(function (index) {
        fillAreas(index, "");
        fillMatches(index);
        renderGlobal();
      }).catch(function (error) {
        reportError("The archive graph could not load. Check the connection and try again.", error);
      });
    });

    function onResize() {
      if (!dialog.open) return;
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(renderGlobal, 120);
    }
    window.addEventListener("resize", onResize);

    function dispose() {
      disposed = true;
      window.clearTimeout(renderTimer);
      window.removeEventListener("resize", onResize);
      stopSimulations();
      if (dialog.open) dialog.close();
    }

    Promise.all([loadD3(), getIndex()]).then(function (results) {
      if (disposed) return;
      var index = results[1];
      fillAreas(index, currentArea);
      renderLocal(index);
      openButton.disabled = false;
      openButton.textContent = "Explore archive graph";
    }).catch(function (error) {
      reportError("The archive graph could not initialize. Check the connection and try again.", error);
    });
    return dispose;
  }

  function init() {
    instances = instances.filter(function (instance) { return instance.root.isConnected; });
    document.querySelectorAll(".archive-graph").forEach(function (root) {
      if (instances.some(function (instance) { return instance.root === root; })) return;
      instances.push({ root: root, dispose: initRoot(root) });
    });
  }

  init();
  document.addEventListener("nav", function () {
    instances.forEach(function (instance) { instance.dispose(); });
    instances = [];
    init();
  });
})();
`
