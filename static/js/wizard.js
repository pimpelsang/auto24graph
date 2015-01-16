var Wizard = (function() {
	var car;
	var results;
	var currentYear = new Date().getFullYear();

	$(function init(){
		$(".wizard input").on('input', updateWizard);
	})
	
	function updateWizard() {
		var producedYear  = 1*$(".wizard input.regYears").val();
		var keepYears = 1*$(".wizard input.useYears").val()
		var sellRelativeYear = producedYear - keepYears; //this is relative - sell price today by the future car age
		
		var buyPrice = Averages.getAverage("price", producedYear);
		var sellPrice = Averages.getAverage("price", sellRelativeYear);
		var keptPercentage = sellPrice && buyPrice ? Math.round(sellPrice/buyPrice*100) : 0;
		var sellYear = currentYear + keepYears;
		var devalueMonth = Math.round((buyPrice - sellPrice) / (keepYears*12));
		
		var buyPriceRounded = Math.round(buyPrice/100)*100;
		var sellPriceRounded = Math.round(sellPrice/100)*100;
		
		$(".wizard > .car").text(car);
		$(".wizard > .buyPrice").text(buyPriceRounded || "?");
		$(".wizard > .keepYears").text(keepYears);
		$(".wizard > .sellPrice").text(sellPriceRounded  || "?");
		$(".wizard > .keptPercentage").text(keptPercentage || "?");
		$(".wizard > .devalueMonth").text(devalueMonth || "?");
	}
	
	function updateResults(_results, _car) {
		results = _results;
		car = _car;
		
		var year = currentYear - 3;
		var latestYear = Averages.getLastProductionYear();
		if (year > latestYear) {
			year = latestYear;
		}
		$(".wizard input.regYears").val(year);
		
		updateWizard();
	}
	
	return {
		setResults: updateResults,
		update: updateWizard,
	}
})();