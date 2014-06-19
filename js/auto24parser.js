var Auto24Parser = (function() {
	function parseTitle(html) {
		return between(html, "<title>", " - Kasutatud", "Car").replace(" sõiduauto","");
	}
	
	function getRangeInfo(html) {
		var range = between(html, 'tan </span><span class="item">', "</span>", -1).split("&ndash;");

		return {
			start: 	1*range[0],
			end: 	1*range[1],
			total: 	1*between(html, "Kokku <strong>", "</strong>", -1),
		}
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
		
		var start = html.indexOf("<table id=\"usedVehiclesSearchResult");
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
		
		while(true) {
			var start = html.indexOf("<tr class=\"result-row")
			var end = html.indexOf("</tr>", start);
			if (start < 0 || end < 0) {
				break;
			}
			
			var rowHtml = html.substring(start, end+5);
			
			var result = parseTableRow(rowHtml);
			if (result.odo && result.year && result.price) {
				results.push(result);
				console.log("add row:", result);
			} else {
				console.log("Filtered out non filled row:", result);
			}

			html = html.substring(end+5);
		}
		
		return results;
	}
	
	function parseTableRow(html) {
		var $row = $(html);
		
		var name = $row.find("td.make_and_model > a").text();
		var img = $row.find("td.pictures img").attr("src");
		var _odoDiv = $row.find("td.make_and_model > .extra")[0];
		var odo = _odoDiv.childNodes.length && _odoDiv.childNodes[0].data.replace(/km|\s/gi,"");
		var year = $row.find("td.year").text();
		var price = $row.find("td.price").text().replace(/\s/gi,"");
		var url = "http://www.auto24.ee" + $row.find("td.make_and_model > a").attr('href');

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
