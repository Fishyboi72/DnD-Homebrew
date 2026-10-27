async function loadHomepageContent() {
	const response = await fetch("./data/homepage-content.json");
	if (!response.ok) {
		throw new Error(`Could not load homepage content: ${response.status}`);
	}

	const content = await response.json();
	const sections = [
		["Latest", "latest-list"],
		["Popular", "popular-list"]
	];

	for (const [sectionName, listId] of sections) {
		const list = document.getElementById(listId);
		for (const item of content[sectionName] ?? []) {
			if (typeof item.name !== "string" || typeof item.url !== "string") {
				continue;
			}

			const link = document.createElement("a");
			link.href = item.url;
			link.textContent = item.name;

			const listItem = document.createElement("li");
			listItem.append(link);
			list.append(listItem);
		}
	}
}

loadHomepageContent().catch((error) => console.error(error));
