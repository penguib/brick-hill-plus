let settingsMainDiv = document.getElementsByClassName("main-holder grid")[0]

let bhplusSettingsColumn = document.createElement("div")
bhplusSettingsColumn.className = "col-10-12 push-1-12"
settingsMainDiv.appendChild(bhplusSettingsColumn)

let bhplusSettingsCard = document.createElement("div")
bhplusSettingsCard.className = "card"

let bhpSettings = window.localStorage.getItem("bhp-settings")
let parsedSettings = (bhpSettings) ? JSON.parse(bhpSettings) : {}

function booleanToChecked(value) {
    if (value)
        return "checked"
    return ""
}

function conversionToSelected(value) {
    if (value === Number(parsedSettings.shopConversions))
        return "selected"
    return ""
} 

let forumImageEmbeds = (parsedSettings.forumImageEmbeds !== undefined) ? booleanToChecked(parsedSettings.forumImageEmbeds) : "checked"
let forumBadges = (parsedSettings.forumBadges !== undefined) ? booleanToChecked(parsedSettings.forumBadges) : "checked"
let forumSignature = (parsedSettings.forumSignature !== undefined) ? parsedSettings.forumSignature : ""

let messagesImageEmbeds = (parsedSettings.messagesImageEmbeds !== undefined) ? booleanToChecked(parsedSettings.messagesImageEmbeds) : "checked"

let shopComments = (parsedSettings.shopComments !== undefined) ? booleanToChecked(parsedSettings.shopComments) : "checked"


bhplusSettingsCard.innerHTML = `
                <div id="bhp-success" class="alert success" style="display:none">Brick Hill+ settings have been saved</div>
                <div class="blue top">Brick Hill+ Settings</div>
                <div class="content">
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Forums</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Image Embeds</span>
                        <input class="f-right" type="checkbox" id="bhp-forumImageEmbeds" ${forumImageEmbeds}>
                    </div>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Badges</span>
                        <input class="f-right" type="checkbox" id="bhp-forumBadges" ${forumBadges}>
                    </div>
                    <br>
                    <span class="dark-gray-text" style="padding-bottom: 5px;">Forums Signature</span>
                    <input id="bhp-forumSignature" class="width-100 block" maxlength="100" placeholder="100 characters max" style="margin-bottom: 6px;" type="text"></input>
                    <hr>
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Messages</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Image Embeds</span>
                        <input class="f-right" type="checkbox" id="bhp-messagesImageEmbeds" ${messagesImageEmbeds}>
                    </div>
                    <hr>
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Shop</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Comments</span>
                        <input class="f-right" type="checkbox" id="bhp-shopComments" ${shopComments}>
                    </div>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Buck/Bit Conversions</span>
                        <div class="inline f-right" style="width: 50%; max-width: 200px;">
                            <select id="bhp-shopConversions" class="no-right-rad width-100">
                                <option value="0"        ${conversionToSelected(0)}>None</option>
                                <option value="0.0099"   ${conversionToSelected(0.0099)}>100 Bucks - $0.99</option>
                                <option value="0.00978"  ${conversionToSelected(0.00978)}>500 Bucks - $4.89</option>
                                <option value="0.00959"  ${conversionToSelected(0.00959)}>1,000 Bucks - $9.59</option>
                                <option value="0.009495" ${conversionToSelected(0.009495)}>2,000 Bucks - $18.99</option>
                                <option value="0.009198" ${conversionToSelected(0.009198)}>5,000 Bucks - $45.99</option>
                                <option value="0.008899" ${conversionToSelected(0.008899)}>10,000 Bucks - $88.99</option>
                            </select>
                        </div>
                    </div>
                    <br>
                    <button id="bhp-save" class="button small blue">Save</button>
                </div>
                
                
                `
bhplusSettingsColumn.appendChild(bhplusSettingsCard)

// appending the text after the element is in the DOM to prevent XSS
// thanks to Dragonian
$("#bhp-forumSignature").text(forumSignature)

$("#bhp-save").click(() => {
    window.localStorage.setItem("bhp-settings", JSON.stringify({
        forumImageEmbeds: $("#bhp-forumImageEmbeds").is(":checked"),
        forumBadges: $("#bhp-forumBadges").is(":checked"),
        forumSignature: $("#bhp-forumSignature").val(),
        messagesImageEmbeds: $("#bhp-messagesImageEmbeds").is(":checked"),
        shopConversions: $("#bhp-shopConversions").val(),
        shopComments: $("#bhp-shopComments").val()
    }))
    $("#bhp-success").show()
})