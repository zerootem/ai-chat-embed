const scriptTag = document.getElementById('modweeb-chat.js');
const HUGGING_FACE_TOKEN = scriptTag ? scriptTag.getAttribute('data-api-key') : null;

// الثوابت الأخرى التي كانت موجودة في الملف الأصلي
const HUGGING_FACE_MODEL = "google/gemma-2-9b-it:nebius";
const USAGE_KEY="modweebChatUsage_v1",HISTORY_KEY="modweebChatHistory_v1",DEFAULT_DAILY_LIMIT=25,DEV_FLAG_KEY="modweebDevUnlimited_v1";

function refreshUsageUI(){
    let remaining = remainingMessages();
    let remainingElement = document.getElementById("modweeb-remaining");
    let remainingItem = document.getElementById("modweeb-remaining-item");
    
    if(remaining === Infinity){
        // استبدال النص "∞" بـ SVG
        remainingElement.innerHTML = `<svg class='line' viewBox='0 0 24 24'><path d='M10.18 9.32001C9.35999 8.19001 8.05001 7.45001 6.54001 7.45001C4.03001 7.45001 1.98999 9.49 1.98999 12C1.98999 14.51 4.03001 16.55 6.54001 16.55C8.23001 16.55 9.80001 15.66 10.67 14.21L12 12L13.32 9.78998C14.19 8.33998 15.76 7.45001 17.45 7.45001C19.96 7.45001 22 9.49 22 12C22 14.51 19.96 16.55 17.45 16.55C15.95 16.55 14.64 15.81 13.81 14.68'></path></svg>`;
        remainingItem.classList.add("unlimited");
        remainingItem.classList.remove("limited");
        remainingItem.title = "وضع غير محدود";
    } else {
        remainingElement.textContent = remaining;
        remainingItem.classList.add("limited");
        remainingItem.classList.remove("unlimited");
        remainingItem.title = `${remaining} رسائل متبقية`;
    }
}

function escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"):""}
function isSafeUrl(e){try{let t=new URL(e,location.href);return"https:"===t.protocol||"http:"===t.protocol}catch(n){return!1}}

