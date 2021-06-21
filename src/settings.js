const $ = e => { return document.getElementById(e) }
const bhplusSettingsColumn = document.createElement("div")
const settingsMainDiv = document.getElementsByClassName("main-holder grid")[0]

bhplusSettingsColumn.className = "col-10-12 push-1-12"
settingsMainDiv.appendChild(bhplusSettingsColumn)

const bhplusSettingsCard = document.createElement("div")
bhplusSettingsCard.className = "card"


// this is so that we can check the checkboxes that they saved
const booleanToChecked = value => {
    return (value) ? "checked" : ""
}

// same as above, but instead of "checked" it's "selected"

const conversionToSelected = value => {
    return (value === Number(bhpSettings.shopConversions)) ? "selected" : ""
}

const forumImageEmbeds = (bhpSettings.f_ImageEmbeds !== undefined) ? booleanToChecked(bhpSettings.f_ImageEmbeds) : "checked"
const forumBadges      = (bhpSettings.f_Badges !== undefined)      ? booleanToChecked(bhpSettings.f_Badges)      : "checked"
const forumPPD         = (bhpSettings.f_PPD !== undefined)         ? booleanToChecked(bhpSettings.f_PPD)         : "checked"
const forumSignature   = (bhpSettings.f_Signature !== undefined)   ? bhpSettings.f_Signature                     : ""

const messagesImageEmbeds = (bhpSettings.m_ImageEmbeds !== undefined) ? booleanToChecked(bhpSettings.m_ImageEmbeds) : "checked"

const profilesBHV = (bhpSettings.p_BHV !== undefined) ? booleanToChecked(bhpSettings.p_BHV) : "checked"
const shopBHV     = (bhpSettings.s_BHV !== undefined) ? booleanToChecked(bhpSettings.s_BHV) : "checked"

const navbarButton  = (bhpSettings.n_CustomButton.name !== "") ? bhpSettings.n_CustomButton : { name: "", link: "" }

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
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Posts Per Day</span>
                        <input class="f-right" type="checkbox" id="bhp-forumPPD" ${forumPPD}>
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
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Brick Hill Values</span>
                        <input class="f-right" type="checkbox" id="bhp-shopBHV" ${shopBHV}>
                    </div>
                    <hr>
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Navbar</span>
                    <span class="dark-gray-text" style="padding-bottom: 5px;">Custom Button</span>
                    <input id="bhp-CBName" class="block" maxlength="20" placeholder="Button name" style="margin-bottom: 6px;" type="text"></input>
                    <input id="bhp-CBLink" class="block" placeholder="Button link" style="margin-bottom: 6px;" type="text"></input>
                    <hr>
                    <span class="dark-gray-text bold block" style="padding-bottom: 5px;">Profiles</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Brick Hill Values</span>
                        <input class="f-right" type="checkbox" id="bhp-userBHV" ${profilesBHV}>
                    </div>
                    <br>
                    <button id="bhp-save" class="button small blue">Save</button>
                    <br>
                </div>
                
                
                `
bhplusSettingsColumn.appendChild(bhplusSettingsCard)

// appending the text after the element is in the DOM to prevent XSS
// thanks to Dragonian
$("bhp-forumSignature").value = forumSignature
$("bhp-CBName").value = navbarButton.name
$("bhp-CBLink").value = navbarButton.link


document.getElementById("bhp-save").addEventListener("click", () => {

    storage.set("bhp-settings", {
        f_ImageEmbeds: $("bhp-forumImageEmbeds").checked,
        f_Badges:      $("bhp-forumBadges").checked,
        f_Signature:   $("bhp-forumSignature").value,
        f_PPD:         $("bhp-forumPPD").checked,

        m_ImageEmbeds: $("bhp-messagesImageEmbeds").checked,

        s_Conversions: $("bhp-shopConversions").value,
        s_BHV:         $("bhp-shopBHV").checked,

        p_BHV:         $("bhp-userBHV").checked,

        n_CustomButton: {
            name: $("bhp-CBName").value,
            link: $("bhp-CBLink").value
        }

    })

    $("bhp-success").style = ""
})