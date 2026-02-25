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

// builds the sidebar chat list items and sets up click handlers to switch chats
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

        div.appendChild(span);
        chatsContainer.appendChild(div);

        div.onclick = () => {
            chatId = c._id;
            window.history.pushState(null, "", `/chat/${chatId}`);
            loadChat();
            loadChats();
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

// init
updateUIForAuth();
if (!userId) showModal("login");
if (userId) loadChats();
if (chatId && userId) loadChat();
