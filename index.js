
"use strict"


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { //Receives listener from web.whataspp
    console.log('Message received from click')
    if (msg.command == 'initReading') {
        alert('Message received from click in the popup')
    }
})

document.addEventListener('click', setListeners)



function setListeners() {
    console.log(`click`)
    setTimeout(() => { //wait to render new elements
        //add event listener
        let topContactTitle = document.querySelector('#main > header > div._24-Ff > div > div > span')
        topContactTitle?.addEventListener('click', getDataFromDOM) //Listen to top contact title, for clicks.

        let dataFromContactButton = document.querySelector('#app > div > span:nth-child(4) > div > ul > div > div > li:nth-child(1)')
        dataFromContactButton?.addEventListener('click', getDataFromDOM) //Listen to Button "data from contact", for clicks.

        let buttonSelectMessages = document.querySelector('button#select_messages')
        buttonSelectMessages?.addEventListener('click', toggleCheckboxes) //Listen to Button "data from contact", for clicks.

        let buttonSendData = document.querySelector('button#send_data')
        buttonSendData?.addEventListener('click', sendData) //Listen to Button "data from contact", for clicks.
        console.log('Listeners setted')
    }, 200)
}

function toggleCheckboxes() {
    console.log('toggleCheckboxes() Executed');
    let isPersonal;
    document.removeEventListener('click', setListeners); //Removes the click Listener to avoid a loop with the setListener() function

    let buttonThreeDotsConteiner = document.querySelectorAll('#main > header > div._1yNrt > div > div')
    let buttonThreeDots = buttonThreeDotsConteiner[buttonThreeDotsConteiner.length - 1].childNodes[0].childNodes[0]; //div three dots (Last Button of the list in the Conteiner, 2 childs down)

    console.log('Step 1: isPersonal: ' + isPersonal);

    /*if (buttonThreeDotsPersonal) { //if personal account (there is the "personal" three dots)
        buttonThreeDots = buttonThreeDotsPersonal;
        isPersonal = true;
        console.log('step 2: 3 dots personal')
    }
    if (buttonThreeDotsBusinnes) { //if business account (there is the "businnes" three dots)
        buttonThreeDots = buttonThreeDotsBusinnes;
        isPersonal = false;
        console.log('step 2: 3 dots business')
    }*/

    console.log('Step 3: isPersonal: ' + isPersonal);
    buttonThreeDots.click(); //click in the one wich exists

    setTimeout(() => { //wait for animation for to render the buttons list
        let buttonSelectMessages;

        //This divs must be declared here, because they only exists in this moment
        let menuThreeDots = document.querySelectorAll('#app > div > span:nth-child(4) > div > ul > div > div');
        menuThreeDots = menuThreeDots[0].childNodes;

        for (let child in menuThreeDots) {
            console.log(menuThreeDots[child].innerText)
            if (menuThreeDots[child].innerText == 'Selecionar mensagens' || menuThreeDots[child].innerText == 'Select Messages') {
                buttonSelectMessages = menuThreeDots[child];
                buttonSelectMessages.click();
                break;
            }
        }

    }, 50);

    buttonThreeDots.click(); //click the three dots again to close
    document.addEventListener('click', setListeners) //resumes the document.click listener
}


//envia dados POST Json, para um webhook do integromat
async function handleWebhookJson(url, jsonBody) {
    try {
        const config = {
            mode: "no-cors",
            method: "POST",
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            body: jsonBody
        };

        const response = await fetch(url, config);
        //const finalRes = await response.json();

        //return response;

    } catch (err) {
        console.log('Requisition Error', err);
    }


}

