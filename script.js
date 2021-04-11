const displayMaximum = 300;

window.onload = function () {
	const table = document.querySelector("main table");
	const keyword_input = document.querySelector("input[type=\"text\"]");
	const form = document.getElementsByTagName("form")[0];
	const req_A_input = document.getElementById("req_A");

	// checkbox
	const checkName = document.getElementById("check-name");
	const checkNo = document.getElementById("check-no");
	const checkPerson = document.getElementById("check-person");
	const checkRoom = document.getElementById("check-room");
	const checkAbstract = document.getElementById("check-abstract");

	let data = null;


	// display a line of the table
	const createLine = (line) =>
	{
		let tr = document.createElement("tr");
		table.appendChild(tr);

		let url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${line[0]}/jpn`;
		let methods = ["対面", "オンデマンド", "同時双方向"].filter(it => line[10].indexOf(it) > -1);

		tr.innerHTML += `<td>${line[0]}<br/>${line[1]}<br/><a href="${url}" class="syllabus" target="_blank">シラバス</a></td>`;
		tr.innerHTML += `<td>${line[3]}単位<br/>${line[4]}年次</td>`;
		tr.innerHTML += `<td>${line[5]}<br/>${line[6]}</td>`;
		tr.innerHTML += `<td>${line[7].replace(/,/g, "<br/>")}</td>`;
		tr.innerHTML += `<td>${line[8].replace(/,/g, "<br/>")}</td>`;

		if (methods.length < 1)
			tr.innerHTML += "<td>不詳</td>"
		else
			tr.innerHTML += `<td>${methods.join('<br/>')}<br /></td>`;

		tr.innerHTML += `<td>${line[9]}</td>`;
		tr.innerHTML += `<td>${line[10]}</td>`;
	}


	// update the table
	const updateTable = (options, maximum) =>
	{
		let index = 0;

		for (let line of data) {
			let regex = new RegExp(options.keyword);

			// keyword
			let matchesNo = checkNo.checked ? line[0].indexOf(options.keyword) != 0 : true;
			let matchesName = checkName.checked ? line[1].match(regex) == null : true;
			let matchesRoom = checkRoom.checked ? line[7].match(regex) == null : true;
			let matchesPerson = checkPerson.checked ? line[8].match(regex) == null : true;
			let matchesAbstract = checkAbstract.checked ? line[9].match(regex) == null : true;

			let matchesKeyword = options.keyword != "" && 
				(matchesNo && matchesName && matchesRoom && matchesPerson && matchesAbstract);

			// other options
			let matchesSeason = options.season != "null" && line[5].indexOf(options.season) < 0;
			let matchesModule = options.module_ != "null" && line[5].indexOf(options.module_) < 0;
			let matchesDay = options.day != "null" && line[6].indexOf(options.day) < 0;
			let matchesPeriod = options.period != "null" && line[6].indexOf(options.period) < 0;
			let matchesOnline = options.online != "null" && line[10].indexOf(options.online) < 0;
			let matchesReq_A = options.req_A != "null" && options.req_A != line[12];

			if (matchesKeyword || matchesSeason || matchesModule ||
				matchesDay || matchesPeriod || matchesOnline || matchesReq_A)
				continue;

			createLine(line);
			index++;

			if (index >= maximum)
				return;
		}
	}


	// search
	const search = (e, maximum) =>
	{
		let options = {};

		options.keyword = keyword_input.value;
		options.req_A = req_A_input.options[req_A_input.selectedIndex].value;
		options.season = form.season.value;
		options.module_ = form.module.value;
		options.day = form.day.value;
		options.period = form.period.value;
		options.online = form.online.value;

		table.innerHTML = `<tr><th>科目番号／科目名</th><th>単位／年次</th><th>学期／時期</th>
			<th>教室</th><th>担当</th><th>実施形態</th><th>概要</th><th>備考</th></tr>`;
		
		maximum = maximum || displayMaximum;
		updateTable(options, maximum);
	}

	let submit = document.getElementById("submit");
	submit.onclick = search;

	fetch("kdb.json")
		.then(response => response.json())
		.then(json => { data = json; search(null, 7); });
};
