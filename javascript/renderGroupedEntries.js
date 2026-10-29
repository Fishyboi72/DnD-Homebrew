const contentUrl = document.currentScript.dataset.content;
const emptyCategoryMessage =
	document.currentScript.dataset.emptyCategoryMessage || "There are no entries in this category yet.";

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

	function appendContentsLink(entry, contentsList) {
		const contentsItem = document.createElement("li");
		const contentsLink = document.createElement("a");
		contentsLink.href = `#${entry.id}`;
		contentsLink.textContent = entry.title;
		contentsItem.append(contentsLink);
		contentsList.append(contentsItem);
	}

	function appendEntry(entry, entryList, contentsList) {
		if (contentsList) {
			appendContentsLink(entry, contentsList);
		}

		const entryFragment = entryTemplate.content.cloneNode(true);
		const article = entryFragment.querySelector("article");
		article.id = entry.id;
		article.querySelector(".entry-content").innerHTML = entry.html;
		entryList.append(entryFragment);
	}

	function appendContentsSubcategory(title, parentList, id) {
		const category = document.createElement("li");
		const categoryToggle = document.createElement("button");
		const categoryList = document.createElement("ul");

		categoryList.id = id;
		categoryList.classList.add("contents-category-list");
		categoryList.hidden = true;
		categoryToggle.className = "contents-subcategory-toggle";
		categoryToggle.type = "button";
		categoryToggle.textContent = title;
		categoryToggle.setAttribute("aria-expanded", "false");
		categoryToggle.setAttribute("aria-controls", categoryList.id);
		category.append(categoryToggle, categoryList);
		parentList.append(category);
		return categoryList;
	}

	for (const [categoryIndex, group] of data.groups.entries()) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".entry-category");
		const categoryHeading = categorySection.querySelector("h2");
		const entryList = categorySection.querySelector(".entry-list");
		const contentsCategory = document.createElement("li");
		const contentsList = document.createElement("ul");

		categoryHeading.textContent = group.heading;

		contentsList.hidden = true;
		contentsList.id = `entry-contents-category-${categoryIndex}`;
		contentsList.classList.add("contents-category-list");
		const contentsToggle = document.createElement("button");
		contentsToggle.className = "contents-category-toggle";
		contentsToggle.type = "button";
		contentsToggle.textContent = group.name;
		contentsToggle.setAttribute("aria-expanded", "false");
		contentsToggle.setAttribute("aria-controls", contentsList.id);

		contentsCategory.append(contentsToggle, contentsList);
		contents.append(contentsCategory);

		const entries = data.items.filter((item) => item.group === group.id);
		if (entries.length === 0) {
			const contentsEmptyMessage = document.createElement("li");
			contentsEmptyMessage.className = "category-empty-message";
			contentsEmptyMessage.textContent = emptyCategoryMessage;
			contentsList.append(contentsEmptyMessage);

			const sectionEmptyMessage = document.createElement("p");
			sectionEmptyMessage.className = "category-empty-message";
			sectionEmptyMessage.textContent = emptyCategoryMessage;
			entryList.append(sectionEmptyMessage);
		}

		if (group.id === "subclasses") {
			const subclassesByClass = new Map();
			for (const subclass of entries) {
				const className = getSubclassClass(subclass) || "Other Subclasses";
				if (!subclassesByClass.has(className)) {
					subclassesByClass.set(className, []);
				}
				subclassesByClass.get(className).push(subclass);
			}

			[...subclassesByClass.entries()]
				.sort(([a], [b]) => collator.compare(a, b))
				.forEach(([className, subclasses], subcategoryIndex) => {
					const subclassList = appendContentsSubcategory(
						className,
						contentsList,
						`entry-contents-subcategory-${categoryIndex}-${subcategoryIndex}`
					);
					subclasses.sort((a, b) => collator.compare(a.title, b.title));
					subclasses.forEach((subclass) => appendContentsLink(subclass, subclassList));
				});
		}

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

			const entryContentsList = group.id === "subclasses"
				? null
				: contentsList;
			appendEntry(entry, entryList, entryContentsList);
		}

		sections.append(categoryFragment);
	}

}

renderGroupedEntries().catch((error) => console.error(error));