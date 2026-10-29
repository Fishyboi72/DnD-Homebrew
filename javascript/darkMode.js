const toggleButton = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
	document.body.classList.add("dark-mode");
}

const updateDarkModeButtons = () => {
	const isDarkMode = document.body.classList.contains("dark-mode");
	const label = isDarkMode ? "Light Mode" : "Dark Mode";

	document.querySelectorAll("#darkModeToggle, .dark-mode-toggle").forEach((button) => {
		button.classList.add("dark-mode-toggle");
		const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		icon.setAttribute("viewBox", "0 0 24 24");
		icon.setAttribute("aria-hidden", "true");
		icon.classList.add("dark-mode-icon");

		if (isDarkMode) {
			const sun = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			sun.setAttribute("cx", "12");
			sun.setAttribute("cy", "12");
			sun.setAttribute("r", "4");
			sun.setAttribute("fill", "none");
			sun.setAttribute("stroke", "currentColor");
			sun.setAttribute("stroke-width", "2");
			const rays = document.createElementNS("http://www.w3.org/2000/svg", "path");
			rays.setAttribute(
				"d",
				"M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
			);
			rays.setAttribute("fill", "none");
			rays.setAttribute("stroke", "currentColor");
			rays.setAttribute("stroke-width", "2");
			rays.setAttribute("stroke-linecap", "round");
			icon.append(sun, rays);
		} else {
			const moon = document.createElementNS("http://www.w3.org/2000/svg", "path");
			moon.setAttribute("d", "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z");
			icon.append(moon);
		}

		const text = document.createElement("span");
		text.textContent = label;
		button.replaceChildren(icon, text);
	});
};

updateDarkModeButtons();

toggleButton.addEventListener("click", () => {
	document.body.classList.toggle("dark-mode");
	localStorage.setItem(
		"darkMode",
		document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
	);
	updateDarkModeButtons();
});