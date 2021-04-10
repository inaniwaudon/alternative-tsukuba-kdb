var data;
var table;
var keyword_input;
var form;
var req_A_input;

window.onload = function()
{
	table = document.querySelector("main table");
	keyword_input = document.querySelector("input[type=\"text\"]");
	form = document.getElementsByTagName("form")[0];
	req_A_input = document.getElementById("req_A");

	let submit = document.getElementById("submit");
	submit.onclick = search;

	fetch("kdb.json")
		.then(response => response.json())
		.then(json => { data = json; search(null, 7); })
};


function search(e, no)
{
	no = no == null ? 100 : no;

	let keyword = keyword_input.value;
	let req_A = req_A_input.options[req_A_input.selectedIndex].value;
	let season = form.season.value;
	let module_ = form.module.value;
	let day = form.day.value;
	let period = form.period.value;
	let online = form.online.value;

	let choosen = [];
	
	for (let line of data) {
		if (keyword != "" && line[1].indexOf(keyword) < 0)
			continue;

		let matchesSeason = season != "null" && line[5].indexOf(season) < 0;
		let matchesModule = module_ != "null" && line[5].indexOf(module_) < 0;
		if (matchesSeason || matchesModule)
			continue;

		let matchesDay = day != "null" && line[6].indexOf(day) < 0;
		let matchesPeriod = period != "null" && line[6].indexOf(period) < 0;
		if (matchesDay || matchesPeriod)
			continue;

		if (online != "null" && line[10].indexOf(online) < 0)
			continue;
		console.log(online);

		if (req_A != "null" && req_A != line[12])
			continue;

		choosen.push(line);

		if (choosen.length > no)
			break;
	}

	table.innerHTML = `<tr><th>科目番号<br>科目名</th><th>単位<br>年次</th>
		<th>学期<br>時期</th><th>教室</th><th>担当</th><th>実施形態</th><th>概要</th><th>備考</th></tr>`;

	for (let i = 0; i < Math.min(choosen.length, no); i++) {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		for (let x = 0; x < 11; x++) {
			let td = document.createElement("td");
			let url = "https://kdb.tsukuba.ac.jp/syllabi/2021/" + choosen[i][0] + "/jpn";

			if (x == 9) {
				let td2 = document.createElement("td");
				let existsMethods = false;
				let methods = ["対面", "オンデマンド", "同時双方向"]

				for (let method of methods) {
					if (choosen[i][10].indexOf(method) > -1) {
						if (existsMethods)
							td2.innerHTML += "<br/>";
						td2.innerHTML += method;
						existsMethods = true;
					}
				}
				if (!existsMethods)
					td2.innerHTML = "不詳";

				tr.appendChild(td2);
			}

			if (x == 1 || x == 2 || x == 4 || x == 6)
				continue;			

			else if (x == 0 || x == 5)
				td.innerHTML = choosen[i][x] + "<br/>" + choosen[i][x+1];
			else if (x == 3)
				td.innerHTML = choosen[i][x] + "単位<br/>" + choosen[i][x+1] + "年次";
			else if (x == 7 || x == 8)
				td.innerHTML = choosen[i][x].replace(/,/g, "<br/>");
			else
				td.innerHTML = choosen[i][x];

			if (x == 0)
				td.innerHTML += "<br/><a href=\"" + url + "\" class=\"syllabus\" target=\"_blank\">シラバス</a>";

			tr.appendChild(td);
		}
	}
}