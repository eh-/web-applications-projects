"use strict";

/*
- fillIn static method: id for table, dictionary object, columnName string
  - header row, replace any with {{property}}
  - column name replace all values in that column if column exists 

*/

class TableTemplate{
    static fillIn(id, dict, columnName){
        let table = document.getElementById(id);
        table.style.visibility = "visible";
        table = table.firstChild.nextSibling;
        if(table === null) return;
        const colsFill = [];
        if(columnName === undefined){
            for(let i = 0; i < table.rows[0].cells.length; i++){
                colsFill.push(i);
            }
        }
        for(let i = 0; i < table.rows[0].cells.length; i++){
            const currCell = table.rows[0].cells[i];
            const currTemplate = new window.Cs142TemplateProcessor(currCell.textContent);
            const filledInText = currTemplate.fillIn(dict);
            if(filledInText === columnName){
                colsFill.push(i);
            }
            currCell.textContent = filledInText;
        }
        for(let i = 1; i < table.rows.length; i++){
            for(const j of colsFill){
                const currCell = table.rows[i].cells[j];
                const currTemplate = new window.Cs142TemplateProcessor(currCell.textContent);
                const filledInText = currTemplate.fillIn(dict);
                currCell.textContent = filledInText;
            }
        }
    }
}