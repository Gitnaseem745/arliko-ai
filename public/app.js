// ── Auth State ──────────────────────────────────────

// grab userId and username from localStorage (returns null if not logged in)
const getUserId = () => localStorage.getItem("userId");
const getUsername = () => localStorage.getItem("username");

let userId = getUserId();

// ── Auth UI Elements ────────────────────────────────
const authOverlay = document.getElementById("authOverlay");
const authClose = document.getElementById("authClose");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");
const authButtons = document.getElementById("authButtons");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

// opens the auth modal and switches to the given tab ("login" or "signup")
const showModal = (tab = "login") => {
    authOverlay.classList.remove("hidden");
    authTabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    loginForm.classList.toggle("hidden", tab !== "login");
    signupForm.classList.toggle("hidden", tab !== "signup");
    loginError.textContent = "";
    signupError.textContent = "";
};

// closes the auth modal
const hideModal = () => authOverlay.classList.add("hidden");

// toggles login/signup buttons, logout btn, and sidebar user info based on auth state
const updateUIForAuth = () => {
    const loggedIn = !!userId;
    authButtons.classList.toggle("hidden", loggedIn);
    logoutBtn.classList.toggle("hidden", !loggedIn);

    const avatar = document.getElementById("userAvatar");
    const name = document.getElementById("userName");
    if (loggedIn) {
        const username = getUsername() || "U";
        avatar.textContent = username.charAt(0).toUpperCase();
        name.textContent = username;
    } else {
        avatar.textContent = "?";
        name.textContent = "Guest";
    }
};

// wire up tab switching between login and signup
authTabs.forEach(tab => {
    tab.onclick = () => showModal(tab.dataset.tab);
});

loginBtn.onclick = () => showModal("login");
signupBtn.onclick = () => showModal("signup");
authClose.onclick = hideModal;
authOverlay.onclick = e => { if (e.target === authOverlay) hideModal(); };

// handles login form submission — hits /api/login and stores user on success
loginForm.onsubmit = async e => {
    e.preventDefault();
    loginError.textContent = "";
    const btn = loginForm.querySelector(".auth-submit");
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value,
                password: document.getElementById("loginPassword").value
            })
        });
        const data = await res.json();

        if (!res.ok) {
            loginError.textContent = data.error || "Login failed.";
            return;
        }

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username || document.getElementById("loginEmail").value.split("@")[0]);
        userId = data.userId;
        hideModal();
        updateUIForAuth();
        loadChats();
    } catch {
        loginError.textContent = "Network error. Try again.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Login";
    }
};

// handles signup form submission — hits /api/signup and auto-logs in on success
signupForm.onsubmit = async e => {
    e.preventDefault();
    signupError.textContent = "";
    const btn = signupForm.querySelector(".auth-submit");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
        const username = document.getElementById("signupUsername").value;
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                email: document.getElementById("signupEmail").value,
                password: document.getElementById("signupPassword").value
            })
        });
        const data = await res.json();

        if (!res.ok) {
            signupError.textContent = data.error || "Signup failed.";
            return;
        }

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", username);
        userId = data.userId;
        hideModal();
        updateUIForAuth();
        loadChats();
    } catch {
        signupError.textContent = "Network error. Try again.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Sign Up";
    }
};

// clears everything and logs the user out
logoutBtn.onclick = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    userId = null;
    chatId = null;
    document.getElementById("messages").innerHTML = "";
    document.getElementById("chats").innerHTML = "";
    updateUIForAuth();
    window.history.replaceState(null, "", "/");
};

// ── Chat Logic ──────────────────────────────────────

// pulls the chatId from the URL path (e.g. /chat/abc123 -> abc123)
const getChatId = () => {
    const parts = window.location.pathname.split("/");
    return parts[2] || null;
};

let chatId = getChatId();

// fetches all conversations for the current user and renders the sidebar list
const loadChats = async () => {
    const res = await fetch(`/api/chats/${userId}`);
    const data = await res.json();
    renderTitles(data.chats || [{ title: "Dummy Chat", _id: "1234" }])
}

