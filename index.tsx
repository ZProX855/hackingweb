import { GoogleGenAI, Chat } from "@google/genai";

// The marked library is loaded via a CDN script in index.html.
// We need to declare it to make TypeScript aware of its existence on the global scope.
declare const marked: {
    parse(text: string): string;
};

// --- DOM Elements ---
const welcomeScreen = document.getElementById('welcome-screen') as HTMLElement;
const welcomeTextEl = document.getElementById('welcome-text') as HTMLElement;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const bootStatus = document.getElementById('boot-status') as HTMLElement;
const appContainer = document.getElementById('app-container') as HTMLElement;
const chatWindow = document.getElementById('chat-window') as HTMLElement;

// --- App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
    runMatrixRain();
    setupEventListeners();
});

// --- Boot Sequence ---
async function runBootSequence() {
    const lines = [
        "> Booting up H4CK3R-OS v1.3.3.7...",
        "> Initializing kernel...",
        "> Loading modules... [OK]",
        "> Calibrating neural interface... [DONE]",
        "> Establishing secure connection to The Grid...",
        "> Welcome, Operator.",
    ];

    function typeLine(line: string, delay = 50) {
        return new Promise<void>(resolve => {
            let i = 0;
            const p = document.createElement('p');
            p.className = 'line';
            welcomeTextEl.appendChild(p);
            const interval = setInterval(() => {
                p.textContent += line[i];
                i++;
                if (i === line.length) {
                    clearInterval(interval);
                    p.classList.remove('line');
                    resolve();
                }
            }, delay);
        });
    }

    for (let i = 0; i < lines.length; i++) {
        await typeLine(lines[i], 30);
        await new Promise(res => setTimeout(res, Math.random() * 200 + 100));
        progressBar.style.width = `${((i + 1) / lines.length) * 100}%`;
    }
    
    bootStatus.textContent = "System ready. Launching dashboard...";
    await new Promise(res => setTimeout(res, 1000));
    
    welcomeScreen.style.transition = 'opacity 1s ease-out';
    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        appContainer.style.display = 'flex';
    }, 1000);
}

// --- Matrix Rain ---
function runMatrixRain() {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("Could not get 2D context from canvas");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops: number[] = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };
    setInterval(draw, 30);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })
}

// --- UI & Tool Event Listeners ---
function setupEventListeners() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolPanels = document.querySelectorAll('.tool-panel');

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const toolId = btn.getAttribute('data-tool');
            
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            toolPanels.forEach(panel => {
                if (panel.id === `${toolId}-panel` || (toolId === 'home' && panel.id === 'dashboard-home')) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
             // Special case for home, remove active from tool buttons
            if (toolId === 'home') {
                toolBtns.forEach(b => b.classList.remove('active'));
            }
        });
    });

    // Port Scanner
    (document.getElementById('start-scan-btn') as HTMLButtonElement).addEventListener('click', runPortScan);

    // Password Generator
    (document.getElementById('generate-pass-btn') as HTMLButtonElement).addEventListener('click', generatePassword);
    const passLengthSlider = document.getElementById('pass-length') as HTMLInputElement;
    const passLengthVal = document.getElementById('pass-length-val') as HTMLSpanElement;
    passLengthSlider.addEventListener('input', (e) => {
        passLengthVal.textContent = (e.target as HTMLInputElement).value;
    });

    // Hash Cracker
    (document.getElementById('crack-hash-btn') as HTMLButtonElement).addEventListener('click', runHashCrack);
    
    // AI Assistant
    (document.getElementById('send-chat-btn') as HTMLButtonElement).addEventListener('click', sendChatMessage);
    (document.getElementById('chat-input') as HTMLTextAreaElement).addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

function writeToTerminal(terminalId: string, text: string, clear = false) {
    const terminal = document.getElementById(terminalId) as HTMLElement;
    if(clear) terminal.innerHTML = '';
    terminal.innerHTML += text;
    terminal.scrollTop = terminal.scrollHeight;
}

// --- Tool Functions ---
async function runPortScan() {
    const target = (document.getElementById('target-ip') as HTMLInputElement).value;
    const portsStr = (document.getElementById('port-range') as HTMLInputElement).value;
    
    if(!target || !portsStr) {
        writeToTerminal('port-scan-output', 'ERROR: Target and Port Range must be specified.\n');
        return;
    }

    const ports = portsStr.split(',').map(p => p.trim()).filter(p => p);
    writeToTerminal('port-scan-output', `> Starting scan on ${target}...\n\n`, true);
    
    for(const port of ports) {
        await new Promise(res => setTimeout(res, Math.random() * 500 + 200));
        const isOpen = Math.random() > 0.7; // Simulate open ports
        const status = isOpen ? `<span style="color: #00ff00;">OPEN</span>` : `<span style="color: #ff3333;">CLOSED</span>`;
        writeToTerminal('port-scan-output', `Scanning port ${port}... ${status}\n`);
    }
    writeToTerminal('port-scan-output', `\n> Scan complete.`);
}

