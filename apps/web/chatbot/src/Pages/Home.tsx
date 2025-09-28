import React from "react";
import CardClick from "../components/CardClick";
import logo from "../assets/logo.png"
import { animate, text, stagger } from 'animejs';

function Home() {


    const { chars } = text.split('p', {
        chars: { wrap: 'clip' },
    });

    animate(chars, {
        y: [
            { to: ['100%', '0%'] },
            { to: '-100%', delay: 1500, ease: 'in(3)' }
        ],
        duration: 1500,
        ease: 'out(3)',
        delay: stagger(50),
        loop: true,
    });
    return (
        <>
        <section className="grid grid-cols-2 w-screen h-screen">
            <div className="flex flex-col bg-gradient-to-tr from-gray-900 to-blue-200 p-5 gap-20">
                <img className="w-20" src={logo} alt="" />
                <p className="chars text-white text-8xl font-bold pr-30">ACESSE AGORA OS NOSSOS CHATBOT's </p>
            </div>
            <div className="grid grid-cols-2 gap-15 bg-black px-15 py-20">
                <CardClick to="/chatai" title="Chat AI" />
                <CardClick to="/chatauditoria" title="Autorização de exames" />
                <CardClick to="/marcarConsulta" title="Agendar Consulta" />
            </div>
        </section>
        </>
    )
}

export default Home