// builds the sidebar chat list items with edit button, sets up click handlers to switch chats
const renderTitles = chats => {
    const chatsContainer = document.getElementById("chats");
    chatsContainer.innerHTML = "";

    chats.forEach(c => {
        const div = document.createElement("div");
        div.className = "chat-item";
        if (c._id === chatId) div.classList.add("active");

        const span = document.createElement("span");
        span.className = "chat-label";
        span.textContent = c.title || "New Chat";

        // action buttons container (pencil edit / check confirm / x cancel)
        const actions = document.createElement("div");
        actions.className = "chat-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "chat-action-btn";
        editBtn.innerHTML = "&#9998;"; // pencil icon
        editBtn.title = "Edit title";

        actions.appendChild(editBtn);
        div.appendChild(span);
        div.appendChild(actions);
        chatsContainer.appendChild(div);

        // clicking the chat item switches to that conversation
        div.onclick = (e) => {
            if (e.target.closest(".chat-action-btn") || div.classList.contains("editing")) return;
            chatId = c._id;
            window.history.pushState(null, "", `/chat/${chatId}`);
            loadChat();
            loadChats();
        };

        // pencil click → switch to inline edit mode
        editBtn.onclick = (e) => {
            e.stopPropagation();
            // close any other open edits first
            document.querySelectorAll(".chat-item.editing").forEach(item => {
                item.classList.remove("editing");
                const label = item.querySelector(".chat-label");
                const input = item.querySelector(".chat-edit-input");
                if (input) {
                    label.style.display = "";
                    input.remove();
                }
                const actionsDiv = item.querySelector(".chat-actions");
                actionsDiv.innerHTML = "";
                const newEditBtn = document.createElement("button");
                newEditBtn.className = "chat-action-btn";
                newEditBtn.innerHTML = "&#9998;";
                newEditBtn.title = "Edit title";
                actionsDiv.appendChild(newEditBtn);
            });

            div.classList.add("editing");
            span.style.display = "none";

            const input = document.createElement("input");
            input.type = "text";
            input.className = "chat-edit-input";
            input.value = c.title || "New Chat";
            div.insertBefore(input, actions);
            input.focus();
            input.select();

            // replace pencil with check + cancel buttons
            actions.innerHTML = "";

            const confirmBtn = document.createElement("button");
            confirmBtn.className = "chat-action-btn";
            confirmBtn.innerHTML = "&#10003;"; // checkmark
            confirmBtn.title = "Save";

            const cancelBtn = document.createElement("button");
            cancelBtn.className = "chat-action-btn";
            cancelBtn.innerHTML = "&#10005;"; // x mark
            cancelBtn.title = "Cancel";

            actions.appendChild(confirmBtn);
            actions.appendChild(cancelBtn);

            const saveEdit = async () => {
                const newTitle = input.value.trim();
                if (!newTitle || newTitle === (c.title || "New Chat")) {
                    cancelEdit();
                    return;
                }
                await editConversationTitle(c._id, newTitle);
                c.title = newTitle;
                span.textContent = newTitle;
                cancelEdit();
            };

            const cancelEdit = () => {
                div.classList.remove("editing");
                span.style.display = "";
                input.remove();
                actions.innerHTML = "";
                const restoreBtn = document.createElement("button");
                restoreBtn.className = "chat-action-btn";
                restoreBtn.innerHTML = "&#9998;";
                restoreBtn.title = "Edit title";
                actions.appendChild(restoreBtn);
                restoreBtn.onclick = editBtn.onclick;
            };

            confirmBtn.onclick = (e) => { e.stopPropagation(); saveEdit(); };
            cancelBtn.onclick = (e) => { e.stopPropagation(); cancelEdit(); };
            input.onkeydown = (e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
            };
            input.onclick = (e) => e.stopPropagation();
        };
    });
}

// loads a single conversation's messages from the server
const loadChat = async () => {
    const res = await fetch(`/api/chat/${userId}/${chatId}`);
    const chat = await res.json();
    renderMessages(chat.messages || []);
}

// renders all messages into the chat area, with markdown + syntax highlighting for assistant msgs
const renderMessages = messages => {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = "";

    messages.forEach(m => {
        const div = document.createElement("div");
        div.className = m.role;

        if (m.role == "assistant") {
            div.innerHTML = DOMPurify.sanitize(marked.parse(m.content));
        } else {
            div.textContent = m.content;
        }

        messagesContainer.appendChild(div);
    });

    document.querySelectorAll("pre code").forEach(b => {
        hljs.highlightElement(b);
    })
};

// sends the user's message to the API, creates a new chat if needed, and refreshes the UI
const sendMessage = async () => {
    const input = document.getElementById("messageInput");

    const message = input.value;
    if (!message.trim()) return;

    if (!userId) {
        showModal("login");
        return;
    }

    input.value = "";

    // if on home page with no chatId, generate one now
    if (!chatId) {
        chatId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
        window.history.replaceState(null, "", `/chat/${chatId}`);
    }

    const res = await fetch(`/api/chat/${userId}/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const data = await res.json();
    if (data.chatId && data.chatId !== chatId) {
        chatId = data.chatId;
        window.history.replaceState(null, "", `/chat/${chatId}`);
    }

    loadChat();
    loadChats();
};

document.getElementById("newChatBtn").onclick = () => {
    window.location.href = "/";
};

// mobile sidebar open/close  
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");

openSidebarBtn.onclick = () => {
    sidebar.style.transform = "translateX(0%)"
}

closeSidebarBtn.onclick = () => {
    sidebar.style.transform = "translateX(-100%)"
}

// sends a PUT request to update the conversation title
const editConversationTitle = async (targetChatId, newTitle) => {
    const res = await fetch(`/api/chat/${userId}/${targetChatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle })
    });
    if (!res.ok) console.error("Failed to update title");
}

// init
updateUIForAuth();
if (!userId) showModal("login");
if (userId) loadChats();
if (chatId && userId) loadChat();
