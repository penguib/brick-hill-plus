const friendsCard = document.getElementsByClassName("card")[0]
const friendsContent = document.getElementsByClassName("content text-center")[0]
const friendsButtonContent = document.createElement("div")
friendsButtonContent.className = "content text-center"

const friendsButtonList = document.createElement("ul")
friendsButtonList.className = "friends-list push-right"
friendsButtonContent.appendChild(friendsButtonList)

const acceptAllItem = document.createElement("li")
acceptAllItem.className = "col-12-5 mobile-col-1-1"
friendsButtonList.appendChild(acceptAllItem)

const acceptAllButton = document.createElement("button")
acceptAllButton.className = "mb2 green"
acceptAllButton.innerText = "Accept All"
acceptAllItem.appendChild(acceptAllButton)

const DeclineAllItem = document.createElement("li")
DeclineAllItem.className = "col-12-5 mobile-col-1-1"
friendsButtonList.appendChild(DeclineAllItem)

const DeclineAllButton = document.createElement("button")
DeclineAllButton.className = "mb2 red"
DeclineAllButton.innerText = "Decline All"
DeclineAllItem.appendChild(DeclineAllButton)

friendsCard.insertBefore(friendsButtonContent, friendsContent)