function renderRichText(e){
    let t=escapeHtml(e);
    t=t.replace(/^#{1,6}\s+(.*)$/gm,(e,t)=>`<b style="display:block; margin:15px 0 8px 0; color:var(--linkC, #2563eb);">${t.trim()}</b>`);
    let n=0;
    return(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=t.replace(/^[*\-]\s+(.*)$/gm,(e,t)=>{n++;let s=n<=10?["١","٢","٣","٤","٥","٦","٧","٨","٩","١٠"][n-1]:n+".";return`${s} ${t.trim()}<br>`})).replace(/(?<!\w)[*#](?!\w)/g,"")).replace(/\*\*/g,"")).replace(/\*/g,"")).replace(/!\[([^\]]*?)\]\((.*?)\)/g,(e,t,n)=>isSafeUrl(n.trim())?`<img src="${n.trim()}" alt="${escapeHtml(t)}" loading="lazy" style="max-width:100%; height:auto; border-radius:8px; margin:8px 0;">`:escapeHtml(e))).replace(/\[([^\]]+)\]\((.*?)\)/g,(e,t,n)=>isSafeUrl(n.trim())?`<a href="${n.trim()}" target="_blank" rel="noopener noreferrer" style="color:var(--linkC, #2563eb); text-decoration:underline;">${escapeHtml(t)}</a>`:escapeHtml(e))).replace(/`([^`]+)`/g,(e,t)=>`<code style="background:var(--contentBa, #f4f8ff); padding:2px 6px; border-radius:4px; border:1px solid var(--contentL, #e3e7ef);">${escapeHtml(t)}</code>`)).replace(/\*\*(.*?)\*\*/g,(e,t)=>`<b style="font-weight:600;">${escapeHtml(t)}</b>`)).replace(/\*(.*?)\*/g,(e,t)=>`<i style="font-style:italic;">${escapeHtml(t)}</i>`)).replace(/(^|\s)(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|bmp))(?![^<]*>)/gi,(e,t,n)=>isSafeUrl(n)?`${t}<img src="${n}" loading="lazy" style="max-width:100%; height:auto; border-radius:8px; margin:8px 0;">`:e)).replace(/(^|\s)(https?:\/\/[^\s<]+)/g,(e,t,n)=>isSafeUrl(n)?`${t}<a href="${n}" target="_blank" rel="noopener noreferrer" style="color:var(--linkC, #2563eb); text-decoration:underline;">${escapeHtml(n)}</a>`:e)).replace(/\n\n+/g,"<br><br>")).replace(/\n/g,"<br>")).replace(/(<br>){3,}/g,"<br><br>")
}

function loadUsage(){try{let e=localStorage.getItem(USAGE_KEY);if(!e)return initUsage();let t=JSON.parse(e),n=new Date().toISOString().slice(0,10);if(t.date!==n)return initUsage();return t}catch(s){return initUsage()}}
function initUsage(){let e=new Date().toISOString().slice(0,10),t={date:e,count:0,limit:25};return localStorage.setItem(USAGE_KEY,JSON.stringify(t)),t}
function saveUsage(e){localStorage.setItem(USAGE_KEY,JSON.stringify(e))}
function remainingMessages(){let e="1"===localStorage.getItem(DEV_FLAG_KEY);if(e)return 1/0;let t=loadUsage();return Math.max(0,t.limit-t.count)}

let messagesLoaded=!1;

function saveHistory(){
    try{
        let e=[...document.getElementById("modweeb-messages").children],
        t=e.map(e=>({
            role:e.classList.contains("modweeb-msg-user")?"user":"assistant",
            html:e.querySelector(".bubble")?e.querySelector(".bubble").innerHTML:e.innerHTML
        }));
        localStorage.setItem(HISTORY_KEY,JSON.stringify(t))
    }catch(n){}
}

function showStatus(e,t=1600){
    let n=document.getElementById("modweeb-status");
    n.style.display="block",n.textContent=e,t>0&&setTimeout(()=>{n.style.display="none"},t)
}

const container=document.getElementById("modweeb-chat-container");

function createUserMessage(e){
    let t=document.createElement("div");
    t.className="modweeb-msg-user";
    let n=document.createElement("div");
    n.className="bubble";
    n.innerHTML=renderRichText(e);
    t.appendChild(n);
    let s=document.createElement("div");
    s.className="meta";
    s.innerHTML=`<div class="msg-controls">
        <button class="edit-user" title="تعديل">
            <svg viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>
    </div>`;
    t.appendChild(s);
    document.getElementById("modweeb-messages").appendChild(t);
    return t;
}

function createAiPlaceholder(){
    let e=document.createElement("div");
    e.className="modweeb-msg-ai";
    let t=document.createElement("div");
    t.className="bubble";
    t.innerHTML=`<div style="display:flex;align-items:center;gap:8px;"><div class="spinner" aria-hidden="true"></div> جاري الكتابة...</div>`;
    e.appendChild(t);
    let n=document.createElement("div");
    n.className="meta";
    n.innerHTML=`<div class="msg-controls">
        <button class="copy-reply" title="نسخ الرد">
            <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        </button>
        <button class="like-btn" title="إعجاب">
            <svg viewBox="0 0 24 24">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
        </button>
        <button class="dislike-btn" title="عدم إعجاب">
            <svg viewBox="0 0 24 24">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
            </svg>
        </button>
        <button class="download-msg" title="تحميل الرد">
            <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </button>
        <button class="resend-retry" title="إعادة المحاولة" style="display:none">
            <svg viewBox="0 0 24 24">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
        </button>
    </div>`;
    e.appendChild(n);
    document.getElementById("modweeb-messages").appendChild(e);
    document.getElementById("modweeb-messages").scrollTop=document.getElementById("modweeb-messages").scrollHeight;
    return e;
}

function buildConversationPayload(e){
    let t=[...document.getElementById("modweeb-messages").children],
    n=[{role:"system",content:"أنت مساعد تقني لمدونة modweeb.com، أجِب بشكل مختصر وعملي واحترافي."}];
    return t.forEach(e=>{
        let t=e.classList.contains("modweeb-msg-user"),
        s=e.querySelector(".bubble");
        if(!s)return;
        let a=s.innerText||s.textContent||"";
        n.push({role:t?"user":"assistant",content:a})
    }),e&&n.push({role:"user",content:e}),n
}

async function sendMessage(e,t=null,n=!1){
    let s="1"===localStorage.getItem(DEV_FLAG_KEY);
    if(!s){let a=loadUsage();if(a.count>=a.limit)return showStatus("تم تجاوز الحد اليومي للرسائل"),!1}
    let l=t||createAiPlaceholder();
    showStatus("جاري إرسال الرسالة...");
    let r=buildConversationPayload(e);
    try{
        let o=await fetch("https://router.huggingface.co/v1/chat/completions",{
            method:"POST",
            headers:{
                Authorization:`Bearer ${HUGGING_FACE_TOKEN}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                model:HUGGING_FACE_MODEL,
                messages:r,
                max_tokens:1e3,
                temperature:.7,
                top_p:.9
            })
        });
        if(!o.ok)throw Error("network");
        let i=await o.json(),
        c=i?.choices?.[0]?.message?.content||"❌ حدث خطأ.",
        d=renderRichText(c),
        m=l.querySelector(".bubble");
        m&&(m.innerHTML=d);
        let g=l.querySelector(".resend-retry");
        g&&(g.style.display="none");
        let u=loadUsage();
        u.count=(u.count||0)+1;
        saveUsage(u);
        refreshUsageUI();
        saveHistory();
        showStatus("تم الرد بنجاح!");
        return!0
    }catch(p){
        let y=l.querySelector(".bubble");
        y&&(y.innerHTML=`<div style="color:#ef4444;">❌ تعذر استجابة المساعد</div>`);
        let b=l.querySelector(".resend-retry");
        return b&&(b.style.display="inline-block",b.onclick=async function(){
            b.disabled=!0;
            y.innerHTML=`<div style="display:flex;align-items:center;gap:8px;"><div class="spinner"></div> إعادة المحاولة...</div>`;
            await sendMessage(e,l,!0);
            b.disabled=!1;
        }),saveHistory(),showStatus("تعذر الاتصال بالخادم"),!1
    }
}

function lazyLoadMessages(){
    if(!messagesLoaded){
        let e=document.createElement("div");
        e.className="modweeb-msg-ai";
        let t=document.createElement("div");
        t.className="bubble";
        t.innerHTML=`👋 مرحبًا بك في دردشة <b>modweeb.com</b>! كيف أساعدك؟`;
        e.appendChild(t);
        let n=document.createElement("div");
        n.className="meta";
        n.innerHTML=`<div class="msg-controls">
            <button class="copy-reply" title="نسخ الرد">
                <svg viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
            <button class="like-btn" title="إعجاب">
                <svg viewBox="0 0 24 24">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
            </button>
            <button class="dislike-btn" title="عدم إعجاب">
                <svg viewBox="0 0 24 24">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                </svg>
            </button>
            <button class="download-msg" title="تحميل الرد">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>`;
        e.appendChild(n);
        document.getElementById("modweeb-messages").appendChild(e);
        messagesLoaded=!0;
        setTimeout(()=>{
            document.getElementById("modweeb-messages").scrollTop=document.getElementById("modweeb-messages").scrollHeight;
        },100);
    }
}

// الأحداث الأساسية
document.getElementById("modweeb-chat-btn").onclick=function(){
    container.style.display="flex";
    container.style.position="fixed";
    container.style.left="";
    container.style.top="";
    container.style.right="32px";
    container.style.bottom="142px";
    lazyLoadMessages();
    setTimeout(function(){document.getElementById("modweeb-input").focus()},100);
    window.modweebChatOpenedAt=Date.now();
    refreshUsageUI();
};

document.getElementById("modweeb-chat-close").onclick=function(){
    container.style.display="none";
    container.style.position="fixed";
    container.style.left="";
    container.style.top="";
    container.style.right="32px";
    container.style.bottom="142px";
    window.modweebChatOpenedAt&&modweebTrackEvent("chat_duration",{value:Date.now()-window.modweebChatOpenedAt});
};

const txt=document.getElementById("modweeb-input"),charsUI=document.getElementById("modweeb-chars");
txt.addEventListener("input",function(e){
    e.target.style.height="auto";
    e.target.style.height=Math.min(e.target.scrollHeight,62)+"px";
    charsUI.textContent=`${e.target.value.length} `;
});

txt.addEventListener("keydown",function(e){
    if("Enter"===e.key&&!e.shiftKey||(e.ctrlKey||e.metaKey)&&"Enter"===e.key){
        e.preventDefault();
        document.getElementById("modweeb-send").click();
        return;
    }
    if("ArrowUp"===e.key&&""===txt.value.trim()){
        let t=[...document.getElementById("modweeb-messages").children].reverse(),
        n=t.find(e=>e.classList.contains("modweeb-msg-user"));
        if(n){
            let s=n.querySelector(".bubble").innerText||"";
            txt.value=s;
            txt.dispatchEvent(new Event("input"));
        }
    }
});

document.addEventListener("keydown",function(e){
    "Escape"===e.key&&(container.style.display="none");
    (e.ctrlKey||e.metaKey)&&"k"===e.key.toLowerCase()&&(e.preventDefault(),container.style.display="flex",setTimeout(()=>txt.focus(),100));
});

document.querySelectorAll(".modweeb-suggestion-btn").forEach(e=>{
    e.onclick=()=>{
        txt.value=e.textContent;
        txt.focus();
        txt.dispatchEvent(new Event("input"));
    }
});

document.getElementById("modweeb-copy-all").onclick=function(){
    let e=[...document.getElementById("modweeb-messages").children].map(e=>e.innerText).join("\n");
    navigator.clipboard.writeText(e).then(()=>showStatus("تم نسخ المحادثة!"));
};

document.getElementById("modweeb-clear").onclick=function(){
    localStorage.removeItem(HISTORY_KEY);
    document.getElementById("modweeb-messages").innerHTML="";
    messagesLoaded=!1;
    lazyLoadMessages();
    showStatus("تم حذف المحادثة!");
};

// التحكم في الشاشة الكاملة
// التحكم في الشاشة الكاملة - الإصدار المصحح
document.getElementById('modweeb-fullscreen').onclick = function() {
    const container = document.getElementById('modweeb-chat-container');
    const isFullscreen = container.classList.contains('modweeb-fullscreen');
    
    if (isFullscreen) {
        // الخروج من الشاشة الكاملة إلى الوضع المصغر
        exitFullscreenMode();
    } else {
        // الدخول للشاشة الكاملة
        enterFullscreenMode();
    }
};

// دالة الدخول إلى الشاشة الكاملة
function enterFullscreenMode() {
    const container = document.getElementById('modweeb-chat-container');
    const fullscreenBtn = document.getElementById('modweeb-fullscreen');
    
    container.classList.add('modweeb-fullscreen');
    fullscreenBtn.title = 'تصغير';
    fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
    document.body.style.overflow = 'hidden';
    
    // تحديث أيقونة زر الشاشة الكاملة في الرأس إذا كان موجودًا
    const fullscreenBtnInHeader = document.querySelector('.modweeb-head-actions #modweeb-fullscreen');
    if(fullscreenBtnInHeader && fullscreenBtnInHeader !== fullscreenBtn) {
        fullscreenBtnInHeader.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
        fullscreenBtnInHeader.title = 'تصغير';
    }
    
    setTimeout(() => {
        const messages = document.getElementById('modweeb-messages');
        if(messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }, 150);
}

// دالة الخروج من الشاشة الكاملة إلى الوضع المصغر
function exitFullscreenMode() {
    const container = document.getElementById('modweeb-chat-container');
    const fullscreenBtn = document.getElementById('modweeb-fullscreen');
    
    container.classList.remove('modweeb-fullscreen');
    fullscreenBtn.title = 'الشاشة الكاملة';
    fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
    document.body.style.overflow = '';
    
    // تحديث أيقونة زر الشاشة الكاملة في الرأس إذا كان موجودًا
    const fullscreenBtnInHeader = document.querySelector('.modweeb-head-actions #modweeb-fullscreen');
    if(fullscreenBtnInHeader && fullscreenBtnInHeader !== fullscreenBtn) {
        fullscreenBtnInHeader.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
        fullscreenBtnInHeader.title = 'الشاشة الكاملة';
    }
}

// تحسين حدث إغلاق الدردشة - الإصدار المصحح
document.getElementById("modweeb-chat-close").onclick = function(e){
    if(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    const container = document.getElementById("modweeb-chat-container");
    
    // إذا كان في وضع الشاشة الكاملة، أخرج أولاً ثم أغلق
    if(container.classList.contains("modweeb-fullscreen")){
        exitFullscreenMode();
        
        // انتظر قليلاً ثم أغلق النافذة
        setTimeout(() => {
            container.style.display = "none";
        }, 100);
    } else {
        // إذا كان في الوضع المصغر، أغلق مباشرة
        container.style.display = "none";
    }
    
    // تتبع المدة إذا لزم الأمر
    if(window.modweebChatOpenedAt){
        modweebTrackEvent("chat_duration",{value:Date.now()-window.modweebChatOpenedAt});
    }
};
    
// إدارة أحداث الأيقونات
document.getElementById('modweeb-messages').addEventListener('click', function(e) {
    let target = e.target.closest('button');
    if (!target) return;

    const messageElement = target.closest('.modweeb-msg-ai, .modweeb-msg-user');
    if (!messageElement) return;
    
    if (target.classList.contains('copy-reply')) {
        const text = messageElement.querySelector('.bubble').innerText || '';
        navigator.clipboard.writeText(text).then(() => {
            showStatus('تم نسخ الرد!');
            // تأثير مرئي عند النسخ
            const originalBg = target.style.background;
            const originalColor = target.style.color;
            target.style.background = 'var(--success, #10b981)';
            target.style.color = 'white';
            setTimeout(() => {
                target.style.background = originalBg;
                target.style.color = originalColor;
            }, 1000);
        }).catch(err => {
            showStatus('فشل في النسخ');
        });
    }
    else if (target.classList.contains('edit-user')) {
        const text = messageElement.querySelector('.bubble').innerText || '';
        const input = document.getElementById('modweeb-input');
        input.value = text;
        input.focus();
        input.dispatchEvent(new Event('input'));
        showStatus('تم تحميل النص للتعديل');
    }
    else if (target.classList.contains('like-btn') || target.classList.contains('dislike-btn')) {
        // إلغاء التفعيل من الزر الآخر
        const likeBtn = messageElement.querySelector('.like-btn');
        const dislikeBtn = messageElement.querySelector('.dislike-btn');
        
        if (target.classList.contains('like-btn')) {
            likeBtn.classList.toggle('liked');
            dislikeBtn.classList.remove('disliked');
            showStatus(likeBtn.classList.contains('liked') ? 'تم تسجيل الإعجاب' : 'تم إلغاء الإعجاب');
        } else {
            dislikeBtn.classList.toggle('disliked');
            likeBtn.classList.remove('liked');
            showStatus(dislikeBtn.classList.contains('disliked') ? 'تم تسجيل عدم الإعجاب' : 'تم الإلغاء');
        }
    }
    else if (target.classList.contains('download-msg')) {
        const text = messageElement.querySelector('.bubble').innerText || '';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `رد-الدردشة-${new Date().toLocaleDateString('ar-SA')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('تم تحميل الرد');
    }
});

document.getElementById("modweeb-send").onclick=async function(){
    let e=txt.value.trim();
    if(!e)return;
    let t="1"===localStorage.getItem(DEV_FLAG_KEY);
    if(!t){let n=loadUsage();if(n.count>=n.limit){showStatus("تم تجاوز الحد اليومي للرسائل");return}}
    createUserMessage(e);
    txt.value="";
    txt.style.height="auto";
    charsUI.textContent=`0 `;
    let s=createAiPlaceholder();
    document.getElementById("modweeb-messages").scrollTop=document.getElementById("modweeb-messages").scrollHeight;
    saveHistory();
    await sendMessage(e,s);
};

// الأحداث الإضافية
let headerClickCount=0,headerClickTimer=null;
const head=document.getElementById("modweeb-head");

function modweebTrackEvent(e,t){
    window.gtag&&gtag("event",e,t||{});
}

function adjustForKeyboard(){
    let e=window.visualViewport.height,t=window.innerHeight;
    t-e>150?(document.getElementById("modweeb-chat-container").style.bottom="10px",document.getElementById("modweeb-chat-btn").style.bottom="10px"):(document.getElementById("modweeb-chat-container").style.bottom="142px",document.getElementById("modweeb-chat-btn").style.bottom="88px");
}

head.addEventListener("click",function(e){
    if(headerClickCount++,headerClickTimer&&clearTimeout(headerClickTimer),headerClickTimer=setTimeout(()=>{headerClickCount=0},4e3),headerClickCount>=5){
        headerClickCount=0;
        let t="1"===localStorage.getItem(DEV_FLAG_KEY);
        t?(localStorage.removeItem(DEV_FLAG_KEY),showStatus("وضع المطور معطل")):(localStorage.setItem(DEV_FLAG_KEY,"1"),showStatus("وضع المطور مفعل: غير محدود")),refreshUsageUI();
    }
});

document.getElementById("modweeb-messages").style.minHeight="60px";
window.visualViewport.addEventListener("resize",adjustForKeyboard);
window.visualViewport.addEventListener("scroll",adjustForKeyboard);

document.addEventListener("click",function(e){
    let t=document.getElementById("modweeb-chat-container"),
    n=document.getElementById("modweeb-chat-btn");
    "flex"!==t.style.display||t.contains(e.target)||n.contains(e.target)||(t.style.display="none");
});

// التهيئة الأولية
refreshUsageUI();

// تحسين وظيفة إرسال الرسائل لضمان الظهور الكامل
document.getElementById("modweeb-send").onclick = async function(){
    let messageText = txt.value.trim();
    if(!messageText) return;
    
    let isUnlimited = "1"===localStorage.getItem(DEV_FLAG_KEY);
    if(!isUnlimited){
        let usage = loadUsage();
        if(usage.count >= usage.limit){
            showStatus("تم تجاوز الحد اليومي للرسائل");
            return;
        }
    }
    
    // إنشاء رسالة المستخدم
    createUserMessage(messageText);
    txt.value = "";
    txt.style.height = "auto";
    charsUI.textContent = `0 `;
    
    // إنشاء رسالة AI placeholder
    let aiMessage = createAiPlaceholder();
    
    // الانتظار قليلاً لضمان التمرير الصحيح
    setTimeout(() => {
        const messagesContainer = document.getElementById("modweeb-messages");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
    
    saveHistory();
    await sendMessage(messageText, aiMessage);
    
    // بعد الرد، التأكد من ظهور الأيقونات
    setTimeout(() => {
        const messagesContainer = document.getElementById("modweeb-messages");
        messagesContainer.scrollTop = messagesContainer.scrollHeight + 100; // زيادة إضافية
    }, 100);
};

// تحسين وظيفة التمرير التلقائي
function ensureFullMessageVisibility() {
    const messagesContainer = document.getElementById("modweeb-messages");
    const lastMessage = messagesContainer.lastElementChild;
    
    if (lastMessage) {
        // حساب الارتفاع الكامل للرسالة مع الأيقونات
        const messageHeight = lastMessage.offsetHeight;
        const containerHeight = messagesContainer.offsetHeight;
        
        // التمرير لأسفل مع هامش إضافي
        messagesContainer.scrollTop = messagesContainer.scrollHeight - containerHeight + messageHeight + 20;
    }
}

// تحديث دالة createAiPlaceholder لضمان الظهور الكامل
function createAiPlaceholder(){
    let e=document.createElement("div");
    e.className="modweeb-msg-ai";
    let t=document.createElement("div");
    t.className="bubble";
    t.innerHTML=`<div style="display:flex;align-items:center;gap:8px;"><div class="spinner" aria-hidden="true"></div> جاري الكتابة...</div>`;
    e.appendChild(t);
    let n=document.createElement("div");
    n.className="meta";
    n.innerHTML=`<div class="msg-controls">
        <button class="copy-reply" title="نسخ الرد">
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
        <button class="like-btn" title="إعجاب">
            <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
        </button>
        <button class="dislike-btn" title="عدم إعجاب">
            <svg viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
        </button>
        <button class="download-msg" title="تحميل الرد">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        <button class="resend-retry" title="إعادة المحاولة" style="display:none">
            <svg viewBox="0 0 24 24"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
    </div>`;
    e.appendChild(n);
    document.getElementById("modweeb-messages").appendChild(e);
    
    // التأكد من الظهور الكامل للرسالة الجديدة
    setTimeout(() => {
        ensureFullMessageVisibility();
    }, 100);
    
    return e;
}

// إضافة مستمع حدث للتمرير عند تغيير الحجم (للكيبورد)
window.addEventListener('resize', function() {
    setTimeout(() => {
        ensureFullMessageVisibility();
    }, 300);
});

// تحسين التمرير عند فتح الدردشة
document.getElementById("modweeb-chat-btn").onclick = function(){
    container.style.display = "flex";
    container.style.position = "fixed";
    container.style.left = "";
    container.style.top = "";
    container.style.right = "32px";
    container.style.bottom = "142px";
    lazyLoadMessages();
    
    setTimeout(function(){
        document.getElementById("modweeb-input").focus();
        // التأكد من الظهور الكامل بعد الفتح
        setTimeout(() => {
            ensureFullMessageVisibility();
        }, 200);
    }, 100);
    
    window.modweebChatOpenedAt = Date.now();
    refreshUsageUI();
};
