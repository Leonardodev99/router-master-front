import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import "../styles/LessaScreen.css";
import { FaMicrophone } from "react-icons/fa";

function LessaScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());
    const API_KEY = "sk_5c8495dacb90e2a304ccdbe081ea5c2e06ead0e4fa0701a1"; // 🔴 Substitua pela sua chave da ElevenLabs

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            console.error("Speech recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "pt-PT";

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
            setInput(transcript);
            setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event) => console.error("Speech recognition error:", event.error);

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onstart = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
            }
        };
    }, []);

    const startVoiceInput = () => {
        if (recognitionRef.current && !isListening) recognitionRef.current.start();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages((prevMessages) => [...prevMessages, { text: input, sender: "user" }]);
            setInput("");

            const response = await fetchResponse(input);
            setMessages((prevMessages) => [...prevMessages, { text: response, sender: "bot" }]);

            speakResponse(response);
        }
    };

    const fetchResponse = async (question) => {
        const responseMap = {
            "olá lessa.": "Olá! Como posso ajudar você hoje?",
            "como você está?": "Eu estou bem, obrigada por perguntar!",
            "qual seu nome?": "Meu nome é Lessa, sua assistente virtual.",
            "tchau": "Até a próxima! Se precisar de algo, estarei aqui.",
            "qual o seu propósito?": "Meu propósito é ajudar você com o que precisar.",
            "qual a capital de Angola?": "A capital de Angola é Luanda.",
            "como está o tempo hoje?": "Na página principal do Router Master tem o botão Meteorologia, clique nele para verificar informações em tempo real.",
            "me conte uma piada?": "Por que o tomate ficou vermelho? Porque viu o alface de saia!",
            "qual a sua cor favorita?": "Eu não tenho preferências por cores, mas o azul é uma cor muito bonita."
        };

        return responseMap[question.trim().toLowerCase()] || "Desculpe, não entendi sua pergunta. Pode tentar novamente?";
    };

    const speakResponse = async (text) => {
        try {
            const response = await axios.post(
                "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream",
                {
                    text: text,
                     model_id: "eleven_turbo_v2",
                    voice_settings: {
                        stability: 1.5,
                        similarity_boost: 0.8
                }
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "xi-api-key": API_KEY
                    },
                    responseType: "arraybuffer"
                }
            );

            // Criar um Blob para armazenar o áudio
            const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Configurar o áudio e tocar
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        } catch (error) {
            console.error("Erro ao gerar áudio:", error);
        }
    };

    return (
        <div className="lessa-screen">
            <div className="lessa-header">
                <h1>Lessa - Assistente Virtual</h1>
            </div>
            <div className="lessa-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`lessa-message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <form className="lessa-input" onSubmit={handleSendMessage}>
                <button type="button" onClick={startVoiceInput} className={`voice-button ${isListening ? "listening" : ""}`}>
                    <FaMicrophone />
                </button>
                <input type="text" placeholder="Digite sua pergunta..." value={input} onChange={(e) => setInput(e.target.value)} />
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
}

export default LessaScreen;
