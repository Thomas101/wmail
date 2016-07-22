Typo.js is a JavaScript spellchecker that uses Hunspell-style dictionaries.

Usage
=====

To use Typo in a Chrome extension, simply include the typo.js file in your extension's background page, and then initialize the dictionary like so:

```javascript
var dictionary = new Typo("en_US");
```

To use Typo in a standard web application you need to pass a settings object that provides a path to the folder containing the desired dictionary.

```javascript
var dictionary = new Typo("en_US", false, false, { dictionaryPath: "typo/dictionaries" }),
```

If using in node.js, load it like so:

```javascript
var Typo = require("typo-js");
var dictionary = new Typo([...]);
```

To check if a word is spelled correctly, do this:

```javascript
var is_spelled_correctly = dictionary.check("mispelled");
```

To get suggested corrections for a misspelled word, do this:
	
```javascript
var array_of_suggestions = dictionary.suggest("mispeling");

// array_of_suggestions == ["misspelling", "dispelling", "misdealing", "misfiling", "misruling"]
```

Typo.js has full support for the following Hunspell affix flags:

* PFX
* SFX
* REP
* FLAG
* COMPOUNDMIN
* COMPOUNDRULE
* ONLYINCOMPOUND
* KEEPCASE
* NOSUGGEST
* NEEDAFFIX

_Note: The manifest.json file in the root directory of the project is there to simplify testing, as it allows you to load all of the files in the Typo project as a Chrome extension. It doesn't have any purpose if you're using Typo.js in your own project._

Demo
====
There's a live demo of Typo.js at http://www.chrisfinke.com/files/typo-demo/ and a complete Node.js example file at examples/node/index.js.

Licensing
=========

Typo.js is free software, licensed under the Modified BSD License.