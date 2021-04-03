var Auto24Parser = (function() {
	function parseTitle(html) {
		return between(html, "<title>", " - Kasutatud", "Car").replace(" sõiduauto","");
	}
	
	function getRangeInfo(html) {
		debugger;
		var total = 1*between(html, "Kokku: <strong>", "</strong>", -1);
		var endStr = between(html, 'class="current-range">', "</div>", -1);
		var end = 200*endStr.match("\(([0-9]+)/.*\)")[2]

		return { end, total }
	}
	
	//helper
	function between(html, startKey, endKey, def) {
		var start = html.indexOf(startKey);
		var end = html.indexOf(endKey, start + startKey.length);
		
		return (start < 0 || end < 0) ? def : html.substring(start + startKey.length, end);
	}

	function parse(html) {
		console.log("Auto24Parser.parse()");
		
		if (!html) {
			alert("auto24.ee lehelt andmete laadimine ebaõnnestus!");
			return;
		}
		
		var start = html.indexOf("<div id=\"usedVehiclesSearchResult-flex");
		var end = html.indexOf("<div class=\"paginator", start);
		if (start < 0 || end < 0) {
			alert("auto24.ee lehelt tulemusi ei leitud");
			return;
		}
		
		var tableHtml = html.substring(start, end);
		
		//parse rows
		return parseTableHtml(tableHtml);
	}
	
	function parseTableHtml(html) {
		var results = [];
		
		var $rows = $(html).find("div.result-row");
		$rows.each((i, row) => {
			var result = parseTableRow($(row));

			if (result.year && result.price) {
				results.push(result);
				console.log("add row:", result);
			} else {
				console.log("Filtered out non filled row:", result);
			}
		});
		
		return results;
	}
	
	function parseTableRow($row) {
		var name = $row.find(".title > a").text();
		var img = $row.find(".thumb").css("background-image").replace(/^url\(['"](.+)['"]\)/, '$1');
		var odo = $row.find(".mileage").text().replace(/km|\s/gi,"");
		var year = $row.find(".year").first().text();
		var price = $row.find(".price").first().text().replace(/\s/gi,"");
		var url = "https://www.auto24.ee" + $row.find(".title > a").attr('href');

		return {
			odo: 	parseInt(odo) || 0,
			year: 	parseInt(year) || 0,
			price: 	parseInt(price) || 0,
			name: 	name,
			url: url,
			img: img,
		}
	}

	return { 
		getResults:	parse,
		getResultTitle: parseTitle,
		getRangeInfo: getRangeInfo,
	}
})();
