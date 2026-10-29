async function loadMagicItems() {
	const response = await fetch("../data/magic-items.json");
	if (!response.ok) {
		throw new Error(`Could not load magic items: ${response.status}`);
	}

	const data = await response.json();
	const contents = document.getElementById("magic-item-contents-list");
	const sections = document.getElementById("magic-item-sections");
	const categoryTemplate = document.getElementById("magic-item-category-template");
	const itemTemplate = document.getElementById("magic-item-template");
	const itemsByGroup = new Map(data.groups.map((group) => [group.id, []]));

	for (const item of data.items) {
		const groupItems = itemsByGroup.get(item.group);
		if (!groupItems) {
			throw new Error(`Magic item "${item.id}" references unknown group "${item.group}".`);
		}
		groupItems.push(item);
	}

	if (data.groups.length === 0) {
		const contentsMessage = document.createElement("li");
		contentsMessage.className = "category-empty-message";
		contentsMessage.textContent = "There are no magic items yet.";
		contents.append(contentsMessage);

		const sectionMessage = document.createElement("p");
		sectionMessage.className = "category-empty-message";
		sectionMessage.textContent = "There are no magic items yet.";
		sections.append(sectionMessage);
	}

	for (const [categoryIndex, group] of data.groups.entries()) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".magic-item-category");
		const categoryHeading = categorySection.querySelector("h2");
		const itemList = categorySection.querySelector(".magic-item-list");
		const contentsCategory = document.createElement("li");
		const contentsList = document.createElement("ul");
		const categoryItems = itemsByGroup.get(group.id);

		categoryHeading.textContent = group.heading;

		contentsList.hidden = true;
		contentsList.id = `magic-item-contents-category-${categoryIndex}`;
		contentsList.classList.add("contents-category-list");
		const contentsToggle = document.createElement("button");
		contentsToggle.className = "contents-category-toggle";
		contentsToggle.type = "button";
		contentsToggle.textContent = group.name;
		contentsToggle.setAttribute("aria-expanded", "false");
		contentsToggle.setAttribute("aria-controls", contentsList.id);

		contentsCategory.append(contentsToggle, contentsList);
		contents.append(contentsCategory);

		if (categoryItems.length === 0) {
			const contentsMessage = document.createElement("li");
			contentsMessage.className = "category-empty-message";
			contentsMessage.textContent = "There are no magic items in this category yet.";
			contentsList.append(contentsMessage);

			const sectionMessage = document.createElement("p");
			sectionMessage.className = "category-empty-message";
			sectionMessage.textContent = "There are no magic items in this category yet.";
			itemList.append(sectionMessage);
		}

		for (const item of categoryItems) {
			const contentsItem = document.createElement("li");
			const contentsLink = document.createElement("a");
			contentsLink.href = `#${item.id}`;
			contentsLink.textContent = item.name;
			contentsItem.append(contentsLink);
			contentsList.append(contentsItem);

			const itemFragment = itemTemplate.content.cloneNode(true);
			const article = itemFragment.querySelector("article");
			article.id = item.id;
			article.querySelector("h3").textContent = item.name;
			article.querySelector("h5").textContent = item.rarity;
			article.querySelector(".magic-item-description").innerHTML = item.description;
			itemList.append(itemFragment);
		}

		sections.append(categoryFragment);
	}
}

loadMagicItems().catch((error) => console.error(error));