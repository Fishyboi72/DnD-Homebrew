async function loadMagicItems() {
	const response = await fetch("../data/magic-items.json");
	if (!response.ok) {
		throw new Error(`Could not load magic items: ${response.status}`);
	}

	const items = await response.json();
	const contents = document.getElementById("magic-item-contents-list");
	const sections = document.getElementById("magic-item-sections");
	const categoryTemplate = document.getElementById("magic-item-category-template");
	const itemTemplate = document.getElementById("magic-item-template");
	const categories = new Map();

	for (const item of items) {
		if (!categories.has(item.type)) {
			categories.set(item.type, []);
		}
		categories.get(item.type).push(item);
	}

	for (const [categoryIndex, [category, categoryItems]] of [...categories].entries()) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".magic-item-category");
		const categoryHeading = categorySection.querySelector("h2");
		const itemList = categorySection.querySelector(".magic-item-list");
		const contentsCategory = document.createElement("li");
		const contentsList = document.createElement("ul");

		categoryHeading.textContent = category;

		contentsList.hidden = true;
		contentsList.id = `magic-item-contents-category-${categoryIndex}`;
		contentsList.classList.add("contents-category-list");
		const contentsToggle = document.createElement("button");
		contentsToggle.className = "contents-category-toggle";
		contentsToggle.type = "button";
		contentsToggle.textContent = category;
		contentsToggle.setAttribute("aria-expanded", "false");
		contentsToggle.setAttribute("aria-controls", contentsList.id);

		contentsCategory.append(contentsToggle, contentsList);
		contents.append(contentsCategory);

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