"use strict";

function Cs142TemplateProcessor(template){
    this.template = template;
}

Cs142TemplateProcessor.prototype.fillIn = function(dict){
    let res = this.template;
    for(const i of Object.keys(dict)){
        res = res.replaceAll("{{" + i + "}}", dict[i]);
    }
    res = res.replace(/{{.*}}/g, "");
    return res;
};