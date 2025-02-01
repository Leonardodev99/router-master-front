import React, { useState, useEffect, useRef } from "react";
import "../styles/LessaScreen.css";
import { FaMicrophone } from 'react-icons/fa';

function LessaScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const synthRef = useRef(window.speechSynthesis);
    const [femaleVoice, setFemaleVoice] = useState(null);
    const [isListening, setIsListening] = useState(false); // Novo estado para controlar a escuta
    const recognitionRef = useRef(null); // Referência para o reconhecimento de voz
    
    const femaleVoiceNames = [
        "Feminina",
        "Raquel",
        "Luciana",
        "Alice",
        "Isabela",
        "Mariana",
        "Ana",
        "Helena",
        "Laura",
        "Juliana"
    ];


    useEffect(() => {
        const getVoices = () => {
            const voices = synthRef.current.getVoices();
            const foundVoice = voices.find((voice) =>
                voice.lang === 'pt-PT' && femaleVoiceNames.some(name => voice.name.toLowerCase().includes(name.toLowerCase()))
            );
            setFemaleVoice(foundVoice);
        };

        getVoices();
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = getVoices;
        }

        return () => {
            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = null;
            }
        };
    }, []);


    useEffect(() => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          console.error("Speech recognition not supported in this browser.");
          return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-PT';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
        };
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
          setInput(transcript);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

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
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: input, sender: "user" },
            ]);
            setInput("");

            // Simula a chamada para a API de respostas
            const response = await fetchResponse(input);

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: response, sender: "bot" },
            ]);

             speakResponse(response); // Simula fala da Lessa
        }
    };


    const fetchResponse = async (question) => {
        // Simulação de uma API que responde a perguntas.
         const responseMap = {
            "olá lessa.": "Olá! Como posso ajudar você hoje?",
            "como você está?": "Eu estou bem, obrigada por perguntar!",
            "qual seu nome?": "Meu nome é Lessa, sua assistente virtual.",
            "tchau": "Até a próxima! Se precisar de algo, estarei aqui.",
            "qual o seu propósito?": "Meu propósito é ajudar você com o que precisar.",
             "qual a capital de Angola?": "A capital de Angola é Luanda.",
             "como está o tempo hoje?": "Na pagina principal do Router Master tem o botao Meteorologia, clique nele verificar informações em tempo real",
             "me conte uma piada?": "Por que o tomate ficou vermelho? Porque viu o alface de saia!",
             "qual a sua cor favorita?": "Eu não tenho preferencias por cores, mas o azul é uma cor muito bonita."
        };

        const normalizedQuestion = question.toLowerCase();
        return responseMap[normalizedQuestion] || "Desculpe, não entendi sua pergunta. Pode tentar novamente?";
    };

    const speakResponse = (text) => {
        if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-PT';
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            synthRef.current.speak(utterance);
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
              <button type="button" onClick={startVoiceInput} className={`voice-button ${isListening ? 'listening' : ''}`}>
                      <FaMicrophone />
                </button>
                <input
                    type="text"
                    placeholder="Digite sua pergunta..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
}

export default LessaScreen;