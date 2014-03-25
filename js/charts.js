var Charts = (function() {
	var $el;
	var auto24url;
	
	function init() {
		$el = $("#auto24graph");

		$el.find('.priceByYear').highcharts({
			chart: {},
			xAxis: {
				title: {
					text: 'auto registreerimise aasta'
				},
				labels: {
					format: '{value}',
					style: {
						fontWeight: 'bold'
					}
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
				color: 'rgba(0,0,0,.5)',
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
					text: 'auto registreerimise aasta'
				},
				labels: {
					format: '{value}',
					style: {
						fontWeight: 'bold'
					}
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
				color: 'rgba(0,0,0,.5)',
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

	function updateSearch(url, car) {
		auto24url = url;
		
		//proper templating
		$el.find("span.car").text(car);
	}
	
	function reset() {
		$el.find('.chart').each(function(){
			var chart = $(this).highcharts();
			chart.setTitle({text:""});
			
			for (var i=0; i < chart.series.length; i++) {
				chart.series[i].setData([]);
			};
		});
	}
	
	return {
		init: init,
		reset: reset,
		updateSearch: updateSearch
	}
})();