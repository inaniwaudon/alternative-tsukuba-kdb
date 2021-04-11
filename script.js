window.onload = function () {
	const table = document.querySelector("main table");
	const keyword_input = document.querySelector("input[type=\"text\"]");
	const form = document.getElementsByTagName("form")[0];
	const req_A_input = document.getElementById("req_A");

	let data = null;
	let timeout = void 0;

	const createLine = (line) => {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		let url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${line[0]}/jpn`;
		let methods = ["対面", "オンデマンド", "同時双方向"].filter(it => line[10].indexOf(it) > -1);

		tr.innerHTML += `<td>${line[0]}<br/>${line[1]}<br/><a href="${url}" class="syllabus" target="_blank">シラバス</a></td>`;
		tr.innerHTML += `<td>${line[3]}単位<br/>${line[4]}年次</td>`;
		tr.innerHTML += `<td>${line[5]}<br/>${line[6]}</td>`;
		tr.innerHTML += `<td>${line[7].replace(/,/g, "<br/>")}</td>`;
		tr.innerHTML += `<td>${line[8].replace(/,/g, "<br/>")}</td>`;

		if (methods.length < 1) {
			tr.innerHTML += "<td>不詳</td>"
		} else {
			tr.innerHTML += `<td>${methods.join('<br />')}<br /></td>`;
		}

		tr.innerHTML += `<td>${line[9]}</td>`;
	}

	const updateTable = (options, index) => {
		index = index || 0;
		let line;

		while (true) {
			line = data[index];

			if (typeof line === 'undefined') {
				clearTimeout(timeout);
				timeout = void 0;
				return;
			}

			if (
				(options.keyword !== "" && !line[1].includes(options.keyword) && line[0] !== options.keyword) ||
				(options.season !== "null" && !line[5].includes(options.season)) ||
				(options.module_ !== "null" && !line[5].includes(options.module_)) ||
				(options.day !== "null" && !line[6].includes(options.day)) ||
				(options.period !== "null" && !line[6].includes(options.period)) ||
				(options.online !== "null" && !line[10].includes(options.online)) ||
				(options.req_A !== "null" && options.req_A !== line[12])) {
				index++;
				continue;
			}

			break;
		}

		createLine(line);

		timeout = setTimeout(() => updateTable(options, index + 1), 10);
	}

	const search = (_) => {

		let options = {};

		options.keyword = keyword_input.value;
		options.req_A = req_A_input.options[req_A_input.selectedIndex].value;
		options.season = form.season.value;
		options.module_ = form.module.value;
		options.day = form.day.value;
		options.period = form.period.value;
		options.online = form.online.value;

		clearTimeout(timeout);
		table.innerHTML = `<tr><th>科目番号<br>科目名</th><th>単位<br>年次</th>
      <th>学期<br>時期</th><th>教室</th><th>担当</th><th>実施形態</th><th>概要</th><th>備考</th></tr>`;

		updateTable(options);
	}

	let submit = document.getElementById("submit");
	submit.onclick = search;

	fetch("kdb.json")
		.then(response => response.json())
		.then(json => { data = json; search(null, 7); })
};
