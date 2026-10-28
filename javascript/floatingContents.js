const contents = document.querySelector(
	"#entry-contents, #magic-item-contents, #monster-contents"
);

if (contents) {
	const staticContentsHeading = contents.querySelector(":scope > h2");
	const staticContentsList = contents.querySelector(":scope > ul");
	if (staticContentsHeading && staticContentsList) {
		const staticContentsToggle = document.createElement("button");
		staticContentsToggle.className = "static-contents-toggle";
		staticContentsToggle.type = "button";
		staticContentsToggle.textContent = "Contents";
		staticContentsToggle.setAttribute("aria-expanded", "true");
		staticContentsToggle.setAttribute("aria-controls", staticContentsList.id);
		staticContentsHeading.replaceChildren(staticContentsToggle);

		staticContentsToggle.addEventListener("click", () => {
			const isExpanded = staticContentsToggle.getAttribute("aria-expanded") !== "true";
			staticContentsToggle.setAttribute("aria-expanded", String(isExpanded));
			staticContentsList.hidden = !isExpanded;
		});
	}

	const floatingContents = document.createElement("aside");
	floatingContents.id = "floating-contents";
	floatingContents.setAttribute("aria-label", "Floating contents");
	floatingContents.setAttribute("aria-hidden", "true");
	const floatingContentsHeader = document.createElement("div");
	floatingContentsHeader.className = "floating-contents-header";
	const floatingContentsToggle = document.createElement("button");
	floatingContentsToggle.className = "floating-contents-toggle";
	floatingContentsToggle.type = "button";
	floatingContentsToggle.textContent = "Contents";
	floatingContentsToggle.setAttribute("aria-expanded", "false");
	floatingContentsToggle.setAttribute("aria-controls", "floating-contents-body");
	floatingContentsHeader.append(floatingContentsToggle);
	const floatingContentsBody = document.createElement("div");
	floatingContentsBody.id = "floating-contents-body";
	floatingContentsBody.hidden = true;
	const floatingContentsContent = contents.cloneNode(false);
	floatingContentsContent.removeAttribute("id");
	floatingContentsBody.append(floatingContentsContent);
	const floatingDarkModeToggle = document.createElement("button");
	floatingDarkModeToggle.className = "floating-dark-mode-toggle";
	floatingDarkModeToggle.type = "button";
	floatingDarkModeToggle.textContent = "Toggle Dark Mode";
	floatingDarkModeToggle.addEventListener("click", () => {
		document.getElementById("darkModeToggle").click();
	});
	floatingContentsHeader.append(floatingDarkModeToggle);
	floatingContents.append(floatingContentsHeader, floatingContentsBody);
	document.body.append(floatingContents);

	floatingContentsToggle.addEventListener("click", () => {
		const isExpanded = floatingContentsToggle.getAttribute("aria-expanded") !== "true";
		floatingContentsToggle.setAttribute("aria-expanded", String(isExpanded));
		floatingContentsBody.hidden = !isExpanded;
		floatingContents.classList.toggle("is-expanded", isExpanded);
	});

	const syncFloatingContents = () => {
		floatingContentsContent.replaceChildren(
			...Array.from(contents.childNodes)
				.filter((node) => node !== staticContentsHeading)
				.map((node) => node.cloneNode(true))
		);
		floatingContentsContent.querySelectorAll("[id]").forEach((element) => {
			element.removeAttribute("id");
		});
	};

	const updateFloatingContents = () => {
		const isPastContents = contents.getBoundingClientRect().bottom <= 0;
		floatingContents.classList.toggle("is-visible", isPastContents);
		floatingContents.setAttribute("aria-hidden", String(!isPastContents));
	};

	const contentsObserver = new MutationObserver(() => {
		syncFloatingContents();
		updateFloatingContents();
	});
	contentsObserver.observe(contents, { childList: true, subtree: true });
	syncFloatingContents();

	window.addEventListener("scroll", updateFloatingContents, { passive: true });
	window.addEventListener("resize", updateFloatingContents);
	updateFloatingContents();
}
