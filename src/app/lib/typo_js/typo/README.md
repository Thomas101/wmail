Typo.js is a JavaScript spellchecker that uses Hunspell-style dictionaries.

Usage
=====

To use Typo, simply load it like so:

```javascript
var Typo = require("typo-js");
var dictionary = new Typo(lang_code);
```

Typo includes by default a dictionary for the `en_US` lang_code.

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

Licensing
=========

Typo.js is free software, licensed under the Modified BSD License.