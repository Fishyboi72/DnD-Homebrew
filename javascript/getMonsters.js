async function loadMonsters() {
	const response = await fetch("../data/monsters.json");
	if (!response.ok) {
		throw new Error(`Could not load monsters: ${response.status}`);
	}

	const data = await response.json();
	const contents = document.getElementById("monster-contents-list");
	const sections = document.getElementById("monster-sections");
	const categoryTemplate = document.getElementById("monster-category-template");
	const monsterTemplate = document.getElementById("monster-template");

	for (const [categoryIndex, category] of data.categories.entries()) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".monster-category");
		const categoryHeading = categorySection.querySelector("h2");
		const monsterList = categorySection.querySelector(".monster-list");
		const contentsCategory = document.createElement("li");
		const contentsList = document.createElement("ul");
		const monsters = data.monsters.filter((monster) => monster.type === category);

		categoryHeading.textContent = category;

		contentsList.hidden = true;
		contentsList.id = `monster-contents-category-${categoryIndex}`;
		contentsList.classList.add("contents-category-list");
		const contentsToggle = document.createElement("button");
		contentsToggle.className = "contents-category-toggle";
		contentsToggle.type = "button";
		contentsToggle.textContent = category;
		contentsToggle.setAttribute("aria-expanded", "false");
		contentsToggle.setAttribute("aria-controls", contentsList.id);

		contentsCategory.append(contentsToggle, contentsList);
		contents.append(contentsCategory);

		if (monsters.length === 0) {
			const emptyMessage = document.createElement("li");
			emptyMessage.className = "category-empty-message";
			emptyMessage.textContent = "There are no monsters in this category yet.";
			contentsList.append(emptyMessage);

			const sectionEmptyMessage = document.createElement("p");
			sectionEmptyMessage.className = "category-empty-message";
			sectionEmptyMessage.textContent = "There are no monsters in this category yet.";
			monsterList.append(sectionEmptyMessage);
		}

		for (const monster of monsters) {
			const contentsItem = document.createElement("li");
			const contentsLink = document.createElement("a");
			contentsLink.href = `#${monster.id}`;
			contentsLink.textContent = monster.name;
			contentsItem.append(contentsLink);
			contentsList.append(contentsItem);

			const monsterFragment = monsterTemplate.content.cloneNode(true);
			const article = monsterFragment.querySelector("article");
			article.id = monster.id;
			article.querySelector("h3").textContent = monster.name;
			article.querySelector("h5").innerHTML = monster.subtitle;
			article.querySelector(".monster-description").innerHTML = monster.description;
			monsterList.append(monsterFragment);
		}

		sections.append(categoryFragment);
	}
}

loadMonsters().catch((error) => console.error(error));