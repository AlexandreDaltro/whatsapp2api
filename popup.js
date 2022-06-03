"use strict"

//Code protected by Copyright
//Creator: Alexandre de Almeida Daltro
//Contact: contato@alexandredaltro.com.br

const divTable = document.querySelector('div.table'); //It is setted, so that we can add the rows inside it
const divButtonAddNewInput = document.querySelector('button#add_input'); //Green ball button
const buttonSave = document.querySelector('button#button_save');
const inputDataToSave = new Object(); //object in wich all the inputs data will be saved.
const inputUrlToPost = document.querySelector('input#webhook_link')
console.log('Input URL to Post: '+inputUrlToPost)
let savedData = new Object(); //object in wich all the saved data in the Storage will be declared.
let buttonRemoveRow = new Array(); //Array where all Buttons to RemoveRow will be saved

let tableRowIndex; //Unique index of the created and removed rows. So there will be no duplicate.

window.addEventListener('DOMContentLoaded', setListeners); //Waits for the DOM to be completely loaded, and then set the listners
window.addEventListener('DOMContentLoaded', getsDataFromChromeStorage); //Waits for the DOM to be completely loaded, and then gets the data from ChromeStorage


function setListeners() { //set listeners to 
    divButtonAddNewInput?.addEventListener('click', addNewInput) //Listen to Button "add Inputs" for clicks
    buttonSave?.addEventListener('click', savesDataAndSendsToTab) //Listen to Button "Save" for clicks
    console.log('Listeners setted to "AddNewInput" and "SaveData" buttons')

}

function getsDataFromChromeStorage() { //Gets the data saved in the Chrome Storage sync and pulls the data to the DOM
    chrome.storage.sync.get(['alldata'], (result) => {
        savedData = result.alldata;
        console.log('rowIndex: '+savedData['rowIndex'])
        console.log('UrlToPost: '+savedData['urlToPost'])

        inputUrlToPost.setAttribute('value', savedData['urlToPost']);
    
        if (!savedData['rowIndex']) { //Only happens in the first time, when no extra row was ever created.
            tableRowIndex = 0;
        } else {
            tableRowIndex = savedData['rowIndex'];
        }


        for (let row in savedData.rows) { //Iterates each row in savedData.rows, and prints the row into the popup

            //make more readable vars
            let rowKey = savedData.rows[row].key;
            let rowLabel = savedData.rows[row].label;
            let rowId = savedData.rows[row].id;
            let rowType = savedData.rows[row].type;
            console.log('Pushin row: ' + rowKey)

            //checks the option to mark as selected in the select field
            let isText = '';
            let isNumber = '';
            let isTel = '';
            let isURL = '';
            if (rowType === "text") isText = 'selected'
            if (rowType === "number") isNumber = 'selected'
            if (rowType === "tel") isTel = 'selected'
            if (rowType === "url") isURL = 'selected'

            //HTML to be pushed to show the new row
            let newRowHTML = `<div id="row_${rowKey}" data-key="${rowKey}" class="row">
            <div><input id="data_label_${rowKey}" type="text" value="${rowLabel}"></div>
            <div><input id="data_id_${rowKey}" type="text" value="${rowId}"></div>
            <div><select id="data_type_${rowKey}">
            <option value="text" ${isText}>Text</option>
            <option value="number" ${isNumber}>Number</option>
            <option value="tel" ${isTel}>Phone</option>
            <option value="url" ${isURL}>URL</option>
            </select></div>
            <div><button id="remove_input" value="${rowKey}" class="remove_input_button_${rowKey}">-</button></div>
            </div>`;

            divTable.insertAdjacentHTML("beforeend", newRowHTML); //insert the HTML

            buttonRemoveRow[[rowKey]] = document.querySelector(`button.remove_input_button_${rowKey}`); //Gets the current added remove_input_button
            buttonRemoveRow[rowKey].addEventListener("click", removeInputRow.bind(this, buttonRemoveRow[rowKey].value)); //add listener to each button, uses the Bind to garantee to use the current TableRowIndex (by the time the addEventListener was evoked, not when the 'click' happens)
        
        }
    });
    console.log('Rows from storage Pushed to the DOM');
}



function queryCurrentTab() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        var activeTab = tab[0];
        chrome.tabs.sendMessage(activeTab.id, { command: "initReading" })
    })
}

function savesDataToChromeStorage(data) {

    chrome.storage.sync.set({ alldata: data }, () => {
        console.log('Data Saved to Chrome storage');
    })
}


function addNewInput() { //adds a new input below the others
    tableRowIndex++; //Each time a new row of inputs are added, it increments the tableRowIndex to keep each row with a unique number.

    //HTML to insert the new row, with the inputs
    let newRowHTML = `<div id="row_${tableRowIndex}" data-key="${tableRowIndex}" class="row">
    <div><input id="data_label_${tableRowIndex}" type="text"></div>
    <div><input id="data_id_${tableRowIndex}" type="text"></div>
    <div><select id="data_type_${tableRowIndex}">
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="tel">Phone</option>
        <option value="url">URL</option>
      </select></div>
      <div><button id="remove_input" value="${tableRowIndex}" class="remove_input_button_${tableRowIndex}">-</button></div>
        </div>`;

    divTable.insertAdjacentHTML("beforeend", newRowHTML);

    buttonRemoveRow[[tableRowIndex]] = document.querySelector(`button.remove_input_button_${tableRowIndex}`); //Gets the current added remove_input_button
    buttonRemoveRow[tableRowIndex].addEventListener("click", removeInputRow.bind(this, buttonRemoveRow[tableRowIndex].value)); //add listener to each button, uses the Bind to garantee to use the current TableRowIndex (by the time the addEventListener was evoked, not when the 'click' happens)
    console.log(`New row (${tableRowIndex}) Added`);

}

function removeInputRow(index) {
    let currentRow = document.querySelector(`#row_${index}`);
    //const divButtonAddNewInput = document.querySelector('div#add_input');
    currentRow.remove(); //removes the currentRow HTML
    console.log('Row ' + index+ ' removed')
}

function savesDataAndSendsToTab() {
    console.log('savesDataAndSendsToTab');
    let allRows = document.querySelectorAll('div.row');
    let inputUrlToPost = document.querySelector('input#webhook_link');
    let thisRowInputs;
    inputDataToSave['rowIndex'] = tableRowIndex; //This is declared, so that this Index never goes to zero again, it is called back in the beginning of the code (savedData['rowIndex'])
    inputDataToSave['urlToPost'] = inputUrlToPost.value;
    console.log(inputDataToSave['urlToPost'])
    inputDataToSave['rows'] = {} //declares the new Object in the Object
    allRows.forEach((row) => { //For each row, gets the label, value and type
        thisRowInputs = document.querySelectorAll(`div#${row.id} > div > input, div#${row.id} > div > select`);
        inputDataToSave['rows'][[row.id]] = { key: row.dataset.key, label: thisRowInputs[0].value, id: thisRowInputs[1].value, type: thisRowInputs[2].value }
        console.log(inputDataToSave)

    })
    savesDataToChromeStorage(inputDataToSave);

}