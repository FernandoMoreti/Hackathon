import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../App.css";

interface CardClickProps {
  title: string;
  to: string;
}

const CardClick: React.FC<CardClickProps> = ({ title, to }) => {
  return (
    <Link
      to={to}
      className="border border-white p-10 flex flex-col justify-between rounded-2xl shadow-lg shadow-gray-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-gray-100"
    >
      <p className="text-white text-lg font-semibold">{title}</p>
      <ArrowRight className="text-white h-8 w-8" />
    </Link>
  );
};

export default CardClick;
