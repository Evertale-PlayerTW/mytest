const initTitle = document.title;

function displayData(id, myCategory) {
	id ??= document.getElementById("targetSelect").value;
	if (id == "") return;

	currentDisplayCategory = myCategory ?? unit_category;

	collapseReset();
	document.title = `${wholeData[currentDisplayCategory][id]["完整名"]} | ${initTitle}`;

	document.getElementById("codeName").textContent = id;
	document.getElementById("bigName").textContent = wholeData[currentDisplayCategory][id]["名字"] || id;
	if (wholeData[currentDisplayCategory][id]["副名"]) {
		document.getElementById("subName").classList.remove("hidden");
		document.getElementById("subName").textContent = wholeData[currentDisplayCategory][id]["副名"];
	} else {
		document.getElementById("subName").classList.add("hidden");
	}

	setGeneralStats(id);
	setProfile(id);
	setLeaderSkill(id);
	setWeaponSkill(id);
	setActiveSkill(id);
	setPassiveSkill(id);
	setSummonableMonsters(id);
	setGachaIntro(id);
	setDialog(id);
	setAiLogic(id);
	setRelationship(id);

	document.getElementById("nameDisplay").scrollIntoView();
}

function setGeneralStats(id) {
	document.getElementById("generalStatsArea").classList.remove("hidden");

	if (currentDisplayCategory === "Equipment") {
		document.querySelector("#atk .infoTitle").textContent = "攻擊力";
		document.querySelector("#hp .infoTitle").textContent = "生命";
		document.getElementById("powerHint").classList.add("hidden");
	} else {
		document.querySelector("#atk .infoTitle").textContent = "基礎攻擊力";
		document.querySelector("#hp .infoTitle").textContent = "基礎生命";
		document.getElementById("powerHint").classList.remove("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["稀有度"] != null) {
		document.getElementById("rarity").classList.remove("hidden");
		document.querySelector("#rarity .infoValue").textContent = wholeData[currentDisplayCategory][id]["稀有度"];
	} else {
		document.getElementById("rarity").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["星數"] != null) {
		document.getElementById("stars").classList.remove("hidden");
		document.querySelector("#stars .infoValue").textContent = wholeData[currentDisplayCategory][id]["星數"];
	} else {
		document.getElementById("stars").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["擅長武器"] != null) {
		document.getElementById("preferredWeapon").classList.remove("hidden");
		document.querySelector("#preferredWeapon .infoValue").textContent =
			wholeData[currentDisplayCategory][id]["擅長武器"];
	} else {
		document.getElementById("preferredWeapon").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["類型"] != null) {
		document.getElementById("weaponType").classList.remove("hidden");
		document.querySelector("#weaponType .infoValue").textContent = wholeData[currentDisplayCategory][id]["類型"];
	} else {
		document.getElementById("weaponType").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["屬性"] != null) {
		document.getElementById("element").classList.remove("hidden");
		document.querySelector("#element .infoValue").textContent = wholeData[currentDisplayCategory][id]["屬性"];
	} else {
		document.getElementById("element").classList.add("hidden");
	}
	if (wholeData[currentDisplayCategory][id]["Cost"] != null) {
		document.getElementById("cost").classList.remove("hidden");
		document.querySelector("#cost .infoValue").textContent = wholeData[currentDisplayCategory][id]["Cost"];
	} else {
		document.getElementById("cost").classList.add("hidden");
	}

	if (
		(wholeData[currentDisplayCategory][id]["基礎攻擊力"] != null) |
		(wholeData[currentDisplayCategory][id]["攻擊力"] != null)
	) {
		document.getElementById("atk").classList.remove("hidden");
		document.querySelector("#atk .infoValue").textContent =
			wholeData[currentDisplayCategory][id]["基礎攻擊力"] ?? wholeData[currentDisplayCategory][id]["攻擊力"];
	} else {
		document.getElementById("atk").classList.add("hidden");
	}

	if (
		(wholeData[currentDisplayCategory][id]["基礎生命"] != null) |
		(wholeData[currentDisplayCategory][id]["生命"] != null)
	) {
		document.getElementById("hp").classList.remove("hidden");
		document.querySelector("#hp .infoValue").textContent =
			wholeData[currentDisplayCategory][id]["基礎生命"] ?? wholeData[currentDisplayCategory][id]["生命"];
	} else {
		document.getElementById("hp").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["速度"] != null) {
		document.getElementById("speed").classList.remove("hidden");
		document.querySelector("#speed .infoValue").textContent = wholeData[currentDisplayCategory][id]["速度"];
	} else {
		document.getElementById("speed").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["戰力"] != null) {
		document.getElementById("power").classList.remove("hidden");
		document.querySelector("#power .infoValue").textContent = wholeData[currentDisplayCategory][id]["戰力"];
	} else {
		document.getElementById("power").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["自動進化"] != null) {
		document.getElementById("freeEvo").classList.remove("hidden");
		const evoLv = `Lv.${wholeData[currentDisplayCategory][id]["自動進化"]["進化等級"]}`;
		const evoTarget = setNameAndLink(
			wholeData[currentDisplayCategory][id]["自動進化"]["進化目標"],
			"Monster",
			true,
			false
		);
		document.querySelector("#freeEvo .infoValue").innerHTML = `${evoLv}<br>${evoTarget.outerHTML}`;
	} else {
		document.getElementById("freeEvo").classList.add("hidden");
	}

	if (wholeData[currentDisplayCategory][id]["圖鑑可見"]) {
		document.getElementById("visible").classList.remove("hidden");
		document.querySelector("#visible .infoValue").textContent = "✔";
	} else {
		document.getElementById("visible").classList.remove("hidden");
		document.querySelector("#visible .infoValue").textContent = "✗";
	}
}

function setProfile(id) {
	if (wholeData[currentDisplayCategory][id]["簡介"]) {
		document.getElementById("profileArea").classList.remove("hidden");
		document.getElementById("profileText").innerText = wholeData[currentDisplayCategory][id]["簡介"];

		document.getElementById("hasAscended")?.remove();
		if (wholeData[currentDisplayCategory][id]["簡介_已超越(滿覺)"] != null) {
			const templateHasAscended = document.getElementById("template-hasAscended").content.cloneNode(true);
			templateHasAscended.getElementById("profileAscendedText").innerText =
				wholeData[currentDisplayCategory][id]["簡介_已超越(滿覺)"];
			document.getElementById("profileContent").appendChild(templateHasAscended);
		}
	} else {
		document.getElementById("profileArea").classList.add("hidden");
	}
}

function setLeaderSkill(id) {
	if (wholeData[currentDisplayCategory][id]["隊長技能"]) {
		document.getElementById("leaderSkillArea").classList.remove("hidden");
		document.getElementById("leaderSkillName").innerText =
			wholeData[currentDisplayCategory][id]["隊長技能"]["技能標題"];
		document.getElementById("leaderSkillDecription").innerText =
			wholeData[currentDisplayCategory][id]["隊長技能"]["技能敘述"];
	} else {
		document.getElementById("leaderSkillArea").classList.add("hidden");
	}
}

function setWeaponSkill(id) {
	if (wholeData[currentDisplayCategory][id]["武器技能"]) {
		document.getElementById("weaponSkillArea").classList.remove("hidden");
		document.getElementById("weaponSkillName").innerText =
			wholeData[currentDisplayCategory][id]["武器技能"][0]["技能標題"];
		document.getElementById("weaponSkillDecription").innerText =
			wholeData[currentDisplayCategory][id]["武器技能"][0]["技能敘述"];
	} else {
		document.getElementById("weaponSkillArea").classList.add("hidden");
	}
}

function setActiveSkill(id) {
	if (wholeData[currentDisplayCategory][id]["主動技能"]) {
		document.getElementById("activeSkillArea").classList.remove("hidden");
		document.getElementById("activeSkillContent").innerHTML = "";

		for (const [index, mySkill] of wholeData[currentDisplayCategory][id]["主動技能"].entries()) {
			const templateActiveSkill = document.getElementById("template-activeSkill").content.cloneNode(true);
			templateActiveSkill.querySelector(".activeSkillDetail").id = "activeSkill_" + (index + 1);
			templateActiveSkill.querySelector(".activeSkillName").innerText = mySkill["技能標題"];
			templateActiveSkill.querySelector(".activeSkillSpirit").innerText = "靈氣 " + mySkill["靈氣"];
			templateActiveSkill.querySelector(".activeSkillTU").innerText = mySkill["TU"] + " TU";
			templateActiveSkill.querySelector(".activeSkillDecription").innerText = mySkill["技能敘述"];

			document.getElementById("activeSkillContent").appendChild(templateActiveSkill);
		}
	} else {
		document.getElementById("activeSkillArea").classList.add("hidden");
	}
}

function setPassiveSkill(id) {
	if (wholeData[currentDisplayCategory][id]["被動技能"]) {
		document.getElementById("passiveSkillArea").classList.remove("hidden");
		document.getElementById("passiveSkillContent").innerHTML = "";

		for (const [index, mySkill] of wholeData[currentDisplayCategory][id]["被動技能"].entries()) {
			const templateActiveSkill = document.getElementById("template-passiveSkill").content.cloneNode(true);
			templateActiveSkill.querySelector(".passiveSkillDetail").id = "passiveSkill_" + (index + 1);
			templateActiveSkill.querySelector(".passiveSkillName").innerText = mySkill["技能標題"];
			templateActiveSkill.querySelector(".passiveSkillDecription").innerText = mySkill["技能敘述"];

			document.getElementById("passiveSkillContent").appendChild(templateActiveSkill);
		}
	} else {
		document.getElementById("passiveSkillArea").classList.add("hidden");
	}
}

function setGachaIntro(id) {
	if (wholeData[currentDisplayCategory][id]["召喚導言"]) {
		document.getElementById("gachaIntroArea").classList.remove("hidden");
		document.getElementById("gachaIntroText").innerText = wholeData[currentDisplayCategory][id]["召喚導言"];
	} else {
		document.getElementById("gachaIntroArea").classList.add("hidden");
	}
}

function setDialog(id) {
	if (wholeData[currentDisplayCategory][id]["對話"]) {
		document.getElementById("dialogArea").classList.remove("hidden");
		document.getElementById("dialogContent").innerHTML = "";

		const dailogSort = {
			Gacha: "召喚",
			Login: "主畫面登入",
			Tap: "主畫面點擊",
			Idle: "主畫面閒置",
		};

		for (const [key, title] of Object.entries(dailogSort)) {
			if (!wholeData[currentDisplayCategory][id]["對話"][title]) continue;

			const templateDialog = document.getElementById("template-dialog").content.cloneNode(true);
			templateDialog.querySelector(".dialogGroup").id = "dialog_" + key;
			templateDialog.querySelector(".dialogGroupTitle").innerText = title;

			for (const dialogText of wholeData[currentDisplayCategory][id]["對話"][title]) {
				if (!dialogText) continue;
				const templateDialogText = templateDialog.querySelector(".dialogText").cloneNode(true);
				templateDialogText.innerText = dialogText;
				templateDialog.querySelector(".dialogGroup").appendChild(templateDialogText);
			}
			//若無添加，則只有模板當初的2子元素
			if (templateDialog.querySelector(".dialogGroup").children.length <= 2) continue;

			templateDialog.querySelector(".dialogText").remove();
			document.getElementById("dialogContent").appendChild(templateDialog);
		}
	} else {
		document.getElementById("dialogArea").classList.add("hidden");
	}
}

function setAiLogic(id) {
	if (wholeData[currentDisplayCategory][id]["AI邏輯"]) {
		document.getElementById("aiLogicArea").classList.remove("hidden");
		//刪除最外層的{}，並統一減少1縮排
		let jsonText = JSON.stringify(wholeData[currentDisplayCategory][id]["AI邏輯"], null, "\t");
		jsonText = jsonText.split("\n").slice(1, -1);
		jsonText = jsonText.map((line) => line.replace(/^\t/, ""));
		jsonText = jsonText.join("\n");

		document.getElementById("aiLogicContent").innerText = jsonText;
	} else {
		document.getElementById("aiLogicArea").classList.add("hidden");
	}
}

function getFullNameAddStarsOrRarity(id, category, addStars = true, addRarity = false) {
	let longName = wholeData[category][id]["完整名"];
	if (addStars) longName += ` (${wholeData[category][id]["星數"]})`;
	if (addRarity) longName += ` (${wholeData[category][id]["稀有度"]})`;
	return longName;
}

function analyzeUrlParams() {
	try {
		const params = new URLSearchParams(window.location.search);

		if (!params.toString()) return;
		const id =
			params.get("id") ??
			(() => {
				throw new Error("id參數不可少");
			})();

		//若沒傳入category則遍歷搜尋
		let category =
			params.get("category") ??
			(() => {
				for (const [type, ids] of Object.entries(wholeData)) {
					if (id in ids) return type;
				}
				throw new Error("id參數錯誤");
			})();

		if (wholeData[category][id]) {
			displayData(id, category);
			history.replaceState(null, "", window.location.pathname);
		} else {
			throw new Error("id或category參數錯誤");
		}
	} catch (e) {
		alert(e);
		console.error(e);
	}
}

function setNameAndLink(id, category, addStars = true, addRarity = false) {
	const linkElement = document.createElement("a");
	linkElement.href = `?id=${id}&category=${category}`;
	linkElement.textContent = getFullNameAddStarsOrRarity(id, category, addStars, addRarity);
	return linkElement;
}

function setSummonableMonsters(id) {
	if (wholeData[currentDisplayCategory][id]["召喚物"]) {
		document.getElementById("summonableMonstersArea").classList.remove("hidden");
		const combination = wholeData[currentDisplayCategory][id]["召喚物"]
			.map((conjureID) => setNameAndLink(conjureID, "Monster", true, false).outerHTML)
			.join("<br>");
		document.getElementById("summonableMonstersContent").innerHTML = combination;
	} else {
		document.getElementById("summonableMonstersArea").classList.add("hidden");
	}
}

function setRelationship(id) {
	if (wholeData[currentDisplayCategory][id]["夥伴"]) {
		document.getElementById("relationshipArea").classList.remove("hidden");
		document.getElementById("relationshipContent").innerHTML = "";

		for (const oneRelationship of Object.values(wholeData[currentDisplayCategory][id]["夥伴"])) {
			const templateRelationship = document.getElementById("template-relationship").content.cloneNode(true);
			templateRelationship.querySelector(".relationshipName").innerText = oneRelationship["夥伴關係"];
			templateRelationship.querySelector(".relationshipBonus").innerText = oneRelationship["夥伴加成"].replace(
				"+",
				"\n+"
			);

			const memberlist = document.createElement("ul");
			for (const charID of oneRelationship["夥伴成員"]) {
				const listItem = document.createElement("li");
				listItem.appendChild(setNameAndLink(charID, "Monster", false, true));
				memberlist.appendChild(listItem);
			}
			templateRelationship.querySelector(".relationshipMembers").appendChild(memberlist);

			document.getElementById("relationshipContent").appendChild(templateRelationship);
		}
	} else {
		document.getElementById("relationshipArea").classList.add("hidden");
	}
}

function collapseContent(triggerElement) {
	triggerElement.innerText = !triggerElement.nextElementSibling.classList.contains("hidden") ? "⊕" : "⊖";
	triggerElement.nextElementSibling.classList.toggle("hidden");
}

function collapseReset() {
	document.querySelectorAll(".collapseButton").forEach(function (el) {
		el.nextElementSibling.classList.remove("hidden");
	});
}
