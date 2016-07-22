function run() {
	var utilityDict = new Typo();
	var affData = utilityDict._readFile(chrome.extension.getURL("tests/dictionaries/fr_FR/fr_FR.aff"), "UTF-8");
	var wordData = utilityDict._readFile(chrome.extension.getURL("tests/dictionaries/fr_FR/fr_FR.dic"), "UTF-8");
	
	var hashDict = new Typo("fr_FR", affData, wordData);
	testDictionary(hashDict);

	var dict = new Typo("fr_FR", null, null, { dictionaryPath : "tests/dictionaries", asyncLoad : true, loadedCallback : function () {
		testDictionary(dict);
	}});
}

function testDictionary(dict) {
	test("Dictionary object attributes are properly set", function () {
		equal(dict.dictionary, "fr_FR");
	});
	
	test("Correct checking of words with affixes", function () {
		equal(dict.check("marchons"), true);
	});
	
	test("KEEPCASE flag is respected", function () {
		equal(dict.check("Bq"), true);
		equal(dict.check("BQ"), false);
		equal(dict.check("pH"), true);
		equal(dict.check("mmHg"), true);
		equal(dict.check("MMHG"), false);
		equal(dict.check("Mmhg"), false);
	});
	
	test("Contractions are recognized", function () {
		equal(dict.check("j'espère"), true);
		equal(dict.check("j'espére"), false);
		equal(dict.check("c'est"), true);
		equal(dict.check("C'est"), true);
	});
	
	test("Continuation classes", function () {
		equal(dict.check("l'impedimentum"), true);
		equal(dict.check("d'impedimentum"), true);
		equal(dict.check("d'impedimenta"), true);
		equal(dict.check("espérés"), true);
		equal(dict.check("espérée"), true);
		equal(dict.check("espérées"), true);
		equal(dict.check("qu'espérés"), true);
		equal(dict.check("qu'espérée"), true);
		equal(dict.check("qu'espérées"), true);
	});
	
	test("NEEDAFFIX is respected", function () {
		// Not flagged with NEEDAFFIX
		equal(dict.check("espressivo"), true);
		
		// Is flagged with NEEDAFFIX, but has an empty affix rule
		equal(dict.check("espérance"), true);
		equal(dict.check("esperluette"), true);
	});
}

addEventListener( "load", run, false );