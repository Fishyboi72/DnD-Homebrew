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

	for (const category of data.categories) {
		const categoryFragment = categoryTemplate.content.cloneNode(true);
		const categorySection = categoryFragment.querySelector(".monster-category");
		const categoryHeading = categorySection.querySelector("h2");
		const monsterList = categorySection.querySelector(".monster-list");
		const contentsCategory = document.createElement("li");
		const contentsHeading = document.createElement("span");
		const contentsList = document.createElement("ul");
		const monsters = data.monsters.filter((monster) => monster.type === category);

		categoryHeading.textContent = category;
		contentsHeading.className = "type";
		contentsHeading.textContent = category;
		contentsCategory.append(contentsHeading, contentsList);
		contents.append(contentsCategory);

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