"use strict"

//Code protected by Copyright
//Creator: Alexandre de Almeida Daltro
//Contact: contato@alexandredaltro.com.br

const divTable=document.querySelector("div.table"),divButtonAddNewInput=document.querySelector("button#add_input"),buttonSave=document.querySelector("button#button_save"),inputDataToSave=new Object,inputUrlToPost=document.querySelector("input#webhook_link");console.log("Input URL to Post: "+inputUrlToPost);let savedData=new Object,buttonRemoveRow=new Array,tableRowIndex;function setListeners(){divButtonAddNewInput?.addEventListener("click",addNewInput),buttonSave?.addEventListener("click",savesDataAndSendsToTab),console.log('Listeners setted to "AddNewInput" and "SaveData" buttons')}function getsDataFromChromeStorage(){chrome.storage.sync.get(["alldata"],h=>{for(let b in savedData=h.alldata,console.log("rowIndex: "+savedData.rowIndex),console.log("UrlToPost: "+savedData.urlToPost),inputUrlToPost.setAttribute("value",savedData.urlToPost),tableRowIndex=savedData.rowIndex?savedData.rowIndex:0,savedData.rows){let a=savedData.rows[b].key,i=savedData.rows[b].label,j=savedData.rows[b].id,c=savedData.rows[b].type;console.log("Pushin row: "+a);let d="",e="",f="",g="";"text"===c&&(d="selected"),"number"===c&&(e="selected"),"tel"===c&&(f="selected"),"url"===c&&(g="selected");let k=`<div id="row_${a}" data-key="${a}" class="row">
            <div><input id="data_label_${a}" type="text" value="${i}"></div>
            <div><input id="data_id_${a}" type="text" value="${j}"></div>
            <div><select id="data_type_${a}">
            <option value="text" ${d}>Text</option>
            <option value="number" ${e}>Number</option>
            <option value="tel" ${f}>Phone</option>
            <option value="url" ${g}>URL</option>
            </select></div>
            <div><button id="remove_input" value="${a}" class="remove_input_button_${a}">-</button></div>
            </div>`;divTable.insertAdjacentHTML("beforeend",k),buttonRemoveRow[[a]]=document.querySelector(`button.remove_input_button_${a}`),buttonRemoveRow[a].addEventListener("click",removeInputRow.bind(this,buttonRemoveRow[a].value))}}),console.log("Rows from storage Pushed to the DOM")}function queryCurrentTab(){chrome.tabs.query({currentWindow:!0,active:!0},function(a){var b=a[0];chrome.tabs.sendMessage(b.id,{command:"initReading"})})}function savesDataToChromeStorage(a){chrome.storage.sync.set({alldata:a},()=>{console.log("Data Saved to Chrome storage")})}function addNewInput(){tableRowIndex++;let a=`<div id="row_${tableRowIndex}" data-key="${tableRowIndex}" class="row">
    <div><input id="data_label_${tableRowIndex}" type="text"></div>
    <div><input id="data_id_${tableRowIndex}" type="text"></div>
    <div><select id="data_type_${tableRowIndex}">
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="tel">Phone</option>
        <option value="url">URL</option>
      </select></div>
      <div><button id="remove_input" value="${tableRowIndex}" class="remove_input_button_${tableRowIndex}">-</button></div>
        </div>`;divTable.insertAdjacentHTML("beforeend",a),buttonRemoveRow[[tableRowIndex]]=document.querySelector(`button.remove_input_button_${tableRowIndex}`),buttonRemoveRow[tableRowIndex].addEventListener("click",removeInputRow.bind(this,buttonRemoveRow[tableRowIndex].value)),console.log(`New row (${tableRowIndex}) Added`)}function removeInputRow(a){document.querySelector(`#row_${a}`).remove(),console.log("Row "+a+" removed")}function savesDataAndSendsToTab(){console.log("savesDataAndSendsToTab");let a=document.querySelectorAll("div.row"),b=document.querySelector("input#webhook_link"),c;inputDataToSave.rowIndex=tableRowIndex,inputDataToSave.urlToPost=b.value,console.log(inputDataToSave.urlToPost),inputDataToSave.rows={},a.forEach(a=>{c=document.querySelectorAll(`div#${a.id} > div > input, div#${a.id} > div > select`),inputDataToSave.rows[[a.id]]={key:a.dataset.key,label:c[0].value,id:c[1].value,type:c[2].value},console.log(inputDataToSave)}),savesDataToChromeStorage(inputDataToSave)}window.addEventListener("DOMContentLoaded",setListeners),window.addEventListener("DOMContentLoaded",getsDataFromChromeStorage)