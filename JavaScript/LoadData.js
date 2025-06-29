const langData = {};
const weaponType = {};
const elementType = {};
const proxyUrl = "https://corsproxy.io/?";
const resourceUrlPrefix = "https://prd.evertaleserver.com/Prd280/";

async function loadWholeData() {
	const cacheKey_Name = "cacheWholeData";
	const cacheKey_Time = "cacheTimestamp";
	const cacheDuration = 10 * 60 * 1000; //快取10分鐘有效

	const cache_WholeData = sessionStorage.getItem(cacheKey_Name);
	const cache_Time = sessionStorage.getItem(cacheKey_Time);
	if (cache_WholeData && cache_Time && Date.now() - cache_Time < cacheDuration) {
		wholeData = JSON.parse(cache_WholeData);
	} else {
		await loadLanguageText();
		await Promise.all([buildMonsterData(), buildWeaponData(), buildEquipmentData()]);
		sessionStorage.setItem(cacheKey_Name, JSON.stringify(wholeData));
		sessionStorage.setItem(cacheKey_Time, Date.now().toString());
	}

	//console.log(wholeData);
	document.getElementById("dataProgress").classList.add("hidden");
	document.getElementById("filterArea").classList.remove("hidden");
}

async function loadLanguageText() {
	const langLink = {
		CHT: `${resourceUrlPrefix}Localization/Localizable_ChineseTraditional.txt`,
		EN: `${resourceUrlPrefix}Localization/Localizable_English.txt`,
	};
	document.getElementById("languageProgress").textContent = "語言文本載入中...";
	console.time("Lang");
	try {
		for (const [langKey, filelink] of Object.entries(langLink)) {
			const data = {};
			const responseText = await (await fetch(`${proxyUrl}${filelink}`)).text();
			const lines = responseText.split(/\r?\n/);

			for (let line of lines) {
				const match = line.match(/"(.*)"="(.*)"/);
				if (match) {
					const [, key, value] = match;
					data[key] = value;
				}
			}
			langData[langKey] = data;
		}
		document.getElementById("languageProgress").textContent = "語言文本載入完成";
	} catch (error) {
		document.getElementById("languageProgress").textContent = "語言文本載入失敗";
		console.error("讀取或解析錯誤:", error);
	}
	console.timeEnd("Lang");
}

