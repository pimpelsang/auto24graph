$(function(){
	var states = {
		FORM:"FORM",
		BUSY:"BUSY",
		RESULTS:"RESULTS"
	};
	
	var state;
	
	//main container
	var $el = $("#auto24graph");

	//$el.find("form button").click(analyzeUrl);
	$el.find("form button").click(analyzeModel);
	$el.find("button.restart").click(restart);
	$(window).on('hashchange', init);
	
	Charts.init();
	init();
	
	//browser detection
	if ((window.attachEvent && !window.addEventListener) || !('withCredentials' in new XMLHttpRequest())) {
		$(".browser.alert").removeClass("hidden");
	}
				
	var auto24url;
	
	function init() {
		var make, makeId, model;
		var validSearchUrl = new RegExp("#.+/.+");

		if (validSearchUrl.test(location.hash)) {
			make = unescape(location.hash.substring(1, location.hash.indexOf("/")));
			makeId = $el.find("form select option:contains("+make+")").attr("selected", "selected").val();
			model = unescape(location.hash.substring(location.hash.indexOf("/")+1));
			$el.find("form input.model").val(model);
		}
			
		reset();
		if (makeId && model) {
			//start search
			var url = "http://www.auto24.ee/kasutatud/nimekiri.php?bn=2&b="+makeId+"&c="+model+"&bi=EUR&ab=0&ae=2&af=200&ag=1&otsi=otsi&ak=0";
			
			setProgress(0.1);
			Charts.updateSearch("", make+" "+model);
			
			$("body").trigger("click");
			window.scrollTo(0,0);
			
			loadUrl(url, model);
		} else {
			//reset to form
			setState(states.FORM);
		}

		updateLastSearch();
	}
	
	function restart() {
		location.hash = "";
	}
	
	function reset() {
		Averages.reset();
		Charts.reset();
	}				
	
	/*
	function analyzeUrl(){
		reset();
		var url = $el.find(".form input.url").val();
		loadUrl(url, "");
	}
	*/
	
	function analyzeModel(e){
		reset();
		var $form = (state == states.FORM) ? $el.find("form.static") : $el.find("form.dropdown");
		
		var make = $form.find("select.make option:selected").text();
		var model = $form.find("input.model").val();
		
		if (make && model) {
			addLastSearch(make, model);
			
			//which saves history and also triggers init()
			location.hash = "#"+make+"/"+model;
		}
		
		return false;
	}
	
	function setState(value) {
		state = value;
		$el.attr("class", value);
	}
	
	
	
	function updateLastSearch() {
		var $lastDiv = $el.find(".lastSearched ul").hide();
		$lastDiv.find("li").remove();
		
		var list = getCookie("last").split("&");
		list.forEach(function(item) {
			if (item) {
				$lastDiv.show().append("<li><a href='#"+item+"'>"+item.replace("/"," ")+"</a></li>");
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

		// var x = new XMLHttpRequest();
		// x.open('GET', "http://cors-anywhere.herokuapp.com/" + url);
		// x.onload = function() {
		// 	onResultHtmlLoaded(x.responseText, url, model);
		// }
		// x.send();
		
		$.get( "/auto/", {
			search: url.replace('http://www.auto24.ee/kasutatud/nimekiri.php?', '')
		}, function(response) {
			onResultHtmlLoaded(response, url, model);
		});
	}
	
	function onResultHtmlLoaded(html, url, model) {
		console.log("got html..");
		
		var results = Auto24Parser.getResults(html);
		if (!results) return restart();

		var car = Auto24Parser.getResultTitle(html)+" "+model;
		
		Averages.update(results);

		Wizard.setResults(results, car);

		//update charts
		Charts.updateSearch(auto24url, car);

		var priceChart = $('.priceByYear').highcharts();
		displayResults(priceChart, results, "price");

		var odoChart = $('.odoByYear').highcharts();
		displayResults(odoChart, results, "odo");
		
		//handle paging
		handlePaging(html, url, model);
	}
	
	function handlePaging(html, url, model) {
		var rangeInfo = Auto24Parser.getRangeInfo(html);
		if (rangeInfo.end < rangeInfo.total) {
			url += "&ak="+rangeInfo.end;
			loadUrl(url, model);
			
			setProgress(rangeInfo.end / rangeInfo.total);
		} else {
			setProgress(1);
			setTimeout(function() {
				setState(states.RESULTS)
				setProgress(0);
			}, 600);
		}
	}
	
	function setProgress(ratio) {
		$(".progress-bar").css("width", Math.round(ratio*100)+"%");
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
})
