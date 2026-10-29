const contents = document.querySelector(
	"#entry-contents, #magic-item-contents, #monster-contents"
);

document.addEventListener("click", (event) => {
	const targetElement = event.target instanceof Element ? event.target : null;
	const contentsToggle = targetElement?.closest(
		".contents-category-toggle, .contents-subcategory-toggle"
	);
	if (contentsToggle) {
		const contentsList = contentsToggle.parentElement.querySelector(":scope > ul");
		if (contentsList) {
			const isExpanded = contentsToggle.getAttribute("aria-expanded") !== "true";
			contentsToggle.setAttribute("aria-expanded", String(isExpanded));
			contentsList.hidden = !isExpanded;
		}
		return;
	}
});

if (contents) {
	const staticContentsHeading = contents.querySelector(":scope > h2");

	const floatingContents = document.createElement("aside");
	floatingContents.id = "floating-contents";
	floatingContents.setAttribute("aria-label", "Floating contents");
	floatingContents.setAttribute("aria-hidden", "false");
	floatingContents.classList.add("is-visible");
	const floatingContentsHeader = document.createElement("div");
	floatingContentsHeader.className = "floating-contents-header";
	const floatingContentsToggle = document.createElement("button");
	floatingContentsToggle.className = "floating-contents-toggle";
	floatingContentsToggle.type = "button";
	floatingContentsToggle.textContent = "Contents";
	floatingContentsToggle.setAttribute("aria-expanded", "false");
	floatingContentsToggle.setAttribute("aria-controls", "floating-contents-body");
	const floatingContentsBody = document.createElement("div");
	floatingContentsBody.id = "floating-contents-body";
	floatingContentsBody.hidden = true;
	const floatingContentsContent = contents.cloneNode(false);
	floatingContentsContent.removeAttribute("id");
	floatingContentsBody.append(floatingContentsContent);
	const floatingDarkModeToggle = document.createElement("button");
	floatingDarkModeToggle.className = "dark-mode-toggle floating-dark-mode-toggle";
	floatingDarkModeToggle.type = "button";
	floatingContentsHeader.append(floatingDarkModeToggle, floatingContentsToggle);
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
		floatingContentsContent
			.querySelectorAll(".contents-category-toggle, .contents-subcategory-toggle")
			.forEach((toggle, index) => {
				const categoryList = toggle.parentElement.querySelector(":scope > ul");
				if (categoryList) {
					categoryList.id = `floating-contents-category-${index}`;
					toggle.setAttribute("aria-controls", categoryList.id);
				}
			});
	};

	const contentsObserver = new MutationObserver(syncFloatingContents);
	contentsObserver.observe(contents, { childList: true, subtree: true });
	syncFloatingContents();

	const pageNavigation = document.querySelector("body > nav");
	const updateFloatingContentsPosition = () => {
		const navigationBounds = pageNavigation?.getBoundingClientRect();
		const shouldDock =
			pageNavigation &&
			window.getComputedStyle(pageNavigation).display !== "none" &&
			navigationBounds.bottom > 0;
		const isDocked = floatingContents.parentElement === pageNavigation;

		if (shouldDock && !isDocked) {
			pageNavigation.append(floatingContents);
			floatingContents.classList.add("is-docked");
		} else if (!shouldDock && isDocked) {
			document.body.append(floatingContents);
			floatingContents.classList.remove("is-docked");
		}
	};

	window.addEventListener("scroll", updateFloatingContentsPosition, { passive: true });
	window.addEventListener("resize", updateFloatingContentsPosition);
	updateFloatingContentsPosition();
}