function getTextByKey(textKey) {
	for (const langKey in langData) {
		if (langData[langKey][textKey]) {
			return langData[langKey][textKey]
				.replace(/\\n/g, "\n")
				.replace(/\\r/g, "\r")
				.replace(/\\t/g, "\t")
				.replace(/\\'/g, "'")
				.replace(/\\"/g, '"')
				.replace(/\\\\/g, "\\");
		}
	}
	return "";
}

async function buildEquipmentData() {
	console.time("Equ");
	document.getElementById("equipmentProgress").textContent = "飾品資料載入中...";
	try {
		const baseEquipmentConfigUrl = `${resourceUrlPrefix}Equipment.json`;
		const baseEquipmentConfig = await fetch(`${proxyUrl}${baseEquipmentConfigUrl}`)
			.then((res) => res.json())
			.then((data) => data["Equipment"]);

		const equipmentData = {};
		for (const entry of baseEquipmentConfig) {
			const equipmentContent = {};
			const entryID = entry["name"];

			equipmentContent["名字"] = getTextByKey(entryID + "NameKey");
			equipmentContent["完整名"] = equipmentContent["名字"] || entryID;
			equipmentContent["簡介"] = getTextByKey(entryID + "DescriptionKey");
			equipmentContent["稀有度"] = getRarity(entry["accessoryStars"]);
			equipmentContent["星數"] = generateStarText(entry["accessoryStars"], entry["accessoryStars"]);
			equipmentContent["目前星數"] = entry["accessoryStars"];
			equipmentContent["最大星數"] = entry["accessoryStars"];
			equipmentContent["攻擊力"] = entry["flatAttack"];
			equipmentContent["生命"] = entry["flatMaxHp"];
			equipmentContent["速度"] = entry["flatSpeed"];
			equipmentContent["戰力"] = calcPowerValEz(
				"Equipment",
				entry["flatAttack"],
				entry["flatMaxHp"],
				entry["flatSpeed"],
				entry["accessoryStars"]
			);
			equipmentContent["圖鑑可見"] = entry["visible"] ? true : false;

			equipmentData[entryID] = equipmentContent;
		}

		wholeData["Equipment"] = equipmentData;
		console.timeEnd("Equ");
		document.getElementById("equipmentProgress").textContent = "飾品資料載入完成";
	} catch (error) {
		document.getElementById("equipmentProgress").textContent = "飾品資料載入失敗";
		console.error("讀取或解析錯誤:", error);
	}
}

async function buildWeaponData() {
	console.time("Weap");
	document.getElementById("weaponProgress").textContent = "武器資料載入中...";
	try {
		const baseWeaponConfigUrl = `${resourceUrlPrefix}Weapon.json`;
		const baseWeaponConfig = await fetch(`${proxyUrl}${baseWeaponConfigUrl}`)
			.then((res) => res.json())
			.then((data) => data["Weapon"]);

		const weaponData = {};
		for (const entry of baseWeaponConfig) {
			const weaponContent = {};
			const entryID = entry["name"];

			weaponContent["名字"] = getTextByKey(entry["family"] + "01NameKey");
			weaponContent["完整名"] = weaponContent["名字"] || entryID;
			weaponContent["簡介"] = getTextByKey(entry["family"] + "01DescriptionKey");
			weaponContent["稀有度"] = getRarity(entry["evolvedStars"]);
			weaponContent["星數"] = generateStarText(entry["stars"], entry["evolvedStars"]);
			weaponContent["目前星數"] = entry["stars"];
			weaponContent["最大星數"] = entry["evolvedStars"];
			weaponContent["類型"] = getWeaponTypeName(entry["weaponPref"]);
			weaponContent["Cost"] = entry["cost"];
			weaponContent["基礎攻擊力"] = entry["baseAttack"];
			weaponContent["基礎生命"] = entry["baseMaxHp"];
			weaponContent["速度"] = 0;
			weaponContent["戰力"] = calcPowerValEz(
				"Weapon",
				entry["baseAttack"],
				entry["baseMaxHp"],
				0,
				entry["evolvedStars"]
			);
			weaponContent["圖鑑可見"] = entry["visible"] ? true : false;

			const gachaIntroText = getTextByKey(entryID + "GachaIntroText");
			if (gachaIntroText) weaponContent["召喚導言"] = gachaIntroText;

			if (entry["passives"]) {
				weaponContent["武器技能"] = [];
				for (const skillID of Object.values(entry["passives"])) {
					const skillDetail = {};
					skillDetail["技能標題"] = getTextByKey(skillID + "NameKey");
					skillDetail["技能敘述"] = getTextByKey(skillID + "DescriptionKey");
					weaponContent["武器技能"].push(skillDetail);
				}
			}

			weaponData[entryID] = weaponContent;
		}

		wholeData["Weapon"] = weaponData;
		console.timeEnd("Weap");
		document.getElementById("weaponProgress").textContent = "武器資料載入完成";
	} catch (error) {
		document.getElementById("weaponProgress").textContent = "武器資料載入失敗";
		console.error("讀取或解析錯誤:", error);
	}
}

async function buildMonsterData() {
	console.time("Mons");
	document.getElementById("monsterProgress").textContent = "角色資料載入中...";
	try {
		//載入基礎設定
		const baseMonsterConfigUrl = `${resourceUrlPrefix}Monster.json`;
		const baseMonsterConfig = await fetch(`${proxyUrl}${baseMonsterConfigUrl}`)
			.then((res) => res.json())
			.then((data) => data["Monster"]);

		//載入技能設定
		const abilityDataConfigUrl = `${resourceUrlPrefix}Ability.json`;
		const abilityDataConfig = {};
		await fetch(`${proxyUrl}${abilityDataConfigUrl}`)
			.then((res) => res.json())
			.then((data) => {
				for (const ability of data["Ability"]) {
					abilityDataConfig[ability.name] = ability;
				}
			});

		//載入AI威脅度設定
		const aiThreatConfigUrl = `${resourceUrlPrefix}AIThreat.json`;
		const aiThreatConfig = {};
		await fetch(`${proxyUrl}${aiThreatConfigUrl}`)
			.then((res) => res.json())
			.then((data) => {
				for (const aiThreat of data["AIThreat"]) {
					(aiThreatConfig[aiThreat.name] ??= {})[aiThreat.condition] = aiThreat.value;
					//if (!aiThreatConfig[aiThreat.name]) aiThreatConfig[aiThreat.name] = {};
					//aiThreatConfig[aiThreat.name][aiThreat.condition] = aiThreat.value;
				}
			});

		//載入技能AI設定
		const skillAIConfigUrl = `${resourceUrlPrefix}AbilityAI.json`;
		const skillAIConfig = await fetch(`${proxyUrl}${skillAIConfigUrl}`)
			.then((res) => res.json())
			.then((data) => data["AbilityAI"]);

		//開始填入資料
		const monsterData = {};
		for (const entry of baseMonsterConfig) {
			const monsterContent = {};
			const entryID = entry["name"];
			const activeSkillNames = {};

			monsterContent["名字"] = getTextByKey(entryID + "NameKey");
			const name2 = getTextByKey(entryID + "SecondNameKey");
			if (name2 && name2 !== monsterContent["名字"]) monsterContent["副名"] = name2;
			monsterContent["完整名"] = monsterContent["名字"]
				? monsterContent["副名"]
					? `${monsterContent["名字"]} - ${monsterContent["副名"]}`
					: monsterContent["名字"]
				: entryID;
			monsterContent["簡介"] = getTextByKey(entryID + "DescriptionKey");
			if (entry["cosmoName"]) monsterContent["簡介_已超越(滿覺)"] = getTextByKey(entry["cosmoName"] + "DescriptionKey");
			monsterContent["稀有度"] = getRarity(entry["evolvedStars"]);
			monsterContent["星數"] = generateStarText(entry["stars"], entry["evolvedStars"]);
			monsterContent["目前星數"] = entry["stars"];
			monsterContent["最大星數"] = entry["evolvedStars"];
			monsterContent["擅長武器"] = getWeaponTypeName(entry["weaponPref"]);
			monsterContent["屬性"] = getElementTypeName(entry["element"]);
			monsterContent["Cost"] = entry["cost"];
			monsterContent["基礎攻擊力"] = entry["baseAttack"];
			monsterContent["基礎生命"] = entry["baseMaxHp"];
			monsterContent["速度"] = entry["speed"];
			monsterContent["戰力"] = calcPowerValEz(
				"Monster",
				entry["baseAttack"],
				entry["baseMaxHp"],
				entry["speed"],
				entry["evolvedStars"]
			);
			monsterContent["圖鑑可見"] = entry["visible"] ? true : false;

			if (entry["freeEvolve"]) {
				monsterContent["自動進化"] = {};
				monsterContent["自動進化"]["進化等級"] = entry["freeEvolveLevel"];
				monsterContent["自動進化"]["進化目標"] = entry["freeEvolve"];
			}

			const gachaIntroText = getTextByKey(entryID + "GachaIntroText");
			if (gachaIntroText) monsterContent["召喚導言"] = gachaIntroText;

			if (entry["leaderBuff"]) {
				monsterContent["隊長技能"] = {};
				const skillID = entry["leaderBuff"];
				monsterContent["隊長技能"]["技能標題"] = getTextByKey(skillID + "NameKey");
				monsterContent["隊長技能"]["技能敘述"] = getTextByKey(skillID + "DescriptionKey");
			}

			if (entry["activeSkills"]) {
				monsterContent["主動技能"] = [];
				for (const skillID of Object.values(entry["activeSkills"])) {
					const skillDetail = {};
					//檢查技能設定中有無指定標題Key
					const skillNameKey = (abilityDataConfig[skillID]["nameKey"] ?? skillID) + "NameKey";
					skillDetail["技能標題"] = getTextByKey(skillNameKey);
					activeSkillNames[skillID] = skillDetail["技能標題"]; //另存供AI區備用

					//檢查技能設定中有無指定敘述Key
					const skillDescriptionKey = (abilityDataConfig[skillID]["descriptionKey"] ?? skillID) + "DescriptionKey";
					skillDetail["技能敘述"] = getTextByKey(skillDescriptionKey);
					//TU
					skillDetail["TU"] = abilityDataConfig[skillID]["tuCost"] ?? 0;
					//靈氣增減0時必帶+號
					skillDetail["靈氣"] = abilityDataConfig[skillID]["spiritGain"]
						? "+" + abilityDataConfig[skillID]["spiritGain"]
						: abilityDataConfig[skillID]["spiritCost"]
						? "-" + abilityDataConfig[skillID]["spiritCost"]
						: "+0";

					monsterContent["主動技能"].push(skillDetail);
				}
			}
			if (entry["passives"]) {
				monsterContent["被動技能"] = [];
				for (const skillID of Object.values(entry["passives"])) {
					const skillDetail = {};
					skillDetail["技能標題"] = getTextByKey(skillID + "NameKey");
					skillDetail["技能敘述"] = getTextByKey(skillID + "DescriptionKey");
					monsterContent["被動技能"].push(skillDetail);
				}
			}

			if (entry["summonableMonsters"]) {
				monsterContent["召喚物"] = [];
				for (const conjures of entry["summonableMonsters"]) {
					monsterContent["召喚物"].push(conjures);
				}
			}

			const dialogGroup = {};
			const dialogList = {
				gachaVoices: ["Gacha", "召喚"],
				loginVoices: ["Login", "主畫面登入"],
				tapVoices: ["Tap", "主畫面點擊"],
				idleVoices: ["Idle", "主畫面閒置"],
			};
			for (const [dialogType, dialogParams] of Object.entries(dialogList)) {
				if (entry[dialogType]) {
					const dialogSet = [];
					for (const dialogNum of entry[dialogType]) {
						dialogSet.push(getTextByKey(entry["family"] + dialogParams[0] + dialogNum + "Key"));
					}
					dialogGroup[dialogParams[1]] = dialogSet;
				}
			}
			if (Object.keys(dialogGroup).length > 0) monsterContent["對話"] = dialogGroup;

			monsterContent["AI邏輯"] = {};
			monsterContent["AI邏輯"]["盯上權重"] = entry["aiTargetPickWeight"];
			if (aiThreatConfig[entryID]) monsterContent["AI邏輯"]["仇恨值(威脅度)"] = aiThreatConfig[entryID];
			monsterContent["AI邏輯"]["技能使用"] = {};
			for (const [fakeIndex, skillID] of Object.entries(entry["activeSkills"])) {
				const skillAISetting = {};
				const skillAIKey = entry["activeSkillsAI"]?.[fakeIndex]
					? entry["activeSkillsAI"][fakeIndex]
					: abilityDataConfig[skillID]["config"] + "_AI";

				if (skillAIConfig[skillAIKey]["baseAITargetingWeight"])
					skillAISetting["基礎權重"] = skillAIConfig[skillAIKey]["baseAITargetingWeight"];
				if (skillAIConfig[skillAIKey]["globalScalorsToIgnore"])
					skillAISetting["忽略"] = skillAIConfig[skillAIKey]["globalScalorsToIgnore"];
				if (skillAIConfig[skillAIKey]["aiTargetingSourceMonsterConditions"])
					skillAISetting["來源"] = skillAIConfig[skillAIKey]["aiTargetingSourceMonsterConditions"];
				if (skillAIConfig[skillAIKey]["aiTargetingMonsterConditions"])
					skillAISetting["目標"] = skillAIConfig[skillAIKey]["aiTargetingMonsterConditions"];

				monsterContent["AI邏輯"]["技能使用"][activeSkillNames[skillID]] = skillAISetting;
			}

			monsterData[entryID] = monsterContent;
		}

		setRelationshipData(monsterData);

		wholeData["Monster"] = monsterData;
		console.timeEnd("Mons");
		document.getElementById("monsterProgress").textContent = "角色資料載入完成";
	} catch (error) {
		document.getElementById("monsterProgress").textContent = "角色資料載入失敗";
		console.error("讀取或解析錯誤:", error);
	}
}

async function setRelationshipData(monsterData) {
	let relationshipData;
	try {
		relationshipData = await generateRelationshipData();
	} catch (e) {
		console.log("未能成功獲取夥伴關係", e);
		const relationshipDataUrl = "https://evertale-playertw.github.io/Config/Relationship.json";
		relationshipData = await fetch(relationshipDataUrl).then((res) => res.json());
	}

	for (const [relationID, relationDetail] of Object.entries(relationshipData)) {
		const relationshipName = getTextByKey(relationDetail["Name"]);
		for (const memberID of relationDetail["Families"]) {
			const clanID = memberID.slice(0, -2);
			for (let i = 1; i <= 3; i++) {
				charID = clanID + String(i).padStart(2, "0");
				if (monsterData[charID]) {
					const relationGroup = {};
					relationGroup["夥伴關係"] = relationshipName;
					relationGroup["夥伴成員"] = relationDetail["Families"];
					relationGroup["夥伴加成"] = relationDetail["Bonus"].replace("ATK", "攻擊力").replace("HP", "生命值");
					monsterData[charID]["夥伴"] ??= {};
					monsterData[charID]["夥伴"][relationID] = relationGroup;
				}
			}
		}
	}
}

async function getRelationshipRaw() {
	const userDevice = "Google Pixel 6";
	const userOs = "Android OS 13 / API-33 (TP1A.221005.002)";
	const evtVersion = "2.0.100";
	const uuid = crypto.randomUUID();

	let uid;
	let clid;
	//從快取讀uid，不然創新帳號獲取
	cache_NewAcc = JSON.parse(localStorage.getItem("NewAcc"));
	if (cache_NewAcc) {
		uid = cache_NewAcc["uid"];
		clid = cache_NewAcc["clid"];
	} else {
		const baseUrl_NewUser = "https://api.prd.evertaleserver.com/newuser";
		const params_NewUser = {
			platform: "android",
			device: userDevice,
			os: userOs,
			adid: "unknown",
			shard: "1",
			req: "newuser",
			lang: "en",
			region: "JST",
			requnique: "1",
		};
		const finalUrl_NewUser = `${proxyUrl}${baseUrl_NewUser}?${new URLSearchParams(params_NewUser).toString()}`;
		const newuserResponse = await fetch(finalUrl_NewUser).then((res) => res.json());
		localStorage.setItem("NewAcc", JSON.stringify(newuserResponse["newuser"]));
		uid = newuserResponse["newuser"]["uid"];
		clid = newuserResponse["newuser"]["clid"];
	}

	//登入以獲取sesid
	const baseUrl_Login = "https://api.prd.evertaleserver.com/login";
	const params_Login = {
		uid: uid,
		clid: clid,
		platform: "android",
		device: userDevice,
		shardpick: "1",
		bundle: "com.zigzagame.evertale",
		ver: evtVersion,
		os: userOs,
		vid: "242f765867a7ee271435177d99fb7749",
		adid: "unknown",
		req: "login",
		lang: "en",
		region: "JST",
		unique: uuid,
		requnique: "1",
	};
	const finalUrl_Login = `${proxyUrl}${baseUrl_Login}?${new URLSearchParams(params_Login).toString()}`;
	const loginResponse = await fetch(finalUrl_Login).then((res) => res.json());
	const sesid = loginResponse["login"]["sesid"];

	//請求獲取Relationship資訊
	const baseUrl_Relationship = "https://api.prd.evertaleserver.com/screenvalues";
	const params_Relationship = {
		screen: "Relationships",
		activeLineup: "1",
		activeEventLineup: "1",
		req: "screenvalues",
		reqid: "1",
		sesid: sesid,
		requnique: "1",
	};
	const finalUrl_Relationship = `${proxyUrl}${baseUrl_Relationship}?${new URLSearchParams(
		params_Relationship
	).toString()}`;
	const relationshipResponse = await fetch(finalUrl_Relationship).then((res) => res.json());

	return relationshipResponse;
}

async function generateRelationshipData() {
	const relationshipRaw = JSON.parse((await getRelationshipRaw())["screenvalues"]["relationships"]);
	const relationshipData = {};

	for (const relationDetail of relationshipRaw) {
		const oneRelationship = {};
		oneRelationship["Name"] = relationDetail["locKey"];
		oneRelationship["Families"] = [];
		for (const aMember of relationDetail["families"]) {
			oneRelationship["Families"].push(aMember["Item1"]);
		}
		if (relationDetail["flatAtk"]) oneRelationship["Bonus"] = `ATK+${relationDetail["flatAtk"]}`;
		if (relationDetail["flatHp"]) oneRelationship["Bonus"] = `HP+${relationDetail["flatHp"]}`;
		if (relationDetail["perAtk"]) oneRelationship["Bonus"] = `ATK+${relationDetail["perAtk"]}%`;
		if (relationDetail["perHp"]) oneRelationship["Bonus"] = `HP+${relationDetail["perHp"]}%`;

		relationshipData[relationDetail["name"]] = oneRelationship;
	}
	return relationshipData;
}

function getRarity(stars) {
	switch (stars) {
		case 6:
			return "SSR";
		case 5:
			return "SR";
		case 4:
			return "R";
		case 3:
		case 2:
		case 1:
		case 0:
			return "N";
		default:
			return "?";
	}
}

function generateStarText(currStar, maxStar) {
	if (maxStar >= currStar) {
		if (maxStar <= 0) {
			return 0;
		} else {
			return "★".repeat(currStar) + "☆".repeat(maxStar - currStar);
		}
	} else {
		return "Stars Error";
	}
}

function calcPowerValEz(type, atk, hp, spd, maxStar) {
	const weight_atk = 30;
	const weight_hp = 6;
	const weight_spd = type !== "Equipment" ? 0 : 180;

	let powVal = weight_atk * atk + weight_hp * hp + weight_spd * spd;
	if (type === "Monster") {
		if (maxStar === 6) powVal *= 2;
		if (maxStar === 5) powVal *= 1.5;
	}
	return powVal;
}

function getWeaponTypeName(weaponTypeKey) {
	if (!weaponTypeKey) return "-";
	if (weaponType[weaponTypeKey]) return weaponType[weaponTypeKey];
	weaponType[weaponTypeKey] = getTextByKey(weaponTypeKey + "NameKey");
	return weaponType[weaponTypeKey];
}

function getElementTypeName(elementTypeKey) {
	if (!elementTypeKey) return "-";
	if (elementType[elementTypeKey]) return elementType[elementTypeKey];
	elementType[elementTypeKey] = getTextByKey(elementTypeKey + "Key");
	return elementType[elementTypeKey];
}
