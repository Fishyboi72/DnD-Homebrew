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

		for (const entry of data.items.filter((item) => item.group === group.id)) {
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