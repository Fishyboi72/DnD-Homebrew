const searchScript = document.currentScript;
const dataPrefix = searchScript.dataset.dataPrefix;
const pagePrefix = searchScript.dataset.pagePrefix;
const searchForms = document.querySelectorAll(".site-search");

const searchSources = [
	{ file: "magic-items.json", page: "Magic Items", path: "pages/magicItems.html", kind: "items" },
	{ file: "monsters.json", page: "Monsters", path: "pages/monsters.html", kind: "monsters" },
	{ file: "races.json", page: "Races & Subraces", path: "pages/races.html", kind: "grouped" },
	{ file: "classes.json", page: "Classes & Subclasses", path: "pages/classes.html", kind: "grouped" },
	{ file: "feats.json", page: "Feats", path: "pages/feats.html", kind: "grouped" },
	{ file: "spells.json", page: "Spells", path: "pages/spells.html", kind: "grouped" },
	{ file: "altRules.json", page: "Rules & Alt Rules", path: "pages/altRules.html", kind: "grouped" }
];

async function loadSearchIndex() {
	const datasets = await Promise.all(searchSources.map(async (source) => {
		const response = await fetch(`${dataPrefix}${source.file}`);
		if (!response.ok) {
			throw new Error(`Could not load ${source.page} search data: ${response.status}`);
		}
		return { source, data: await response.json() };
	}));

	return datasets.flatMap(({ source, data }) => {
		if (source.kind === "items") {
			return data.map((item) => ({
				name: item.name,
				categories: [item.type, item.rarity, source.page].filter(Boolean),
				source,
				id: item.id
			}));
		}

		if (source.kind === "monsters") {
			return data.monsters.map((monster) => ({
				name: monster.name,
				categories: [monster.type, source.page].filter(Boolean),
				source,
				id: monster.id
			}));
		}

		const groupNames = new Map(data.groups.map((group) => [group.id, group.name]));
		const classTitlesById = new Map(
			data.items
				.filter((item) => item.group === "classes")
				.map((item) => [item.id, item.title])
		);

		return data.items.map((item) => {
			let parentClass = item.subclassOf
				? classTitlesById.get(item.subclassOf) ?? item.subclassOf.replaceAll("_", " ")
				: "";
			if (!parentClass && item.group === "subclasses") {
				const itemTemplate = document.createElement("template");
				itemTemplate.innerHTML = item.html;
				parentClass = (itemTemplate.content.querySelector("h5")?.textContent ?? "")
					.replace(/\s+subclass$/i, "")
					.trim();
			}

			return {
				name: item.title,
				categories: [
					groupNames.get(item.group),
					parentClass,
					source.page
				].filter(Boolean),
				source,
				id: item.id
			};
		});
	});
}

function positionFloatingResults(searchInput, searchResults) {
	if (!searchResults.classList.contains("is-floating-results") || searchResults.hidden) {
		return;
	}

	const inputBounds = searchInput.getBoundingClientRect();
	const viewportPadding = 8;
	const maximumHeight = Math.min(window.innerHeight * 0.6, 480);
	const spaceBelow = window.innerHeight - inputBounds.bottom - viewportPadding * 2;
	const placeAbove = spaceBelow < Math.min(maximumHeight, 160);
	const availableHeight = Math.max(
		80,
		Math.min(maximumHeight, placeAbove ? inputBounds.top - viewportPadding * 2 : spaceBelow)
	);
	const left = Math.max(
		viewportPadding,
		Math.min(inputBounds.left, window.innerWidth - inputBounds.width - viewportPadding)
	);

	searchResults.style.left = `${left}px`;
	searchResults.style.width = `${Math.min(inputBounds.width, window.innerWidth - viewportPadding * 2)}px`;
	searchResults.style.maxHeight = `${availableHeight}px`;
	searchResults.style.top = placeAbove
		? `${Math.max(viewportPadding, inputBounds.top - availableHeight - 4)}px`
		: `${inputBounds.bottom + 4}px`;
}

