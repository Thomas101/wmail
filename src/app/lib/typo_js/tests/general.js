function run() {
	var empty_dict = new Typo();
	
	test("Dictionary instantiated without arguments is essentially empty.", function () {
		deepEqual(empty_dict.rules, {});
		deepEqual(empty_dict.dictionaryTable, {});
		deepEqual(empty_dict.dictionary, null);
	});
	
	test("Comments are removed from affix files", function () {
		equal(empty_dict._removeAffixComments("# abc\ndef # ghi\n # jkl\nmnop qrst\n##"), "def\nmnop qrst", "Comment lines are removed.");
		equal(empty_dict._removeAffixComments(""), "", "Handles empty input.");
		equal(empty_dict._removeAffixComments("abc"), "abc", "Handles input that doesn't need changing.");
		equal(empty_dict._removeAffixComments(" abc"), "abc", "Leading whitespace is removed.");
		equal(empty_dict._removeAffixComments(" abc "), "abc", "Leading and trailing whitespace is removed.");
		equal(empty_dict._removeAffixComments("\n\n\abc\n"), "abc", "Leading and trailing newlines are removed.");
		equal(empty_dict._removeAffixComments("\n\n"), "", "Consecutive newlines are removed.");
		equal(empty_dict._removeAffixComments("\t"), "", "Tabs are treated as whitespace.");
		equal(empty_dict._removeAffixComments("\n\t \t\n\n"), "", "All whitespace is treated the same.");
	});
	
	test("_readFile can load a file synchronously", function() {
		var data = empty_dict._readFile(chrome.extension.getURL("../typo/dictionaries/en_US/en_US.dic"));
		ok(data && data.length > 0);
	});
	
	asyncTest("_readFile can load a file asynchronously", function(assert) {
		empty_dict._readFile(chrome.extension.getURL("../typo/dictionaries/en_US/en_US.dic"), null, true).then(function(data) {
			assert.ok(data && data.length > 0);
			QUnit.start();
		}, function(err) {
			QUnit.pushFailure(err);
			QUnit.start();
		});
	});
	
	function checkLoadedDict(dict) {
		ok(dict);
		ok(dict.compoundRules.length > 0);
		ok(dict.replacementTable.length > 0);
	}
	
	test("Dictionary instantiated with preloaded data is setup correctly", function() {
		var affData = empty_dict._readFile(chrome.extension.getURL("../typo/dictionaries/en_US/en_US.aff"));
		var wordData = empty_dict._readFile(chrome.extension.getURL("../typo/dictionaries/en_US/en_US.dic"));
		var dict = new Typo("en_US", affData, wordData);
		checkLoadedDict(dict);
	});
	
	test("Synchronous load of dictionary data", function() {
		var dict = new Typo("en_US");
		checkLoadedDict(dict);
	});
	
	asyncTest("Asynchronous load of dictionary data", function() {
		var dict = new Typo("en_US", null, null, { asyncLoad: true, loadedCallback: function() {
			checkLoadedDict(dict);
			QUnit.start();
		}});
	});
	
	test("Public API throws exception if called before dictionary is loaded", function() {
		var expected = function(err) {
			return err === "Dictionary not loaded.";
		};
		
		throws(empty_dict.check, expected);
		throws(empty_dict.checkExact, expected);
		throws(empty_dict.hasFlag, expected);
		throws(empty_dict.check, expected);
	});
}

addEventListener( "load", run, false );