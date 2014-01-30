var Averages = (function() {
	var _yearAverages = {};
	
	function reset() {
		_yearAverages = {};
	}
	
	function update(results) {
		for(var i=0; i<results.length; i++) {
			var result = results[i];
			var year = result.year;
			
			var yearAvg = _yearAverages[year] = _yearAverages[year] || {
				price: 0, 
				odo: 0,
				count:0,
			};
			
			yearAvg.price += result.price;
			yearAvg.odo += result.odo;
			yearAvg.count++;
		}
	}
	
	function getAverage(field, year, skipIternpolate) {
		var value = 0;
		var avg = _yearAverages[""+year];
		if (avg) {
			value = Math.round(avg[field] / avg.count);
		}
		else if (!skipIternpolate) 
		{
			var prevVal = getAverage(field, year-1, true);
			var nextVal = getAverage(field, year+1, true);
			if (prevVal && nextVal) {
				value = (prevVal+nextVal)/2
			} 
		}
		//todo: interpolate value
		
		return value;
	}
	
	function getAverageCount(year) {
		return _yearAverages[year] ? _yearAverages[year].count : 0;
	}
	
	function getAverages(field) {
		var data = [];
		for(var year in _yearAverages) {
			var point = {
						x: 1*year,
						y: getAverage(field, year),
						count: getAverageCount(year),
					};
			data.push(point);
		}
		return data;
	}
	
	function getLastProductionYear() {
		var maxYear = 0;
		for(var year in _yearAverages) {
			if (1*year > maxYear) {
				maxYear = 1*year;
			}
		}
		return maxYear;
	}
	
	return {
		reset: reset,
		update: update,
		getAverage: getAverage,
		getAverages: getAverages,
		getLastProductionYear: getLastProductionYear,
	}
}());