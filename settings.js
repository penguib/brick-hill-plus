let mainDiv = document.getElementsByClassName("main-holder grid")[0]
let column = document.createElement("div")
column.className = "col-10-12 push-1-12"
mainDiv.appendChild(column)

let card = document.createElement("div")
card.className = "card"

card.innerHTML = `<div class="blue top">Brick Hill+ Settings</div>
                <div class="content">
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Forums Signature</span>
                    <textarea name="signature" class="width-100 block" style="height: 80px; margin-bottom: 6px;"></textarea>
                    <button class="button small blue">Save</button>
                </div>`
column.appendChild(card)