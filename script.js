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
    tr.innerHTML += `<td>${line[9]}</td>`;

    if (methods.length < 1) {
      tr.innerHTML += "<td>不詳</td>"
    } else {
      tr.innerHTML += `<td>${methods.join('<br />')}<br /></td>`;
    }
  }

  const updateTable = (options, data, index, continuous) => {
    index = index || 0;
    const line = data[index];
    let matchesSeason = options.season != "null" && line[5].indexOf(season) < 0;
    let matchesModule = options.module_ != "null" && line[5].indexOf(module_) < 0;
    let matchesDay = options.day != "null" && line[6].indexOf(day) < 0;
    let matchesPeriod = options.period != "null" && line[6].indexOf(period) < 0;

    if (typeof line === 'undefined') {
      clearTimeout(timeout);
      timeout = void 0;
    }

    if (!continuous && typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }


    if (
      (options.keyword != "" && line[1].indexOf(options.keyword) < 0) ||
      matchesSeason ||
      matchesModule ||
      matchesDay ||
      matchesPeriod ||
      (options.online != "null" && line[10].indexOf(options.online) < 0) ||
      (options.req_A != "null" && options.req_A != line[12])) {
      timeout = setTimeout(updateTable(index + 1, true), 0);
      return;
    }

    createLine(line);

    timeout = setTimeout(updateTable(index + 1, true), 0);
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

    table.innerHTML = `<tr><th>科目番号<br>科目名</th><th>単位<br>年次</th>
      <th>学期<br>時期</th><th>教室</th><th>担当</th><th>実施形態</th><th>概要</th><th>備考</th></tr>`;

    updateTable(options, data);
  }

  let submit = document.getElementById("submit");
  submit.onclick = search;

  fetch("kdb.json")
    .then(response => response.json())
    .then(json => { data = json; search(null, 7); })
};
