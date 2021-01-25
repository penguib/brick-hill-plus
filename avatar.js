const csrfToken = $("meta[name='csrf-token']").attr("content")

function errorModal(msg) {
    $("body").append(`\n\t<div class="modal">\n\t\t<div class="modal-content" style="display:block">\n\t\t\t<span class="close" onclick="$(\'.modal\').remove()">&times;</span>\n\t\t\tAn error occurred while coloring all parts\n\t\t\t<hr>\n\t\t\t${msg}\n\t\t\t<div style="display:flex;justify-content:center;margin-top:20px;">\n\t\t\t   <button class="purchase-bucks cancel-button" style="background-color:#FFF;color:#000;border:1px solid #B8B8B8;" onclick="$(\'.modal\').remove();location.reload()" type="button">Cancel</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t`)
}

function avatarProcess(color, part) {
    return $.post("/api/avatar/process", {
        _token: csrfToken,
        type: "color",
        color: color,
        part: part
    })
}
const parts = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"]

function colorAllParts(color, part = 0) {
    avatarProcess(color, parts[part])
    .done((res) => {
        if (!res.success) throw new Error(res.error)
        if (part < parts.length - 1) {
            setTimeout(colorAllParts, 500, color, ++part)
        } else {
            return location.reload()
        }
    })
    .fail((xhr, res, err) => {
        switch(xhr.status) {
            case 429:
                errorModal("You are being rate limited, please try again later.")
                break
            default:
                errorModal("Unknown error")
        }
    })
}
function newChangeColor(color) {
    let part = $("#curr-edit").text().split("Currently Editing: ").join("")
    if (part === "All") return colorAllParts(color)


    avatarProcess(color, part)
    .done((res) => {
        if (res.error) return errorModal(res.error)
        $("button[onclick=\"colorChange('" + part + "')\"").css("background-color", "#" + color)
    })
}


$(document).ready(() => {
    const avatarColorsBox = $("body > div.main-holder.grid > div:nth-child(1) > div:nth-child(8) > div > div.content")
    const allBtn = $(avatarColorsBox).prepend(`<button onclick=colorChange('All') style="background-color:#6fb6db;border-color:#419dda;padding:10px;width:20%;">Select All</button>`)

    $(`<input class="jscolor {closable:true, closeText:'Cancel'}" style="margin: 5px 15px 15px 15px;" placeholder="ffffff">`).insertAfter("#curr-edit")

    $(`<button id="submitColor" style="background-color:#6fb6db;border-color:#419dda;padding:6px;">Submit</button><hr><br>`).insertAfter("input.jscolor")

    $("body > div.main-holder.grid > div:nth-child(1) > div:nth-child(7) > div > div.content").attr("style", "position:relative;height:550px;overflow-x:hidden;")

    $("#submitColor").on("click", () => {
        newChangeColor($("input.jscolor").val())
    })

    $(".colorPallete").attr("class", "newColorPallette") // Rename button classes to not interfere with site.js

    $(document).on("click", ".newColorPallette", t => newChangeColor($(t.target).val()))
})