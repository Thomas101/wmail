/**
 * Before running, ensure that you have done
 * $ npm install typo-js
 */

var Typo = require("typo-js");
var dictionary = new Typo( "en_US" );

var is_spelled_correctly = dictionary.check("mispelled");

console.log( "Is 'mispelled' spelled correctly? " + is_spelled_correctly );

var is_spelled_correctly = dictionary.check("misspelled");

console.log( "Is 'misspelled' spelled correctly? " + is_spelled_correctly );

var array_of_suggestions = dictionary.suggest("mispeling");

console.log( "Spelling suggestions for 'mispeling': " + array_of_suggestions.join( ', ' ) );