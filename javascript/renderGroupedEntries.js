const contentUrl = document.currentScript.dataset.content;

async function renderGroupedEntries() {
	const response = await fetch(contentUrl);
	if (!response.ok) {
		throw new Error(`Could not load page content: ${response.status}`);
	}

	const data = await response.json();
	const contents = document.getElementById("entry-contents-list");
	const sections = document.getElementById("entry-sections");
	const categoryTemplate = document.getElementById("entry-category-template");
	const entryTemplate = document.getElementById("entry-template");
	const classTitlesById = new Map(
		data.items
			.filter((item) => item.group === "classes")
			.map((item) => [item.id, item.title])
	);
	const subclassesByClassId = new Map();
	for (const item of data.items) {
		if (item.group !== "subclasses" || !classTitlesById.has(item.subclassOf)) {
			continue;
		}

		if (!subclassesByClassId.has(item.subclassOf)) {
			subclassesByClassId.set(item.subclassOf, []);
		}
		subclassesByClassId.get(item.subclassOf).push(item);
	}

	function getSubclassClass(item) {
		if (typeof item.subclassOf === "string" && item.subclassOf.trim()) {
			const classId = item.subclassOf.trim();
			return classTitlesById.get(classId) ?? classId.replaceAll("_", " ");
		}

		const itemTemplate = document.createElement("template");
		itemTemplate.innerHTML = item.html;
		return (itemTemplate.content.querySelector("h5")?.textContent ?? "")
			.replace(/\s+subclass$/i, "")
			.trim();
	}

	const collator = new Intl.Collator(undefined, { sensitivity: "base" });

	function appendEntry(entry, entryList, contentsList, articleClass = "") {
		const contentsItem = document.createElement("li");
		const contentsLink = document.createElement("a");
		contentsLink.href = `#${entry.id}`;
		contentsLink.textContent = entry.title;
		contentsItem.append(contentsLink);
		contentsList.append(contentsItem);

		const entryFragment = entryTemplate.content.cloneNode(true);
		const article = entryFragment.querySelector("article");
		article.id = entry.id;
		if (articleClass) {
			article.classList.add(articleClass);
		}
		article.querySelector(".entry-content").innerHTML = entry.html;
		entryList.append(entryFragment);

		return contentsItem;
	}

	for (const group of data.groups) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".entry-category");
		const categoryHeading = categorySection.querySelector("h2");
		const entryList = categorySection.querySelector(".entry-list");
		const contentsCategory = document.createElement("li");
		const contentsHeading = document.createElement("span");
		const contentsList = document.createElement("ul");

		categoryHeading.textContent = group.heading;
		contentsHeading.className = "type";
		contentsHeading.textContent = group.name;
		contentsCategory.append(contentsHeading, contentsList);
		contents.append(contentsCategory);

		const entries = data.items.filter((item) => {
			if (item.group !== group.id) {
				return false;
			}
			return group.id !== "subclasses" || !classTitlesById.has(item.subclassOf);
		});
		entries.sort((a, b) => {
			const classOrder = group.id === "subclasses"
				? collator.compare(getSubclassClass(a), getSubclassClass(b))
				: 0;
			return classOrder || collator.compare(a.title, b.title);
		});

		let currentSubclassClass = "";
		for (const entry of entries) {
			if (group.id === "subclasses") {
				const subclassClass = getSubclassClass(entry);
				if (collator.compare(subclassClass, currentSubclassClass) !== 0) {
					const classHeading = document.createElement("h3");
					classHeading.textContent = subclassClass;
					entryList.append(classHeading);
					currentSubclassClass = subclassClass;
				}
			}

			const contentsItem = appendEntry(entry, entryList, contentsList);

			if (group.id === "classes") {
				const subclasses = subclassesByClassId.get(entry.id) ?? [];
				if (subclasses.length > 0) {
					subclasses.sort((a, b) => collator.compare(a.title, b.title));
					const subclassContentsList = document.createElement("ul");
					contentsItem.append(subclassContentsList);

					const subclassGroup = document.createElement("div");
					subclassGroup.className = "entry-subclasses";
					const subclassHeading = document.createElement("h3");
					subclassHeading.textContent = `${entry.title} Subclasses`;
					subclassGroup.append(subclassHeading);
					entryList.append(subclassGroup);

					for (const subclass of subclasses) {
						appendEntry(subclass, subclassGroup, subclassContentsList, "subclass-entry");
					}
				}
			}
		}

		sections.append(categoryFragment);
	}

}

renderGroupedEntries().catch((error) => console.error(error));