function renderSearchResults(index, query, searchInput, searchResults, searchStatus) {
	const normalizedQuery = query.trim().toLowerCase();
	searchResults.replaceChildren();

	if (!normalizedQuery) {
		searchResults.hidden = true;
		searchStatus.textContent = "";
		searchInput.setAttribute("aria-expanded", "false");
		return;
	}

	const matches = index
		.filter((entry) =>
			entry.name.toLowerCase().includes(normalizedQuery) ||
			entry.categories.some((category) =>
				category.toLowerCase().includes(normalizedQuery)
			)
		)
		.sort((a, b) => {
			const aNameMatch = a.name.toLowerCase().includes(normalizedQuery);
			const bNameMatch = b.name.toLowerCase().includes(normalizedQuery);
			return Number(bNameMatch) - Number(aNameMatch) ||
				a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
		});

	searchResults.hidden = false;
	searchInput.setAttribute("aria-expanded", "true");
	positionFloatingResults(searchInput, searchResults);

	if (matches.length === 0) {
		const emptyMessage = document.createElement("p");
		emptyMessage.className = "site-search-empty";
		emptyMessage.textContent = "No matching names or categories.";
		searchResults.append(emptyMessage);
		searchStatus.textContent = "No results found.";
		return;
	}

	const resultList = document.createElement("ul");
	for (const match of matches) {
		const resultItem = document.createElement("li");
		const resultLink = document.createElement("a");
		const resultName = document.createElement("span");
		const resultCategory = document.createElement("span");

		resultName.className = "site-search-result-name";
		resultName.textContent = match.name;
		resultCategory.className = "site-search-result-category";
		resultCategory.textContent = [match.source.page, ...match.categories]
			.filter((category, index, categories) => categories.indexOf(category) === index)
			.join(" · ");
		resultLink.href = `${pagePrefix}${match.source.path}#${match.id}`;
		resultLink.append(resultName, resultCategory);
		resultItem.append(resultLink);
		resultList.append(resultItem);
	}
	searchResults.append(resultList);
	searchStatus.textContent = `${matches.length} ${matches.length === 1 ? "result" : "results"} found.`;
}

function scrollToHashTarget() {
	const targetId = window.location.hash.slice(1);
	if (!targetId) {
		return false;
	}

	const target = document.getElementById(targetId);
	if (!target) {
		return false;
	}

	target.scrollIntoView();
	return true;
}

const hashTargetObserver = new MutationObserver(() => {
	if (scrollToHashTarget()) {
		hashTargetObserver.disconnect();
	}
});

function observeHashTarget() {
	if (!scrollToHashTarget()) {
		hashTargetObserver.observe(document.body, { childList: true, subtree: true });
	}
}

window.addEventListener("hashchange", observeHashTarget);
if (window.location.hash) {
	observeHashTarget();
}

loadSearchIndex()
	.then((index) => {
		searchForms.forEach((searchForm) => {
			const searchToggle = searchForm.querySelector(".site-search-toggle");
			const searchPanel = searchForm.querySelector(".site-search-panel");
			const searchInput = searchForm.querySelector("input");
			const searchResults = searchForm.querySelector(".site-search-results");
			const searchStatus = searchForm.querySelector(".site-search-status");
			const isFloatingSearch = Boolean(searchForm.closest("#floating-navigation"));

			if (isFloatingSearch) {
				searchResults.classList.add("is-floating-results");
				document.body.append(searchResults);
			}
			searchToggle.disabled = false;
			searchInput.disabled = false;
			searchToggle.addEventListener("click", () => {
				const isExpanded = searchToggle.getAttribute("aria-expanded") !== "true";
				searchToggle.setAttribute("aria-expanded", String(isExpanded));
				searchToggle.setAttribute("aria-label", isExpanded ? "Close search" : "Open search");
				searchForm.classList.toggle("is-open", isExpanded);
				searchForm.closest("#floating-navigation")?.classList.toggle("has-open-search", isExpanded);
				searchPanel.hidden = !isExpanded;
				if (isExpanded) {
					searchInput.focus();
				} else {
					searchInput.value = "";
					renderSearchResults(index, "", searchInput, searchResults, searchStatus);
				}
			});
			searchForm.addEventListener("input", () => {
				renderSearchResults(index, searchInput.value, searchInput, searchResults, searchStatus);
			});
			searchForm.addEventListener("submit", (event) => {
				event.preventDefault();
				searchResults.querySelector("a")?.click();
			});
			searchForm.addEventListener("site-search-dismiss", () => {
				searchToggle.setAttribute("aria-expanded", "false");
				searchToggle.setAttribute("aria-label", "Open search");
				searchForm.classList.remove("is-open");
				searchForm.closest("#floating-navigation")?.classList.remove("has-open-search");
				searchPanel.hidden = true;
				searchInput.value = "";
				renderSearchResults(index, "", searchInput, searchResults, searchStatus);
			});
			searchInput.addEventListener("keydown", (event) => {
				if (event.key === "Escape") {
					searchInput.value = "";
					renderSearchResults(index, "", searchInput, searchResults, searchStatus);
					searchToggle.setAttribute("aria-expanded", "false");
					searchToggle.setAttribute("aria-label", "Open search");
					searchForm.classList.remove("is-open");
					searchForm.closest("#floating-navigation")?.classList.remove("has-open-search");
					searchPanel.hidden = true;
					searchToggle.focus();
				}
			});
			if (isFloatingSearch) {
				const repositionResults = () => positionFloatingResults(searchInput, searchResults);
				window.addEventListener("resize", repositionResults);
				window.addEventListener("scroll", repositionResults, true);
			}
		});
	})
	.catch((error) => {
		console.error(error);
		searchForms.forEach((searchForm) => {
			searchForm.querySelector(".site-search-toggle").disabled = true;
			searchForm.querySelector("input").disabled = true;
			searchForm.querySelector(".site-search-status").textContent =
				"Search is unavailable because content could not be loaded.";
		});
	});
