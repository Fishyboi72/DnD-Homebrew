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

	function getSubclassClass(item) {
		const itemTemplate = document.createElement("template");
		itemTemplate.innerHTML = item.html;
		return (itemTemplate.content.querySelector("h5")?.textContent ?? "")
			.replace(/\s+subclass$/i, "")
			.trim();
	}

	const collator = new Intl.Collator(undefined, { sensitivity: "base" });

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

		const entries = data.items.filter((item) => item.group === group.id);
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

			const contentsItem = document.createElement("li");
			const contentsLink = document.createElement("a");
			contentsLink.href = `#${entry.id}`;
			contentsLink.textContent = entry.title;
			contentsItem.append(contentsLink);
			contentsList.append(contentsItem);

			const entryFragment = entryTemplate.content.cloneNode(true);
			const article = entryFragment.querySelector("article");
			article.id = entry.id;
			article.querySelector(".entry-content").innerHTML = entry.html;
			entryList.append(entryFragment);
		}

		sections.append(categoryFragment);
	}

}

renderGroupedEntries().catch((error) => console.error(error));