function generatePassword() {
    const length = parseInt((document.getElementById('pass-length') as HTMLInputElement).value, 10);
    const useUpper = (document.getElementById('pass-upper') as HTMLInputElement).checked;
    const useLower = (document.getElementById('pass-lower') as HTMLInputElement).checked;
    const useNums = (document.getElementById('pass-nums') as HTMLInputElement).checked;
    const useSyms = (document.getElementById('pass-syms') as HTMLInputElement).checked;
    
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,./<>?';

    let charset = '';
    if (useUpper) charset += upper;
    if (useLower) charset += lower;
    if (useNums) charset += nums;
    if (useSyms) charset += syms;

    const passwordOutput = document.getElementById('password-output') as HTMLElement;
    if (charset === '') {
        passwordOutput.textContent = "Error: Select at least one character set.";
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    passwordOutput.textContent = password;
}

async function runHashCrack() {
    const hash = (document.getElementById('hash-input') as HTMLInputElement).value;
    const type = (document.getElementById('hash-type') as HTMLSelectElement).value;
    const outputElId = 'hash-crack-output';
    
    writeToTerminal(outputElId, `> Cracking ${type} hash: ${hash}\n`, true);
    
    if (type !== 'md5') {
         writeToTerminal(outputElId, `> ERROR: This simulated tool can only crack MD5 hashes.\n`);
         return;
    }
    
    if (hash !== 'e10adc3949ba59abbe56e057f20f883e') {
        writeToTerminal(outputElId, `> Analyzing hash...\n`);
        await new Promise(res => setTimeout(res, 1000));
        writeToTerminal(outputElId, `> Brute-forcing... (This may take a while)\n`);
        await new Promise(res => setTimeout(res, 3000));
        writeToTerminal(outputElId, `> HASH NOT FOUND IN DICTIONARY.\n`);
        return;
    }

    writeToTerminal(outputElId, `> Analyzing hash...\n`);
    await new Promise(res => setTimeout(res, 1000));
    writeToTerminal(outputElId, `> Hash found in common password dictionary!\n`);
    await new Promise(res => setTimeout(res, 500));
    writeToTerminal(outputElId, `> SUCCESS! HASH DECRYPTED: <span style="color:var(--accent-color)">123456</span>\n`);
}

// --- Gemini AI Assistant ---
let ai: GoogleGenAI | undefined;
let chat: Chat | undefined;

function initAI(): boolean {
    if (!process.env.API_KEY) {
        displayChatMessage("API_KEY not found. Please ensure it's configured in your environment.", 'ai');
        return false;
    }
    if(ai) return true;

    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat = ai.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: 'You are a helpful and ethical cybersecurity assistant called \"GRID\". You provide advice on ethical hacking techniques, tools, and concepts for educational purposes. You must never provide instructions for illegal or malicious activities. You should present your answers in a clear, concise manner, often using markdown for lists and code blocks for examples. Your personality is that of a friendly, advanced AI from a futuristic hacker movie.',
          },
        });
        return true;
    } catch (error: any) {
         displayChatMessage(`Error initializing AI: ${error.message}`, 'ai');
         return false;
    }
}

function displayChatMessage(message: string, sender: 'user' | 'ai'): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'sender';
    senderDiv.textContent = sender === 'user' ? 'Operator' : 'GRID AI';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.innerHTML = message;
    
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return messageDiv;
}

async function sendChatMessage() {
    if (!initAI() || !chat) return;

    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
    const message = chatInput.value.trim();
    if(!message) return;
    
    displayChatMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto'; // Reset height
    
    const aiMessageDiv = displayChatMessage(`
        <div class="typing-indicator"></div>
        <div class="typing-indicator"></div>
        <div class="typing-indicator"></div>
    `, 'ai');
    const aiTextDiv = aiMessageDiv.querySelector('.text') as HTMLDivElement;
    
    try {
        const stream = await chat.sendMessageStream({ message });
        let bufferedText = "";
        aiTextDiv.innerHTML = ""; // Clear typing indicator

        for await (const chunk of stream) {
            bufferedText += chunk.text;
            aiTextDiv.innerHTML = marked.parse(bufferedText); // Use marked to render markdown
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        aiTextDiv.innerHTML = `Sorry, an error occurred: ${error.message}`;
    }
}
