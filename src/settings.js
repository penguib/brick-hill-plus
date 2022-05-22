const $ = e => { return document.getElementById(e) }
const bhplusSettingsColumn = document.createElement("div")
const settingsMainDiv = document.getElementsByClassName("main-holder grid")[0]
const notifierConstants = {
    specials:     1 << 0,
    newItems:     1 << 1,
    updatedItems: 1 << 2,
    tweets:       1 << 3,
    firstItem:    1 << 4,
};

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

const messagesImageEmbeds = (bhpSettings.m_ImageEmbeds !== undefined) ? booleanToChecked(bhpSettings.m_ImageEmbeds) : "checked"

const navbarButton  = (bhpSettings.n_CustomButton.name !== "") ? bhpSettings.n_CustomButton : { name: "", link: "" }
const navbarColoredIcons = (bhpSettings.n_ColoredIcons !== undefined) ? booleanToChecked(bhpSettings.n_ColoredIcons) : "checked"

bhplusSettingsCard.innerHTML = `
                <div id="bhp-success" class="alert success" style="display:none">Brick Hill+ settings have been saved</div>
                <div class="blue top">Brick Hill+ Settings</div>
                <div class="content">
                    <span class="dark-gray-text very-bold block" style="padding-bottom: 5px;">Forums</span>
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
                    <hr>
                    <span class="dark-gray-text very-bold block" style="padding-bottom: 5px;">Messages</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Image Embeds</span>
                        <input class="f-right" type="checkbox" id="bhp-messagesImageEmbeds" ${messagesImageEmbeds}>
                    </div>
                    <hr>
                    <span class="dark-gray-text very-bold block" style="padding-bottom: 5px;">Shop</span>
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
                    <hr>
                    <span class="dark-gray-text very-bold block" style="padding-bottom: 5px;">Navbar</span>
                    <span class="dark-gray-text" style="padding-bottom: 5px;">Custom Button</span>
                    <input id="bhp-CBName" class="block" maxlength="20" placeholder="Button name" style="margin-bottom: 6px;" type="text"></input>
                    <input id="bhp-CBLink" class="block" placeholder="Button link" style="margin-bottom: 6px;" type="text"></input>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Colored Icons</span>
                        <input class="f-right" type="checkbox" id="bhp-coloredIcons" ${navbarColoredIcons}>
                    </div>
                    <br>

                    <hr>
                    <span class="dark-gray-text very-bold block" style="padding-bottom: 5px;">Notifier</span>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Tweets from @hillofbricks</span>
                        <input class="f-right" type="checkbox" id="bhp-notifierTweets">
                    </div>
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Updates of first shop item</span>
                        <input class="f-right" type="checkbox" id="bhp-notifierFirstItem">
                    </div>
                    <br> 
                    <div class="block">
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Specials</span>
                        <input class="f-right" type="checkbox" id="bhp-notifierSpecials">
                    </div>
                    <div>
                        <span class="dark-gray-text" style="padding-bottom: 5px;">New items</span>
                        <input class="f-right" type="checkbox" id="bhp-notifierNew">
                    </div>
                    <div>
                        <span class="dark-gray-text" style="padding-bottom: 5px;">Updated items</span>
                        <input class="f-right" type="checkbox" id="bhp-notifierUpdated">
                    </div>
                    <br> 

                    <button id="bhp-save" class="button small blue">Save</button>
                    <br>
                </div>
                
                
                `
bhplusSettingsColumn.appendChild(bhplusSettingsCard)

browser.storage.sync.get("settings", settingsObj => {
    let notifierSettings = settingsObj.settings
    if (!notifierSettings || Object.keys(settingsObj.settings).length === 0) {
        notifierSettings = 0x1F;
    }
    $("bhp-notifierTweets").checked = ((notifierConstants.tweets & notifierSettings) ? true : false)
    $("bhp-notifierFirstItem").checked = ((notifierConstants.firstItem & notifierSettings) ? true : false)
    $("bhp-notifierSpecials").checked = ((notifierConstants.specials & notifierSettings) ? true : false)
    $("bhp-notifierNew").checked = ((notifierConstants.newItems & notifierSettings) ? true : false)
    $("bhp-notifierUpdated").checked = ((notifierConstants.updatedItems & notifierSettings) ? true : false)
})

// appending the text after the element is in the DOM to prevent XSS
// thanks to Dragonian
$("bhp-CBName").value = navbarButton.name
$("bhp-CBLink").value = navbarButton.link

document.getElementById("bhp-save").addEventListener("click", () => {

    storage.set("bhp-settings", {
        f_ImageEmbeds: $("bhp-forumImageEmbeds").checked,
        f_Badges:      $("bhp-forumBadges").checked,
        f_PPD:         $("bhp-forumPPD").checked,

        m_ImageEmbeds: $("bhp-messagesImageEmbeds").checked,

        s_Conversions: $("bhp-shopConversions").value,

        n_CustomButton: {
            name: $("bhp-CBName").value,
            link: $("bhp-CBLink").value
        },

        n_ColoredIcons: $("bhp-coloredIcons").checked

    })

    browser.storage.sync.set({
        settings: storage.setNotifierSettings([ 
            $("bhp-notifierSpecials"), 
            $("bhp-notifierNew"),
            $("bhp-notifierUpdated"),
            $("bhp-notifierTweets"),
            $("bhp-notifierFirstItem"),
         ])
    })

    $("bhp-success").style = ""
})