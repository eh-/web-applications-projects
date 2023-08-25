"use strict";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

class DatePicker{
    constructor(id, dateSelectionCallback){
        this.id = id;
        this.dateSelectionCallback = dateSelectionCallback;
    }

    render(date){
        const thisDiv = document.getElementById(this.id);
        for(const i of thisDiv.children){
            i.remove();
        }
        
        const calandarElement = document.createElement("table");
        document.getElementById(this.id).appendChild(calandarElement);

        const tableHeader = document.createElement("thead");
        tableHeader.appendChild(this.monthYearTitleRow(date));
        tableHeader.appendChild(DatePicker.daysHeaderRow());
        calandarElement.appendChild(tableHeader); 
        calandarElement.appendChild(this.calendarRows(date));
    }

    monthYearTitleRow(date){
        const monthTitleRow = document.createElement("tr");

        const monthHeaderTitle = document.createElement("td");
        monthHeaderTitle.setAttribute("colspan", "5");
        monthHeaderTitle.appendChild(
            document.createTextNode(
                months[date.getMonth()] + " " + date.getFullYear()));

        const prevMonthArrow = document.createElement("td");
        prevMonthArrow.appendChild(document.createTextNode("<"));
        prevMonthArrow.classList.add("clickable");
        prevMonthArrow.addEventListener("click", function(){
            const prevMonthDate = new Date(date);
            prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
            this.render(prevMonthDate);
        }.bind(this));

        const nextMonthArrow = document.createElement("td");
        nextMonthArrow.appendChild(document.createTextNode(">"));
        nextMonthArrow.classList.add("clickable");
        nextMonthArrow.addEventListener("click", function(){
            const nextMonthDate = new Date(date);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            this.render(nextMonthDate);
        }.bind(this));
        
        monthTitleRow.appendChild(monthHeaderTitle);
        monthTitleRow.appendChild(prevMonthArrow);
        monthTitleRow.appendChild(nextMonthArrow);
        return monthTitleRow;
    }

    static daysHeaderRow(){
        const daysRow = document.createElement("tr");
        for(const day of days){
            const currDayElement = document.createElement("th");
            currDayElement.appendChild(
                document.createTextNode(day.substring(0, 2)));
            daysRow.appendChild(currDayElement);
        }
        return daysRow;
    }

    calendarRows(date){
        const tableBody = document.createElement("tbody");

        const month = date.getMonth();
        const year = date.getFullYear();

        const firstDayCurrMonth = new Date(year, month, 1);
        const firstDayNextMonth = new Date(firstDayCurrMonth);
        firstDayNextMonth.setMonth(firstDayNextMonth.getMonth() + 1);

        const currDate = new Date(firstDayCurrMonth);
        while(currDate.getDay() !== 0){
            currDate.setDate(currDate.getDate() - 1);
        }

        while(currDate.getTime() < firstDayNextMonth.getTime()){
            const currRow = document.createElement("tr");
            for(let i = 0; i < 7; i++){
                
                const currElement = document.createElement("td");
                currElement.appendChild(document.createTextNode(currDate.getDate()));
                currRow.appendChild(currElement);
                if(currDate.getMonth() !== month){
                    currElement.classList.add("dimmed");
                }
                else{
                    currElement.classList.add("clickable");
                    currElement.addEventListener("click", function(){
                        const clicked_date = {
                            month: date.getMonth() + 1,
                            year: date.getFullYear(),
                            day: currElement.textContent
                        };
                        this.dateSelectionCallback(this.id, clicked_date);
                    }.bind(this));
                }
                currDate.setDate(currDate.getDate() + 1);
            }
            tableBody.appendChild(currRow);
        }

        return tableBody;
    }
}