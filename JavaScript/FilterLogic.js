const initSelectOptionContent = document.getElementById("targetSelect").innerHTML;

function initFilter() {
	document.getElementById("selectCategory").querySelector('input[type="radio"]').checked = true;
	document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = true));
	document.getElementById("reverseToggle").checked = false;
}

function changeCategory() {
	unit_category = document.querySelector('input[name="unit_category"]:checked').value;

	document.querySelectorAll(".mo, .wo").forEach(function (el) {
		el.style.display = "none";
	});

	if (unit_category === "Equipment") {
	} else {
		if (unit_category === "Weapon") {
			document.querySelectorAll(".wo").forEach(function (el) {
				el.style.display = "";
			});
		} else {
			document.querySelectorAll(".mo").forEach(function (el) {
				el.style.display = "";
			});
		}
	}

	document.querySelectorAll('.chooseOption input[type="checkbox"]').forEach((el) => (el.checked = true));
	document.getElementById("reverseToggle").checked = false;

	setSelectableList();
}

function setSelectableList(triggerElement) {
	const targetSelect = document.getElementById("targetSelect");
	targetSelect.innerHTML = initSelectOptionContent;

	const selectedRarities = Array.from(document.querySelectorAll("#filterRarity input:checked")).map((cb) => cb.value);
	const selectedStars = Array.from(document.querySelectorAll("#filterStars input:checked")).map((cb) => cb.value);
	const selectedElements = Array.from(document.querySelectorAll("#filterElement input:checked")).map((cb) =>
		cb.parentNode.textContent.trim()
	);
	const selectedWeaponTypes = Array.from(document.querySelectorAll("#filterWeaponType input:checked")).map((cb) =>
		cb.parentNode.textContent.trim()
	);

	const filteredStars = new Set();

	for (const id in wholeData[unit_category]) {
		const entry = wholeData[unit_category][id];
		const option = document.createElement("option");

		if (!selectedRarities.includes(entry["稀有度"])) continue;
		if (unit_category === "Monster" && !selectedElements.includes(entry["屬性"])) continue;
		if (unit_category === "Weapon" && !selectedWeaponTypes.includes(entry["類型"])) continue;

		filteredStars.add(entry["目前星數"]);
		if (!selectedStars.includes(String(entry["目前星數"]))) continue;

		option.value = id;
		option.text = getFullNameAddStarsOrRarity(id, unit_category, true, false);
		targetSelect.appendChild(option);
	}

	if (document.getElementById("reverseToggle").checked) reverseOptions();
	targetSelect.selectedIndex = 0;

	if (filteredStars.size !== 0) {
		//禁用沒有的星數選項
		Array.from(document.querySelectorAll("#filterStars input")).forEach((cb) => {
			cb.disabled = false;
			if (!filteredStars.has(Number(cb.value))) {
				cb.checked = false;
				cb.disabled = true;
			}
		});

		//若非星數區塊觸發，且星數都未選，則全選
		const selectedStarsNew = Array.from(document.querySelectorAll("#filterStars input:checked")).map((cb) => cb.value);
		if (triggerElement && !triggerElement.closest("#filterStars") && selectedStarsNew.length === 0) {
			document.querySelectorAll("#filterStars input").forEach((cb) => (cb.checked = true));
			setSelectableList();
		}
	}
}

function reverseOptions() {
	const selectableTarget = document.getElementById("targetSelect");
	const originalOptions = Array.from(selectableTarget.options).slice(1);
	const newOptions = originalOptions.reverse();
	selectableTarget.innerHTML = initSelectOptionContent;
	newOptions.forEach((option) => selectableTarget.appendChild(option));
	selectableTarget.selectedIndex = 0;
}

function toggleAllCheckboxes(toggleElement) {
	const checkboxes = toggleElement.parentElement.querySelectorAll('input[type="checkbox"]');

	// 檢查目前是否全選
	const allChecked = Array.from(checkboxes)
		.filter((cb) => !cb.disabled)
		.every((cb) => cb.checked);
	checkboxes.forEach((cb) => (cb.checked = !allChecked));

	setSelectableList();
}
