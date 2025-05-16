import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import RecoverAccountScreen from "./components/RecoverAccountScreen";
import HomeScreen from "./components/HomeScreen";
import AddFriendScreen from "./components/AddFriendScreen";
import ChatScreen from "./components/ChatScreen";
import WeatherScreen from "./components/WeatherScreen"; 
import ProfileScreen from "./components/ProfileScreen";
import WalkHistoryScreen from "./components/WalkHistoryScreen";

function App() {
  const [routeInfo, setRouteInfo] = useState({
    start: null,
    end: null,
    mode: "pedestrian",
  });


  return (
    <BrowserRouter>
          <Routes>
             {/* Tela de carregamento inicial */}
            <Route path="/" element={<LoadingScreen />} />

             {/* Telas de autenticação */}
            <Route path="/login" element={<LoginScreen />}/>
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/recover" element={<RecoverAccountScreen />} />

            {/* Tela principal e subpáginas */}
            <Route path="/home" element={<HomeScreen routeInfo={routeInfo} setRouteInfo={setRouteInfo} />} />
            <Route path="/add-friend" element={<AddFriendScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/weather" element={<WeatherScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/hostory" element={<WalkHistoryScreen />} />

            {/* Redireciona qualquer rota inválida para a tela de carregamento */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        
      
    </BrowserRouter>
  );
}

export default App;