function sendData() {
    console.log('sendData() Executed');
    let allInputs = document.querySelectorAll('div#div_form_container > input');
    let messages = document.querySelectorAll('#main > div._2gzeB > div > div._33LGR > div._3K4-L > div'); //all messages
    var selectedMessages = new Object();

    for (let i = 0; i < messages.length; i++) { //for Each Message
        //If the message is selected, creates a Obj with the variables
        if (messages[i].childNodes[0].childNodes[0]?.classList.contains('_3vy-1')) { //If the message (message > child > child) contains the class '_3vy-1' (means selected) get the message data to an Obj
            selectedMessages[[i]] = messages[i].innerText.replace(/\n/g, '\\n'); //replaces \n for \\n (For it to work in the Json)
            console.log(selectedMessages.length)
        }
    }

    //////Make Json body data
    let jsonBodyData = '{\n'
    for (let i = 0; i < allInputs.length; i++) { //includes all inputs.values
        jsonBodyData += `"${allInputs[i].id}":"${allInputs[i].value}",\n`
    }

    jsonBodyData += '"messages":"Whatsapp Messages: \\n'
    for (let i in selectedMessages) { // Includes all selected messages
        jsonBodyData += `${selectedMessages[i]}\\n\\n`
    }

    jsonBodyData += '"}'
    //////Finish Json body data

    console.log(jsonBodyData)
    console.log(selectedMessages)

    let webhookLink = allInputs[0].value; //First Input by default.
    console.log('webhook Link: '+webhookLink);
    handleWebhookJson(webhookLink, jsonBodyData)

}

