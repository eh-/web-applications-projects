"use strict";

function cs142MakeMultiFilter(originalArray){
    function arrayFilterer(filterCriteria, callback){
        if(typeof filterCriteria !== "function"){
            return arrayFilterer.currentArray;
        }
        arrayFilterer.currentArray = arrayFilterer.currentArray.filter(filterCriteria);
        if(typeof callback === "function"){
            callback.call(originalArray, arrayFilterer.currentArray);
        }
        return arrayFilterer;
    }
    arrayFilterer.currentArray = originalArray;
    return arrayFilterer;
}