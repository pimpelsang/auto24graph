$(function(){
	var states = {
		FORM:"FORM",
		BUSY:"BUSY",
		RESULTS:"RESULTS"
	};
	
	//main container
	var $el = $("#auto24graph");

	$el.find("button.startUrl").click(analyzeUrl);
	$el.find("button.startModel").click(analyzeModel);
	$el.find("button.restart").click(restart);
	$(window).on('hashchange', initApp);
	
	initCharts();
	initApp();
				
	var auto24url;
	
	function initApp() {
		var make, makeId, model;
		
		if (location.hash) {
			make = location.hash.substring(1, location.hash.indexOf("/"));
			makeId = $el.find(".form select option:contains("+make+")").val();
			model = location.hash.substring(location.hash.indexOf("/")+1);
		}
			
		reset();
		if (makeId && model) {
			//start search
			var url = "http://www.auto24.ee/kasutatud/nimekiri.php?bn=2&b="+makeId+"&c="+model+"&bi=EUR&ab=0&ae=2&af=200&ag=1&otsi=otsi&ak=0";
			loadUrl(url, model);
		} else {
			//reset to form
			setState(states.FORM);
			updateLastSearch();
		}
	}
	
	function restart() {
		location.hash = "";
	}
	
	function reset() {
		Averages.reset();
		
		$el.find('.chart').each(function(){
			var chart = $(this).highcharts();
			chart.setTitle({text:""});
			
			for (var i=0; i < chart.series.length; i++) {
				chart.series[i].setData([]);
			};
		});
	}				
	
	function analyzeUrl(){
		reset();
		var url = $el.find(".form input.url").val();
		loadUrl(url, "");
	}
	
	function analyzeModel(){
		reset();

		var make = $el.find(".form select option:selected").text();
		var model = $el.find(".form input.model").val();
		
		addLastSearch(make, model);
		
		//forses initApp call
		location.hash = "#"+make+"/"+model;
	}
	
	function setState(state) {
		$el.attr("class", state);
	}
	
	function updateLastSearch() {
		var $last = $el.find(".lastSearched").hide();
		$last.find("a").remove();
		
		var list = getCookie("last").split("&");
		list.forEach(function(item) {
			if (item) {
				$last.show().append("<a href='#"+item+"'>"+item.replace("/"," ")+"</a>");
			}
		});
	}
	
	function addLastSearch(make,  model) {
		//not used already
		var list = getCookie("last");
		
		if (list.indexOf(make+"/"+model) > -1) return;
		
		if(list.split("&").length >= 5) {
			list = list.substring(0, list.lastIndexOf("&"));
		}
		setCookie("last", make+"/"+model+"&"+list);
	}
	
	function setCookie(key, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
		document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
	}

	function getCookie(key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
		return keyValue ? keyValue[2] : "";
	}
	
	function loadUrl(url, model) {
		console.log("Loading auto24 url", url);
		if (url.indexOf("www.auto24.ee/kasutatud/nimekiri.php") == -1) {
			return alert( "url isn't www.auto24.ee/kasutatud/nimekiri.php...");
		}
		
		auto24url = url;
		
		setState(states.BUSY);
		
		//console.log("http://whateverorigin.org:"+url);
		//$.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=?', function(data){
		//	onResultHtmlLoaded(data.contents, url, model);
		//});
		//console.log('http://anyorigin.com/get/?url=' + escape(url) + '&callback=?');
		//$.getJSON('http://anyorigin.com/get/?url=' + escape(url) + '&callback=?', function(data){
		//	onResultHtmlLoaded(data.contents, url, model);
		//});
		
		var x = new XMLHttpRequest();
		x.open('GET', "http://cors-anywhere.herokuapp.com/" + url);
		x.onload = function() {
			onResultHtmlLoaded(x.responseText, url, model);
		}
		x.send();
	}
	
	function onResultHtmlLoaded(html, url, model) {
		console.log("got html..");
		
		var results = Auto24Parser.getResults(html);
		if (!results) return restart();

		var car = Auto24Parser.getResultTitle(html)+" "+model;
		
		Averages.update(results);

		Wizard.setResults(results, car);
		
		//update charts
		var priceChart = $('.priceByYear').highcharts();
		displayResults(priceChart, results, "price");
		priceChart.setTitle({text: "Kasutatud "+car+ " hind auto registreerimise aasta kohta"});

		var odoChart = $('.odoByYear').highcharts();
		displayResults(odoChart, results, "odo");
		odoChart.setTitle({text: "Kasutatud "+car+ " läbisõit auto registreerimise aasta kohta"});
		
		//handle paging
		handlePaging(html, url, model);
	}
	
	function handlePaging(html, url, model) {
		var rangeInfo = Auto24Parser.getRangeInfo(html);
		if (rangeInfo.end < rangeInfo.total) {
			url += "&ak="+rangeInfo.end;
			loadUrl(url, model);
		} else {
			setState(states.RESULTS);
		}
	}
	

	function displayResults(chart, results, field) {
		console.log("displaying results ", results.length);
		
		//points graph
		var series = chart.series[0];
		for(var i=0; i < results.length; i++) {
			var result = results[i];
			var point = {
				x: result.year,
				y: result[field],
				result: result
			};
			series.addPoint(point, false);
		}
		
		//averages graph
		var avgSeries = chart.series[1];
		avgSeries.setData(Averages.getAverages(field));
		
		chart.redraw()
	}
	
	function initCharts() {
		$el.find('.priceByYear').highcharts({
			chart: {},
			xAxis: {
				title: {
					text: 'auto registreerimise aasta'
				},
				labels: {
					format: '{value}'
				},
				tickInterval: 1,
				reversed: true,
			},
			yAxis: {
				min: 0,
				title: {
					text: 'hind'
				},
				labels: {
					format: '{value:,.0f} €'
				}
			},
			title: {
				text: ''
			},
			series: [{
				type: 'scatter',
				name: 'hind',
				data: [],
				marker: {
					radius: 4
				}
			},{
				type: 'line',
				name: 'Keskmine hind',
				marker: {
					radius: 10
				},
				data: [],
			}],
			tooltip: {
				useHTML: true,
				hideDelay: 1500,
				formatter: function() {
					if (this.point.result) {
						return resultTooltip(this.point.result);
					} else {
						return 'Aasta ' + this.point.x + ' autode(' + this.point.count + 'tk)<br /> keskmine hind: <b>' + Highcharts.numberFormat(this.point.y,0,0," ") + '€</b>';
					}
				}
			},
			//prevent tooltip moving with mouse
			plotOptions: { 
				scatter:{ tooltip:{ followPointer: false }},
				series:{ cursor: 'pointer', point: { events: {click: resultClick}}}
			}
		});
		
		$el.find('.odoByYear').highcharts({
			chart: {},
			xAxis: {
				title: {
					text: 'aasta'
				},
				labels: {
					format: '{value}'
				},
				tickInterval: 1,
				reversed: true,
			},
			yAxis: {
				min: 0,
				title: {
					text: 'läbisõit'
				},
				labels: {
					format: '{value:,.0f} km'
				}
			},
			title: {
				text: ''
			},
			series: [{
				type: 'scatter',
				name: 'odometer',
				data: [],
				marker: {
					radius: 4
				}
			},{
				type: 'line',
				name: 'Keskmine läbisõit',
				marker: {
					radius: 10
				},
				data: [],
			}],
			tooltip: {
				useHTML: true,
				hideDelay: 1500,
				formatter: function() {
					if (this.point.result) {
						return resultTooltip(this.point.result);
					} else {
						return 'Aasta ' + this.point.x + ' autode(' + this.point.count + 'tk)<br /> keskmine läbisõit: <b>' + Highcharts.numberFormat(this.point.y,0,0," ") + 'km</b>';
					}
				}
			},
			//prevent tooltip moving with mouse
			plotOptions: { 
				scatter:{ tooltip:{ followPointer: false }},
				series:{ cursor: 'pointer', point: { events: {click: resultClick}}}
			}
		});
		
		function resultClick() {
			if (this.result) { 
				//point
				window.open(this.result.url, "_blank");
			} else {
				//average
				var url = auto24url + "&f1=" + this.x + "&f2=" + this.x + "&ak=0";
				window.open(url, "_blank");
			}
		};
		
		//console.log(r.odo+", "+r.year+", "+r.price+", "+r.name);
		function resultTooltip(result) {
			var tooltip = '<b><a href="' + result.url + '" target="_blank" style="max-width: 200px;">'+result.name+"</a></b><br />" +
			(result.img ? '<img src="' + result.img + '" style="width:74px;height:56px;border:1px solid"/><br />': "") +
			'Läbisõit: ' + Highcharts.numberFormat(result.odo,0,0," ") + 'km<br />' +
			'Aasta: ' + result.year + '<br />' +
			'Hind: ' + Highcharts.numberFormat(result.price,0,0," ") + '€<br />';
			
			return tooltip;
		}
	}
})
