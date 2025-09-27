import React from "react";
import CardClick from "../components/CardClick";
import logo from "../assets/logo.png"

function Home() {
    console.log("Aqui estopu")
    return (
        <>
        <section className="grid grid-cols-2 w-screen h-screen">
            <div className="flex flex-col bg-gradient-to-tr from-gray-900 to-blue-200 p-5 gap-20">
                <img className="w-20" src={logo} alt="" />
                <p className="text-white text-8xl font-bold pr-30">ACESSE AGORA OS NOSSOS CHATBOT's </p>
            </div>
            <div className="grid grid-cols-2 gap-15 bg-black px-15 py-20">
                <CardClick to="/chatai" title="Chat AI" />
                <CardClick to="/chatauditoria" title="Chat Auditoria" />
                <CardClick to="/marcarConsulta" title="Chat Consulta" />
            </div>
        </section>
        </>
    )
}

export default Home