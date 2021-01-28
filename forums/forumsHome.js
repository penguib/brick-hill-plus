let div = document.getElementsByClassName("col-8-12")[1]
let card = document.createElement("div")
card.className = "card"
card.innerHTML = `
<div class="top gray cc_cursor">
    <div class="col-7-12">Conspiracies</div>
        <div class="no-mobile overflow-auto topic text-center">
        <div class="col-3-12 stat">Threads</div>
        <div class="col-3-12 stat">Replies</div>
        <div class="col-6-12"></div>
        </div>
        </div>
        <div class="content">
        <div class="board-info mb1">
        <div class="col-7-12 board">
            <div>
                <a class="label dark" href="/forum/6">Conspiracies</a>
            </div>
            <span class="label small">What could this be?</span>
        </div>

        <div class="no-mobile overflow-auto board ellipsis" style="overflow:hidden;">
            <div class="col-3-12 stat">
                <span class="title">???</span>
            </div>
            <div class="col-3-12 stat">
                <span class="title">????</span>
            </div>
            <div class="col-6-12 text-right ellipsis pt2" style="max-width:180px;">
                <a href="/forum/thread/1364590/" class="label dark">????????????</a><br>
                <span class="label small">? days ago</span>
            </div>
        </div>
    </div>
</div>`


div.appendChild(card)