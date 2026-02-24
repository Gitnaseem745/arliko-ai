const getChatId = () => {
    const parts = window.location.pathname.split("/");
    return parts[2] || null;
};

let chatId = getChatId();

if (!chatId) {
    // Redirect to a new chat with a random ID
    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.location.href = `/chat/${newId}`;
}

const loadChats = async () => {
    const res = await fetch("/api/chats");
    const data = await res.json();
    renderTitles(data.chats || [{ title: "Dummy Chat", _id: "1234" }])
}

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

const loadChat = async () => {
    const res = await fetch(`/api/chat/${chatId}`);
    const chat = await res.json();
    renderMessages(chat.messages || []);
}

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

const sendMessage = async () => {
    const input = document.getElementById("messageInput");

    const message = input.value;
    input.value = "";

    const res = await fetch(`/api/chat/${chatId}`, {
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
    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.location.href = `/chat/${newId}`;
};

loadChats();
loadChat();
