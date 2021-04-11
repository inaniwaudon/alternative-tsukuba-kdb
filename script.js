window.onload = function () {
	const table = document.querySelector("main table tbody");
	const keyword_input = document.querySelector("input[type=\"text\"]");
	const form = document.getElementsByTagName("form")[0];
	const req_A_input = document.getElementById("req_A");
	const clearButton = document.getElementById("clear");
	const downloadLink = document.getElementById("download");

	// checkbox
	const checkName = document.getElementById("check-name");
	const checkNo = document.getElementById("check-no");
	const checkPerson = document.getElementById("check-person");
	const checkRoom = document.getElementById("check-room");
	const checkAbstract = document.getElementById("check-abstract");

	// if the device is iOS, displayed lines are limited 500.
	const isIOS = ["iPhone", "iPad", "iPod"].some(name => navigator.userAgent.indexOf(name) > -1);
	const lineLimit = 500;

	let data = null;
	let timeout = void 0;

	clearButton.addEventListener('click', (evt) => {
		evt.stopPropagation();
		keyword_input.value = "";
		req_A_input.selectedIndex = 0;
		form.season.value = "null";
		form.module.value = "null";
		form.day.value = "null";
		form.period.value = "null";
		form.online.value = "null";

		checkName.checked = true;
		checkNo.checked = true;
		checkPerson.checked = false;
		checkRoom.checked = false;
		checkAbstract.checked = false;
	});

	// display a line of the table
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

		if (methods.length < 1)
			tr.innerHTML += "<td>不詳</td>"
		else
			tr.innerHTML += `<td>${methods.join('<br/>')}<br /></td>`;

		tr.innerHTML += `<td>${line[9]}</td>`;
		tr.innerHTML += `<td>${line[10]}</td>`;
	}


	// update the table
	const updateTable = (options, index, displayedIndex) => {
		let regex = new RegExp(options.keyword);

		index = typeof index === 'undefined' ? 0 : index;
		displayedIndex = typeof displayedIndex === "undefined" ? 0 : displayedIndex;
		
		if (isIOS && displayedIndex >= lineLimit)
			return;

		for (; ;) {
			const line = data[index];

			if (typeof line === 'undefined') {
				return;
			}

			// keyword
			let matchesNo = checkNo.checked ? line[0].indexOf(options.keyword) != 0 : true;
			let matchesName = checkName.checked ? line[1].match(regex) == null : true;
			let matchesRoom = checkRoom.checked ? line[7].match(regex) == null : true;
			let matchesPerson = checkPerson.checked ? line[8].match(regex) == null : true;
			let matchesAbstract = checkAbstract.checked ? line[9].match(regex) == null : true;

			let matchesKeyword = options.keyword != "" &&
				(matchesNo && matchesName && matchesRoom && matchesPerson && matchesAbstract);

			// other options
			let missMatchesSeason = options.season != "null" && line[5].indexOf(options.season) < 0;
			let missMatchesModule = options.module_ != "null" && line[5].indexOf(options.module_) < 0;
			let missMatchesDay = options.day != "null" && line[6].indexOf(options.day) < 0;
			let missMatchesPeriod = options.period != "null" && line[6].indexOf(options.period) < 0;
			let missMatchesOnline = options.online != "null" && line[10].indexOf(options.online) < 0;
			let missMatchesReq_A = options.req_A != "null" && options.req_A != line[12];

			if (
				matchesKeyword ||
				missMatchesSeason ||
				missMatchesModule ||
				missMatchesDay ||
				missMatchesPeriod ||
				missMatchesOnline ||
				missMatchesReq_A) {
				index++;
				continue;
			}

			createLine(line);
			timeout = setTimeout(() => updateTable(options, index + 1, ++displayedIndex), 0);
			break;
		}
	}

	// convert table data to CSV file with utf-8 BOM
	const makeCSV = (a, table_, filename) => {
		var escaped = /,|\r?\n|\r|"/;
		var e = /"/g;

		var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
		var csv = [], row = [], field, r, c;
		for (r=0;  r<table_.rows.length; r++) {
			row.length = 0;
			for (c=0; c<table_.rows[r].cells.length; c++) {
				field = table_.rows[r].cells[c].textContent;
				if (r !== 0 && c == 0) {
					field = field.slice(0,-4);
				}
				row.push(escaped.test(field)? '"'+field.replace(e, '""')+'"': field);
		 	}
			csv.push(row.join(','));
		}
		var blob = new Blob([bom, csv.join('\n')], {'type': 'text/csv'});
	  
		if (window.navigator.msSaveBlob) {
			// IE
			window.navigator.msSaveBlob(blob, filename); 
		} else {
			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
		}
	}

	// download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
	const downloadCSV = () => {
		makeCSV(
			downloadLink, document.querySelector("main table"), `kdb_${getDateString()}.csv`);
	}

	// get YYYYMMDDhhmmdd
	const getDateString = () => {
		let date = new Date();
		let Y = date.getFullYear();
		let M = ("00" + (date.getMonth()+1)).slice(-2);
		let D = ("00" + date.getDate()).slice(-2);
		let h = ('0' + date.getHours()).slice(-2);
		let m = ('0' + date.getMinutes()).slice(-2);
		let d = ('0' + date.getSeconds()).slice(-2);

		return Y + M + D + h + m + d;
	  }
	
	// search
	const search = (e) => {
		while (table.firstChild) {
	        	table.removeChild(table.firstChild);
		}
		if (e !== null) {
			e.stopPropagation();
		}
		let options = {};

		options.keyword = keyword_input.value;
		options.req_A = req_A_input.options[req_A_input.selectedIndex].value;
		options.season = form.season.value;
		options.module_ = form.module.value;
		options.day = form.day.value;
		options.period = form.period.value;
		options.online = form.online.value;

		clearTimeout(timeout);

		updateTable(options);
	}

	let submit = document.getElementById("submit");
	submit.onclick = search;
	downloadLink.onclick = downloadCSV;

	fetch("kdb.json")
		.then(response => response.json())
		.then(json => { data = json; search(null); });
};
