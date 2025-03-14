// ✅ User Authentication
let userName = localStorage.getItem("chatUserName");
let userID = localStorage.getItem("chatUserID");

if (!userName) {
    userName = prompt("Enter your name:");
    userID = prompt("Enter your User ID (Leave empty if normal user):");

    localStorage.setItem("chatUserName", userName);
    localStorage.setItem("chatUserID", userID);
}

// ✅ Check if User is Admin
let isAdmin = Object.keys(ADMINS).includes(userID);

if (isAdmin) {
    userName = ADMINS[userID]; // Set correct admin name
    document.getElementById("deleteAllBtn").style.display = "inline";
}

// ✅ Send Message
document.getElementById("sendBtn").addEventListener("click", () => {
    let messageInput = document.getElementById("messageInput");
    let message = messageInput.value.trim();

    if (message === "") return;

    push(ref(db, "messages"), {
        name: userName,
        text: message,
        timestamp: Date.now(),
        isAdmin: isAdmin,
    });

    messageInput.value = "";
});

// ✅ Receive Messages
onChildAdded(ref(db, "messages"), (snapshot) => {
    let msg = snapshot.val();
    let msgId = snapshot.key;
    let msgContainer = document.createElement("div");

    msgContainer.classList.add("message", msg.name === userName ? "my-message" : "other-message");

    // ⏳ Convert Timestamp to Readable Time
    let time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 🏆 Admin Blue Tick SVG
    let adminBadge = msg.isAdmin
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
           <polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"></polygon>
           <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"></polygon>
           </svg>`
        : "";

    // ❌ Delete Icon (Only for Admin)
    let deleteIcon = isAdmin
        ? `<span class="delete-msg" data-id="${msgId}" style="cursor: pointer; color: red; margin-left: 10px;">🗑️</span>`
        : "";

    msgContainer.innerHTML = `<b>${msg.name} ${adminBadge}:</b> ${msg.text}
                              <span class="time" style="font-size: 12px; color: gray; margin-left: 5px;">${time}</span> ${deleteIcon}`;

    document.getElementById("messages").appendChild(msgContainer);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});

// ✅ Delete Single Message (Admin Only)
document.getElementById("messages").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-msg")) {
        let msgId = e.target.getAttribute("data-id");
        remove(ref(db, `messages/${msgId}`));
    }
});

// ✅ Logout Function
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
});

// ✅ Admin: Delete All Messages
document.getElementById("deleteAllBtn").addEventListener("click", async () => {
    if (!isAdmin) return;

    if (confirm("Are you sure you want to delete all messages?")) {
        let messagesRef = ref(db, "messages");

        get(messagesRef).then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                remove(ref(db, `messages/${childSnapshot.key}`));
            });
        });
    }
});