function firstNameLastName(string) {
    console.log('firstNameLastName() Executed');
    let name = new Array();
    let regexFirstName = /(?<=^[\W]+|^)[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+/; //after '(?<= ...)' a non-word+ '^[\W]+' or '|' in beggining '^', then a whole word [A-z...]
    let regexLasttName = /(?<=[\w]\s).*/;
    name[0] = string?.match(regexFirstName);
    name[1] = string?.match(regexLasttName);
    console.log(name)
    return name;
}

function getDataFromDOM() {
    console.log('getDataFromDOM() Executed');
    let clientData = new Object(); //Global Obj where it will be included the data got from the inputs, and the selected text to send via Json

    setTimeout(() => {
        /////////////////Get the data from the DOM
        let divData1 = document.querySelector('h2 > span.l7jjieqr.cw3vfol9.i0jNr.selectable-text.copyable-text'); //data 1 in the right menu (Contact Name or Tel)
        let divData2 = document.querySelector('section > div._2P1rL._1is6W.ZIBLv.RVTrW > div.p357zi0d.ktfrpxia.nu7pwgvd.fhf7t426.f8m0rgwh.gndfcl4n > div > span > span'); //data 2 in the right menu (Contact Name or Tel)
        let divData3 = document.querySelector('#app > div > div > div._3ArsE > div.ldL67._1bLj8 > span > div > span > div > div > section > div > div.gx1rr48f.Wt3HP > div > div > span > span'); //data 3 in the right menu (Tel) (Business)
        let divData4 = document.querySelector('#app > div > div > div._3ArsE > div.ldL67._1bLj8 > span > div > span > div > div > section > div._2P1rL._1is6W.ZIBLv._1zkaQ._3uJPJ > div._25luK > div.IbzNe > div._9q4U3 > span'); //data 4 in the right menu (Name) (Business)
        let messages = document.querySelectorAll('#main > div._2gzeB > div > div._33LGR > div._3K4-L > div'); //all messages

        let regex = new Object();
        regex['tel'] = /^[+][0-9]{2}[ ][0-9]{2,3}[ ][0-9]{4,5}[-][0-9]{4,5}$/;
        regex['email'] = /[A-z-_.0-9]+[@][A-z.-_0-9]+/;
        regex['company'] = /(?<=Site\/Instagram\sda\sempresa:\s).*/;
        regex['photos_quantity'] = /(?<=Quantidade\sde\sfotos\sdesejada\sno\stotal:)[ 0-9]+/
        regex['product_types'] = /(?<=Tipos\sde\sProdutos:).*/


        let tel;
        let clientName;
        let firstName;
        let lastName;

        if (regex['tel'].test(divData1?.innerText)) { //check if the Phone Number is in the divData1
            tel = divData1.innerText;
            clientName = firstNameLastName(divData2?.innerText);

        } else if (regex['tel'].test(divData2?.innerText)) { //or in the divData2
            tel = divData2?.innerText;
            clientName = firstNameLastName(divData1?.innerText)
        } else { // Or in the divData3
            tel = divData3?.innerText;
            clientName = firstNameLastName(divData4?.innerText)
            console.log(divData1?.innerText);
            var isBusinessAccount = true; // is business account, so the conteiner to Insert Adjacent will be different. I`ve put an if some lines below to check that.
            console.log('Is Business Account' + isBusinessAccount)
        }

        ////////////////Defines where to insert the Div with the HTML, depending on the page (Personal, business...)
        let divToAddFormBellow;
        if (!isBusinessAccount) { //If not Business Account, gets a Div to insert adjacent
            divToAddFormBellow = document.querySelector('#app > div > div > div._3ArsE > div.ldL67._1bLj8 > span > div > span > div > div > section > div._2P1rL._1is6W.ZIBLv.RVTrW > div._1Nfyf');
        }
        else { //If IS Business Account, gets another Div to insert adjacent
            divToAddFormBellow = document.querySelector('section > div._2P1rL._1is6W.ZIBLv._2FcG4');
        }
        //------------- 

        //Gets the main data from DOM
        firstName = clientName[0];
        lastName = clientName[1];
        tel = tel.replace(/[\s-\.]/g, '');//Cleans spaces and hifens from the telephone


        //Gets the data in the messages, via regex 
        messages.forEach(msg => { //for Each Message
            for (let i in regex) { //For each var declared in regex['regex']
                if (msg.innerText.match(regex[i])) { //Searches for the regex value match, in the current message
                    clientData[[i]] = msg.innerText.match(regex[i])[0]; //adds the data found to an object
                }
            }
        })

        ////////////////// End Get AllData



        /////Adds the infos to the right side menu.
        /////Gets all data saved in the Chrome Storage, and creates a HTML to insert in te DOM.
        chrome.storage.sync.get(['alldata'], (result) => {
            let savedData = new Object();
            savedData = result.alldata;

            /////////////////Creates the whole InnerHTML to the form
            let innerFormHTML = `<input id="url_to_post" type="hidden" value="${savedData['urlToPost']}"/>`
            innerFormHTML += `<span>First name</span><input id="first_name" type="text" class="extension_form_input" value="${firstName}"/>`
            innerFormHTML += `<span>Last name</span><input id="last_name" type="text" class="extension_form_input" value="${lastName}"/>`
            innerFormHTML += `<span>Cellphone</span><input id="tel" type="text" class="extension_form_input" value="${tel}"/>`
            

            for (let row in savedData.rows) { //Iterates each row in savedData.rows, and Saves the HTML to the var to be inserted

                //make more readable vars
                let rowKey = savedData.rows[row].key;
                let rowLabel = savedData.rows[row].label;
                let rowId = savedData.rows[row].id;
                let rowType = savedData.rows[row].type;
                let rowValue = '';
                if (rowId === 'email') rowValue = clientData['email'];
                console.log(savedData)

                //HTML to be pushed to show the new row
                console.log('para cada row: ' + rowLabel)
                innerFormHTML += `<span>${rowLabel}</span><input id="${rowId}" type="${rowType}" class="extension_form_input" value="${rowValue}"/>`
                console.log(innerFormHTML)
            }
            innerFormHTML += '<button id="select_messages" class="extension_form_button">Select Messages</button>'
            innerFormHTML += '<button id="send_data" class="extension_form_button">Send Data</button>'

            //The whole div conteiner and contents
            let conteinerFormHTML = `<div id="div_form_container" class="_1is6W _2P1rL ZIBLv e8k79tju bcymb0na myel2vfb i4pc7asj">${innerFormHTML}</div>`
            //////////////////

            if (document.querySelector('div#div_form_container')) { //If the Div id=div_form_container already exists, then Reload the innerHTML content
                console.log('Menu já Existe')
                let divFormConteiner = document.querySelector('div#div_form_container');
                divFormConteiner.innerHTML = innerFormHTML;
                console.log('div_form_container Reloaded');

            } else { //if not, insert the whole conteiner HTML adjacent to the divToAddFormBellow
                divToAddFormBellow.insertAdjacentHTML('afterend', conteinerFormHTML);
            }

        });
        //////////////////////

    }, 200)
    setListeners()
    console.log('End of getDataFromDOM')
}
