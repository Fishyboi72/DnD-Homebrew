const pageNavigation = document.querySelector("body > nav");

if (pageNavigation) {
	const floatingNavigation = document.createElement("aside");
	floatingNavigation.id = "floating-navigation";
	floatingNavigation.setAttribute("aria-hidden", "true");

	const navigationToggle = document.createElement("button");
	navigationToggle.className = "floating-navigation-toggle";
	navigationToggle.type = "button";
	navigationToggle.setAttribute("aria-label", "Open site navigation");
	navigationToggle.setAttribute("aria-expanded", "false");
	navigationToggle.setAttribute("aria-controls", "floating-navigation-links");
	const menuIcon = document.createElement("span");
	menuIcon.className = "menu-icon";
	menuIcon.setAttribute("aria-hidden", "true");
	navigationToggle.append(menuIcon);

	const navigationToolbar = document.createElement("div");
	navigationToolbar.className = "floating-navigation-toolbar";
	navigationToolbar.append(navigationToggle);

	const navigationLinks = document.createElement("nav");
	navigationLinks.id = "floating-navigation-links";
	navigationLinks.setAttribute("aria-label", "Site navigation");
	navigationLinks.hidden = true;
	navigationLinks.append(
		...Array.from(pageNavigation.querySelectorAll(":scope > a"), (link) =>
			link.cloneNode(true)
		)
	);
	const searchForm = pageNavigation.querySelector(":scope > .site-search");
	if (searchForm) {
		const floatingSearchForm = searchForm.cloneNode(true);
		const floatingSearchInput = floatingSearchForm.querySelector("input");
		const floatingSearchLabel = floatingSearchForm.querySelector("label");
		const floatingSearchResults = floatingSearchForm.querySelector(".site-search-results");
		const floatingSearchPanel = floatingSearchForm.querySelector(".site-search-panel");

		floatingSearchForm.removeAttribute("id");
		floatingSearchInput.id = "floating-site-search-input";
		floatingSearchLabel.htmlFor = floatingSearchInput.id;
		floatingSearchPanel.id = "floating-site-search-panel";
		floatingSearchForm.querySelector(".site-search-toggle").setAttribute(
			"aria-controls",
			floatingSearchPanel.id
		);
		floatingSearchResults.id = "floating-site-search-results";
		floatingSearchInput.setAttribute("aria-controls", floatingSearchResults.id);
		floatingSearchForm.querySelector(".site-search-status").id = "floating-site-search-status";
		navigationToolbar.append(floatingSearchForm);
	}

	floatingNavigation.append(navigationToolbar, navigationLinks);
	document.body.append(floatingNavigation);

	navigationToggle.addEventListener("click", () => {
		const isExpanded = navigationToggle.getAttribute("aria-expanded") !== "true";
		navigationToggle.setAttribute("aria-expanded", String(isExpanded));
		navigationToggle.setAttribute(
			"aria-label",
			isExpanded ? "Close site navigation" : "Open site navigation"
		);
		navigationLinks.hidden = !isExpanded;
		floatingNavigation.classList.toggle("is-expanded", isExpanded);
		if (!isExpanded) {
			floatingNavigation.querySelector(".site-search")?.dispatchEvent(
				new Event("site-search-dismiss")
			);
		}
	});

	const updateFloatingNavigation = () => {
		const isTopNavigationOutOfView = pageNavigation.getBoundingClientRect().bottom <= 0;
		floatingNavigation.classList.toggle("is-visible", isTopNavigationOutOfView);
		floatingNavigation.setAttribute("aria-hidden", String(!isTopNavigationOutOfView));

		if (!isTopNavigationOutOfView && !navigationLinks.hidden) {
			navigationToggle.click();
		}
	};

	window.addEventListener("scroll", updateFloatingNavigation, { passive: true });
	window.addEventListener("resize", updateFloatingNavigation);
	updateFloatingNavigation();

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !navigationLinks.hidden) {
			navigationToggle.click();
			navigationToggle.focus();
		}
	});
}
